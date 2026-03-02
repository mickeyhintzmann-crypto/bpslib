"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { JobFormModal, type JobDraft } from "@/components/admin/JobFormModal";

const STATUS_OPTIONS = [
  { value: "alle", label: "Alle status" },
  { value: "new", label: "New" },
  { value: "in_progress", label: "In progress" },
  { value: "awaiting_customer", label: "Awaiting customer" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" }
] as const;

const SOURCE_OPTIONS = [
  { value: "alle", label: "Alle kilder" },
  { value: "form", label: "Form" },
  { value: "ai_quote", label: "AI quote" },
  { value: "booking", label: "Booking" },
  { value: "manual", label: "Manual" },
  { value: "import", label: "Import" }
] as const;

const SERVICE_OPTIONS = [
  { value: "alle", label: "Alle services" },
  { value: "bordplade", label: "Bordplade" },
  { value: "gulvafslibning", label: "Gulvafslibning" },
  { value: "gulvbelaegning", label: "Gulvbelægning" },
  { value: "microcement", label: "Microcement" },
  { value: "maler", label: "Maler" },
  { value: "toemrer", label: "Tømrer" },
  { value: "murer", label: "Murer" },
  { value: "andet", label: "Andet" }
] as const;

type LeadListItem = {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: string;
  source: string;
  service: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  message: string | null;
  pageUrl: string | null;
  utm: Record<string, unknown>;
  meta: Record<string, unknown>;
};

type LeadMessageItem = {
  id: string;
  leadId: string;
  createdAt: string;
  kind: string;
  channel: string;
  content: string;
  createdBy: string | null;
};

type LeadsListResponse = {
  items?: LeadListItem[];
  total?: number | null;
  message?: string;
};

type LeadDetailResponse = {
  item?: LeadListItem;
  messages?: LeadMessageItem[];
  message?: string;
};

type LeadPrefillJobResponse = {
  lead?: {
    id: string;
    name: string | null;
    phone: string | null;
    email: string | null;
    location: string | null;
    message: string | null;
    service: string | null;
  };
  jobDraft?: JobDraft;
  message?: string;
};

const formatDate = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "Ukendt";
  }
  return new Intl.DateTimeFormat("da-DK", { dateStyle: "short", timeStyle: "short" }).format(date);
};

const statusClasses: Record<string, string> = {
  new: "bg-blue-100 text-blue-800",
  in_progress: "bg-amber-100 text-amber-800",
  awaiting_customer: "bg-purple-100 text-purple-800",
  won: "bg-emerald-100 text-emerald-800",
  lost: "bg-rose-100 text-rose-800"
};

const short = (value: string | null | undefined, fallback = "-") => {
  const text = (value || "").trim();
  return text || fallback;
};

const copyText = async (value: string | null | undefined) => {
  const text = short(value, "");
  if (!text) {
    return;
  }
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    console.error("Kunne ikke kopiere", error);
  }
};

export const LeadsInbox = () => {
  const [statusFilter, setStatusFilter] = useState("alle");
  const [sourceFilter, setSourceFilter] = useState("alle");
  const [serviceFilter, setServiceFilter] = useState("alle");
  const [query, setQuery] = useState("");

  const [items, setItems] = useState<LeadListItem[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [loadingList, setLoadingList] = useState(false);
  const [listError, setListError] = useState("");

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<LeadListItem | null>(null);
  const [messages, setMessages] = useState<LeadMessageItem[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState("");

  const [statusDraft, setStatusDraft] = useState("new");
  const [serviceDraft, setServiceDraft] = useState("");
  const [savingMeta, setSavingMeta] = useState(false);

  const [noteDraft, setNoteDraft] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [jobPrefillBusy, setJobPrefillBusy] = useState(false);
  const [jobModalOpen, setJobModalOpen] = useState(false);
  const [jobDraft, setJobDraft] = useState<JobDraft | null>(null);
  const [jobSuccessMessage, setJobSuccessMessage] = useState("");

  const hasItems = items.length > 0;

  const selectedSummary = useMemo(() => items.find((item) => item.id === selectedId) || null, [items, selectedId]);

  const loadList = async () => {
    setLoadingList(true);
    setListError("");

    try {
      const params = new URLSearchParams();
      if (statusFilter !== "alle") params.set("status", statusFilter);
      if (sourceFilter !== "alle") params.set("source", sourceFilter);
      if (serviceFilter !== "alle") params.set("service", serviceFilter);
      if (query.trim()) params.set("q", query.trim());
      params.set("page", "1");
      params.set("pageSize", "200");

      const response = await fetch(`/api/admin/leads?${params.toString()}`, {
        cache: "no-store"
      });
      const payload = (await response.json()) as LeadsListResponse;

      if (!response.ok || !payload.items) {
        setItems([]);
        setTotal(null);
        setListError(payload.message || "Kunne ikke hente leads.");
        return;
      }

      setItems(payload.items);
      setTotal(payload.total ?? null);

      if (payload.items.length === 0) {
        setSelectedId(null);
        setDetail(null);
        setMessages([]);
      } else if (!selectedId) {
        setSelectedId(payload.items[0].id);
      }
    } catch (error) {
      console.error(error);
      setItems([]);
      setTotal(null);
      setListError("Netværksfejl ved hentning af leads.");
    } finally {
      setLoadingList(false);
    }
  };

  const loadDetail = async (leadId: string) => {
    setLoadingDetail(true);
    setDetailError("");

    try {
      const response = await fetch(`/api/admin/leads/${leadId}`, { cache: "no-store" });
      const payload = (await response.json()) as LeadDetailResponse;

      if (!response.ok || !payload.item) {
        setDetail(null);
        setMessages([]);
        setDetailError(payload.message || "Kunne ikke hente lead-detaljer.");
        return;
      }

      setDetail(payload.item);
      setMessages(payload.messages || []);
      setStatusDraft(payload.item.status || "new");
      setServiceDraft(payload.item.service || "");
    } catch (error) {
      console.error(error);
      setDetail(null);
      setMessages([]);
      setDetailError("Netværksfejl ved hentning af lead.");
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    loadList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, sourceFilter, serviceFilter]);

  useEffect(() => {
    if (!selectedId) {
      return;
    }
    loadDetail(selectedId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const saveStatusAndService = async () => {
    if (!detail) {
      return;
    }

    setSavingMeta(true);
    setDetailError("");

    try {
      const response = await fetch(`/api/admin/leads/${detail.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          status: statusDraft,
          service: serviceDraft || null
        })
      });

      const payload = (await response.json()) as LeadDetailResponse;
      if (!response.ok || !payload.item) {
        setDetailError(payload.message || "Kunne ikke opdatere lead.");
        return;
      }

      setDetail(payload.item);
      setMessages(payload.messages || messages);
      setItems((current) => current.map((item) => (item.id === payload.item!.id ? payload.item! : item)));
    } catch (error) {
      console.error(error);
      setDetailError("Netværksfejl ved opdatering af lead.");
    } finally {
      setSavingMeta(false);
    }
  };

  const addNote = async () => {
    if (!detail || !noteDraft.trim()) {
      return;
    }

    setSavingNote(true);
    setDetailError("");

    try {
      const response = await fetch(`/api/admin/leads/${detail.id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          content: noteDraft.trim(),
          kind: "note",
          channel: "admin"
        })
      });

      const payload = (await response.json()) as { item?: LeadMessageItem; message?: string };
      if (!response.ok || !payload.item) {
        setDetailError(payload.message || "Kunne ikke oprette note.");
        return;
      }

      setMessages((current) => [...current, payload.item!]);
      setNoteDraft("");
    } catch (error) {
      console.error(error);
      setDetailError("Netværksfejl ved oprettelse af note.");
    } finally {
      setSavingNote(false);
    }
  };

  const openCreateJobModal = async () => {
    if (!detail) {
      return;
    }

    setJobPrefillBusy(true);
    setDetailError("");
    setJobSuccessMessage("");

    try {
      const response = await fetch(`/api/admin/leads/${detail.id}/prefill-job`, { cache: "no-store" });
      const payload = (await response.json()) as LeadPrefillJobResponse;
      if (!response.ok || !payload.jobDraft) {
        setDetailError(payload.message || "Kunne ikke hente job-prefill.");
        return;
      }

      setJobDraft(payload.jobDraft);
      setJobModalOpen(true);
    } catch (error) {
      console.error(error);
      setDetailError("Netværksfejl ved hentning af job-prefill.");
    } finally {
      setJobPrefillBusy(false);
    }
  };

  const deleteLead = async () => {
    if (!detail) {
      return;
    }

    const confirmed = window.confirm("Slet lead? Denne handling kan ikke fortrydes.");
    if (!confirmed) {
      return;
    }

    setSavingMeta(true);
    setDetailError("");

    try {
      const response = await fetch(`/api/admin/leads/${detail.id}`, {
        method: "DELETE"
      });
      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        setDetailError(payload.message || "Kunne ikke slette lead.");
        return;
      }

      setItems((current) => current.filter((item) => item.id !== detail.id));
      setSelectedId((current) => {
        if (current !== detail.id) {
          return current;
        }
        const next = items.find((item) => item.id !== detail.id);
        return next?.id || null;
      });
      setDetail(null);
      setMessages([]);
    } catch (error) {
      console.error(error);
      setDetailError("Netværksfejl ved sletning.");
    } finally {
      setSavingMeta(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">Leads Inbox</h1>
          <p className="text-sm text-muted-foreground">Samlet intake fra formularer, AI-quote og booking.</p>
        </div>
        <Button variant="outline" onClick={() => loadList()} disabled={loadingList}>
          {loadingList ? "Henter..." : "Opdater"}
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_1fr_auto]">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Søg i navn, email, telefon, besked"
          className="h-10 rounded-md border border-border bg-white px-3 text-sm"
        />
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="h-10 rounded-md border border-border bg-white px-3 text-sm"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          value={sourceFilter}
          onChange={(event) => setSourceFilter(event.target.value)}
          className="h-10 rounded-md border border-border bg-white px-3 text-sm"
        >
          {SOURCE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          value={serviceFilter}
          onChange={(event) => setServiceFilter(event.target.value)}
          className="h-10 rounded-md border border-border bg-white px-3 text-sm"
        >
          {SERVICE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Button variant="outline" onClick={() => loadList()}>
          Søg
        </Button>
      </div>

      {listError ? <p className="text-sm font-medium text-red-700">{listError}</p> : null}

      <div className="grid gap-5 lg:grid-cols-[1.05fr_1.25fr]">
        <aside className="overflow-hidden rounded-2xl border border-border bg-white">
          <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Leads</h2>
            <span className="text-xs text-muted-foreground">{total ?? items.length}</span>
          </div>
          <div className="max-h-[72vh] divide-y divide-border/60 overflow-y-auto">
            {!hasItems ? (
              <p className="px-4 py-6 text-sm text-muted-foreground">
                {loadingList ? "Henter leads..." : "No leads yet"}
              </p>
            ) : (
              items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  className={`w-full px-4 py-3 text-left transition hover:bg-muted/50 ${
                    selectedId === item.id ? "bg-muted/50" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-foreground">{short(item.name, "Ukendt")}</p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        statusClasses[item.status] || "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {short(item.email)} · {short(item.phone)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {short(item.source)} · {short(item.service)} · {formatDate(item.createdAt)}
                  </p>
                </button>
              ))
            )}
          </div>
        </aside>

        <section className="rounded-2xl border border-border bg-white p-4 md:p-5">
          {!selectedId ? (
            <p className="text-sm text-muted-foreground">Vælg et lead i listen for at se detaljer.</p>
          ) : loadingDetail ? (
            <p className="text-sm text-muted-foreground">Indlæser lead...</p>
          ) : !detail ? (
            <p className="text-sm text-muted-foreground">Ingen detaljer fundet.</p>
          ) : (
            <div className="space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">{short(detail.name, "Ukendt lead")}</h2>
                  <p className="text-xs text-muted-foreground">
                    Oprettet {formatDate(detail.createdAt)} · Opdateret {formatDate(detail.updatedAt)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => copyText(detail.phone)}>
                    Copy phone
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => copyText(detail.email)}>
                    Copy email
                  </Button>
                  <Button size="sm" variant="outline" onClick={openCreateJobModal} disabled={jobPrefillBusy}>
                    {jobPrefillBusy ? "Henter..." : "Opret job"}
                  </Button>
                </div>
              </div>

              {detailError ? <p className="text-sm font-medium text-red-700">{detailError}</p> : null}
              {jobSuccessMessage ? <p className="text-sm font-medium text-emerald-700">{jobSuccessMessage}</p> : null}

              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Status
                  <select
                    value={statusDraft}
                    onChange={(event) => setStatusDraft(event.target.value)}
                    className="mt-2 h-10 w-full rounded-md border border-border bg-white px-3"
                  >
                    {STATUS_OPTIONS.filter((option) => option.value !== "alle").map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="text-sm font-medium text-muted-foreground">
                  Service
                  <select
                    value={serviceDraft}
                    onChange={(event) => setServiceDraft(event.target.value)}
                    className="mt-2 h-10 w-full rounded-md border border-border bg-white px-3"
                  >
                    <option value="">Ikke sat</option>
                    {SERVICE_OPTIONS.filter((option) => option.value !== "alle").map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button onClick={saveStatusAndService} disabled={savingMeta}>
                  {savingMeta ? "Gemmer..." : "Gem status/service"}
                </Button>
                <Button variant="outline" onClick={deleteLead} disabled={savingMeta}>
                  Slet lead
                </Button>
              </div>

              <div className="rounded-xl border border-border/70 bg-muted/20 p-4 text-sm">
                <p>
                  <strong>Email:</strong> {short(detail.email)}
                </p>
                <p>
                  <strong>Telefon:</strong> {short(detail.phone)}
                </p>
                <p>
                  <strong>Lokation:</strong> {short(detail.location)}
                </p>
                <p>
                  <strong>Source:</strong> {short(detail.source)}
                </p>
                <p>
                  <strong>Page URL:</strong> {short(detail.pageUrl)}
                </p>
                <p className="mt-2 whitespace-pre-wrap">
                  <strong>Besked:</strong> {short(detail.message)}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-border/70 p-3 text-xs">
                  <p className="mb-2 font-semibold uppercase text-muted-foreground">UTM</p>
                  <pre className="max-h-40 overflow-auto whitespace-pre-wrap break-words text-[11px] text-foreground">
                    {JSON.stringify(detail.utm || {}, null, 2)}
                  </pre>
                </div>
                <div className="rounded-xl border border-border/70 p-3 text-xs">
                  <p className="mb-2 font-semibold uppercase text-muted-foreground">Meta</p>
                  <pre className="max-h-40 overflow-auto whitespace-pre-wrap break-words text-[11px] text-foreground">
                    {JSON.stringify(detail.meta || {}, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-semibold text-foreground">Messages & notes</h3>
                <div className="max-h-56 space-y-2 overflow-y-auto rounded-xl border border-border/70 bg-muted/20 p-3">
                  {messages.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Ingen beskeder endnu.</p>
                  ) : (
                    messages.map((message) => (
                      <article key={message.id} className="rounded-lg border border-border bg-white p-3 text-sm">
                        <p className="text-xs text-muted-foreground">
                          {formatDate(message.createdAt)} · {message.kind} · {message.channel}
                        </p>
                        <p className="mt-1 whitespace-pre-wrap text-foreground">{message.content}</p>
                      </article>
                    ))
                  )}
                </div>

                <div className="space-y-2">
                  <textarea
                    value={noteDraft}
                    onChange={(event) => setNoteDraft(event.target.value)}
                    rows={4}
                    placeholder="Skriv intern note"
                    className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                  />
                  <Button onClick={addNote} disabled={savingNote || !noteDraft.trim()}>
                    {savingNote ? "Gemmer note..." : "Tilføj note"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      {selectedSummary && !detail ? (
        <p className="text-xs text-muted-foreground">Valgt lead: {selectedSummary.name || selectedSummary.id}</p>
      ) : null}

      <JobFormModal
        isOpen={jobModalOpen}
        draft={jobDraft}
        title="Opret job fra lead"
        subtitle="Klargjort fra lead-data. Justér felter og gem."
        onClose={() => setJobModalOpen(false)}
        onCreated={(jobId) => {
          setJobSuccessMessage(`Job oprettet (${jobId}).`);
          setJobModalOpen(false);
        }}
      />
    </section>
  );
};
