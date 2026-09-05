# IntelFlow — n8n Orchestration Workflow

This directory contains the orchestration blueprint for IntelFlow, handling web scraping, cognitive LLM reasoning, audit logging, and email delivery.

## How to Import

1. Open your self-hosted or cloud [n8n](https://n8n.io/) instance.
2. Go to **Workflows** → click the **Add Workflow** button (or press `Ctrl/Cmd + N`).
3. Click the menu dots (`...`) in the top-right corner of the canvas.
4. Select **Import from File...** and choose `intelflow-workflow.json`.

## Required Credentials

After importing, configure credentials for the following nodes:

* **Firecrawl API**: Web scraper node
* **LLM Provider**: OpenAI, Anthropic, or compatible cognitive engine
* **Google Sheets OAuth / Service Account**: Audit log target sheet
* **SMTP Credentials**: Outbound email notification node

## Activation

1. Toggle the workflow status switch in the top header from **Inactive** to **Active**.
2. Double-click the **Webhook** node and copy the **Production URL**.
3. Paste that production URL into your `Backend/.env` file under `N8N_WEBHOOK_URL`.