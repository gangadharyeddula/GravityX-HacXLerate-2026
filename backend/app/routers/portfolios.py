from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status

from ..database import store
from ..schemas.portfolio import PortfolioItemInput
from ..utils.auth import get_current_user

router = APIRouter(tags=["portfolios"])


@router.get("/creators/{creator_id}/portfolio")
def list_portfolio(creator_id: str):
    return {"portfolio": [p for p in store.list("portfolios") if p.get("creator_id") == creator_id]}


@router.post("/portfolio")
def create_portfolio(payload: PortfolioItemInput, user: dict = Depends(get_current_user)):
    creator = store.find_one("creators", user_id=user["id"])
    if user.get("role") != "creator":
        raise HTTPException(status_code=403, detail="Only creators can add portfolio items")
    if not creator:
        raise HTTPException(status_code=404, detail="Create a creator profile before adding portfolio items")
    now = datetime.now(timezone.utc).isoformat()
    item = {
        "id": f"portfolio-{len(store.list('portfolios')) + 1}",
        "creator_id": creator["id"],
        "title": payload.title,
        "description": payload.description,
        "media_url": payload.media_url,
        "thumbnail_url": payload.thumbnail_url,
        "content_type": payload.content_type,
        "tools": payload.tools,
        "models": payload.models,
        "skills": payload.skills,
        "specialization": payload.specialization,
        "workflow": payload.workflow,
        "aspect_ratio": payload.aspect_ratio,
        "duration": payload.duration,
        "commercial_use": payload.commercial_use,
        "licensing_notes": payload.licensing_notes,
        "usage_rights": payload.usage_rights,
        "verification": {},
        "source_url": payload.source_url,
        "source_platform": payload.source_platform,
        "creator_attribution": payload.creator_attribution,
        "rights_status": payload.rights_status,
        "ai_provenance": payload.ai_provenance,
        "created_at": now,
        "updated_at": now,
    }
    record = store.insert("portfolios", item)
    return {"portfolio": record}


@router.get("/portfolio/{portfolio_id}")
def get_portfolio(portfolio_id: str):
    item = store.find_one("portfolios", id=portfolio_id)
    if not item:
        raise HTTPException(status_code=404, detail="Portfolio item not found")
    return {"portfolio": item}


@router.put("/portfolio/{portfolio_id}")
def update_portfolio(portfolio_id: str, payload: PortfolioItemInput, user: dict = Depends(get_current_user)):
    item = store.find_one("portfolios", id=portfolio_id)
    if not item:
        raise HTTPException(status_code=404, detail="Portfolio item not found")
    creator = store.find_one("creators", id=item["creator_id"])
    if user.get("id") != creator.get("user_id"):
        raise HTTPException(status_code=403, detail="You cannot edit this portfolio item")
    updated = {**item, **payload.model_dump(exclude_unset=True)}
    record = store.update("portfolios", portfolio_id, updated)
    return {"portfolio": record}


@router.delete("/portfolio/{portfolio_id}")
def delete_portfolio(portfolio_id: str, user: dict = Depends(get_current_user)):
    item = store.find_one("portfolios", id=portfolio_id)
    if not item:
        raise HTTPException(status_code=404, detail="Portfolio item not found")
    creator = store.find_one("creators", id=item["creator_id"])
    if user.get("id") != creator.get("user_id"):
        raise HTTPException(status_code=403, detail="You cannot delete this portfolio item")
    store.delete("portfolios", portfolio_id)
    return {"deleted": True}
