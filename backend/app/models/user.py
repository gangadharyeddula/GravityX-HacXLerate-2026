from pydantic import BaseModel, EmailStr
from typing import Optional


class UserModel(BaseModel):
    id: str
    name: str
    email: EmailStr
    password_hash: str
    role: str
    created_at: Optional[str] = None
