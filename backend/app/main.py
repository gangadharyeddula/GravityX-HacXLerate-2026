from pathlib import Path

from fastapi import FastAPI
from fastapi import HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

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


FRONTEND_DIST = Path(__file__).resolve().parents[2] / "frontend" / "dist"
FRONTEND_ASSETS = FRONTEND_DIST / "assets"
if FRONTEND_ASSETS.is_dir():
    app.mount("/assets", StaticFiles(directory=FRONTEND_ASSETS), name="frontend-assets")


@app.get("/{path:path}", include_in_schema=False)
def serve_frontend(path: str):
    if path == "api" or path.startswith("api/"):
        raise HTTPException(status_code=404, detail="Not found")

    index_file = FRONTEND_DIST / "index.html"
    if not index_file.is_file():
        raise HTTPException(status_code=404, detail="Frontend build not found")

    frontend_root = FRONTEND_DIST.resolve()
    requested_file = (FRONTEND_DIST / path).resolve()
    try:
        requested_file.relative_to(frontend_root)
    except ValueError as error:
        raise HTTPException(status_code=404, detail="Not found") from error

    if requested_file.is_file():
        return FileResponse(requested_file)
    return FileResponse(index_file)

ensure_seed_data()
