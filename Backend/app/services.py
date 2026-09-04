from app.clients.n8n import N8nClient
from app.schemas import ProcessArticleRequest, ProcessArticleResponse


class ArticleService:
    def __init__(self, n8n_client: N8nClient) -> None:
        self._n8n_client = n8n_client

    async def process(self, request: ProcessArticleRequest) -> ProcessArticleResponse:
        return await self._n8n_client.process_article(request)