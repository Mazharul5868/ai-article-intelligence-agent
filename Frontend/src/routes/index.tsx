import { processArticle, type ProcessArticleResponse } from "@/lib/api";
import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  BrainCircuit,
  Check,
  FileText,
  Link2,
  Mail,
  RotateCcw,
  Send,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "IntelFlow — AI Article Intelligence & Summarization" },
      {
        name: "description",
        content:
          "Drop an article URL and IntelFlow reads, extracts, and returns an actionable summary with key insights straight to your inbox.",
      },
      { property: "og:title", content: "IntelFlow — AI Article Intelligence" },
      {
        property: "og:description",
        content:
          "Decision-ready article briefs with synthesized insights and a full audit trail, in under a minute.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Phase = "idle" | "processing" | "done" | "error";

const PIPELINE_STEPS = [
  { label: "Reading Article", detail: "fetching and cleaning web page content" },
  { label: "Analyzing Content", detail: "identifying key facts and claims" },
  { label: "Generating Insights", detail: "drafting summary and takeaways" },
  { label: "Sending Report", detail: "saving record and emailing brief" },
];

// Approximate stage boundaries (ms) across the typical 20–40s window.
const STEP_TIMES = [0, 6000, 14000, 26000];
const ESTIMATED_SECONDS = 34;

function normalizeInsights(
  insights: ProcessArticleResponse["insights"],
): Array<string> {
  if (!Array.isArray(insights)) return [];
  return insights
    .map((i) => (typeof i === "string" ? i : (i.text ?? i.insight ?? "")))
    .filter(Boolean)
    .slice(0, 6);
}

function Index() {
  const [articleUrl, setArticleUrl] = useState("");
  const [email, setEmail] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [sessionId, setSessionId] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [result, setResult] = useState<ProcessArticleResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const activeStep = (() => {
    if (phase === "done") return PIPELINE_STEPS.length;
    if (phase !== "processing") return -1;
    const [, t1 = 6, t2 = 14, t3 = 26] = STEP_TIMES.map((t) => t / 1000);
    if (elapsed < t1) return 0;
    if (elapsed < t2) return 1;
    if (elapsed < t3) return 2;
    return 3;
  })();

  useEffect(() => {
    if (phase !== "processing") return;
    const started = Date.now();
    const t = window.setInterval(
      () => setElapsed((Date.now() - started) / 1000),
      200,
    );
    return () => window.clearInterval(t);
  }, [phase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!articleUrl.trim() || !email.trim()) {
      toast.error("Enter an article URL and your email to begin.");
      return;
    }
    const sid = crypto.randomUUID();
    setSessionId(sid);
    setPhase("processing");
    setElapsed(0);
    setResult(null);
    setError(null);

    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const data = await processArticle(
        { email: email.trim(), article_url: articleUrl.trim(), session_id: sid },
        controller.signal,
      );
      setResult(data);
      setPhase("done");
      toast.success("Analysis complete — brief delivered.");
    } catch (err) {
      if (controller.signal.aborted) return;
      setError(err instanceof Error ? err.message : "Unexpected error");
      setPhase("error");
      toast.error("Analysis failed. Check the backend and try again.");
    }
  }

  function reset() {
    abortRef.current?.abort();
    setPhase("idle");
    setResult(null);
    setError(null);
    setElapsed(0);
    setSessionId("");
  }

  const insights = result ? normalizeInsights(result.insights) : [];
  const progressPct =
    phase === "done"
      ? 100
      : Math.min(96, Math.round((elapsed / ESTIMATED_SECONDS) * 100));

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground font-sans">
      {/* Aurora background */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="aurora aur-1 left-[-12%] top-[-14%] h-[46rem] w-[46rem] bg-primary/25" />
        <div className="aurora aur-2 right-[-14%] top-[18%] h-[40rem] w-[40rem] bg-accent/20" />
        <div className="aurora aur-3 left-[30%] bottom-[-18%] h-[38rem] w-[38rem] bg-primary/15" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 sm:px-10">
        {/* Header */}
        <header className="flex items-center justify-between py-7">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/30">
              <BrainCircuit className="size-4.5" />
            </div>
            <span className="text-sm font-medium tracking-tight">IntelFlow</span>
            <span className="ml-1 text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              AI Article Intelligence
            </span>
          </div>
          <span className="hidden sm:flex items-center gap-2 rounded-full bg-card/60 px-3 py-1.5 text-[11px] font-medium text-muted-foreground ring-1 ring-border">
            <span className="size-1.5 rounded-full bg-accent" />
              Core Engine v1.0.0
          </span>
        </header>

        <div className="grid gap-6 lg:grid-cols-12">
          {/* Intake panel */}
          <div className="lg:col-span-5">
            <section className="rounded-2xl bg-card/40 p-7 ring-1 ring-border backdrop-blur-md">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
                New analysis
              </p>
              <h1 className="mt-3 font-serif text-3xl leading-tight font-medium text-balance text-foreground sm:text-4xl">
                Turn long reads into quick, actionable insights.
              </h1>
              <p className="mt-3 max-w-[46ch] text-sm leading-relaxed text-pretty text-muted-foreground">
                Drop any article URL below. IntelFlow reads, extracts, and returns 
                an actionable summary with key insights straight to your inbox in under a minute.
              </p>

              <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label
                    htmlFor="article-url"
                    className="block text-xs font-medium text-muted-foreground"
                  >
                    Article URL
                  </label>
                  <div className="mt-1.5 flex items-center rounded-lg bg-background/60 px-3 ring-1 ring-border transition focus-within:ring-primary/60">
                    <Link2 className="size-4 shrink-0 text-muted-foreground/60" />
                    <input
                      id="article-url"
                      type="url"
                      required
                      value={articleUrl}
                      onChange={(e) => setArticleUrl(e.target.value)}
                      disabled={phase === "processing"}
                      className="w-full bg-transparent px-2.5 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground/50 disabled:opacity-60"
                      placeholder="https://…"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs font-medium text-muted-foreground"
                  >
                    Deliver to
                  </label>
                  <div className="mt-1.5 flex items-center rounded-lg bg-background/60 px-3 ring-1 ring-border transition focus-within:ring-primary/60">
                    <Mail className="size-4 shrink-0 text-muted-foreground/60" />
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={phase === "processing"}
                      className="w-full bg-transparent px-2.5 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground/50 disabled:opacity-60"
                      placeholder="you@company.com"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs font-medium text-muted-foreground">
                    Standard depth
                  </span>
                  {phase === "processing" ? (
                    <button
                      type="button"
                      onClick={reset}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-secondary py-2 px-3 text-sm font-medium text-secondary-foreground ring-1 ring-border transition-colors hover:bg-secondary/80"
                    >
                      <RotateCcw className="size-3.5" />
                      Cancel
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary py-2 pr-3 pl-3 text-sm font-semibold text-primary-foreground ring-1 ring-primary/60 transition-colors hover:bg-primary/90"
                    >
                      <Send className="size-3.5" />
                      Summarise article
                    </button>
                  )}
                </div>
              </form>

              <div className="mt-5 flex items-center gap-2 border-t border-border pt-4 text-[11px] text-muted-foreground/80">
                <ShieldCheck className="size-4 shrink-0 text-primary/70" />
                Encrypted in transit. Streamed through Firecrawl & authenticated n8n workflow.
              </div>
            </section>
          </div>

          {/* Right column */}
          <div className="space-y-6 lg:col-span-7">
            {/* Processing panel */}
            <section className="rounded-2xl bg-card/40 p-6 ring-1 ring-border backdrop-blur-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {phase === "processing" ? (
                    <span className="pulse-dot size-2 rounded-full bg-accent" />
                  ) : (
                    <span className="size-2 rounded-full bg-muted-foreground/40" />
                  )}
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/80">
                    {phase === "done"
                      ? "Complete"
                      : phase === "processing"
                        ? "Processing"
                        : phase === "error"
                          ? "Failed"
                          : "Awaiting input"}
                  </span>
                </div>
                <span className="text-[11px] font-medium tabular-nums text-muted-foreground">
                  {phase === "processing"
                    ? `${Math.floor(elapsed)} of ~${ESTIMATED_SECONDS}s`
                    : phase === "done"
                      ? "done"
                      : "—"}
                </span>
              </div>

              <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-[width] duration-500 ease-out"
                  style={{ width: `${progressPct}%` }}
                />
              </div>

              <ol className="mt-5 space-y-3 text-sm">
                {PIPELINE_STEPS.map((step, i) => {
                  const done = activeStep > i;
                  const running = activeStep === i;
                  return (
                    <li
                      key={step.label}
                      className={`flex items-center gap-3 ${
                        done
                          ? "text-foreground/90"
                          : running
                            ? "text-foreground"
                            : "text-muted-foreground/60"
                      }`}
                    >
                      <span
                        className={`grid size-5 shrink-0 place-items-center rounded-full ring-1 ${
                          done
                            ? "bg-primary/20 text-primary ring-primary/40"
                            : running
                              ? "bg-muted ring-border"
                              : "bg-muted/50 ring-border/60"
                        }`}
                      >
                        {done ? (
                          <Check className="size-3" />
                        ) : running ? (
                          <span className="pulse-dot size-1.5 rounded-full bg-accent" />
                        ) : null}
                      </span>
                      <span className="font-medium">{step.label}</span>
                      <span className="ml-auto text-xs text-muted-foreground/70">
                        {done ? "done" : running ? step.detail : "queued"}
                      </span>
                    </li>
                  );
                })}
              </ol>

              {phase === "error" && (
                <div className="mt-4 flex items-start gap-2.5 rounded-lg bg-destructive/10 p-3 ring-1 ring-destructive/30">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
                  <p className="text-xs leading-relaxed text-destructive-foreground/90">
                    {error ?? "The analysis pipeline did not respond."}
                  </p>
                </div>
              )}
            </section>

            {/* Results dashboard */}
            {phase === "done" && result && (
              <section className="rise-in rounded-2xl bg-card/70 p-6 ring-1 ring-border backdrop-blur-md">
                <div className="flex items-end justify-between gap-4 border-b border-border pb-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
                      Executive Summary
                    </p>
                    <h2 className="mt-1.5 max-w-[30ch] font-serif text-xl leading-tight font-medium text-balance text-foreground">
                      {result.title ?? "Article analysis"}
                    </h2>
                  </div>
                  <span className="shrink-0 rounded-md bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary ring-1 ring-primary/20">
                    {typeof result.confidence === "string"
                      ? result.confidence
                      : "Analysis ready"}
                  </span>
                </div>

                {result.summary && (
                  <p className="mt-4 max-w-[52ch] text-sm leading-relaxed text-pretty text-muted-foreground">
                    {result.summary}
                  </p>
                )}

                {/* Metrics */}
                <div className="mt-5 grid grid-cols-3 gap-3">
                  <div className="rounded-xl bg-muted/60 p-3 ring-1 ring-border">
                    <p className="font-serif text-lg font-medium text-foreground">
                      {result.key_insight_count ?? insights.length}
                    </p>
                    <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">
                      Key insights
                    </p>
                  </div>
                  <div className="rounded-xl bg-muted/60 p-3 ring-1 ring-border">
                    <p className="font-serif text-lg font-medium text-foreground">
                      {result.source_grounded ?? "—"}
                      {typeof result.source_grounded === "number" ? "%" : ""}
                    </p>
                    <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">
                      Source grounded
                    </p>
                  </div>
                  <div className="rounded-xl bg-muted/60 p-3 ring-1 ring-border">
                    <p className="font-serif text-lg font-medium text-accent">
                      {result.open_questions ?? 0}
                    </p>
                    <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">
                      Open questions
                    </p>
                  </div>
                </div>

                {/* Key insights */}
                {insights.length > 0 && (
                  <>
                    <p className="mt-6 mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                      Key insights
                    </p>
                    <ul className="space-y-2.5">
                      {insights.map((insight, i) => (
                        <li
                          key={i}
                          className="flex gap-3 rounded-lg bg-muted/60 p-3 ring-1 ring-border"
                        >
                          <span className="mt-0.5 text-xs font-medium tabular-nums text-primary">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <span className="text-sm leading-relaxed text-pretty text-foreground/85">
                            {insight}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                {/* Audit + confirm */}
                <div className="mt-6 flex flex-col gap-3 rounded-xl bg-background/50 p-4 ring-1 ring-border sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/15 text-primary ring-1 ring-primary/30">
                      <ShieldCheck className="size-4" />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Report Delivered
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Delivered to {email} · ID {result.audit_id ?? sessionId.slice(0, 8)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={reset}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-muted py-2 pr-3 pl-3 text-sm font-medium text-foreground ring-1 ring-border transition-colors hover:bg-muted/70"
                  >
                    <FileText className="size-4" />
                    New analysis
                    <ArrowRight className="size-4" />
                  </button>
                </div>
              </section>
            )}
          </div>
        </div>

        <footer className="flex items-center justify-between py-8 text-[11px] text-muted-foreground/60">
          <span>IntelFlow · AI Article Intelligence</span>
          <span className="tabular-nums">
            Session {sessionId ? sessionId.slice(0, 8) : "—"}
          </span>
        </footer>
      </div>
    </div>
  );
}
