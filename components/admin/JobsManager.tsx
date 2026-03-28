"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { JOB_SERVICE_VALUES, JOB_STATUS_VALUES, type JobService, type JobStatus } from "@/lib/admin/jobs";
import {
  Briefcase,
  RefreshCw,
  Plus,
  Filter,
  Pencil,
  Trash2,
  X,
  Clock,
  MapPin,
  User,
  Save,
} from "lucide-react";

type EmployeeItem = {
  id: string;
  createdAt: string;
  name: string;
  role: string;
  isActive: boolean;
  calendarColor: string | null;
};

type JobItem = {
  id: string;
  createdAt: string;
  updatedAt: string;
  leadId: string | null;
  title: string;
  service: string | null;
  location: string | null;
  address: string | null;
  notes: string | null;
  status: string;
  startAt: string;
  endAt: string;
  assignedEmployeeId: string | null;
  employee: {
    id: string;
    name: string;
    role: string;
    isActive: boolean;
    calendarColor: string | null;
  } | null;
};

type JobsResponse = { items?: JobItem[]; message?: string };
type EmployeesResponse = { items?: EmployeeItem[]; message?: string };

type LeadPrefill = {
  id: string;
  name: string | null;
  location: string | null;
  message: string | null;
  service: string | null;
};

const statusLabels: Record<JobStatus, string> = {
  unassigned: "Ikke tildelt",
  scheduled: "Planlagt",
  in_progress: "I gang",
  done: "Udført",
  invoiced: "Faktureret",
  cancelled: "Annulleret",
};

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  unassigned: { bg: "bg-neutral-100", text: "text-neutral-600", dot: "bg-neutral-400" },
  scheduled: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  in_progress: { bg: "bg-violet-50", text: "text-violet-700", dot: "bg-violet-500" },
  done: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
  invoiced: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  cancelled: { bg: "bg-red-50", text: "text-red-600", dot: "bg-red-400" },
};

const serviceLabels: Record<JobService, string> = {
  bordplade: "Bordplade",
  gulvafslibning: "Gulvafslibning",
  gulvbelaegning: "Gulvbelægning",
  microcement: "Microcement",
  maler: "Maler",
  toemrer: "Tømrer",
  murer: "Murer",
  andet: "Andet",
};

const StatusBadge = ({ status }: { status: string }) => {
  const config = statusConfig[status] || statusConfig.unassigned;
  const label = statusLabels[status as JobStatus] || status;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${config.bg} ${config.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {label}
    </span>
  );
};

type RangePreset = "today" | "week" | "next14";

const getRangeByPreset = (preset: RangePreset) => {
  const from = new Date();
  from.setHours(0, 0, 0, 0);
  const to = new Date(from);
  if (preset === "today") { to.setHours(23, 59, 59, 999); }
  else if (preset === "week") { to.setDate(to.getDate() + 6); to.setHours(23, 59, 59, 999); }
  else { to.setDate(to.getDate() + 13); to.setHours(23, 59, 59, 999); }
  return { fromIso: from.toISOString(), toIso: to.toISOString() };
};

const toInputDateTime = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const offsetMinutes = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offsetMinutes * 60000);
  return local.toISOString().slice(0, 16);
};

const fromInputDateTime = (value: string) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
};

const formatDateTime = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Ukendt";
  return new Intl.DateTimeFormat("da-DK", { dateStyle: "short", timeStyle: "short" }).format(date);
};

const makeInitialForm = () => {
  const start = new Date();
  start.setMinutes(0, 0, 0);
  start.setHours(start.getHours() + 1);
  const end = new Date(start);
  end.setHours(end.getHours() + 2);
  return {
    title: "",
    service: "andet" as JobService,
    status: "unassigned" as JobStatus,
    startAt: toInputDateTime(start.toISOString()),
    endAt: toInputDateTime(end.toISOString()),
    assignedEmployeeId: "",
    location: "",
    address: "",
    notes: "",
    leadId: "",
  };
};

const inputClass =
  "mt-1 h-10 w-full rounded-xl border border-border/60 bg-muted/20 px-3 text-sm transition focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100";

export const JobsManager = () => {
  const searchParams = useSearchParams();
  const leadIdFromQuery = searchParams.get("lead_id");

  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [employees, setEmployees] = useState<EmployeeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [rangePreset, setRangePreset] = useState<RangePreset>("next14");
  const [statusFilter, setStatusFilter] = useState("alle");
  const [employeeFilter, setEmployeeFilter] = useState("alle");

  const [leadPrefill, setLeadPrefill] = useState<LeadPrefill | null>(null);
  const [leadPrefillBusy, setLeadPrefillBusy] = useState(false);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(makeInitialForm());
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const employeeOptions = useMemo(
    () => employees.filter((e) => e.isActive || e.id === form.assignedEmployeeId),
    [employees, form.assignedEmployeeId]
  );

  const loadEmployees = async () => {
    try {
      const response = await fetch("/api/admin/employees?all=1", { cache: "no-store" });
      const payload = (await response.json()) as EmployeesResponse;
      if (!response.ok || !payload.items) return;
      setEmployees(payload.items);
    } catch (e) { console.error(e); }
  };

  const loadJobs = async () => {
    setLoading(true);
    setError("");
    try {
      const { fromIso, toIso } = getRangeByPreset(rangePreset);
      const params = new URLSearchParams({ from: fromIso, to: toIso });
      if (statusFilter !== "alle") params.set("status", statusFilter);
      if (employeeFilter !== "alle") params.set("employeeId", employeeFilter);
      const response = await fetch(`/api/admin/jobs?${params.toString()}`, { cache: "no-store" });
      const payload = (await response.json()) as JobsResponse;
      if (!response.ok || !payload.items) {
        setJobs([]);
        setError(payload.message || "Kunne ikke hente jobs.");
        return;
      }
      setJobs(payload.items);
    } catch (e) {
      console.error(e);
      setJobs([]);
      setError("Netværksfejl ved hentning af jobs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadEmployees(); }, []);
  useEffect(() => { loadJobs(); }, [rangePreset, statusFilter, employeeFilter]);

  useEffect(() => {
    const loadLeadPrefill = async () => {
      if (!leadIdFromQuery) { setLeadPrefill(null); return; }
      setLeadPrefillBusy(true);
      try {
        const response = await fetch(`/api/admin/leads/${leadIdFromQuery}`, { cache: "no-store" });
        const payload = (await response.json()) as { item?: { id: string; name: string | null; location: string | null; message: string | null; service: string | null } };
        if (!response.ok || !payload.item) { setLeadPrefill(null); return; }
        setLeadPrefill({ id: payload.item.id, name: payload.item.name, location: payload.item.location, message: payload.item.message, service: payload.item.service });
      } catch (e) { console.error(e); setLeadPrefill(null); }
      finally { setLeadPrefillBusy(false); }
    };
    loadLeadPrefill();
  }, [leadIdFromQuery]);

  const openCreate = () => {
    const next = makeInitialForm();
    if (leadPrefill) {
      next.leadId = leadPrefill.id;
      next.location = leadPrefill.location || "";
      if (leadPrefill.service && JOB_SERVICE_VALUES.includes(leadPrefill.service as JobService)) next.service = leadPrefill.service as JobService;
      const noteParts = [`Lead: ${leadPrefill.name || "Ukendt"}`, leadPrefill.location ? `Lokation: ${leadPrefill.location}` : "", leadPrefill.message ? `Besked: ${leadPrefill.message}` : ""].filter(Boolean);
      next.notes = noteParts.join("\n");
    }
    setEditingId(null);
    setSaveError("");
    setForm(next);
    setEditorOpen(true);
  };

  const openEdit = (item: JobItem) => {
    setEditingId(item.id);
    setSaveError("");
    setForm({
      title: item.title,
      service: (item.service as JobService) || "andet",
      status: item.status as JobStatus,
      startAt: toInputDateTime(item.startAt),
      endAt: toInputDateTime(item.endAt),
      assignedEmployeeId: item.assignedEmployeeId || "",
      location: item.location || "",
      address: item.address || "",
      notes: item.notes || "",
      leadId: item.leadId || "",
    });
    setEditorOpen(true);
  };

  const saveJob = async () => {
    setSaving(true);
    setSaveError("");
    try {
      const startAtIso = fromInputDateTime(form.startAt);
      const endAtIso = fromInputDateTime(form.endAt);
      if (!startAtIso || !endAtIso) { setSaveError("Start/slut tidspunkt er ugyldigt."); return; }
      const endpoint = editingId ? `/api/admin/jobs/${editingId}` : "/api/admin/jobs";
      const method = editingId ? "PATCH" : "POST";
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title, service: form.service, status: form.status,
          start_at: startAtIso, end_at: endAtIso,
          assigned_employee_id: form.assignedEmployeeId || null,
          location: form.location || null, address: form.address || null,
          notes: form.notes || null, lead_id: form.leadId || null,
        }),
      });
      const payload = (await response.json()) as { message?: string };
      if (!response.ok) { setSaveError(payload.message || "Kunne ikke gemme job."); return; }
      setEditorOpen(false);
      setEditingId(null);
      setForm(makeInitialForm());
      await loadJobs();
    } catch (e) { console.error(e); setSaveError("Netværksfejl ved gemning."); }
    finally { setSaving(false); }
  };

  const deleteJob = async (item: JobItem) => {
    const confirmed = window.confirm(`Slet job "${item.title}"?`);
    if (!confirmed) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/jobs/${item.id}`, { method: "DELETE" });
      const payload = (await response.json()) as { message?: string };
      if (!response.ok) { setError(payload.message || "Kunne ikke slette job."); return; }
      await loadJobs();
    } catch (e) { console.error(e); setError("Netværksfejl ved sletning."); }
    finally { setSaving(false); }
  };

  const rangeLabels: Record<RangePreset, string> = { today: "I dag", week: "Denne uge", next14: "Næste 14 dage" };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-blue-50 p-2.5">
            <Briefcase className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Jobs</h1>
            <p className="text-sm text-muted-foreground">Planlæg opgaver og tildel medarbejdere.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => loadJobs()} disabled={loading} className="gap-2">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Opdater
          </Button>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-3.5 w-3.5" />
            Nyt job
          </Button>
        </div>
      </div>

      {leadPrefillBusy && <p className="text-xs text-muted-foreground">Henter lead-prefill...</p>}
      {leadPrefill && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-xs text-blue-700">
          Lead-prefill aktiv: <strong>{leadPrefill.name || leadPrefill.id}</strong>
        </div>
      )}

      {/* Filters */}
      <div className="rounded-2xl border border-border/40 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <Filter className="h-3.5 w-3.5" />
          Filtre
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Periode</label>
            <select value={rangePreset} onChange={(e) => setRangePreset(e.target.value as RangePreset)} className={inputClass}>
              {(["today", "week", "next14"] as RangePreset[]).map((p) => (
                <option key={p} value={p}>{rangeLabels[p]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={inputClass}>
              <option value="alle">Alle status</option>
              {JOB_STATUS_VALUES.map((s) => (
                <option key={s} value={s}>{statusLabels[s]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Medarbejder</label>
            <select value={employeeFilter} onChange={(e) => setEmployeeFilter(e.target.value)} className={inputClass}>
              <option value="alle">Alle</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-semibold">{error}</p>
        </div>
      )}

      {/* Jobs table */}
      <div className="overflow-hidden rounded-2xl border border-border/40 bg-white shadow-sm">
        {/* Desktop header */}
        <div className="hidden grid-cols-[160px_1fr_120px_140px_1fr_130px] gap-2 border-b border-border/40 bg-muted/30 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground lg:grid">
          <span>Tid</span>
          <span>Titel</span>
          <span>Status</span>
          <span>Medarbejder</span>
          <span>Lokation</span>
          <span>Handling</span>
        </div>
        <div className="divide-y divide-border/30">
          {jobs.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <Briefcase className="mb-3 h-10 w-10 text-muted-foreground/20" />
              <p className="text-sm font-medium text-muted-foreground">
                {loading ? "Henter jobs..." : "Ingen jobs i perioden."}
              </p>
            </div>
          ) : (
            jobs.map((item) => (
              <div key={item.id} className="transition hover:bg-blue-50/20">
                {/* Desktop row */}
                <div className="hidden grid-cols-[160px_1fr_120px_140px_1fr_130px] items-center gap-2 px-5 py-3.5 text-sm lg:grid">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{formatDateTime(item.startAt)}</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.service ? serviceLabels[item.service as JobService] || item.service : "Ingen service"}
                    </p>
                  </div>
                  <StatusBadge status={item.status} />
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <User className="h-3 w-3" />
                    {item.employee?.name || "Ikke tildelt"}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {item.location || "-"}
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEdit(item)}
                      className="rounded-lg p-2 text-muted-foreground transition hover:bg-blue-50 hover:text-blue-600"
                      title="Redigér"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteJob(item)}
                      disabled={saving}
                      className="rounded-lg p-2 text-muted-foreground transition hover:bg-red-50 hover:text-red-600"
                      title="Slet"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Mobile card */}
                <div className="space-y-2 px-4 py-4 lg:hidden">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-foreground">{item.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {item.service ? serviceLabels[item.service as JobService] || item.service : ""}
                      </p>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {formatDateTime(item.startAt)}</span>
                    <span className="flex items-center gap-1"><User className="h-3 w-3" /> {item.employee?.name || "Ikke tildelt"}</span>
                    {item.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {item.location}</span>}
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button size="sm" variant="outline" onClick={() => openEdit(item)} className="gap-1.5">
                      <Pencil className="h-3 w-3" /> Redigér
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => deleteJob(item)} disabled={saving} className="gap-1.5 text-red-600 hover:bg-red-50">
                      <Trash2 className="h-3 w-3" /> Slet
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Editor slide-over */}
      {editorOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button
            type="button"
            onClick={() => setEditorOpen(false)}
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            aria-label="Luk editor"
          />
          <div className="relative h-full w-full max-w-2xl overflow-y-auto border-l border-border/40 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-50 p-2">
                  <Briefcase className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    {editingId ? "Redigér job" : "Nyt job"}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {editingId ? "Opdater opgavens detaljer." : "Opret en ny planlagt opgave."}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditorOpen(false)}
                className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {saveError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {saveError}
              </div>
            )}

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground sm:col-span-2">
                Titel
                <input
                  value={form.title}
                  onChange={(e) => setForm((c) => ({ ...c, title: e.target.value }))}
                  className={inputClass}
                  placeholder="Fx. Gulvafslibning - Frederiksberg"
                />
              </label>

              <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Service
                <select value={form.service} onChange={(e) => setForm((c) => ({ ...c, service: e.target.value as JobService }))} className={inputClass}>
                  {JOB_SERVICE_VALUES.map((s) => <option key={s} value={s}>{serviceLabels[s]}</option>)}
                </select>
              </label>

              <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Status
                <select value={form.status} onChange={(e) => setForm((c) => ({ ...c, status: e.target.value as JobStatus }))} className={inputClass}>
                  {JOB_STATUS_VALUES.map((s) => <option key={s} value={s}>{statusLabels[s]}</option>)}
                </select>
              </label>

              <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Start
                <input type="datetime-local" value={form.startAt} onChange={(e) => setForm((c) => ({ ...c, startAt: e.target.value }))} className={inputClass} />
              </label>

              <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Slut
                <input type="datetime-local" value={form.endAt} onChange={(e) => setForm((c) => ({ ...c, endAt: e.target.value }))} className={inputClass} />
              </label>

              <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Medarbejder
                <select value={form.assignedEmployeeId} onChange={(e) => setForm((c) => ({ ...c, assignedEmployeeId: e.target.value }))} className={inputClass}>
                  <option value="">Ikke tildelt</option>
                  {employeeOptions.map((emp) => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                </select>
              </label>

              <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Lead ID (valgfri)
                <input value={form.leadId} onChange={(e) => setForm((c) => ({ ...c, leadId: e.target.value }))} className={inputClass} />
              </label>

              <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Lokation
                <input value={form.location} onChange={(e) => setForm((c) => ({ ...c, location: e.target.value }))} className={inputClass} placeholder="Fx. København NV" />
              </label>

              <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Adresse
                <input value={form.address} onChange={(e) => setForm((c) => ({ ...c, address: e.target.value }))} className={inputClass} placeholder="Fx. Nørrebrogade 42" />
              </label>

              <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground sm:col-span-2">
                Noter
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((c) => ({ ...c, notes: e.target.value }))}
                  rows={4}
                  className="mt-1 w-full rounded-xl border border-border/60 bg-muted/20 px-3 py-2 text-sm transition focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
                />
              </label>
            </div>

            <div className="mt-6 flex gap-3 border-t border-border/40 pt-6">
              <Button onClick={saveJob} disabled={saving} className="gap-2">
                <Save className="h-3.5 w-3.5" />
                {saving ? "Gemmer..." : editingId ? "Gem ændringer" : "Opret job"}
              </Button>
              <Button variant="outline" onClick={() => setEditorOpen(false)}>
                Annuller
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
