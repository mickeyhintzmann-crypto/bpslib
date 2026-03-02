"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  AI_REVIEW_STATUS_VALUES,
  AI_SERVICES,
  type AiReviewStatus,
  type AiService
} from "@/lib/ai-estimator-control-room";

type TabKey = "queue" | "history" | "prompts";

type QuoteListItem = {
  result_id: string;
  created_at: string;
  service: string;
  needs_review: boolean;
  review_status: string;
  confidence: number | null;
  lead_id: string | null;
  lead: {
    name: string | null;
    email: string | null;
    phone: string | null;
    location: string | null;
  } | null;
  summary: string;
};

type QuoteListResponse = {
  items?: QuoteListItem[];
  total?: number;
  message?: string;
};

type QuoteDetailPayload = {
  result: {
    id: string;
    created_at: string;
    request_id: string;
    prompt_version_id: string | null;
    output: Record<string, unknown>;
    confidence: number | null;
    needs_review: boolean;
    review_status: string;
    admin_feedback: string | null;
    admin_override: Record<string, unknown>;
  };
  request: {
    id: string;
    created_at: string;
    service: string;
    lead_id: string | null;
    page_url: string | null;
    utm: Record<string, unknown>;
    inputs: Record<string, unknown>;
    images: unknown[];
    client_meta: Record<string, unknown>;
  } | null;
  promptVersion: {
    id: string;
    name: string;
    service: string;
  } | null;
  lead: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    location: string | null;
    message: string | null;
    page_url: string | null;
  } | null;
};

type QuoteDetailResponse = QuoteDetailPayload & {
  message?: string;
};

type PromptItem = {
  id: string;
  created_at: string;
  name: string;
  service: string;
  prompt: string;
  rules: Record<string, unknown>;
  is_active: boolean;
};

type PromptListResponse = {
  items?: PromptItem[];
  item?: PromptItem;
  message?: string;
};

const serviceOptions = ["alle", ...AI_SERVICES] as const;
const reviewStatusOptions = ["alle", ...AI_REVIEW_STATUS_VALUES] as const;
const DEFAULT_RULES_TEXT = `{
  "min_confidence": 0.6,
  "needs_review_if_missing_images": true,
  "needs_review_if_missing_m2": true
}`;

const short = (value: string | null | undefined, fallback = "-") => {
  const cleaned = (value || "").trim();
  return cleaned || fallback;
};

const formatDateTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Ukendt";
  }
  return new Intl.DateTimeFormat("da-DK", { dateStyle: "short", timeStyle: "short" }).format(date);
};

const prettyJson = (value: unknown) => JSON.stringify(value || {}, null, 2);

const parseJsonObject = (raw: string) => {
  const trimmed = raw.trim();
  if (!trimmed) {
    return {};
  }
  const parsed = JSON.parse(trimmed);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("JSON skal være et objekt.");
  }
  return parsed as Record<string, unknown>;
};

const extractImageUrls = (images: unknown[]) => {
  const urls: string[] = [];

  for (const item of images) {
    if (typeof item === "string" && item.trim()) {
      urls.push(item.trim());
      continue;
    }

    if (!item || typeof item !== "object") {
      continue;
    }

    const obj = item as Record<string, unknown>;
    const candidates = [obj.url, obj.src, obj.href, obj.publicUrl];
    const match = candidates.find((value) => typeof value === "string" && value.trim()) as string | undefined;
    if (match) {
      urls.push(match.trim());
    }
  }

  return Array.from(new Set(urls));
};

const statusClasses: Record<string, string> = {
  unreviewed: "bg-amber-100 text-amber-900",
  approved: "bg-emerald-100 text-emerald-900",
  edited: "bg-blue-100 text-blue-900",
  rejected: "bg-rose-100 text-rose-900"
};

export const AIEstimatorDashboard = () => {
  const [tab, setTab] = useState<TabKey>("queue");
  const [serviceFilter, setServiceFilter] = useState<(typeof serviceOptions)[number]>("alle");
  const [needsReviewOnly, setNeedsReviewOnly] = useState(true);
  const [historyStatusFilter, setHistoryStatusFilter] =
    useState<(typeof reviewStatusOptions)[number]>("alle");
  const [query, setQuery] = useState("");

  const [items, setItems] = useState<QuoteListItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loadingList, setLoadingList] = useState(false);
  const [listError, setListError] = useState("");
  const [listMessage, setListMessage] = useState("");

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailSaving, setDetailSaving] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [detailMessage, setDetailMessage] = useState("");
  const [detail, setDetail] = useState<QuoteDetailPayload | null>(null);

  const [feedbackDraft, setFeedbackDraft] = useState("");
  const [overrideDraft, setOverrideDraft] = useState("{}");
  const [promptsLoading, setPromptsLoading] = useState(false);
  const [promptsError, setPromptsError] = useState("");
  const [promptsMessage, setPromptsMessage] = useState("");
  const [promptServiceFilter, setPromptServiceFilter] = useState<(typeof serviceOptions)[number]>("alle");
  const [promptItems, setPromptItems] = useState<PromptItem[]>([]);
  const [editingPromptId, setEditingPromptId] = useState<string | null>(null);
  const [promptNameDraft, setPromptNameDraft] = useState("");
  const [promptServiceDraft, setPromptServiceDraft] = useState<AiService>("bordplade");
  const [promptTextDraft, setPromptTextDraft] = useState("");
  const [promptRulesDraft, setPromptRulesDraft] = useState(DEFAULT_RULES_TEXT);
  const [promptSaving, setPromptSaving] = useState(false);

  const isQueueTab = tab === "queue";
  const isHistoryTab = tab === "history";

  const clearMessages = () => {
    setListError("");
    setListMessage("");
    setDetailError("");
    setDetailMessage("");
    setPromptsError("");
    setPromptsMessage("");
  };

  const applyDetail = (payload: QuoteDetailPayload) => {
    setDetail(payload);
    setFeedbackDraft(payload.result.admin_feedback || "");
    setOverrideDraft(prettyJson(payload.result.admin_override || {}));
  };

  const loadQuotes = async () => {
    setLoadingList(true);
    setListError("");

    try {
      const params = new URLSearchParams({
        page: "1",
        pageSize: isQueueTab ? "25" : "100"
      });

      if (serviceFilter !== "alle") {
        params.set("service", serviceFilter);
      }
      if (query.trim()) {
        params.set("q", query.trim());
      }

      if (isQueueTab) {
        if (needsReviewOnly) {
          params.set("needs_review", "true");
        }
      } else if (isHistoryTab) {
        params.set("needs_review", "false");
        if (historyStatusFilter !== "alle") {
          params.set("review_status", historyStatusFilter);
        }
      }

      const response = await fetch(`/api/admin/ai/quotes?${params.toString()}`, { cache: "no-store" });
      const payload = (await response.json()) as QuoteListResponse;

      if (!response.ok || !payload.items) {
        setItems([]);
        setTotal(0);
        setListError(payload.message || "Kunne ikke hente AI quotes.");
        return;
      }

      setItems(payload.items);
      setTotal(payload.total ?? payload.items.length);
    } catch (error) {
      console.error(error);
      setItems([]);
      setTotal(0);
      setListError("Netværksfejl ved hentning af AI quotes.");
    } finally {
      setLoadingList(false);
    }
  };

  const resetPromptEditor = () => {
    setEditingPromptId(null);
    setPromptNameDraft("");
    setPromptServiceDraft("bordplade");
    setPromptTextDraft("");
    setPromptRulesDraft(DEFAULT_RULES_TEXT);
  };

  const loadPrompts = async () => {
    setPromptsLoading(true);
    setPromptsError("");

    try {
      const params = new URLSearchParams();
      if (promptServiceFilter !== "alle") {
        params.set("service", promptServiceFilter);
      }

      const query = params.toString();
      const response = await fetch(`/api/admin/ai/prompts${query ? `?${query}` : ""}`, {
        cache: "no-store"
      });
      const payload = (await response.json()) as PromptListResponse;

      if (!response.ok || !payload.items) {
        setPromptItems([]);
        setPromptsError(payload.message || "Kunne ikke hente prompt versions.");
        return;
      }

      setPromptItems(payload.items);
    } catch (error) {
      console.error(error);
      setPromptItems([]);
      setPromptsError("Netværksfejl ved hentning af prompt versions.");
    } finally {
      setPromptsLoading(false);
    }
  };

  const startCreatePrompt = () => {
    setPromptsError("");
    setPromptsMessage("");
    resetPromptEditor();
  };

  const startEditPrompt = (item: PromptItem) => {
    setPromptsError("");
    setPromptsMessage("");
    setEditingPromptId(item.id);
    setPromptNameDraft(item.name);
    setPromptServiceDraft(item.service as AiService);
    setPromptTextDraft(item.prompt);
    setPromptRulesDraft(prettyJson(item.rules || {}));
  };

  const savePromptVersion = async () => {
    setPromptSaving(true);
    setPromptsError("");
    setPromptsMessage("");

    try {
      if (promptNameDraft.trim().length < 2) {
        setPromptsError("Name er påkrævet.");
        return;
      }
      if (promptTextDraft.trim().length < 10) {
        setPromptsError("Prompt er for kort.");
        return;
      }

      const parsedRules = parseJsonObject(promptRulesDraft);
      const isEditing = Boolean(editingPromptId);
      const endpoint = isEditing ? `/api/admin/ai/prompts/${editingPromptId}` : "/api/admin/ai/prompts";
      const method = isEditing ? "PATCH" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: promptNameDraft.trim(),
          service: promptServiceDraft,
          prompt: promptTextDraft.trim(),
          rules: parsedRules
        })
      });
      const payload = (await response.json()) as PromptListResponse;

      if (!response.ok) {
        setPromptsError(payload.message || "Kunne ikke gemme prompt version.");
        return;
      }

      setPromptsMessage(isEditing ? "Prompt version opdateret." : "Prompt version oprettet.");
      if (!isEditing) {
        resetPromptEditor();
      }
      await loadPrompts();
    } catch (error) {
      console.error(error);
      setPromptsError(error instanceof Error ? error.message : "Kunne ikke gemme prompt version.");
    } finally {
      setPromptSaving(false);
    }
  };

  const activatePromptVersion = async (id: string) => {
    setPromptSaving(true);
    setPromptsError("");
    setPromptsMessage("");

    try {
      const response = await fetch(`/api/admin/ai/prompts/${id}/activate`, {
        method: "POST"
      });
      const payload = (await response.json()) as PromptListResponse;

      if (!response.ok || !payload.items) {
        setPromptsError(payload.message || "Kunne ikke aktivere prompt version.");
        return;
      }

      if (promptServiceFilter === "alle") {
        await loadPrompts();
      } else {
        setPromptItems(payload.items);
      }
      setPromptsMessage("Prompt version aktiveret.");
    } catch (error) {
      console.error(error);
      setPromptsError("Netværksfejl ved aktivering af prompt version.");
    } finally {
      setPromptSaving(false);
    }
  };

  useEffect(() => {
    if (tab === "prompts") {
      return;
    }
    loadQuotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, serviceFilter, needsReviewOnly, historyStatusFilter]);

  useEffect(() => {
    if (tab !== "prompts") {
      return;
    }
    loadPrompts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, promptServiceFilter]);

  const openDetail = async (resultId: string) => {
    setDetailLoading(true);
    setDetailError("");
    setDetailMessage("");

    try {
      const response = await fetch(`/api/admin/ai/quotes/${resultId}`, { cache: "no-store" });
      const payload = (await response.json()) as QuoteDetailResponse;

      if (!response.ok || !payload.result) {
        setDetailError(payload.message || "Kunne ikke hente quote detalje.");
        return;
      }

      applyDetail(payload);
      setDetailOpen(true);
    } catch (error) {
      console.error(error);
      setDetailError("Netværksfejl ved hentning af detalje.");
    } finally {
      setDetailLoading(false);
    }
  };

  const patchDetail = async (body: Record<string, unknown>, successMessage: string) => {
    if (!detail) {
      return;
    }

    setDetailSaving(true);
    setDetailError("");
    setDetailMessage("");

    try {
      const response = await fetch(`/api/admin/ai/quotes/${detail.result.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const payload = (await response.json()) as QuoteDetailResponse;

      if (!response.ok || !payload.result) {
        setDetailError(payload.message || "Kunne ikke opdatere quote.");
        return;
      }

      applyDetail(payload);
      setDetailMessage(successMessage);
      setListMessage(successMessage);
      await loadQuotes();
    } catch (error) {
      console.error(error);
      setDetailError("Netværksfejl ved opdatering af quote.");
    } finally {
      setDetailSaving(false);
    }
  };

  const saveOverride = async () => {
    try {
      const parsed = parseJsonObject(overrideDraft);
      await patchDetail({ admin_override: parsed }, "Override gemt.");
    } catch (error) {
      setDetailError(error instanceof Error ? error.message : "Ugyldig JSON i override.");
    }
  };

  const clearOverride = async () => {
    await patchDetail({ admin_override: {} }, "Override nulstillet.");
  };

  const saveFeedback = async () => {
    await patchDetail({ admin_feedback: feedbackDraft }, "Feedback gemt.");
  };

  const updateNeedsReview = async (value: boolean) => {
    await patchDetail({ needs_review: value }, "Needs-review opdateret.");
  };

  const reviewAction = async (status: AiReviewStatus) => {
    await patchDetail(
      {
        review_status: status,
        needs_review: false
      },
      `Status sat til ${status}.`
    );
  };

  const openLeadHref = detail?.lead?.id ? `/admin/leads?open=${detail.lead.id}` : null;
  const detailImages = useMemo(
    () => extractImageUrls(Array.isArray(detail?.request?.images) ? detail?.request?.images : []),
    [detail?.request?.images]
  );
  const activePrompt = useMemo(
    () => promptItems.find((item) => item.is_active) || null,
    [promptItems]
  );

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="font-display text-4xl font-semibold text-foreground">AI Prisberegner</h1>
        <p className="text-sm text-muted-foreground">
          Queue og historik for AI-estimater med review, feedback og admin overrides.
        </p>
      </header>

      <div className="inline-flex rounded-xl border border-border bg-muted/20 p-1">
        <button
          type="button"
          onClick={() => {
            clearMessages();
            setTab("queue");
          }}
          className={`rounded-lg px-3 py-2 text-sm ${
            tab === "queue" ? "bg-primary text-white" : "text-foreground"
          }`}
        >
          Queue
        </button>
        <button
          type="button"
          onClick={() => {
            clearMessages();
            setTab("history");
          }}
          className={`rounded-lg px-3 py-2 text-sm ${
            tab === "history" ? "bg-primary text-white" : "text-foreground"
          }`}
        >
          History
        </button>
        <button
          type="button"
          onClick={() => {
            clearMessages();
            setTab("prompts");
            if (!editingPromptId) {
              startCreatePrompt();
            }
          }}
          className={`rounded-lg px-3 py-2 text-sm ${
            tab === "prompts" ? "bg-primary text-white" : "text-foreground"
          }`}
        >
          Prompts
        </button>
      </div>

      {listError ? <p className="text-sm font-medium text-red-700">{listError}</p> : null}
      {listMessage ? <p className="text-sm font-medium text-emerald-700">{listMessage}</p> : null}

      {tab === "prompts" ? (
        <div className="space-y-4">
          {promptsError ? <p className="text-sm font-medium text-red-700">{promptsError}</p> : null}
          {promptsMessage ? <p className="text-sm font-medium text-emerald-700">{promptsMessage}</p> : null}

          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm text-muted-foreground">
              Service
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
            <Button variant="outline" onClick={loadPrompts} disabled={promptsLoading || promptSaving}>
              {promptsLoading ? "Henter..." : "Opdater"}
            </Button>
            <Button variant="outline" onClick={startCreatePrompt} disabled={promptSaving}>
              Ny version
            </Button>
          </div>

          <div className="rounded-2xl border border-border bg-muted/20 p-4">
            <p className="text-sm font-semibold text-foreground">Aktiv prompt i produktion</p>
            {activePrompt ? (
              <p className="mt-1 text-sm text-muted-foreground">
                {activePrompt.name} ({activePrompt.service}) · {formatDateTime(activePrompt.created_at)}
              </p>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">Ingen aktiv prompt version i det valgte filter.</p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              This is the prompt currently used in production.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-white">
            <div className="grid grid-cols-[1.4fr_140px_120px_180px] border-b border-border/70 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <span>Name</span>
              <span>Service</span>
              <span>Active</span>
              <span>Actions</span>
            </div>
            <div className="divide-y divide-border/60">
              {promptItems.length === 0 ? (
                <p className="px-4 py-6 text-sm text-muted-foreground">Ingen prompt versions fundet.</p>
              ) : (
                promptItems.map((item) => (
                  <div key={item.id} className="grid grid-cols-[1.4fr_140px_120px_180px] items-start gap-3 px-4 py-3 text-sm">
                    <div>
                      <p className="font-medium text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{formatDateTime(item.created_at)}</p>
                    </div>
                    <span className="text-muted-foreground">{item.service}</span>
                    <span
                      className={`inline-flex w-fit rounded-full px-2 py-1 text-xs ${
                        item.is_active ? "bg-emerald-100 text-emerald-900" : "bg-muted text-foreground"
                      }`}
                    >
                      {item.is_active ? "active" : "inactive"}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" onClick={() => startEditPrompt(item)} disabled={promptSaving}>
                        View/Edit
                      </Button>
                      {!item.is_active ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => activatePromptVersion(item.id)}
                          disabled={promptSaving}
                        >
                          Activate
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-4">
            <p className="text-sm font-semibold text-foreground">
              {editingPromptId ? "Rediger prompt version" : "Opret ny prompt version"}
            </p>

            <div className="mt-3 grid gap-4 md:grid-cols-2">
              <label className="text-sm text-muted-foreground">
                Name
                <input
                  value={promptNameDraft}
                  onChange={(event) => setPromptNameDraft(event.target.value)}
                  className="mt-1 h-10 w-full rounded-md border border-border bg-white px-3"
                />
              </label>
              <label className="text-sm text-muted-foreground">
                Service
                <select
                  value={promptServiceDraft}
                  onChange={(event) => setPromptServiceDraft(event.target.value as AiService)}
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
                  value={promptTextDraft}
                  onChange={(event) => setPromptTextDraft(event.target.value)}
                  rows={8}
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2"
                />
              </label>

              <label className="text-sm text-muted-foreground md:col-span-2">
                Rules (JSON)
                <textarea
                  value={promptRulesDraft}
                  onChange={(event) => setPromptRulesDraft(event.target.value)}
                  rows={7}
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 font-mono text-xs"
                />
              </label>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button onClick={savePromptVersion} disabled={promptSaving}>
                {promptSaving ? "Gemmer..." : "Save changes"}
              </Button>
              {editingPromptId ? (
                <Button
                  variant="outline"
                  onClick={() => activatePromptVersion(editingPromptId)}
                  disabled={promptSaving}
                >
                  Activate this version
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {tab !== "prompts" ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm text-muted-foreground">
              Service
              <select
                value={serviceFilter}
                onChange={(event) => setServiceFilter(event.target.value as (typeof serviceOptions)[number])}
                className="ml-2 h-10 rounded-md border border-border bg-white px-3"
              >
                {serviceOptions.map((service) => (
                  <option key={service} value={service}>
                    {service}
                  </option>
                ))}
              </select>
            </label>

            {isQueueTab ? (
              <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={needsReviewOnly}
                  onChange={(event) => setNeedsReviewOnly(event.target.checked)}
                />
                Needs review only
              </label>
            ) : null}

            {isHistoryTab ? (
              <label className="text-sm text-muted-foreground">
                Review status
                <select
                  value={historyStatusFilter}
                  onChange={(event) =>
                    setHistoryStatusFilter(event.target.value as (typeof reviewStatusOptions)[number])
                  }
                  className="ml-2 h-10 rounded-md border border-border bg-white px-3"
                >
                  {reviewStatusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Søg i lead/inputs/output..."
              className="h-10 min-w-[220px] rounded-md border border-border bg-white px-3 text-sm"
            />

            <Button variant="outline" onClick={loadQuotes} disabled={loadingList}>
              {loadingList ? "Henter..." : "Opdater"}
            </Button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-white">
            <div className="grid grid-cols-[160px_130px_220px_120px_120px_1fr_100px] border-b border-border/70 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <span>Tid</span>
              <span>Service</span>
              <span>Lead</span>
              <span>Confidence</span>
              <span>Status</span>
              <span>Summary</span>
              <span>Detalje</span>
            </div>
            <div className="divide-y divide-border/60">
              {items.length === 0 ? (
                <p className="px-4 py-6 text-sm text-muted-foreground">Ingen quotes fundet.</p>
              ) : (
                items.map((item) => (
                  <div
                    key={item.result_id}
                    className="grid grid-cols-[160px_130px_220px_120px_120px_1fr_100px] items-start gap-3 px-4 py-3 text-sm"
                  >
                    <span className="text-muted-foreground">{formatDateTime(item.created_at)}</span>
                    <span className="text-muted-foreground">{item.service}</span>
                    <div className="text-xs text-muted-foreground">
                      <p className="font-medium text-foreground">{short(item.lead?.name, "Ukendt")}</p>
                      <p>{short(item.lead?.phone)}</p>
                      <p>{short(item.lead?.email)}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {typeof item.confidence === "number" ? item.confidence.toFixed(2) : "n/a"}
                    </span>
                    <span
                      className={`inline-flex w-fit rounded-full px-2 py-1 text-xs ${
                        statusClasses[item.review_status] || "bg-muted text-foreground"
                      }`}
                    >
                      {item.review_status}
                    </span>
                    <div className="space-y-1">
                      <p className="text-foreground">{item.summary}</p>
                      {item.needs_review ? (
                        <span className="inline-flex rounded-full bg-amber-100 px-2 py-1 text-xs text-amber-900">
                          needs review
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-900">
                          reviewed
                        </span>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openDetail(item.result_id)}
                      disabled={detailLoading}
                    >
                      Open
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          <p className="text-xs text-muted-foreground">Viser {items.length} af {total} resultater.</p>
        </div>
      ) : null}

      {detailOpen && detail ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/45">
          <div className="h-full w-full max-w-3xl overflow-y-auto bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">Quote detail</h2>
                <p className="text-xs text-muted-foreground">
                  {detail.request?.service || "-"} · {formatDateTime(detail.result.created_at)}
                </p>
              </div>
              <Button variant="outline" onClick={() => setDetailOpen(false)} disabled={detailSaving}>
                Luk
              </Button>
            </div>

            {detailError ? <p className="mt-4 text-sm font-medium text-red-700">{detailError}</p> : null}
            {detailMessage ? <p className="mt-4 text-sm font-medium text-emerald-700">{detailMessage}</p> : null}

            <div className="mt-4 space-y-4">
              <section className="rounded-xl border border-border bg-muted/20 p-4">
                <p className="text-sm font-semibold text-foreground">Lead</p>
                {detail.lead ? (
                  <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">{short(detail.lead.name, "Ukendt")}</p>
                    <p>{short(detail.lead.phone)}</p>
                    <p>{short(detail.lead.email)}</p>
                    <p>{short(detail.lead.location)}</p>
                    {openLeadHref ? (
                      <Link href={openLeadHref} className="inline-flex text-primary underline underline-offset-2">
                        Open lead
                      </Link>
                    ) : null}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">Intet lead linked endnu.</p>
                )}
              </section>

              <section className="rounded-xl border border-border bg-muted/20 p-4">
                <p className="text-sm font-semibold text-foreground">Request</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Oprettet: {detail.request ? formatDateTime(detail.request.created_at) : "-"}
                </p>
                <p className="text-xs text-muted-foreground">Page: {short(detail.request?.page_url)}</p>
                <pre className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-md border border-border/70 bg-white p-3 text-xs text-muted-foreground">
                  {prettyJson(detail.request?.inputs || {})}
                </pre>
              </section>

              <section className="rounded-xl border border-border bg-muted/20 p-4">
                <p className="text-sm font-semibold text-foreground">Images</p>
                {detailImages.length === 0 ? (
                  <p className="mt-2 text-sm text-muted-foreground">No images provided.</p>
                ) : (
                  <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3">
                    {detailImages.map((url) => (
                      <a
                        key={url}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="group overflow-hidden rounded-lg border border-border bg-white"
                      >
                        <img
                          src={url}
                          alt="AI quote input"
                          className="h-28 w-full object-cover transition group-hover:scale-[1.02]"
                        />
                      </a>
                    ))}
                  </div>
                )}
              </section>

              <section className="rounded-xl border border-border bg-muted/20 p-4">
                <p className="text-sm font-semibold text-foreground">AI output</p>
                {typeof detail.result.output?.text === "string" && detail.result.output.text.trim() ? (
                  <p className="mt-2 text-sm text-foreground">{detail.result.output.text.trim()}</p>
                ) : null}
                <pre className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-md border border-border/70 bg-white p-3 text-xs text-muted-foreground">
                  {prettyJson(detail.result.output || {})}
                </pre>
              </section>

              <section className="rounded-xl border border-border bg-muted/20 p-4">
                <p className="text-sm font-semibold text-foreground">Review actions</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button variant="outline" disabled={detailSaving} onClick={() => reviewAction("approved")}>
                    Approve
                  </Button>
                  <Button variant="outline" disabled={detailSaving} onClick={() => reviewAction("edited")}>
                    Mark edited
                  </Button>
                  <Button variant="outline" disabled={detailSaving} onClick={() => reviewAction("rejected")}>
                    Reject
                  </Button>
                </div>
                <label className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={detail.result.needs_review}
                    onChange={(event) => updateNeedsReview(event.target.checked)}
                    disabled={detailSaving}
                  />
                  needs_review
                </label>
              </section>

              <section className="rounded-xl border border-border bg-muted/20 p-4">
                <p className="text-sm font-semibold text-foreground">Admin feedback</p>
                <textarea
                  value={feedbackDraft}
                  onChange={(event) => setFeedbackDraft(event.target.value)}
                  rows={4}
                  className="mt-2 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                />
                <div className="mt-3">
                  <Button variant="outline" disabled={detailSaving} onClick={saveFeedback}>
                    Save feedback
                  </Button>
                </div>
              </section>

              <section className="rounded-xl border border-border bg-muted/20 p-4">
                <p className="text-sm font-semibold text-foreground">Admin override (JSON)</p>
                <textarea
                  value={overrideDraft}
                  onChange={(event) => setOverrideDraft(event.target.value)}
                  rows={10}
                  className="mt-2 w-full rounded-md border border-border bg-white px-3 py-2 font-mono text-xs"
                />
                <div className="mt-3 flex gap-2">
                  <Button variant="outline" disabled={detailSaving} onClick={saveOverride}>
                    Save override
                  </Button>
                  <Button variant="outline" disabled={detailSaving} onClick={clearOverride}>
                    Clear override
                  </Button>
                </div>
              </section>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
};
