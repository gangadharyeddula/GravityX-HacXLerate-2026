from typing import List, Optional
from pydantic import BaseModel


class BriefModel(BaseModel):
    id: str
    brand_id: str
    campaign_name: str
    brand_name: str
    description: str
    objective: Optional[str] = None
    content_type: Optional[str] = None
    style: Optional[str] = None
    target_audience: Optional[str] = None
    location: Optional[str] = None
    language: Optional[str] = None
    platform: Optional[str] = None
    aspect_ratio: Optional[str] = None
    duration: Optional[str] = None
    required_tools: List[str] = []
    required_skills: List[str] = []
    required_specialization: List[str] = []
    budget: Optional[str] = None
    deadline: Optional[str] = None
    commercial_use_required: Optional[str] = None
    licensing_requirement: Optional[str] = None
    usage_rights: Optional[str] = None
    reference_links: List[str] = []
    additional_requirements: Optional[str] = None
    status: str = "draft"
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
