from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timezone

from ..database import store
from ..schemas.review import ReviewInput
from ..services.review_service import has_duplicate_review
from ..utils.auth import get_current_user

router = APIRouter(tags=["reviews"])


@router.post("/reviews")
def create_review(payload: ReviewInput, user: dict = Depends(get_current_user)):
    engagement = store.find_one("engagements", id=payload.engagement_id)
    if not engagement:
        raise HTTPException(status_code=404, detail="Engagement not found")

    if user.get("id") not in [engagement.get("brand_id"), engagement.get("creator_id")]:
        raise HTTPException(status_code=403, detail="You are not part of this engagement")

    if payload.reviewer_id and payload.reviewer_id != user.get("id"):
        raise HTTPException(status_code=403, detail="Reviewer mismatch")

    if engagement.get("status") not in {"completed", "done", "finished"}:
        raise HTTPException(status_code=400, detail="Reviews are available after delivery is approved")

    if payload.reviewee_role == "creator":
        if user.get("id") != engagement.get("brand_id"):
            raise HTTPException(status_code=403, detail="Only the brand can review the creator for this engagement")
        if payload.reviewee_id != engagement.get("creator_id"):
            raise HTTPException(status_code=400, detail="The reviewee must be the creator in this engagement")
    elif payload.reviewee_role == "brand":
        if user.get("id") != engagement.get("creator_id"):
            raise HTTPException(status_code=403, detail="Only the creator can review the brand for this engagement")
        if payload.reviewee_id != engagement.get("brand_id"):
            raise HTTPException(status_code=400, detail="The reviewee must be the brand in this engagement")
    else:
        raise HTTPException(status_code=400, detail="reviewee_role must be either 'creator' or 'brand'")

    existing = store.list("reviews")
    if has_duplicate_review(existing, user["id"], payload.engagement_id):
        raise HTTPException(status_code=400, detail="Review already submitted for this engagement")

    review = {
        "id": f"review-{len(store.list('reviews')) + 1}",
        "reviewer_id": user["id"],
        "reviewee_id": payload.reviewee_id,
        "reviewee_role": payload.reviewee_role,
        "engagement_id": payload.engagement_id,
        "rating": payload.rating,
        "review_title": payload.review_title,
        "review_text": payload.review_text,
        "categories": payload.categories,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    return {"review": store.insert("reviews", review)}


@router.get("/creators/{creator_id}/reviews")
def get_creator_reviews(creator_id: str):
    reviews = [r for r in store.list("reviews") if r.get("reviewee_id") == creator_id and r.get("reviewee_role") == "creator"]
    average = 0
    if reviews:
        average = round(sum(item.get("rating", 0) for item in reviews) / len(reviews), 1)
    return {"reviews": reviews, "count": len(reviews), "average_rating": average}


@router.get("/brands/{brand_id}/reviews")
def get_brand_reviews(brand_id: str):
    reviews = [r for r in store.list("reviews") if r.get("reviewee_id") == brand_id and r.get("reviewee_role") == "brand"]
    average = 0
    if reviews:
        average = round(sum(item.get("rating", 0) for item in reviews) / len(reviews), 1)
    return {"reviews": reviews, "count": len(reviews), "average_rating": average}
