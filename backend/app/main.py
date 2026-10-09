from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import FRONTEND_URL
from .routers.ai import router as ai_router
from .routers.auth import router as auth_router
from .routers.briefs import router as briefs_router
from .routers.creators import router as creators_router
from .routers.dashboard import router as dashboard_router
from .routers.engagements import router as engagements_router
from .routers.portfolios import router as portfolios_router
from .routers.reviews import router as reviews_router
from .routers.verification import router as verification_router
from .seed import ensure_seed_data

app = FastAPI(title="CreatorTwin AI", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*", FRONTEND_URL, "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "CreatorTwin AI"}


app.include_router(auth_router, prefix="/api/auth")
app.include_router(creators_router, prefix="/api")
app.include_router(portfolios_router, prefix="/api")
app.include_router(briefs_router, prefix="/api")
app.include_router(engagements_router, prefix="/api")
app.include_router(reviews_router, prefix="/api")
app.include_router(ai_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api")
app.include_router(verification_router, prefix="/api")

ensure_seed_data()
