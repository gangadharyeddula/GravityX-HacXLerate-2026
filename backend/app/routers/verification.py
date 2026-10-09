from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException

from ..database import store
from ..schemas.verification import VerificationDecision, VerificationInput
from ..services.verification_service import get_verification_status_summary
from ..utils.auth import get_current_user

router = APIRouter(tags=["verification"])


@router.get("/creators/{creator_id}/verification")
def list_verifications(creator_id: str):
    items = [v for v in store.list("verification") if v.get("creator_id") == creator_id]
    return {"verification": items, "summary": get_verification_status_summary(creator_id)}


@router.post("/verification")
def create_verification(payload: VerificationInput, user: dict = Depends(get_current_user)):
    creator = store.find_one("creators", user_id=user["id"])
    if user.get("role") != "creator" or not creator:
        raise HTTPException(status_code=403, detail="Only creators can create verification records")

    existing = [item for item in store.list("verification") if item.get("creator_id") == creator["id"]]
    if any(item.get("status") == "pending" and item.get("type") == payload.type for item in existing):
        raise HTTPException(status_code=409, detail="A request of this type is already awaiting review")

    record = {
        "id": f"verification-{len(store.list('verification')) + 1}",
        "creator_id": creator["id"],
        "type": payload.type,
        "status": "pending",
        "evidence": payload.evidence.strip(),
        "submitted_at": datetime.now(timezone.utc).isoformat(),
        "verified_at": None,
    }
    inserted = store.insert("verification", record)
    return {"verification": inserted, "summary": get_verification_status_summary(creator["id"])}


@router.get("/verification/requests")
def list_verification_requests(user: dict = Depends(get_current_user)):
    if user.get("role") != "reviewer":
        raise HTTPException(status_code=403, detail="Only reviewers can access the verification queue")
    creators = {creator.get("id"): creator for creator in store.list("creators")}
    items = [
        {**item, "creator": creators.get(item.get("creator_id"))}
        for item in store.list("verification")
        if item.get("status") in {"pending", "verified", "rejected"}
    ]
    return {"requests": sorted(items, key=lambda item: (item.get("status") != "pending", item.get("submitted_at", "")))}


@router.put("/verification/{verification_id}/decision")
def decide_verification(verification_id: str, payload: VerificationDecision, user: dict = Depends(get_current_user)):
    if user.get("role") != "reviewer":
        raise HTTPException(status_code=403, detail="Only reviewers can decide verification requests")
    request = store.find_one("verification", id=verification_id)
    if not request:
        raise HTTPException(status_code=404, detail="Verification request not found")
    if request.get("status") != "pending":
        raise HTTPException(status_code=409, detail="This request has already been reviewed")
    review_note = (payload.review_note or "").strip()
    if payload.status == "rejected" and not review_note:
        raise HTTPException(status_code=400, detail="A note is required when asking for more evidence")
    now = datetime.now(timezone.utc).isoformat()
    updated = store.update("verification", verification_id, {
        **request,
        "status": payload.status,
        "reviewer_id": user["id"],
        "review_note": review_note,
        "reviewed_at": now,
        "verified_at": now if payload.status == "verified" else None,
    })
    return {"verification": updated, "summary": get_verification_status_summary(request.get("creator_id"))}
