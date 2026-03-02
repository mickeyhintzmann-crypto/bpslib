"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  AI_REVIEW_STATUS_VALUES,
  AI_SERVICES,
  type AiReviewStatus,
  type AiService
} from "@/lib/ai-estimator-control-room";

type TabKey = "queue" | "prompts" | "history";

type QueueItem = {
  id: string;
  createdAt: string;
  requestId: string;
  promptVersionId: string | null;
  service: string;
  reviewStatus: string;
  needsReview: boolean;
  confidence: number | null;
  summary: string;
  lead: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    location: string | null;
  } | null;
};

type PromptItem = {
  id: string;
  createdAt: string;
  name: string;
  service: string;
  prompt: string;
  rules: Record<string, unknown>;
  isActive: boolean;
};

type HistoryItem = {
  id: string;
  createdAt: string;
  requestId: string;
  promptVersionId: string | null;
  service: string;
  reviewStatus: string;
  needsReview: boolean;
  confidence: number | null;
  summary: string;
};

type DetailItem = {
  id: string;
  createdAt: string;
  requestId: string;
  promptVersionId: string | null;
  output: Record<string, unknown>;
  confidence: number | null;
  needsReview: boolean;
  reviewStatus: string;
  adminFeedback: string | null;
  adminOverride: Record<string, unknown>;
  request: {
    id: string;
    createdAt: string;
    service: string;
    leadId: string | null;
    pageUrl: string | null;
    inputs: Record<string, unknown>;
    images: unknown[];
    clientMeta: Record<string, unknown>;
    utm: Record<string, unknown>;
  } | null;
  lead: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    location: string | null;
    message: string | null;
  } | null;
  promptVersion: {
    id: string;
    name: string;
    service: string;
    prompt: string;
    rules: Record<string, unknown>;
    isActive: boolean;
  } | null;
};

const formatDateTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Ukendt";
  }
  return new Intl.DateTimeFormat("da-DK", { dateStyle: "short", timeStyle: "short" }).format(date);
};

const prettyJson = (value: unknown) => JSON.stringify(value || {}, null, 2);

const parseJsonText = (raw: string, fallback: Record<string, unknown>) => {
  if (!raw.trim()) {
    return fallback;
  }
  const parsed = JSON.parse(raw);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("JSON skal være et objekt.");
  }
  return parsed as Record<string, unknown>;
};

const serviceOptions = ["alle", ...AI_SERVICES] as const;
const reviewOptions = ["alle", ...AI_REVIEW_STATUS_VALUES] as const;

export const AIEstimatorDashboard = () => {
  const [tab, setTab] = useState<TabKey>("queue");

  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [promptItems, setPromptItems] = useState<PromptItem[]>([]);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);

  const [queueServiceFilter, setQueueServiceFilter] = useState<(typeof serviceOptions)[number]>("alle");
  const [promptServiceFilter, setPromptServiceFilter] = useState<(typeof serviceOptions)[number]>("alle");
  const [historyServiceFilter, setHistoryServiceFilter] = useState<(typeof serviceOptions)[number]>("alle");
  const [historyStatusFilter, setHistoryStatusFilter] = useState<(typeof reviewOptions)[number]>("alle");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<DetailItem | null>(null);
  const [detailBusy, setDetailBusy] = useState(false);
  const [detailReviewStatus, setDetailReviewStatus] = useState<AiReviewStatus>("unreviewed");
  const [detailNeedsReview, setDetailNeedsReview] = useState(true);
  const [detailFeedback, setDetailFeedback] = useState("");
  const [detailOutputText, setDetailOutputText] = useState("{}");
  const [detailOverrideText, setDetailOverrideText] = useState("{}");

  const [newPromptName, setNewPromptName] = useState("");
  const [newPromptService, setNewPromptService] = useState<AiService>("bordplade");
  const [newPromptText, setNewPromptText] = useState("");
  const [newPromptRulesText, setNewPromptRulesText] = useState("{\n  \"min_confidence\": 0.65,\n  \"min_images\": 1\n}");
  const [newPromptActive, setNewPromptActive] = useState(false);

  const loadQueue = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (queueServiceFilter !== "alle") {
        params.set("service", queueServiceFilter);
      }
      const response = await fetch(`/api/admin/ai-estimator/queue?${params.toString()}`, { cache: "no-store" });
      const payload = (await response.json()) as { items?: QueueItem[]; message?: string };
      if (!response.ok || !payload.items) {
        setQueueItems([]);
        setError(payload.message || "Kunne ikke hente queue.");
        return;
      }
      setQueueItems(payload.items);
    } catch (fetchError) {
      console.error(fetchError);
      setQueueItems([]);
      setError("Netværksfejl ved hentning af queue.");
    } finally {
      setLoading(false);
    }
  };

  const loadPrompts = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (promptServiceFilter !== "alle") {
        params.set("service", promptServiceFilter);
      }
      const response = await fetch(`/api/admin/ai-estimator/prompts?${params.toString()}`, { cache: "no-store" });
      const payload = (await response.json()) as { items?: PromptItem[]; message?: string };
      if (!response.ok || !payload.items) {
        setPromptItems([]);
        setError(payload.message || "Kunne ikke hente prompt versions.");
        return;
      }
      setPromptItems(payload.items);
    } catch (fetchError) {
      console.error(fetchError);
      setPromptItems([]);
      setError("Netværksfejl ved hentning af prompt versions.");
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (historyServiceFilter !== "alle") {
        params.set("service", historyServiceFilter);
      }
      if (historyStatusFilter !== "alle") {
        params.set("status", historyStatusFilter);
      }
      params.set("limit", "100");

      const response = await fetch(`/api/admin/ai-estimator/history?${params.toString()}`, { cache: "no-store" });
      const payload = (await response.json()) as { items?: HistoryItem[]; message?: string };
      if (!response.ok || !payload.items) {
        setHistoryItems([]);
        setError(payload.message || "Kunne ikke hente history.");
        return;
      }
      setHistoryItems(payload.items);
    } catch (fetchError) {
      console.error(fetchError);
      setHistoryItems([]);
      setError("Netværksfejl ved hentning af history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === "queue") {
      loadQueue();
    } else if (tab === "prompts") {
      loadPrompts();
    } else {
      loadHistory();
    }
  }, [tab, queueServiceFilter, promptServiceFilter, historyServiceFilter, historyStatusFilter]);

  const openDetail = async (resultId: string) => {
    setDetailBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/ai-estimator/results/${resultId}`, { cache: "no-store" });
      const payload = (await response.json()) as { item?: DetailItem; message?: string };
      if (!response.ok || !payload.item) {
        setError(payload.message || "Kunne ikke hente detaljer.");
        return;
      }
      const item = payload.item;
      setDetail(item);
      setDetailReviewStatus((item.reviewStatus as AiReviewStatus) || "unreviewed");
      setDetailNeedsReview(Boolean(item.needsReview));
      setDetailFeedback(item.adminFeedback || "");
      setDetailOutputText(prettyJson(item.output));
      setDetailOverrideText(prettyJson(item.adminOverride));
      setDetailOpen(true);
    } catch (detailError) {
      console.error(detailError);
      setError("Netværksfejl ved hentning af detalje.");
    } finally {
      setDetailBusy(false);
    }
  };

  const patchResult = async (resultId: string, body: Record<string, unknown>) => {
    const response = await fetch(`/api/admin/ai-estimator/results/${resultId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const payload = (await response.json()) as { item?: DetailItem; message?: string };
    if (!response.ok) {
      throw new Error(payload.message || "Kunne ikke opdatere AI resultat.");
    }
    if (payload.item) {
      setDetail(payload.item);
    }
  };

  const quickAction = async (resultId: string, action: "approved" | "rejected") => {
    setMessage("");
    setError("");
    try {
      await patchResult(resultId, {
        review_status: action,
        needs_review: false
      });
      setMessage(action === "approved" ? "Resultat godkendt." : "Resultat afvist.");
      await loadQueue();
      await loadHistory();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Kunne ikke opdatere status.");
    }
  };

  const saveDetail = async () => {
    if (!detail) {
      return;
    }
    setMessage("");
    setError("");
    try {
      const output = parseJsonText(detailOutputText, detail.output || {});
      const override = parseJsonText(detailOverrideText, detail.adminOverride || {});
      await patchResult(detail.id, {
        review_status: detailReviewStatus,
        needs_review: detailNeedsReview,
        admin_feedback: detailFeedback,
        output,
        admin_override: override
      });
      setMessage("Detalje gemt.");
      await loadQueue();
      await loadHistory();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Kunne ikke gemme detalje.");
    }
  };

  const createPromptVersion = async () => {
    setMessage("");
    setError("");
    try {
      const parsedRules = parseJsonText(newPromptRulesText, {});
      const response = await fetch("/api/admin/ai-estimator/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newPromptName,
          service: newPromptService,
          prompt: newPromptText,
          rules: parsedRules,
          is_active: newPromptActive
        })
      });
      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        setError(payload.message || "Kunne ikke oprette prompt version.");
        return;
      }
      setMessage("Prompt version oprettet.");
      setNewPromptName("");
      setNewPromptText("");
      setNewPromptActive(false);
      await loadPrompts();
    } catch (promptError) {
      setError(promptError instanceof Error ? promptError.message : "Kunne ikke oprette prompt version.");
    }
  };

  const activatePrompt = async (promptId: string) => {
    setMessage("");
    setError("");
    try {
      const response = await fetch(`/api/admin/ai-estimator/prompts/${promptId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: true })
      });
      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        setError(payload.message || "Kunne ikke aktivere prompt.");
        return;
      }
      setMessage("Prompt sat som aktiv.");
      await loadPrompts();
    } catch (activateError) {
      console.error(activateError);
      setError("Netværksfejl ved aktivering af prompt.");
    }
  };

  const groupedPrompts = useMemo(() => {
    const map = new Map<string, PromptItem[]>();
    promptItems.forEach((item) => {
      const key = item.service;
      const current = map.get(key) || [];
      current.push(item);
      map.set(key, current);
    });
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [promptItems]);

  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h1 className="font-display text-3xl font-semibold text-foreground">AI Prisberegner Control Room</h1>
        <p className="text-sm text-muted-foreground">
          Styr prompt-versioner, review queue og historik for AI-estimator output.
        </p>
      </div>

      <div className="inline-flex rounded-xl border border-border bg-muted/20 p-1">
        <button
          type="button"
          onClick={() => setTab("queue")}
          className={`rounded-lg px-3 py-2 text-sm ${
            tab === "queue" ? "bg-primary text-white" : "text-foreground"
          }`}
        >
          Queue
        </button>
        <button
          type="button"
          onClick={() => setTab("prompts")}
          className={`rounded-lg px-3 py-2 text-sm ${
            tab === "prompts" ? "bg-primary text-white" : "text-foreground"
          }`}
        >
          Prompt & rules
        </button>
        <button
          type="button"
          onClick={() => setTab("history")}
          className={`rounded-lg px-3 py-2 text-sm ${
            tab === "history" ? "bg-primary text-white" : "text-foreground"
          }`}
        >
          History
        </button>
      </div>

      {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}
      {message ? <p className="text-sm font-medium text-emerald-700">{message}</p> : null}

      {tab === "queue" ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm text-muted-foreground">
              Service
              <select
                value={queueServiceFilter}
                onChange={(event) => setQueueServiceFilter(event.target.value as (typeof serviceOptions)[number])}
                className="ml-2 h-10 rounded-md border border-border bg-white px-3"
              >
                {serviceOptions.map((service) => (
                  <option key={service} value={service}>
                    {service}
                  </option>
                ))}
              </select>
            </label>
            <Button variant="outline" onClick={loadQueue} disabled={loading}>
              {loading ? "Henter..." : "Opdater"}
            </Button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-white">
            <div className="grid grid-cols-[150px_120px_1fr_220px_220px] border-b border-border/70 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <span>Tid</span>
              <span>Service</span>
              <span>Summary</span>
              <span>Lead</span>
              <span>Actions</span>
            </div>
            <div className="divide-y divide-border/60">
              {queueItems.length === 0 ? (
                <p className="px-4 py-6 text-sm text-muted-foreground">Ingen items i queue.</p>
              ) : (
                queueItems.map((item) => (
                  <div key={item.id} className="grid grid-cols-[150px_120px_1fr_220px_220px] items-start gap-3 px-4 py-3 text-sm">
                    <span className="text-muted-foreground">{formatDateTime(item.createdAt)}</span>
                    <span className="text-muted-foreground">{item.service}</span>
                    <div className="space-y-1">
                      <p className="text-foreground">{item.summary}</p>
                      <p className="text-xs text-muted-foreground">
                        status: {item.reviewStatus} · confidence:{" "}
                        {typeof item.confidence === "number" ? item.confidence.toFixed(2) : "n/a"}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <p>{item.lead?.name || "Ukendt"}</p>
                      <p>{item.lead?.phone || "-"}</p>
                      <p>{item.lead?.email || "-"}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" onClick={() => openDetail(item.id)} disabled={detailBusy}>
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => quickAction(item.id, "approved")}>
                        Approve
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => quickAction(item.id, "rejected")}>
                        Reject
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : null}

      {tab === "prompts" ? (
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-white p-4">
            <h2 className="text-lg font-semibold text-foreground">Ny prompt version</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="text-sm text-muted-foreground">
                Name
                <input
                  value={newPromptName}
                  onChange={(event) => setNewPromptName(event.target.value)}
                  className="mt-1 h-10 w-full rounded-md border border-border bg-white px-3"
                />
              </label>
              <label className="text-sm text-muted-foreground">
                Service
                <select
                  value={newPromptService}
                  onChange={(event) => setNewPromptService(event.target.value as AiService)}
                  className="mt-1 h-10 w-full rounded-md border border-border bg-white px-3"
                >
                  {AI_SERVICES.map((service) => (
                    <option key={service} value={service}>
                      {service}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm text-muted-foreground md:col-span-2">
                Prompt
                <textarea
                  value={newPromptText}
                  onChange={(event) => setNewPromptText(event.target.value)}
                  rows={6}
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2"
                />
              </label>
              <label className="text-sm text-muted-foreground md:col-span-2">
                Rules (JSON)
                <textarea
                  value={newPromptRulesText}
                  onChange={(event) => setNewPromptRulesText(event.target.value)}
                  rows={6}
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 font-mono text-xs"
                />
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={newPromptActive}
                  onChange={(event) => setNewPromptActive(event.target.checked)}
                />
                Activate med det samme
              </label>
            </div>
            <div className="mt-4 flex gap-2">
              <Button onClick={createPromptVersion}>Opret version</Button>
              <Button variant="outline" onClick={loadPrompts} disabled={loading}>
                {loading ? "Henter..." : "Opdater liste"}
              </Button>
            </div>
          </div>

          <label className="text-sm text-muted-foreground">
            Service filter
            <select
              value={promptServiceFilter}
              onChange={(event) => setPromptServiceFilter(event.target.value as (typeof serviceOptions)[number])}
              className="ml-2 h-10 rounded-md border border-border bg-white px-3"
            >
              {serviceOptions.map((service) => (
                <option key={service} value={service}>
                  {service}
                </option>
              ))}
            </select>
          </label>

          <div className="space-y-4">
            {groupedPrompts.length === 0 ? (
              <p className="text-sm text-muted-foreground">Ingen prompt versions endnu.</p>
            ) : (
              groupedPrompts.map(([service, items]) => (
                <div key={service} className="rounded-2xl border border-border bg-white p-4">
                  <h3 className="text-base font-semibold text-foreground">{service}</h3>
                  <div className="mt-3 space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="rounded-xl border border-border/70 p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium text-foreground">
                              {item.name} {item.isActive ? "(active)" : ""}
                            </p>
                            <p className="text-xs text-muted-foreground">{formatDateTime(item.createdAt)}</p>
                          </div>
                          {!item.isActive ? (
                            <Button size="sm" variant="outline" onClick={() => activatePrompt(item.id)}>
                              Activate
                            </Button>
                          ) : null}
                        </div>
                        <pre className="mt-2 whitespace-pre-wrap text-xs text-muted-foreground">{item.prompt}</pre>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}

      {tab === "history" ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm text-muted-foreground">
              Service
              <select
                value={historyServiceFilter}
                onChange={(event) => setHistoryServiceFilter(event.target.value as (typeof serviceOptions)[number])}
                className="ml-2 h-10 rounded-md border border-border bg-white px-3"
              >
                {serviceOptions.map((service) => (
                  <option key={service} value={service}>
                    {service}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm text-muted-foreground">
              Status
              <select
                value={historyStatusFilter}
                onChange={(event) => setHistoryStatusFilter(event.target.value as (typeof reviewOptions)[number])}
                className="ml-2 h-10 rounded-md border border-border bg-white px-3"
              >
                {reviewOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
            <Button variant="outline" onClick={loadHistory} disabled={loading}>
              {loading ? "Henter..." : "Opdater"}
            </Button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-white">
            <div className="grid grid-cols-[160px_120px_140px_1fr_120px] border-b border-border/70 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <span>Tid</span>
              <span>Service</span>
              <span>Status</span>
              <span>Summary</span>
              <span>Handling</span>
            </div>
            <div className="divide-y divide-border/60">
              {historyItems.length === 0 ? (
                <p className="px-4 py-6 text-sm text-muted-foreground">Ingen resultater i history.</p>
              ) : (
                historyItems.map((item) => (
                  <div key={item.id} className="grid grid-cols-[160px_120px_140px_1fr_120px] items-start gap-3 px-4 py-3 text-sm">
                    <span className="text-muted-foreground">{formatDateTime(item.createdAt)}</span>
                    <span className="text-muted-foreground">{item.service}</span>
                    <span className="text-muted-foreground">{item.reviewStatus}</span>
                    <span className="text-foreground">{item.summary}</span>
                    <Button size="sm" variant="outline" onClick={() => openDetail(item.id)} disabled={detailBusy}>
                      Åbn
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : null}

      {detailOpen && detail ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
          <div className="h-full w-full max-w-2xl overflow-y-auto bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">Quote detail</h2>
                <p className="text-xs text-muted-foreground">
                  {detail.request?.service || "-"} · {formatDateTime(detail.createdAt)}
                </p>
              </div>
              <Button variant="outline" onClick={() => setDetailOpen(false)}>
                Luk
              </Button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="rounded-xl border border-border bg-muted/20 p-3 text-sm">
                <p className="font-medium text-foreground">Lead</p>
                <p className="text-muted-foreground">{detail.lead?.name || "Ukendt"}</p>
                <p className="text-muted-foreground">{detail.lead?.phone || "-"}</p>
                <p className="text-muted-foreground">{detail.lead?.email || "-"}</p>
              </div>

              <div className="rounded-xl border border-border bg-muted/20 p-3 text-sm">
                <p className="font-medium text-foreground">Request inputs</p>
                <pre className="mt-2 whitespace-pre-wrap text-xs text-muted-foreground">
                  {prettyJson(detail.request?.inputs || {})}
                </pre>
              </div>

              <label className="text-sm text-muted-foreground">
                Review status
                <select
                  value={detailReviewStatus}
                  onChange={(event) => setDetailReviewStatus(event.target.value as AiReviewStatus)}
                  className="mt-1 h-10 w-full rounded-md border border-border bg-white px-3"
                >
                  {AI_REVIEW_STATUS_VALUES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>

              <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={detailNeedsReview}
                  onChange={(event) => setDetailNeedsReview(event.target.checked)}
                />
                needs_review
              </label>

              <label className="text-sm text-muted-foreground">
                Admin feedback
                <textarea
                  value={detailFeedback}
                  onChange={(event) => setDetailFeedback(event.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2"
                />
              </label>

              <label className="text-sm text-muted-foreground">
                Output (JSON)
                <textarea
                  value={detailOutputText}
                  onChange={(event) => setDetailOutputText(event.target.value)}
                  rows={8}
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 font-mono text-xs"
                />
              </label>

              <label className="text-sm text-muted-foreground">
                Admin override (JSON)
                <textarea
                  value={detailOverrideText}
                  onChange={(event) => setDetailOverrideText(event.target.value)}
                  rows={6}
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 font-mono text-xs"
                />
              </label>
            </div>

            <div className="mt-6 flex gap-2">
              <Button onClick={saveDetail}>Gem ændringer</Button>
              <Button variant="outline" onClick={() => quickAction(detail.id, "approved")}>
                Approve
              </Button>
              <Button variant="outline" onClick={() => quickAction(detail.id, "rejected")}>
                Reject
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
};
