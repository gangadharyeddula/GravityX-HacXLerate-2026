from typing import Optional
from pydantic import BaseModel, Field


class EngagementModel(BaseModel):
    id: str
    brief_id: str
    brand_id: str
    creator_id: str
    message: Optional[str] = None
    budget: Optional[str] = None
    deadline: Optional[str] = None
    status: str = "pending"
    delivery_url: Optional[str] = None
    delivery_note: Optional[str] = None
    revision_notes: Optional[str] = None
    deliveries: list[dict] = Field(default_factory=list)
    revision_requests: list[dict] = Field(default_factory=list)
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
