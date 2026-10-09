from typing import Literal, Optional

from pydantic import BaseModel, Field, field_validator


class VerificationInput(BaseModel):
    type: Literal["Tool verification", "Workflow verification", "Portfolio verification", "Commercial rights review"]
    evidence: str = Field(min_length=8, max_length=2000)

    @field_validator("evidence")
    @classmethod
    def evidence_must_contain_text(cls, value):
        cleaned = value.strip()
        if len(cleaned) < 8:
            raise ValueError("Evidence must contain at least 8 non-space characters")
        return cleaned


class VerificationDecision(BaseModel):
    status: Literal["verified", "rejected"]
    review_note: Optional[str] = Field(default=None, max_length=2000)
