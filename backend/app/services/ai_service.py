from typing import Dict

from ..config import OMNIROUTE_API_KEY, OMNIROUTE_BASE_URL, OMNIROUTE_MODEL
from .agent_chat_service import respond as respond_to_agent


class AIService:
    def __init__(self):
        self.api_key = OMNIROUTE_API_KEY

    @property
    def model_status(self) -> Dict:
        if not self.api_key:
            return {
                "mode": "local_fallback",
                "provider": "OmniRoute",
                "model": OMNIROUTE_MODEL,
                "live_model_configured": False,
            }
        return {
            "mode": "live_configured",
            "provider": "OmniRoute",
            "model": OMNIROUTE_MODEL,
            "live_model_configured": True,
        }

    def agent_chat(self, client_message: str, history=None) -> Dict:
        return self._respond(client_message, history)

    def _respond(self, client_message: str, history=None, force_brief: bool = False) -> Dict:
        result = respond_to_agent(
            self.api_key, OMNIROUTE_MODEL, client_message, history, force_brief,
            OMNIROUTE_BASE_URL,
        )
        result["provider"] = "OmniRoute" if result.get("model_mode") == "live" else ""
        return result

    def creative_chat(self, client_message: str, history=None) -> Dict:
        result = self._respond(client_message, history)
        brief = result.get("full_brief") or {}
        fields = (
            "platform", "content_type", "style", "aspect_ratio", "duration",
            "commercial_use_required", "licensing_requirement", "usage_rights",
            "target_audience", "required_tools", "required_skills", "required_specialization",
        )
        suggested_fields = {
            key: brief[key] for key in fields
            if brief.get(key) not in (None, "", [])
        } if result.get("can_create_brief") else {}
        return {
            "reply": result["reply"],
            "suggested_fields": suggested_fields,
            "model_mode": result.get("model_mode", "local_fallback"),
            "provider": result.get("provider", ""),
        }

    def build_brief_from_idea(self, idea: str) -> Dict:
        prompt = (idea or "").strip()
        if prompt:
            result = self._respond(prompt, force_brief=True)
            brief = result.get("full_brief")
            if result.get("can_create_brief") and isinstance(brief, dict):
                return brief

        return {
            "campaign_name": "Untitled Campaign",
            "brand_name": "",
            "description": prompt,
            "objective": "Create engaging AI-driven campaign content",
            "content_type": "Video",
            "style": "Cinematic",
            "target_audience": "",
            "location": "",
            "language": "",
            "platform": "Instagram",
            "aspect_ratio": "9:16",
            "duration": "",
            "required_skills": [],
            "required_tools": [],
            "required_specialization": [],
            "budget": "",
            "country": "",
            "currency": "USD",
            "project_type": "Video",
            "deadline": "",
            "commercial_use_required": "",
            "licensing_requirement": "",
            "usage_rights": "",
            "reference_links": [],
            "additional_requirements": "",
            "status": "draft",
        }


ai_service = AIService()
