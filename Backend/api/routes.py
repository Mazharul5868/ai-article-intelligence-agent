from fastapi import APIRouter, Depends, Request, status

from app.schemas import ProcessArticleRequest, ProcessArticleResponse
from app.services import ArticleService

router = APIRouter(prefix="/api/v1", tags=["articles"])


def get_article_service(request: Request) -> ArticleService:
    return request.app.state.article_service


@router.post(
    "/articles/process",
    response_model=ProcessArticleResponse,
    status_code=status.HTTP_200_OK,
    summary="Process an article through the n8n workflow",
)
async def process_article(
    payload: ProcessArticleRequest,
    service: ArticleService = Depends(get_article_service),
) -> ProcessArticleResponse:
        return await service.process(payload)