from typing import Optional
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status

from ..database import store
from ..schemas.creator import CreatorProfileInput
from ..utils.auth import get_current_user, require_role

router = APIRouter(tags=["creators"])


@router.get("/creators")
def list_creators(
    search: Optional[str] = None,
    skill: Optional[str] = None,
    specialization: Optional[str] = None,
    tool: Optional[str] = None,
    content_type: Optional[str] = None,
    format: Optional[str] = None,
    language: Optional[str] = None,
    location: Optional[str] = None,
    commercial_use: Optional[str] = None,
    availability: Optional[str] = None,
):
    items = store.list("creators")
    portfolios = store.list("portfolios")
    verification_items = store.list("verification")
    filtered = []
    for creator in items:
        if search:
            haystack = " ".join([
                creator.get("name") or "",
                creator.get("bio") or "",
                " ".join(creator.get("skills", [])),
                " ".join(creator.get("specializations", [])),
                " ".join(creator.get("tools", [])),
                " ".join(creator.get("content_types", [])),
                " ".join(creator.get("languages", [])),
            ])
            if search.lower() not in haystack.lower():
                continue
        if skill and skill not in creator.get("skills", []):
            continue
        if specialization and specialization not in creator.get("specializations", []):
            continue
        if tool and tool not in creator.get("tools", []):
            continue
        if content_type and content_type not in creator.get("content_types", []):
            continue
        if format and format not in creator.get("formats", []):
            continue
        if language and language not in creator.get("languages", []):
            continue
        if location and location.lower() not in (creator.get("location") or "").lower():
            continue
        if commercial_use and commercial_use != creator.get("commercial_use"):
            continue
        if availability and availability != creator.get("availability"):
            continue
        portfolio_count = len([item for item in portfolios if item.get("creator_id") == creator.get("id")])
        verification = [item for item in verification_items if item.get("creator_id") == creator.get("id")]
        filtered.append({**creator, "portfolio_count": portfolio_count, "verification": verification})
    return {"creators": filtered, "count": len(filtered)}


@router.get("/creators/{creator_id}")
def get_creator(creator_id: str):
    creator = store.find_one("creators", id=creator_id)
    if not creator:
        raise HTTPException(status_code=404, detail="Creator profile not found")
    creator["portfolio_count"] = len([p for p in store.list("portfolios") if p.get("creator_id") == creator_id])
    creator["verification"] = [v for v in store.list("verification") if v.get("creator_id") == creator_id]
    return {"creator": creator}


@router.post("/creators")
def create_creator(payload: CreatorProfileInput, user: dict = Depends(get_current_user)):
    if user.get("role") != "creator":
        raise HTTPException(status_code=403, detail="Only creators can create a profile")
    if store.find_one("creators", user_id=user["id"]):
        raise HTTPException(status_code=400, detail="Creator profile already exists")

    creator = {
        "id": f"creator-{len(store.list('creators')) + 1}",
        "user_id": user["id"],
        "name": user["name"],
        "bio": payload.bio or "",
        "location": payload.location or "",
        "languages": payload.languages or [],
        "specializations": payload.specializations or [],
        "skills": payload.skills or [],
        "tools": payload.tools or [],
        "content_types": payload.content_types or [],
        "formats": payload.formats or [],
        "availability": payload.availability or "",
        "commercial_use": payload.commercial_use or "",
        "licensing_notes": payload.licensing_notes or "",
        "usage_rights": payload.usage_rights or "",
        "rate": payload.rate or "",
        "profile_image": payload.profile_image or "",
        "verification": {},
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    record = store.insert("creators", creator)
    return {"creator": record}


@router.put("/creators/{creator_id}")
def update_creator(creator_id: str, payload: CreatorProfileInput, user: dict = Depends(get_current_user)):
    creator = store.find_one("creators", id=creator_id)
    if not creator:
        raise HTTPException(status_code=404, detail="Creator profile not found")
    if user.get("id") != creator.get("user_id") and user.get("role") != "brand":
        raise HTTPException(status_code=403, detail="You cannot update this creator")
    updated = {**creator, **payload.model_dump(exclude_unset=True)}
    updated["name"] = user.get("name") or creator.get("name")
    updated["profile_image"] = updated.get("profile_image") or creator.get("profile_image")
    record = store.update("creators", creator_id, updated)
    return {"creator": record}


@router.delete("/creators/{creator_id}")
def delete_creator(creator_id: str, user: dict = Depends(get_current_user)):
    creator = store.find_one("creators", id=creator_id)
    if not creator:
        raise HTTPException(status_code=404, detail="Creator profile not found")
    if user.get("id") != creator.get("user_id"):
        raise HTTPException(status_code=403, detail="You cannot delete this creator")
    store.delete("creators", creator_id)
    return {"deleted": True}


@router.get("/creators/{creator_id}/verification")
def get_creator_verification(creator_id: str):
    return {"verification": [v for v in store.list("verification") if v.get("creator_id") == creator_id]}
