import json
from copy import deepcopy
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

from pymongo import MongoClient
from pymongo.errors import PyMongoError

from .config import DATA_FILE, MONGODB_URI


class DatabaseStore:
    def __init__(self):
        self.db = None
        self.data = {
            "users": [],
            "creators": [],
            "portfolios": [],
            "briefs": [],
            "engagements": [],
            "verification": [],
            "reviews": [],
        }
        self._load_from_file()
        self._connect()

    def _connect(self):
        try:
            client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=2000)
            client.admin.command("ping")
            self.db = client.get_default_database()
            self._sync_from_mongo()
        except Exception:
            self.db = None

    def _load_from_file(self):
        if DATA_FILE.exists():
            try:
                with DATA_FILE.open("r", encoding="utf-8") as file:
                    content = json.load(file)
                    if isinstance(content, dict):
                        self.data = {**self.data, **content}
            except Exception:
                self.data = {
                    "users": [],
                    "creators": [],
                    "portfolios": [],
                    "briefs": [],
                    "engagements": [],
                    "verification": [],
                }

    def _save_to_file(self):
        DATA_FILE.parent.mkdir(exist_ok=True)
        with DATA_FILE.open("w", encoding="utf-8") as file:
            json.dump(self.data, file, indent=2, default=str)

    def _sync_from_mongo(self):
        if not self.db:
            return
        for key in self.data:
            coll = self.db[key]
            docs = list(coll.find({}))
            if docs:
                self.data[key] = docs

    def _persist(self):
        self._save_to_file()
        if self.db:
            for key, items in self.data.items():
                collection = self.db[key]
                collection.delete_many({})
                if items:
                    collection.insert_many(items)

    def get_collection(self, name: str):
        return self.data.get(name, [])

    def find_one(self, collection_name: str, **criteria):
        for item in self.data.get(collection_name, []):
            matches = True
            for key, value in criteria.items():
                if item.get(key) != value:
                    matches = False
                    break
            if matches:
                return item
        return None

    def insert(self, collection_name: str, payload: Dict[str, Any]):
        payload = deepcopy(payload)
        if "_id" not in payload:
            payload["_id"] = self._new_id()
        if "created_at" not in payload:
            payload["created_at"] = datetime.now(timezone.utc).isoformat()
        if "updated_at" not in payload:
            payload["updated_at"] = payload["created_at"]
        self.data.setdefault(collection_name, []).append(payload)
        self._persist()
        return payload

    def update(self, collection_name: str, id_value: str, payload: Dict[str, Any]):
        items = self.data.setdefault(collection_name, [])
        for idx, item in enumerate(items):
            if str(item.get("id")) == str(id_value) or str(item.get("_id")) == str(id_value):
                merged = {**item, **payload}
                merged["updated_at"] = datetime.now(timezone.utc).isoformat()
                items[idx] = merged
                self._persist()
                return merged
        return None

    def delete(self, collection_name: str, id_value: str):
        items = self.data.setdefault(collection_name, [])
        remaining = []
        deleted = None
        for item in items:
            if str(item.get("id")) == str(id_value) or str(item.get("_id")) == str(id_value):
                deleted = item
            else:
                remaining.append(item)
        self.data[collection_name] = remaining
        self._persist()
        return deleted

    def list(self, collection_name: str):
        return deepcopy(self.data.get(collection_name, []))

    def _new_id(self):
        return f"{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S%f')}" 


store = DatabaseStore()
