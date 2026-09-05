export const API_BASE_URL =
  (import.meta.env["VITE_API_BASE_URL"] as string | undefined)?.replace(/\/$/, "") ||
  "http://127.0.0.1:8000";

export interface ProcessArticleRequest {
  email: string;
  article_url: string;
  session_id: string;
}

/**
 * Loose-typed API response — the backend may evolve, so unknown fields are
 * tolerated and mapped defensively in the UI layer.
 */
export interface ProcessArticleResponse {
  title?: string;
  summary?: string;
  insights?: Array<string | { text?: string; insight?: string }>;
  confidence?: string | number;
  source_grounded?: number | string;
  key_insight_count?: number;
  open_questions?: number;
  audit_id?: string;
  email_delivered?: boolean;
  status?: string;
  [key: string]: unknown;
}

export async function processArticle(
  payload: ProcessArticleRequest,
  signal?: AbortSignal | null,
): Promise<ProcessArticleResponse> {
  const res = await fetch(`${API_BASE_URL}/api/v1/articles/process`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
    signal: signal ?? null,
  });

  if (!res.ok) {
    let errorMessage = `Analysis request failed (${res.status})`;

    try {
      const errorJson = await res.json();
      if (typeof errorJson?.detail === "string") {
        errorMessage = errorJson.detail;
      } else if (Array.isArray(errorJson?.detail)) {
        errorMessage = errorJson.detail.map((e: { msg?: string }) => e.msg).filter(Boolean).join(", ") || errorMessage;
      } else if (errorJson?.message) {
        errorMessage = errorJson.message;
      }
    } catch {
      const rawText = await res.text().catch(() => "");
      if (rawText.trim()) errorMessage = rawText.slice(0, 150);
    }

    throw new Error(errorMessage);
  }

  try {
    return (await res.json()) as ProcessArticleResponse;
  } catch {
    throw new Error("Server returned an invalid JSON response.");
  }
}
