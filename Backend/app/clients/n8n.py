import json

import httpx
from fastapi import HTTPException

from app.config import Settings
from app.schemas import ProcessArticleRequest, ProcessArticleResponse


class N8nWebhookError(Exception):
    """Raised when the n8n webhook cannot produce a valid result."""


class N8nClient:
    def __init__(self, http_client: httpx.AsyncClient, settings: Settings) -> None:
        self._http_client = http_client
        self._settings = settings

    async def process_article(self, request: ProcessArticleRequest) -> ProcessArticleResponse:
        headers = {"Accept": "application/json"}
        if self._settings.n8n_webhook_token:
            headers["Authorization"] = f"Bearer {self._settings.n8n_webhook_token}"

        try:
            response = await self._http_client.post(
                str(self._settings.n8n_webhook_url),
                json=request.model_dump(mode="json"),
                headers=headers,
                timeout=self._settings.n8n_timeout_seconds,
            )

            # Safely attempt JSON parsing without crashing
            try:
                body = response.json()
            except (json.JSONDecodeError, ValueError):
                body = None

            if response.status_code != 200:
                if isinstance(body, dict):
                    detail = body.get("message") or body.get("error") or str(body)
                elif response.text.strip():
                    detail = response.text.strip()[:300]
                else:
                    detail = f"Workflow failed with status code {response.status_code}."
                raise HTTPException(status_code=response.status_code, detail=detail)

            if not isinstance(body, dict):
                raise HTTPException(
                    status_code=502,
                    detail="Workflow completed without returning valid JSON data.",
                )

            return ProcessArticleResponse.model_validate(body)

        except httpx.TimeoutException as err:
            raise HTTPException(
                status_code=504,
                detail=f"Gateway Timeout: n8n workflow took longer than {self._settings.n8n_timeout_seconds}s to finish."
            ) from err

        except httpx.ConnectError as err:
            raise HTTPException(
                status_code=502,
                detail="Bad Gateway: Could not reach the n8n webhook service."
            ) from err

        except HTTPException:
            raise

        except Exception as error:
            raise HTTPException(
                status_code=500,
                detail=f"Downstream processing error: {str(error)}"
            ) from error