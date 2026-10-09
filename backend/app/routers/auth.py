from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse

from ..database import store
from ..schemas.auth import LoginRequest, RegisterRequest
from ..utils.auth import create_access_token, get_current_user, hash_password, verify_password

router = APIRouter(tags=["auth"])


@router.post("/register")
def register(payload: RegisterRequest):
    existing = store.find_one("users", email=payload.email.lower())
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User already exists")

    user_payload = {
        "id": f"user-{len(store.list('users')) + 1}",
        "name": payload.name,
        "email": payload.email.lower(),
        "password_hash": hash_password(payload.password),
        "role": payload.role,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    user = store.insert("users", user_payload)
    token = create_access_token(user)
    return {"access_token": token, "token_type": "bearer", "user": {"id": user["id"], "name": user["name"], "email": user["email"], "role": user["role"]}}


@router.post("/login")
def login(payload: LoginRequest):
    user = store.find_one("users", email=payload.email.lower())
    if not user or not verify_password(payload.password, user.get("password_hash")):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    token = create_access_token(user)
    return {"access_token": token, "token_type": "bearer", "user": {"id": user["id"], "name": user["name"], "email": user["email"], "role": user["role"]}}


@router.get("/me")
def me(user: dict = Depends(get_current_user)):
    return {"user": {"id": user["id"], "name": user["name"], "email": user["email"], "role": user["role"]}}
