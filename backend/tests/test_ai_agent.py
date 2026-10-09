from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_ai_agent_chat_returns_structured_response():
    response = client.post(
        "/api/ai/agent-chat",
        json={"message": "Create a launch brief for my skincare line on TikTok"},
    )

    assert response.status_code == 200, response.text
    payload = response.json()
    assert "reply" in payload
    assert "actions" in payload
    assert "brief_preview" in payload
    assert "full_brief" in payload
    assert payload["brief_preview"]["platform"] in {"TikTok", "Instagram", "YouTube"}
    assert payload["full_brief"]["platform"] == payload["brief_preview"]["platform"]
    assert isinstance(payload["actions"], list)
