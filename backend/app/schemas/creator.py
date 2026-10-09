from typing import List, Optional
from pydantic import BaseModel


class CreatorProfileInput(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    languages: List[str] = []
    specializations: List[str] = []
    skills: List[str] = []
    tools: List[str] = []
    content_types: List[str] = []
    formats: List[str] = []
    availability: Optional[str] = None
    commercial_use: Optional[str] = None
    licensing_notes: Optional[str] = None
    usage_rights: Optional[str] = None
    rate: Optional[str] = None
    profile_image: Optional[str] = None
    verification: Optional[dict] = None
    source_url: Optional[str] = None
    source_platform: Optional[str] = None
    external_profile: Optional[bool] = None
    source_note: Optional[str] = None
