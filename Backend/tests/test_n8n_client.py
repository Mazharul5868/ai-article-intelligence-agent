import json

import httpx
import pytest

from app.clients.n8n import N8nClient
from app.config import Settings
from app.schemas import ProcessArticleRequest


@pytest.mark.asyncio
async def test_client_posts_expected_payload_and_parses_response():
    received: dict = {}

    async def handler(request: httpx.Request) -> httpx.Response:
        received.update(json.loads(request.content))
        return httpx.Response(
            200,
            json={
                "status": "success",
                "session_id": "sess_12345",
                "article_url": "https://newsroom.ibm.com/why-the-rise-of-model-routing-is-a-bet-against-permanence",
                "summary": "A summary",
                "insights": ["One insight"],
                "chat_message": "Done",
            },
        )

    request = ProcessArticleRequest(
        email="user@example.com",
        article_url="https://example.com/article",
        session_id="sess_12345",
    )
    async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as http_client:
        client = N8nClient(
            http_client,
            Settings(n8n_webhook_url="https://workflow.test/webhook", n8n_timeout_seconds=5),
        )
        result = await client.process_article(request)

    assert received == request.model_dump(mode="json")
    assert result.status == "success"
    assert result.insights == ["One insight"]