from typing import Dict, List

from ..database import store


def get_verification_for_creator(creator_id: str) -> List[Dict]:
    return [item for item in store.list("verification") if item.get("creator_id") == creator_id]


def get_verification_status_summary(creator_id: str) -> Dict:
    items = get_verification_for_creator(creator_id)
    if not items:
        return {"status": "not_verified", "label": "Not verified", "is_verified": False, "count": 0, "checks": []}

    values = [str(item.get("status", "pending")).strip().lower() for item in items]
    normalized = []
    for status in values:
        if status in {"verified", "approved", "active", "passed"}:
            normalized.append("verified")
        elif status == "demo":
            normalized.append("demo")
        elif status in {"pending", "in_review", "review"}:
            normalized.append("pending")
        elif status in {"rejected", "declined", "failed"}:
            normalized.append("rejected")
        else:
            normalized.append("pending")

    if any(value == "rejected" for value in normalized):
        status = "rejected"
        label = "Verification rejected"
        is_verified = False
    elif any(value == "pending" for value in normalized):
        status = "pending"
        label = "Pending verification"
        is_verified = False
    elif any(value == "verified" for value in normalized):
        status = "verified"
        label = "Verified"
        is_verified = True
    elif any(value == "demo" for value in normalized):
        status = "demo"
        label = "Demo signals only"
        is_verified = False
    else:
        status = "verified"
        label = "Verified"
        is_verified = True

    return {
        "status": status,
        "label": label,
        "is_verified": is_verified,
        "count": len(items),
        "checks": [
            {
                "id": item.get("id"),
                "type": item.get("type", "Verification"),
                "status": str(item.get("status", "pending")).lower(),
            }
            for item in items
        ],
    }


