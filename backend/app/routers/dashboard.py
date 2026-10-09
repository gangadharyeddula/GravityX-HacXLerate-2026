from fastapi import APIRouter, Depends

from ..database import store
from ..utils.auth import get_current_user

router = APIRouter(tags=["dashboard"])


@router.get("/dashboard/brand")
def brand_dashboard(user: dict = Depends(get_current_user)):
    briefs = [b for b in store.list("briefs") if b.get("brand_id") == user["id"]]
    engagements = [e for e in store.list("engagements") if e.get("brand_id") == user["id"]]
    return {
        "total_briefs": len(briefs),
        "published_briefs": len([b for b in briefs if b.get("status") == "published"]),
        "draft_briefs": len([b for b in briefs if b.get("status") == "draft"]),
        "engagement_requests": len(engagements),
        "accepted_engagements": len([e for e in engagements if e.get("status") == "accepted"]),
        "recent_briefs": sorted(briefs, key=lambda b: b.get("created_at", ""), reverse=True)[:5],
    }


@router.get("/dashboard/creator")
def creator_dashboard(user: dict = Depends(get_current_user)):
    creator = store.find_one("creators", user_id=user["id"])
    portfolio_items = [p for p in store.list("portfolios") if p.get("creator_id") == creator["id"]] if creator else []
    portfolio_count = len(portfolio_items)
    engagement_items = [e for e in store.list("engagements") if e.get("creator_id") == creator["id"]] if creator else []
    matching_briefs = [b for b in store.list("briefs") if b.get("status") == "published"]
    profile_completion = 100
    missing = []
    if not creator or not creator.get("bio"):
        missing.append("Basic information")
    if not creator or not creator.get("skills"):
        missing.append("Skills")
    if not creator or not creator.get("tools"):
        missing.append("Tools")
    if portfolio_count == 0:
        missing.append("Portfolio")
    if not any(item.get("workflow") for item in portfolio_items):
        missing.append("Workflow")
    if not creator or creator.get("commercial_use") not in ["Commercial work available", "Commercial licensing required"]:
        missing.append("Commercial rights")
    if missing:
        profile_completion = max(0, 100 - (len(missing) * 100 // 6))
    return {
        "profile_completion": profile_completion,
        "missing_fields": missing,
        "portfolio_count": portfolio_count,
        "matching_briefs": len(matching_briefs),
        "pending_requests": len([e for e in engagement_items if e.get("status") == "pending"]),
        "accepted_engagements": len([e for e in engagement_items if e.get("status") == "accepted"]),
        "creator": creator,
    }
