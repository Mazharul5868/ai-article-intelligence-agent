# Insightful Digest

Create a modern, responsive single-page web application for an AI-Powered Article Intelligence & Summarization tool. Use React, Tailwind CSS, Lucide icons, and shadcn/ui components.

### 1. Application Overview
The user inputs an article URL and their email address to trigger an asynchronous analysis pipeline. The app communicates with a backend REST API, shows engaging progressive-loading states during the 20-40 second processing window, and renders the synthesized insights, summaries, and audit confirmations in a clean, executive-ready dashboard.

---

### 2. Backend API Integration Details
- Base URL: Configurable via environment variable (`VITE_API_BASE_URL` or default `http://127.0.0.1:8000`)
- Endpoint: `POST /api/v1/articles/process`
- Request Headers: `Content-Type: application/json`, `Accept: application/json`
- Request Body:
  ```json
  {
    "email": "user@example.com",
    "article_url": "[https://example.com/article](https://example.com/article)",
    "session_id": "auto_generated_uuid"
  }

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/581b3f1d-9c3a-4a55-ae89-f8850d488c6a).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
