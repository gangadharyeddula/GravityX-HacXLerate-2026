from typing import List, Optional
from pydantic import BaseModel


class PortfolioItemInput(BaseModel):
    title: str
    description: str
    media_url: str
    thumbnail_url: Optional[str] = None
    content_type: str
    tools: List[str] = []
    models: List[str] = []
    skills: List[str] = []
    specialization: Optional[str] = None
    workflow: List[str] = []
    aspect_ratio: Optional[str] = None
    duration: Optional[str] = None
    commercial_use: Optional[str] = None
    licensing_notes: Optional[str] = None
    usage_rights: Optional[str] = None
    verification: Optional[dict] = None
    source_url: Optional[str] = None
    source_platform: Optional[str] = None
    creator_attribution: Optional[str] = None
    rights_status: Optional[str] = None
    ai_provenance: Optional[str] = None
