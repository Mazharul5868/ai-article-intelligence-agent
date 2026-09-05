# IntelFlow — AI Article Intelligence

IntelFlow is an AI-powered article intelligence pipeline that transforms web articles into concise summaries and actionable key insights.

It combines a **React frontend**, **FastAPI backend**, and **n8n workflow** with **Firecrawl** for article extraction, LLM-powered analysis, Google Sheets logging, and automated email delivery.

---

## Architecture

```text
React Frontend
      │
      │ API Request
      ▼
FastAPI Backend
      │
      │ Webhook
      ▼
     n8n
      │
      ├── Firecrawl ─────── Article Extraction
      ├── LLM ───────────── Summary & Key Insights
      ├── Google Sheets ─── Result Logging
      └── SMTP ──────────── Email Delivery
```

### How It Works

1. The user submits an **email address** and **article URL**.
2. FastAPI validates the request, generates a `session_id`, and forwards it to n8n.
3. Firecrawl extracts the article content.
4. The LLM generates a concise summary and key insights.
5. n8n logs the result in Google Sheets and sends the report via email.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, TanStack Router, Tailwind CSS, Vite |
| Backend | FastAPI, Python 3.12+, Pydantic v2, HTTPX |
| Orchestration | n8n |
| Web Extraction | Firecrawl |
| AI Processing | LLM |
| Persistence | Google Sheets |
| Notifications | SMTP |
| Testing | Pytest |

---

## Project Structure

```text
ai-article-intelligence-agent/
├── Backend/
│   ├── api/
│   │   └── routes.py
│   ├── app/
│   │   ├── clients/
│   │   │   └── n8n.py
│   │   ├── config.py
│   │   ├── schemas.py
│   │   ├── services.py
│   │   └── main.py
│   ├── tests/
│   ├── .env.example
│   └── requirements.txt
│
├── Frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   └── routes/
│   ├── package.json
│   └── vite.config.ts
├── n8n/
│   ├── README.md
│   └── intelflow-workflow.json    # Core orchestration logic
├── .gitignore
└── README.md
```

---

## Quickstart

### Prerequisites

Make sure you have:

- **Node.js** 20+
- **Python** 3.12+
- An active [n8n](https://n8n.io/) instance
- A [Firecrawl](https://firecrawl.dev/) API key
- Required AI, Google Sheets, and SMTP credentials configured in n8n

### 1. Clone the Repository

```bash
git clone https://github.com/Mazharul5868/ai-article-intelligence-agent.git
cd ai-article-intelligence-agent
```

### 2. Configure the Environment

Create the backend environment file.

**macOS / Linux**

```bash
cp Backend/.env.example Backend/.env
```

**Windows PowerShell**

```powershell
Copy-Item Backend/.env.example Backend/.env
```

Configure `Backend/.env`:

```env
N8N_WEBHOOK_URL="https://your-n8n-instance.com/webhook/your-secret-path"
N8N_WEBHOOK_TOKEN="your_optional_token"
```

> **Note:** Never commit `.env` files, API keys, or credentials to the repository.

### 3. Configure the n8n Workflow

1. Open your n8n instance and import `n8n/intelflow-workflow.json`.
2. Connect your credentials for Firecrawl, LLM, Google Sheets, and SMTP.
3. Toggle the workflow to **Active**.
4. Copy the production webhook URL into `Backend/.env` (`N8N_WEBHOOK_URL`).

### 4. Start the Backend

Navigate to the backend directory and create a virtual environment:

```bash
cd Backend
python -m venv .venv
```

Activate the virtual environment.

**macOS / Linux**

```bash
source .venv/bin/activate
```

**Windows PowerShell**

```powershell
.venv\Scripts\Activate.ps1
```

Install the dependencies:

```bash
pip install -r requirements.txt
```

Start the FastAPI server:

```bash
uvicorn app.main:app --reload
```

The backend will be available at:

- API: `http://127.0.0.1:8000`
- API Docs: `http://127.0.0.1:8000/docs`

### 5. Start the Frontend

Open a second terminal:

```bash
cd Frontend
npm install
npm run dev
```

The frontend will typically be available at:

`http://localhost:5173`

### 6. Start the n8n Workflow

Ensure the **IntelFlow n8n workflow is active** and the required Firecrawl, AI model, Google Sheets, and SMTP credentials are configured.

Open `http://localhost:5173`, enter an email address and article URL, and submit the request.

---

## API Payload

FastAPI forwards the following payload to the n8n webhook:

```json
{
  "email": "user@example.com",
  "article_url": "https://example.com/article",
  "session_id": "generated-session-id"
}
```

---

## Testing

Run the backend tests from the `Backend` directory:

```bash
pytest
```

For verbose output:

```bash
pytest -v
```

---

## Troubleshooting

### n8n Webhook Not Responding

- Confirm the n8n workflow is active.
- Verify `N8N_WEBHOOK_URL`.
- Use the production webhook URL rather than the test URL.
- Confirm the webhook accepts `POST` requests.

### Frontend Cannot Reach FastAPI

- Confirm the backend is running on port `8000`.
- Verify the frontend is using the correct backend URL.
- Check the browser console for CORS or network errors.

### Firecrawl Extraction Fails

- Verify the Firecrawl credentials in n8n.
- Ensure the target article URL is publicly accessible.

---

## Security

- Store API keys and secrets in environment variables.
- Never commit `.env` files to version control.
- Validate incoming requests through the FastAPI gateway.
- Use `N8N_WEBHOOK_TOKEN` to secure webhook communication when authentication is enabled.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.