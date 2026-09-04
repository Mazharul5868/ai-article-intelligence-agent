# Article Workflow API

FastAPI gateway for the n8n `process-article` webhook.

## Run locally

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -e ".[dev]"
Copy-Item .env.example .env
uvicorn app.main:app --reload
```

The API is available at `http://localhost:8000`. Interactive documentation is at `/docs`.

### Endpoint

`POST /api/v1/articles/process`

```json
{
  "email": "user@example.com",
  "article_url": "https://example.com/article",
  "session_id": "sess_12345"
}
```

The n8n URL, optional bearer token, and timeout are configured through environment variables. The service returns `502` when n8n is unavailable or returns an invalid response.

## Test and lint

```powershell
pytest
ruff check .
```