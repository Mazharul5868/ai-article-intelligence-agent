import os
from contextlib import asynccontextmanager
from uuid import uuid4

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from api.routes import router
from app.clients.n8n import N8nClient
from app.config import get_settings
from app.services import ArticleService

load_dotenv()  

@asynccontextmanager
async def lifespan(application: FastAPI):
    settings = get_settings()
    timeout = httpx.Timeout(
        settings.n8n_timeout_seconds,
        connect=10.0,
    )
    async with httpx.AsyncClient(timeout=timeout) as http_client:
        application.state.article_service = ArticleService(N8nClient(http_client, settings))
        yield


app = FastAPI(title=get_settings().app_name, version="0.1.0", lifespan=lifespan)
app.include_router(router)

raw_origins = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173, http://localhost:8080,http://127.0.0.1:8080",
)
origins = [origin.strip() for origin in raw_origins.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def request_id_middleware(request: Request, call_next):
    request_id = request.headers.get("X-Request-ID", str(uuid4()))
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    return response


@app.get("/health", tags=["health"])
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.exception_handler(Exception)
async def unhandled_exception_handler(_: Request, __: Exception) -> JSONResponse:
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})