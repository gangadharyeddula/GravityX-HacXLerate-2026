import os
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR.parent / ".env")

APP_ENV = os.getenv("APP_ENV", "development")
JWT_SECRET = os.getenv("JWT_SECRET", "creator-twin-demo-secret")
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/creatortwin")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
OMNIROUTE_API_KEY = os.getenv("OMNIROUTE_API_KEY", "").strip()
OMNIROUTE_BASE_URL = os.getenv("OMNIROUTE_BASE_URL", "http://localhost:20128/v1").rstrip("/")
OMNIROUTE_MODEL = os.getenv("OMNIROUTE_MODEL", "auto").strip() or "auto"
DEMO_MODE = os.getenv("DEMO_MODE", "true").lower() == "true"
DATA_DIR = BASE_DIR / "data"
DATA_FILE = DATA_DIR / "demo_store.json"

DATA_DIR.mkdir(exist_ok=True)
