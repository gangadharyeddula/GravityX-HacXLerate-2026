from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException

from ..database import store
from ..schemas.brief import BriefInput
from ..services.matching_service import find_matching_creators_for_brief
from ..utils.auth import get_current_user

router = APIRouter(tags=["briefs"])


@router.get("/briefs")
def list_briefs(user: dict = Depends(get_current_user)):
    if user.get("role") == "brand":
        briefs = [b for b in store.list("briefs") if b.get("brand_id") == user["id"]]
    else:
        briefs = store.list("briefs")
    return {"briefs": briefs}


@router.post("/briefs")
def create_brief(payload: BriefInput, user: dict = Depends(get_current_user)):
    if user.get("role") != "brand":
        raise HTTPException(status_code=403, detail="Only brands can create briefs")
    brief = {
        "id": f"brief-{len(store.list('briefs')) + 1}",
        "brand_id": user["id"],
        "campaign_name": payload.campaign_name,
        "brand_name": payload.brand_name,
        "description": payload.description,
        "objective": payload.objective,
        "content_type": payload.content_type,
        "style": payload.style,
        "target_audience": payload.target_audience,
        "location": payload.location,
        "language": payload.language,
        "platform": payload.platform,
        "aspect_ratio": payload.aspect_ratio,
        "duration": payload.duration,
        "required_tools": payload.required_tools,
        "required_skills": payload.required_skills,
        "required_specialization": payload.required_specialization,
        "budget": payload.budget,
        "country": payload.country,
        "currency": payload.currency,
        "project_type": payload.project_type,
        "deadline": payload.deadline,
        "commercial_use_required": payload.commercial_use_required,
        "licensing_requirement": payload.licensing_requirement,
        "usage_rights": payload.usage_rights,
        "reference_links": payload.reference_links,
        "additional_requirements": payload.additional_requirements,
        "status": payload.status,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    record = store.insert("briefs", brief)
    return {"brief": record}


@router.get("/briefs/{brief_id}")
def get_brief(brief_id: str):
    brief = store.find_one("briefs", id=brief_id)
    if not brief:
        raise HTTPException(status_code=404, detail="Brief not found")
    return {"brief": brief}


@router.put("/briefs/{brief_id}")
def update_brief(brief_id: str, payload: BriefInput, user: dict = Depends(get_current_user)):
    brief = store.find_one("briefs", id=brief_id)
    if not brief:
        raise HTTPException(status_code=404, detail="Brief not found")
    if user.get("id") != brief.get("brand_id"):
        raise HTTPException(status_code=403, detail="You cannot edit this brief")
    record = store.update("briefs", brief_id, payload.model_dump())
    return {"brief": record}


@router.delete("/briefs/{brief_id}")
def delete_brief(brief_id: str, user: dict = Depends(get_current_user)):
    brief = store.find_one("briefs", id=brief_id)
    if not brief:
        raise HTTPException(status_code=404, detail="Brief not found")
    if user.get("id") != brief.get("brand_id"):
        raise HTTPException(status_code=403, detail="You cannot delete this brief")
    store.delete("briefs", brief_id)
    return {"deleted": True}


@router.get("/briefs/{brief_id}/matches")
def get_matching_creators(brief_id: str):
    brief = store.find_one("briefs", id=brief_id)
    if not brief:
        raise HTTPException(status_code=404, detail="Brief not found")
    matches = find_matching_creators_for_brief(brief)
    portfolios = store.list("portfolios")
    verification_items = store.list("verification")
    result = []
    for item in matches:
        creator = item["creator"]
        creator_profile = {**creator}
        creator_profile["match_score"] = item["match_score"]
        creator_profile["reasons"] = item["reasons"]
        for key in ("specialization_score", "skills_score", "tools_score", "content_type_score", "format_score", "language_score", "commercial_use_score"):
            creator_profile[key] = item.get(key)
        creator_profile["portfolio_count"] = len([portfolio for portfolio in portfolios if portfolio.get("creator_id") == creator.get("id")])
        creator_profile["verification"] = [record for record in verification_items if record.get("creator_id") == creator.get("id")]
        result.append(creator_profile)
    return {"matches": result}
