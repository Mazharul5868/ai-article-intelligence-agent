from functools import lru_cache
from typing import List

from pydantic import AnyHttpUrl, Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_prefix="", extra="ignore")

    app_name: str = Field(default="IntelFlow API", validation_alias="API_TITLE")
    n8n_webhook_url: AnyHttpUrl = Field(..., validation_alias="N8N_WEBHOOK_URL")
    
    # SecretStr masks the token (renders as '**********') when printed or logged
    n8n_webhook_token: SecretStr = Field(..., validation_alias="N8N_WEBHOOK_TOKEN")
    n8n_timeout_seconds: float = Field(default=90.0, gt=0, le=180)
    log_level: str = Field(default="INFO", validation_alias="LOG_LEVEL")
    allowed_origins: str = Field(default="*", validation_alias="ALLOWED_ORIGINS")

    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip().rstrip("/") for origin in self.allowed_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()