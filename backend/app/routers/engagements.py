from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query

from ..database import store
from ..schemas.engagement import DeliveryInput, EngagementInput, RevisionInput
from ..utils.auth import get_current_user

router = APIRouter(tags=["engagements"])


@router.post("/engagements")
def create_engagement(payload: EngagementInput, user: dict = Depends(get_current_user)):
    if user.get("role") != "brand":
        raise HTTPException(status_code=403, detail="Only brands can send engagement requests")
    brief = store.find_one("briefs", id=payload.brief_id)
    if not brief:
        raise HTTPException(status_code=404, detail="Brief not found")
    if brief.get("brand_id") != user["id"]:
        raise HTTPException(status_code=403, detail="You can only request creators for your own brief")
    creator = store.find_one("creators", id=payload.creator_id)
    if not creator:
        raise HTTPException(status_code=404, detail="Creator not found")
    if creator.get("external_profile"):
        raise HTTPException(status_code=400, detail="This public creator profile has not joined CreatorTwin. Open the source profile to contact them.")
    active_duplicate = any(
        item.get("brief_id") == payload.brief_id
        and item.get("creator_id") == payload.creator_id
        and item.get("brand_id") == user["id"]
        and item.get("status") not in {"rejected", "cancelled", "completed", "done", "finished"}
        for item in store.list("engagements")
    )
    if active_duplicate:
        raise HTTPException(status_code=409, detail="An active request already exists for this creator and brief")
    now = datetime.now(timezone.utc).isoformat()
    engagement = {
        "id": f"engagement-{len(store.list('engagements')) + 1}",
        "brief_id": payload.brief_id,
        "brand_id": user["id"],
        "creator_id": payload.creator_id,
        "message": payload.message or "Interested in collaborating.",
        "budget": payload.proposed_budget,
        "deadline": payload.proposed_deadline,
        "status": "pending",
        "deliveries": [],
        "revision_requests": [],
        "created_at": now,
        "updated_at": now,
    }
    return {"engagement": store.insert("engagements", engagement)}


@router.get("/engagements")
def list_engagements(user: dict = Depends(get_current_user)):
    if user.get("role") == "brand":
        items = [e for e in store.list("engagements") if e.get("brand_id") == user["id"]]
    elif user.get("role") == "creator":
        creator = store.find_one("creators", user_id=user["id"])
        items = [e for e in store.list("engagements") if creator and e.get("creator_id") == creator.get("id")]
    else:
        raise HTTPException(status_code=403, detail="Only project participants can view engagements")
    return {"engagements": items}


@router.put("/engagements/{engagement_id}/status")
def update_engagement_status(
    engagement_id: str,
    status_value: str | None = Query(None, alias="status"),
    user: dict = Depends(get_current_user),
    legacy_status: str | None = Query(None, alias="status_value"),
):
    resolved_status = status_value or legacy_status
    if not resolved_status:
        raise HTTPException(status_code=400, detail="Status is required")

    engagement = store.find_one("engagements", id=engagement_id)
    if not engagement:
        raise HTTPException(status_code=404, detail="Engagement not found")
    creator = store.find_one("creators", id=engagement.get("creator_id"))
    if not creator:
        raise HTTPException(status_code=404, detail="Creator profile not found")
    if user.get("id") != creator.get("user_id") and user.get("id") != engagement.get("brand_id"):
        raise HTTPException(status_code=403, detail="You cannot update this engagement")

    actor_role = "brand" if user.get("id") == engagement.get("brand_id") else "creator"
    allowed_transitions = {
        "pending": {"brand": {"cancelled"}, "creator": {"accepted", "rejected"}},
        "accepted": {"creator": {"in_progress"}},
        "in_progress": {"creator": set()},
        "delivered": {"brand": {"completed"}},
        "revision_requested": {"creator": {"in_progress"}},
    }
    allowed = allowed_transitions.get(engagement.get("status"), {}).get(actor_role, set())
    if resolved_status not in allowed:
        raise HTTPException(
            status_code=400,
            detail=f"{actor_role.capitalize()} cannot move this engagement from {engagement.get('status')} to {resolved_status}",
        )

    updated = {
        **engagement,
        "status": resolved_status,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    record = store.update("engagements", engagement_id, updated)
    return {"engagement": record}


@router.post("/engagements/{engagement_id}/deliveries")
def submit_delivery(engagement_id: str, payload: DeliveryInput, user: dict = Depends(get_current_user)):
    engagement = store.find_one("engagements", id=engagement_id)
    if not engagement:
        raise HTTPException(status_code=404, detail="Engagement not found")
    creator = store.find_one("creators", id=engagement.get("creator_id"))
    if user.get("role") != "creator" or not creator or creator.get("user_id") != user.get("id"):
        raise HTTPException(status_code=403, detail="Only the assigned creator can submit project work")
    if engagement.get("status") != "in_progress":
        raise HTTPException(status_code=400, detail="A delivery can only be submitted while production is in progress")

    now = datetime.now(timezone.utc).isoformat()
    deliveries = list(engagement.get("deliveries") or [])
    delivery = {
        "version": len(deliveries) + 1,
        "url": str(payload.delivery_url),
        "notes": payload.delivery_note.strip(),
        "submitted_at": now,
        "submitted_by": user["id"],
    }
    deliveries.append(delivery)
    updated = store.update("engagements", engagement_id, {
        **engagement,
        "status": "delivered",
        "delivery_url": delivery["url"],
        "delivery_note": delivery["notes"],
        "deliveries": deliveries,
        "updated_at": now,
    })
    return {"engagement": updated}


@router.post("/engagements/{engagement_id}/revisions")
def request_revision(engagement_id: str, payload: RevisionInput, user: dict = Depends(get_current_user)):
    engagement = store.find_one("engagements", id=engagement_id)
    if not engagement:
        raise HTTPException(status_code=404, detail="Engagement not found")
    if user.get("role") != "brand" or user.get("id") != engagement.get("brand_id"):
        raise HTTPException(status_code=403, detail="Only the requesting brand can ask for revisions")
    if engagement.get("status") != "delivered":
        raise HTTPException(status_code=400, detail="Revisions can only be requested for a submitted delivery")

    now = datetime.now(timezone.utc).isoformat()
    revision_requests = list(engagement.get("revision_requests") or [])
    revision = {
        "round": len(revision_requests) + 1,
        "notes": payload.revision_notes.strip(),
        "requested_at": now,
        "requested_by": user["id"],
    }
    revision_requests.append(revision)
    updated = store.update("engagements", engagement_id, {
        **engagement,
        "status": "revision_requested",
        "revision_requests": revision_requests,
        "revision_notes": revision["notes"],
        "updated_at": now,
    })
    return {"engagement": updated}
