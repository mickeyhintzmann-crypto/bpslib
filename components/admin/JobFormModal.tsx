"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { JOB_SERVICE_VALUES, JOB_STATUS_VALUES, type JobService, type JobStatus } from "@/lib/admin/jobs";

export type JobDraft = {
  lead_id: string | null;
  title: string;
  service: string;
  location: string;
  address: string;
  notes: string;
  status: string;
  start_at: string;
  end_at: string;
};

type EmployeeItem = {
  id: string;
  name: string;
  role: string;
  isActive: boolean;
};

type EmployeesResponse = {
  items?: EmployeeItem[];
  message?: string;
};

type JobCreateResponse = {
  item?: {
    id: string;
  };
  message?: string;
};

type FormState = {
  title: string;
  service: JobService;
  status: JobStatus;
  startAt: string;
  endAt: string;
  assignedEmployeeId: string;
  location: string;
  address: string;
  notes: string;
  leadId: string;
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

const statusLabels: Record<JobStatus, string> = {
  unassigned: "Unassigned",
  scheduled: "Scheduled",
  in_progress: "In progress",
  done: "Done",
  invoiced: "Invoiced",
  cancelled: "Cancelled"
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

const normalizeService = (value: string): JobService => {
  if (JOB_SERVICE_VALUES.includes(value as JobService)) {
    return value as JobService;
  }
  return "andet";
};

const normalizeStatus = (value: string): JobStatus => {
  if (JOB_STATUS_VALUES.includes(value as JobStatus)) {
    return value as JobStatus;
  }
  return "unassigned";
};

const toInitialForm = (draft: JobDraft): FormState => ({
  title: draft.title || "",
  service: normalizeService(draft.service),
  status: normalizeStatus(draft.status),
  startAt: toInputDateTime(draft.start_at),
  endAt: toInputDateTime(draft.end_at),
  assignedEmployeeId: "",
  location: draft.location || "",
  address: draft.address || "",
  notes: draft.notes || "",
  leadId: draft.lead_id || ""
});

export const JobFormModal = ({
  isOpen,
  draft,
  title = "Opret job",
  subtitle,
  onClose,
  onCreated
}: {
  isOpen: boolean;
  draft: JobDraft | null;
  title?: string;
  subtitle?: string;
  onClose: () => void;
  onCreated?: (jobId: string) => void;
}) => {
  const [form, setForm] = useState<FormState | null>(null);
  const [employees, setEmployees] = useState<EmployeeItem[]>([]);
  const [employeesBusy, setEmployeesBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [createdJobId, setCreatedJobId] = useState<string | null>(null);

  const visible = isOpen && draft;

  useEffect(() => {
    if (!visible || !draft) {
      return;
    }
    setForm(toInitialForm(draft));
    setError("");
    setMessage("");
    setCreatedJobId(null);
  }, [visible, draft]);

  useEffect(() => {
    if (!visible) {
      return;
    }
    const loadEmployees = async () => {
      setEmployeesBusy(true);
      try {
        const response = await fetch("/api/admin/employees", { cache: "no-store" });
        const payload = (await response.json()) as EmployeesResponse;
        if (!response.ok || !payload.items) {
          setEmployees([]);
          return;
        }
        setEmployees(payload.items);
      } catch (fetchError) {
        console.error(fetchError);
        setEmployees([]);
      } finally {
        setEmployeesBusy(false);
      }
    };
    loadEmployees();
  }, [visible]);

  const canSave = useMemo(() => {
    if (!form) {
      return false;
    }
    return Boolean(form.title.trim()) && Boolean(form.startAt) && Boolean(form.endAt);
  }, [form]);

  const submit = async () => {
    if (!form) {
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const startIso = fromInputDateTime(form.startAt);
      const endIso = fromInputDateTime(form.endAt);
      if (!startIso || !endIso) {
        setError("Start/slut skal være gyldige datoer.");
        return;
      }

      const response = await fetch("/api/admin/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          service: form.service,
          status: form.status,
          start_at: startIso,
          end_at: endIso,
          assigned_employee_id: form.assignedEmployeeId || null,
          location: form.location.trim() || null,
          address: form.address.trim() || null,
          notes: form.notes.trim() || null,
          lead_id: form.leadId || null
        })
      });
      const payload = (await response.json()) as JobCreateResponse;

      if (!response.ok || !payload.item) {
        setError(payload.message || "Kunne ikke oprette job.");
        return;
      }

      setCreatedJobId(payload.item.id);
      setMessage("Job oprettet.");
      onCreated?.(payload.item.id);
    } catch (submitError) {
      console.error(submitError);
      setError("Netværksfejl ved oprettelse af job.");
    } finally {
      setSaving(false);
    }
  };

  if (!visible || !form) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-4 md:items-center">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-border bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-foreground">{title}</h2>
            {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
          </div>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Luk
          </Button>
        </div>

        {error ? <p className="mt-3 text-sm font-medium text-red-700">{error}</p> : null}
        {message ? <p className="mt-3 text-sm font-medium text-emerald-700">{message}</p> : null}

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-muted-foreground md:col-span-2">
            Titel
            <input
              value={form.title}
              onChange={(event) => setForm((current) => (current ? { ...current, title: event.target.value } : current))}
              className="mt-2 h-10 w-full rounded-md border border-border bg-white px-3"
            />
          </label>

          <label className="text-sm font-medium text-muted-foreground">
            Service
            <select
              value={form.service}
              onChange={(event) =>
                setForm((current) =>
                  current ? { ...current, service: normalizeService(event.target.value) } : current
                )
              }
              className="mt-2 h-10 w-full rounded-md border border-border bg-white px-3"
            >
              {JOB_SERVICE_VALUES.map((service) => (
                <option key={service} value={service}>
                  {serviceLabels[service]}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-medium text-muted-foreground">
            Status
            <select
              value={form.status}
              onChange={(event) =>
                setForm((current) =>
                  current ? { ...current, status: normalizeStatus(event.target.value) } : current
                )
              }
              className="mt-2 h-10 w-full rounded-md border border-border bg-white px-3"
            >
              {JOB_STATUS_VALUES.map((status) => (
                <option key={status} value={status}>
                  {statusLabels[status]}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-medium text-muted-foreground">
            Start
            <input
              type="datetime-local"
              value={form.startAt}
              onChange={(event) => setForm((current) => (current ? { ...current, startAt: event.target.value } : current))}
              className="mt-2 h-10 w-full rounded-md border border-border bg-white px-3"
            />
          </label>

          <label className="text-sm font-medium text-muted-foreground">
            Slut
            <input
              type="datetime-local"
              value={form.endAt}
              onChange={(event) => setForm((current) => (current ? { ...current, endAt: event.target.value } : current))}
              className="mt-2 h-10 w-full rounded-md border border-border bg-white px-3"
            />
          </label>

          <label className="text-sm font-medium text-muted-foreground">
            Medarbejder
            <select
              value={form.assignedEmployeeId}
              onChange={(event) =>
                setForm((current) =>
                  current ? { ...current, assignedEmployeeId: event.target.value } : current
                )
              }
              className="mt-2 h-10 w-full rounded-md border border-border bg-white px-3"
              disabled={employeesBusy}
            >
              <option value="">Unassigned</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-medium text-muted-foreground">
            Lokation
            <input
              value={form.location}
              onChange={(event) =>
                setForm((current) => (current ? { ...current, location: event.target.value } : current))
              }
              className="mt-2 h-10 w-full rounded-md border border-border bg-white px-3"
            />
          </label>

          <label className="text-sm font-medium text-muted-foreground md:col-span-2">
            Adresse
            <input
              value={form.address}
              onChange={(event) =>
                setForm((current) => (current ? { ...current, address: event.target.value } : current))
              }
              className="mt-2 h-10 w-full rounded-md border border-border bg-white px-3"
            />
          </label>

          <label className="text-sm font-medium text-muted-foreground md:col-span-2">
            Noter
            <textarea
              value={form.notes}
              onChange={(event) =>
                setForm((current) => (current ? { ...current, notes: event.target.value } : current))
              }
              rows={8}
              className="mt-2 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
            />
          </label>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <Button onClick={submit} disabled={saving || !canSave}>
            {saving ? "Opretter..." : "Opret job"}
          </Button>
          {createdJobId ? (
            <a
              href={`/admin/calendar?job=${createdJobId}`}
              className="inline-flex h-9 items-center rounded-md border border-border px-4 text-sm text-foreground"
            >
              Gå til kalender
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
};
