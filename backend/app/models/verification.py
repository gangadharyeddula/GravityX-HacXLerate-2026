from typing import Optional
from pydantic import BaseModel


class VerificationModel(BaseModel):
    id: str
    creator_id: str
    type: str
    status: str = "demo"
    evidence: Optional[str] = None
    verified_at: Optional[str] = None
