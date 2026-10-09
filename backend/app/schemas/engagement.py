from typing import Optional
from pydantic import BaseModel, Field, HttpUrl, field_validator


class EngagementInput(BaseModel):
    brief_id: str
    creator_id: str
    message: Optional[str] = None
    proposed_budget: Optional[str] = None
    proposed_deadline: Optional[str] = None


class DeliveryInput(BaseModel):
    delivery_url: HttpUrl
    delivery_note: str = Field(min_length=8, max_length=3000)

    @field_validator("delivery_note")
    @classmethod
    def delivery_note_must_contain_text(cls, value):
        cleaned = value.strip()
        if len(cleaned) < 8:
            raise ValueError("Delivery notes must contain at least 8 non-space characters")
        return cleaned


class RevisionInput(BaseModel):
    revision_notes: str = Field(min_length=8, max_length=3000)

    @field_validator("revision_notes")
    @classmethod
    def revision_notes_must_contain_text(cls, value):
        cleaned = value.strip()
        if len(cleaned) < 8:
            raise ValueError("Revision notes must contain at least 8 non-space characters")
        return cleaned
