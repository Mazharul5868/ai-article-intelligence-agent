from pydantic import BaseModel, ConfigDict, Field, HttpUrl


class ProcessArticleRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    email: str = Field(min_length=3, max_length=320)
    article_url: HttpUrl
    session_id: str = Field(min_length=1, max_length=128, pattern=r"^[A-Za-z0-9._:-]+$")


class ProcessArticleResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")

    status: str
    session_id: str
    article_url: HttpUrl
    summary: str
    insights: list[str]
    chat_message: str | None = None