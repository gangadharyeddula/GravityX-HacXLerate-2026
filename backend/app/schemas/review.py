from typing import Dict, Optional

from pydantic import BaseModel, Field


class ReviewInput(BaseModel):
    reviewer_id: Optional[str] = None
    reviewee_id: str
    reviewee_role: str = "creator"
    engagement_id: str
    rating: int = Field(ge=1, le=5)
    review_title: str = ""
    review_text: str = ""
    categories: Dict[str, int] = {}
