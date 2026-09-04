import httpx
import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client


def test_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_process_rejects_unknown_fields(client):
    response = client.post(
        "/api/v1/articles/process",
        json={
            "email": "user@example.com",
            "article_url": "https://example.com/article",
            "session_id": "sess_12345",
            "unexpected": True,
        },
    )
    assert response.status_code == 422


def test_process_maps_workflow_failure(client, monkeypatch):
    async def fail(*args, **kwargs):
        from app.clients.n8n import N8nWebhookError
        raise N8nWebhookError("workflow failed")

    monkeypatch.setattr("app.services.ArticleService.process", fail)
    response = client.post(
        "/api/v1/articles/process",
        json={
            "email": "user@example.com",
            "article_url": "https://newsroom.ibm.com/why-the-rise-of-model-routing-is-a-bet-against-permanence",
            "session_id": "sess_12345",
        },
    )
    assert response.status_code == 502