"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { JOB_SERVICE_VALUES, JOB_STATUS_VALUES, type JobService, type JobStatus } from "@/lib/admin/jobs";

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

type JobsResponse = {
  items?: JobItem[];
  message?: string;
};

type EmployeesResponse = {
  items?: EmployeeItem[];
  message?: string;
};

type LeadPrefill = {
  id: string;
  name: string | null;
  location: string | null;
  message: string | null;
  service: string | null;
};

const statusLabels: Record<JobStatus, string> = {
  unassigned: "Unassigned",
  scheduled: "Scheduled",
  in_progress: "In progress",
  done: "Done",
  invoiced: "Invoiced",
  cancelled: "Cancelled"
};

const serviceLabels: Record<JobService, string> = {
  bordplade: "Bordplade",
  gulvafslibning: "Gulvafslibning",
  gulvbelaegning: "Gulvbelægning",
  microcement: "Microcement",
  maler: "Maler",
  toemrer: "Tømrer",
  murer: "Murer",
  andet: "Andet"
};

type RangePreset = "today" | "week" | "next14";

const getRangeByPreset = (preset: RangePreset) => {
  const from = new Date();
  from.setHours(0, 0, 0, 0);
  const to = new Date(from);

  if (preset === "today") {
    to.setHours(23, 59, 59, 999);
  } else if (preset === "week") {
    to.setDate(to.getDate() + 6);
    to.setHours(23, 59, 59, 999);
  } else {
    to.setDate(to.getDate() + 13);
    to.setHours(23, 59, 59, 999);
  }

  return { fromIso: from.toISOString(), toIso: to.toISOString() };
};

const toInputDateTime = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offsetMinutes = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offsetMinutes * 60000);
  return local.toISOString().slice(0, 16);
};

const fromInputDateTime = (value: string) => {
  if (!value) {
    return null;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed.toISOString();
};

const formatDateTime = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "Ukendt";
  }

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
    leadId: ""
  };
};

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
    () => employees.filter((employee) => employee.isActive || employee.id === form.assignedEmployeeId),
    [employees, form.assignedEmployeeId]
  );

  const loadEmployees = async () => {
    try {
      const response = await fetch("/api/admin/employees?all=1", { cache: "no-store" });
      const payload = (await response.json()) as EmployeesResponse;
      if (!response.ok || !payload.items) {
        return;
      }
      setEmployees(payload.items);
    } catch (fetchError) {
      console.error(fetchError);
    }
  };

  const loadJobs = async () => {
    setLoading(true);
    setError("");

    try {
      const { fromIso, toIso } = getRangeByPreset(rangePreset);
      const params = new URLSearchParams({
        from: fromIso,
        to: toIso
      });

      if (statusFilter !== "alle") {
        params.set("status", statusFilter);
      }

      if (employeeFilter !== "alle") {
        params.set("employeeId", employeeFilter);
      }

      const response = await fetch(`/api/admin/jobs?${params.toString()}`, { cache: "no-store" });
      const payload = (await response.json()) as JobsResponse;

      if (!response.ok || !payload.items) {
        setJobs([]);
        setError(payload.message || "Kunne ikke hente jobs.");
        return;
      }

      setJobs(payload.items);
    } catch (fetchError) {
      console.error(fetchError);
      setJobs([]);
      setError("Netværksfejl ved hentning af jobs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rangePreset, statusFilter, employeeFilter]);

  useEffect(() => {
    const loadLeadPrefill = async () => {
      if (!leadIdFromQuery) {
        setLeadPrefill(null);
        return;
      }

      setLeadPrefillBusy(true);
      try {
        const response = await fetch(`/api/admin/leads/${leadIdFromQuery}`, { cache: "no-store" });
        const payload = (await response.json()) as {
          item?: {
            id: string;
            name: string | null;
            location: string | null;
            message: string | null;
            service: string | null;
          };
        };

        if (!response.ok || !payload.item) {
          setLeadPrefill(null);
          return;
        }

        setLeadPrefill({
          id: payload.item.id,
          name: payload.item.name,
          location: payload.item.location,
          message: payload.item.message,
          service: payload.item.service
        });
      } catch (prefillError) {
        console.error(prefillError);
        setLeadPrefill(null);
      } finally {
        setLeadPrefillBusy(false);
      }
    };

    loadLeadPrefill();
  }, [leadIdFromQuery]);

  const openCreate = () => {
    const next = makeInitialForm();

    if (leadPrefill) {
      next.leadId = leadPrefill.id;
      next.location = leadPrefill.location || "";
      if (leadPrefill.service && JOB_SERVICE_VALUES.includes(leadPrefill.service as JobService)) {
        next.service = leadPrefill.service as JobService;
      }

      const noteParts = [
        `Lead: ${leadPrefill.name || "Ukendt"}`,
        leadPrefill.location ? `Lokation: ${leadPrefill.location}` : "",
        leadPrefill.message ? `Besked: ${leadPrefill.message}` : ""
      ].filter(Boolean);
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
      leadId: item.leadId || ""
    });
    setEditorOpen(true);
  };

  const saveJob = async () => {
    setSaving(true);
    setSaveError("");

    try {
      const startAtIso = fromInputDateTime(form.startAt);
      const endAtIso = fromInputDateTime(form.endAt);
      if (!startAtIso || !endAtIso) {
        setSaveError("Start/slut tidspunkt er ugyldigt.");
        return;
      }

      const endpoint = editingId ? `/api/admin/jobs/${editingId}` : "/api/admin/jobs";
      const method = editingId ? "PATCH" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: form.title,
          service: form.service,
          status: form.status,
          start_at: startAtIso,
          end_at: endAtIso,
          assigned_employee_id: form.assignedEmployeeId || null,
          location: form.location || null,
          address: form.address || null,
          notes: form.notes || null,
          lead_id: form.leadId || null
        })
      });

      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        setSaveError(payload.message || "Kunne ikke gemme job.");
        return;
      }

      setEditorOpen(false);
      setEditingId(null);
      setForm(makeInitialForm());
      await loadJobs();
    } catch (persistError) {
      console.error(persistError);
      setSaveError("Netværksfejl ved gemning.");
    } finally {
      setSaving(false);
    }
  };

  const deleteJob = async (item: JobItem) => {
    const confirmed = window.confirm(`Slet job "${item.title}"?`);
    if (!confirmed) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/jobs/${item.id}`, { method: "DELETE" });
      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        setError(payload.message || "Kunne ikke slette job.");
        return;
      }
      await loadJobs();
    } catch (deleteError) {
      console.error(deleteError);
      setError("Netværksfejl ved sletning.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">Jobs</h1>
          <p className="text-sm text-muted-foreground">Planlæg opgaver og tildel medarbejdere.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => loadJobs()} disabled={loading}>
            {loading ? "Henter..." : "Opdater"}
          </Button>
          <Button onClick={openCreate}>Nyt job</Button>
        </div>
      </div>

      {leadPrefillBusy ? <p className="text-xs text-muted-foreground">Henter lead-prefill…</p> : null}
      {leadPrefill ? (
        <p className="text-xs text-muted-foreground">
          Lead-prefill aktiv: <strong>{leadPrefill.id}</strong> (via query param)
        </p>
      ) : null}

      <div className="grid gap-3 md:grid-cols-4">
        <label className="text-sm text-muted-foreground">
          Range
          <select
            value={rangePreset}
            onChange={(event) => setRangePreset(event.target.value as RangePreset)}
            className="mt-1 h-10 w-full rounded-md border border-border bg-white px-3"
          >
            <option value="today">Today</option>
            <option value="week">This week</option>
            <option value="next14">Next 14 days</option>
          </select>
        </label>

        <label className="text-sm text-muted-foreground">
          Status
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="mt-1 h-10 w-full rounded-md border border-border bg-white px-3"
          >
            <option value="alle">Alle status</option>
            {JOB_STATUS_VALUES.map((status) => (
              <option key={status} value={status}>
                {statusLabels[status]}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm text-muted-foreground">
          Medarbejder
          <select
            value={employeeFilter}
            onChange={(event) => setEmployeeFilter(event.target.value)}
            className="mt-1 h-10 w-full rounded-md border border-border bg-white px-3"
          >
            <option value="alle">Alle</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}

      <div className="overflow-hidden rounded-2xl border border-border bg-white">
        <div className="grid grid-cols-[180px_1fr_140px_180px_1fr_150px] border-b border-border/70 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <span>Tid</span>
          <span>Titel</span>
          <span>Status</span>
          <span>Medarbejder</span>
          <span>Lokation</span>
          <span>Handling</span>
        </div>
        <div className="divide-y divide-border/60">
          {jobs.length === 0 ? (
            <p className="px-4 py-6 text-sm text-muted-foreground">{loading ? "Henter jobs..." : "Ingen jobs i perioden."}</p>
          ) : (
            jobs.map((item) => (
              <div key={item.id} className="grid grid-cols-[180px_1fr_140px_180px_1fr_150px] items-center gap-2 px-4 py-3 text-sm">
                <span className="text-muted-foreground">
                  {formatDateTime(item.startAt)} → {formatDateTime(item.endAt)}
                </span>
                <div>
                  <p className="font-medium text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.service ? serviceLabels[item.service as JobService] || item.service : "Ingen service"}</p>
                </div>
                <span className="text-muted-foreground">{statusLabels[item.status as JobStatus] || item.status}</span>
                <span className="text-muted-foreground">{item.employee?.name || "Unassigned"}</span>
                <span className="text-muted-foreground">{item.location || "-"}</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(item)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => deleteJob(item)} disabled={saving}>
                    Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {editorOpen ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
          <div className="h-full w-full max-w-2xl overflow-y-auto bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">{editingId ? "Redigér job" : "Nyt job"}</h2>
                <p className="text-sm text-muted-foreground">Opret eller redigér planlagte opgaver.</p>
              </div>
              <Button variant="outline" onClick={() => setEditorOpen(false)}>
                Luk
              </Button>
            </div>

            {saveError ? <p className="mt-4 text-sm font-medium text-red-700">{saveError}</p> : null}

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="text-sm text-muted-foreground md:col-span-2">
                Titel
                <input
                  value={form.title}
                  onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                  className="mt-1 h-10 w-full rounded-md border border-border bg-white px-3"
                />
              </label>

              <label className="text-sm text-muted-foreground">
                Service
                <select
                  value={form.service}
                  onChange={(event) => setForm((current) => ({ ...current, service: event.target.value as JobService }))}
                  className="mt-1 h-10 w-full rounded-md border border-border bg-white px-3"
                >
                  {JOB_SERVICE_VALUES.map((service) => (
                    <option key={service} value={service}>
                      {serviceLabels[service]}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm text-muted-foreground">
                Status
                <select
                  value={form.status}
                  onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as JobStatus }))}
                  className="mt-1 h-10 w-full rounded-md border border-border bg-white px-3"
                >
                  {JOB_STATUS_VALUES.map((status) => (
                    <option key={status} value={status}>
                      {statusLabels[status]}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm text-muted-foreground">
                Start
                <input
                  type="datetime-local"
                  value={form.startAt}
                  onChange={(event) => setForm((current) => ({ ...current, startAt: event.target.value }))}
                  className="mt-1 h-10 w-full rounded-md border border-border bg-white px-3"
                />
              </label>

              <label className="text-sm text-muted-foreground">
                Slut
                <input
                  type="datetime-local"
                  value={form.endAt}
                  onChange={(event) => setForm((current) => ({ ...current, endAt: event.target.value }))}
                  className="mt-1 h-10 w-full rounded-md border border-border bg-white px-3"
                />
              </label>

              <label className="text-sm text-muted-foreground">
                Medarbejder
                <select
                  value={form.assignedEmployeeId}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, assignedEmployeeId: event.target.value }))
                  }
                  className="mt-1 h-10 w-full rounded-md border border-border bg-white px-3"
                >
                  <option value="">Unassigned</option>
                  {employeeOptions.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm text-muted-foreground">
                Lead ID (valgfri)
                <input
                  value={form.leadId}
                  onChange={(event) => setForm((current) => ({ ...current, leadId: event.target.value }))}
                  className="mt-1 h-10 w-full rounded-md border border-border bg-white px-3"
                />
              </label>

              <label className="text-sm text-muted-foreground">
                Lokation
                <input
                  value={form.location}
                  onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
                  className="mt-1 h-10 w-full rounded-md border border-border bg-white px-3"
                />
              </label>

              <label className="text-sm text-muted-foreground">
                Adresse
                <input
                  value={form.address}
                  onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))}
                  className="mt-1 h-10 w-full rounded-md border border-border bg-white px-3"
                />
              </label>

              <label className="text-sm text-muted-foreground md:col-span-2">
                Noter
                <textarea
                  value={form.notes}
                  onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
                  rows={5}
                  className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2"
                />
              </label>
            </div>

            <div className="mt-6 flex gap-3">
              <Button onClick={saveJob} disabled={saving}>
                {saving ? "Gemmer..." : editingId ? "Gem ændringer" : "Opret job"}
              </Button>
              <Button variant="outline" onClick={() => setEditorOpen(false)}>
                Annuller
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
};
