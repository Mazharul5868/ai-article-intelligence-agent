# AI Article Intelligence Agent (BriefFlow)

An enterprise-ready, autonomous content intelligence pipeline that converts raw web articles into structured executive summaries and key insights. Built with a high-throughput **FastAPI** gateway and an orchestrated **n8n** background workflow.

---

## 🚀 Architecture & Overview

The system bridges client-side requests with background extraction and cognitive reasoning:

1. **API Ingestion & Validation (FastAPI + Pydantic v2):** Strict schema enforcement, extra-field forbidding, and request tracking with correlation IDs.
2. **Orchestration Gateway (n8n Webhook):** Asynchronous workflow management via a persistent HTTP client connection pool (`httpx.AsyncClient`).
3. **Extraction Engine (Firecrawl):** Headless scraping that eliminates DOM clutter, advertisements, and paywalls to yield clean Markdown.
4. **Cognitive Synthesis (LLM Node):** Extracts core narratives, structured key takeaways, and formatted chat responses.
5. **Dual Persistence & Alerting:** Appends record rows to **Google Sheets** and dispatches executive email reports via **SMTP**.

---

## 🛠️ Tech Stack

- **Backend Framework:** FastAPI (Python 3.12+)
- **Data Validation & Settings:** Pydantic v2, `pydantic-settings`
- **HTTP Engine:** HTTPX (Async client pooling with extended timeout windows)
- **Workflow Automation:** n8n (Cloud/Self-hosted)
- **Scraping:** Firecrawl API
- **Testing Suite:** Pytest, HTTPX TestClient

---

## 📂 Project Structure

```text
ai-article-intelligence-agent/
├── Backend/
│   ├── api/
│   │   └── routes.py              # API endpoint routes & dependency injection
│   ├── app/
│   │   ├── clients/
│   │   │   └── n8n.py             # HTTP client interface for n8n webhooks
│   │   ├── config.py              # Environment configuration via Pydantic
│   │   ├── schemas.py             # Ingestion & response data models
│   │   └── services.py            # Business logic orchestration
│   ├── tests/
│   │   └── test_api.py            # Automated API and failure scenario tests
│   ├── app/main.py                # App entrypoint, lifespan context & middleware
│   ├── pyproject.toml             # Pytest and project settings
│   └── requirements.txt           # Python dependencies
├── .gitignore
└── README.md