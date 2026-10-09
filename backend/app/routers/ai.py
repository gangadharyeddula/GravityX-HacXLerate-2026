from fastapi import APIRouter, HTTPException

from ..database import store
from ..services.ai_service import ai_service
from ..services.agent_chat_service import LiveModelUnavailable
from ..services.matching_service import find_matching_creators_for_brief

router = APIRouter(tags=["ai"])


def _live_model_error(error: LiveModelUnavailable):
    raise HTTPException(status_code=503, detail=str(error)) from error


@router.get("/ai/status")
def ai_status():
    status = ai_service.model_status
    if status["mode"] == "local_fallback":
        status["setup"] = "Add an OmniRoute API key to OMNIROUTE_API_KEY in the project-root .env file, then restart the backend."
    return status


@router.post("/ai/brief-builder")
def brief_builder(payload: dict):
    idea = payload.get("idea") or ""
    try:
        brief = ai_service.build_brief_from_idea(idea)
    except LiveModelUnavailable as error:
        _live_model_error(error)
    return {"brief": brief}


@router.post("/ai/match-creators")
def match_creators(payload: dict):
    brief_id = payload.get("brief_id")
    brief = store.find_one("briefs", id=brief_id)
    if not brief:
        raise HTTPException(status_code=404, detail="Brief not found")
    matches = find_matching_creators_for_brief(brief)
    return {"matches": matches}


@router.post("/ai/creative-chat")
def creative_chat(payload: dict):
    message = payload.get("message") or ""
    try:
        result = ai_service.creative_chat(message, payload.get("history"))
    except LiveModelUnavailable as error:
        _live_model_error(error)
    return {
        "reply": result["reply"],
        "suggested_fields": result.get("suggested_fields", {}),
        "model_mode": result.get("model_mode", "local_fallback"),
        "provider": result.get("provider", ""),
    }


@router.post("/ai/agent-chat")
def agent_chat(payload: dict):
    message = payload.get("message") or ""
    try:
        result = ai_service.agent_chat(message, payload.get("history"))
    except LiveModelUnavailable as error:
        _live_model_error(error)
    return {
        "intent": result.get("intent", "brief"),
        "can_create_brief": result.get("can_create_brief", bool(result.get("full_brief"))),
        "reply": result["reply"],
        "actions": result.get("actions", []),
        "brief_preview": result.get("brief_preview", {}),
        "full_brief": result.get("full_brief", {}),
        "model_mode": result.get("model_mode", "local_fallback"),
        "provider": result.get("provider", ""),
    }
