from fastapi.testclient import TestClient

from app.database import store
from app.main import app
from app.services.currency_service import convert_to_local_price, get_local_price_display
from app.services.review_service import has_duplicate_review
from app.services.verification_service import get_verification_status_summary
from app.utils.auth import get_current_user


def test_currency_for_india():
    assert convert_to_local_price(500, "India") == 41500


def test_local_price_display_uses_currency_symbol():
    assert get_local_price_display(500, "United Kingdom") == "£390"


def test_duplicate_review_is_detected():
    reviews = [{"reviewer_id": "u-1", "engagement_id": "eng-1"}]
    assert has_duplicate_review(reviews, "u-1", "eng-1") is True
    assert has_duplicate_review(reviews, "u-2", "eng-1") is False


def test_creator_can_accept_engagement_with_status_query_param():
    app.dependency_overrides[get_current_user] = lambda: {"id": "user-creator", "role": "creator"}
    try:
        store.insert(
            "engagements",
            {
                "id": "eng-accept-test",
                "brief_id": "brief-1",
                "brand_id": "user-brand",
                "creator_id": "creator-demo",
                "message": "Interested in collaborating.",
                "budget": "1500",
                "deadline": "2024-12-15",
                "status": "pending",
                "created_at": "2024-01-01T00:00:00Z",
                "updated_at": "2024-01-01T00:00:00Z",
            },
        )
        client = TestClient(app)
        response = client.put("/api/engagements/eng-accept-test/status?status=accepted")
        assert response.status_code == 200
        assert response.json()["engagement"]["status"] == "accepted"
    finally:
        app.dependency_overrides.clear()
        store.delete("engagements", "eng-accept-test")


def test_verification_summary_marks_demo_records_as_verified():
    creator_id = "creator-verification-summary"
    store.insert(
        "verification",
        {
            "id": "verification-summary-1",
            "creator_id": creator_id,
            "type": "Tool verification",
            "status": "demo",
            "evidence": "Demo Verified Signal",
            "verified_at": "2024-01-01T00:00:00Z",
        },
    )
    summary = get_verification_status_summary(creator_id)
    assert summary["status"] == "verified"
    assert summary["is_verified"] is True
    store.delete("verification", "verification-summary-1")


def test_review_requires_matching_engagement_party():
    app.dependency_overrides[get_current_user] = lambda: {"id": "user-brand", "role": "brand"}
    client = TestClient(app)
    try:
        store.insert(
            "engagements",
            {
                "id": "eng-review-party-test",
                "brief_id": "brief-1",
                "brand_id": "user-brand",
                "creator_id": "creator-demo",
                "message": "Interested in collaborating.",
                "budget": "1500",
                "deadline": "2024-12-15",
                "status": "accepted",
                "created_at": "2024-01-01T00:00:00Z",
                "updated_at": "2024-01-01T00:00:00Z",
            },
        )
        response = client.post(
            "/api/reviews",
            json={
                "engagement_id": "eng-review-party-test",
                "reviewee_id": "user-brand",
                "reviewee_role": "brand",
                "rating": 5,
                "review_title": "Great partner",
                "review_text": "Loved the process.",
                "categories": {"communication": 5},
            },
        )
        assert response.status_code == 403
    finally:
        app.dependency_overrides.clear()
        store.delete("engagements", "eng-review-party-test")
