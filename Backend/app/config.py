from functools import lru_cache

from pydantic import AnyHttpUrl, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_prefix="", extra="ignore")

    app_name: str = Field(default="Article Workflow API", validation_alias="API_TITLE")
    n8n_webhook_url: AnyHttpUrl = (
        "https://mazharul5868.app.n8n.cloud/webhook/process-article"
    )
    n8n_webhook_token: str | None = None
    n8n_timeout_seconds: float = Field(default=90.0, gt=0, le=180)
    log_level: str = "INFO"


@lru_cache
def get_settings() -> Settings:
    return Settings()