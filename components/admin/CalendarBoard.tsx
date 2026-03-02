"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  Views,
  dateFnsLocalizer,
  type SlotInfo,
  type View,
  type EventProps
} from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import {
  addDays,
  endOfDay,
  endOfWeek,
  format,
  getDay,
  parse,
  startOfDay,
  startOfWeek
} from "date-fns";
import { da } from "date-fns/locale";

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
};

type EmployeeResponse = {
  items?: EmployeeItem[];
  message?: string;
};

type JobsResponse = {
  items?: JobItem[];
  message?: string;
};

type ResourceItem = {
  resourceId: string;
  resourceTitle: string;
  calendarColor: string | null;
};

type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resourceId: string;
  status: string;
  service: string | null;
  location: string | null;
};

type JobFormState = {
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

type CalendarView = "day" | "week";

const locales = { da };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => startOfWeek(date, { weekStartsOn: 1 }),
  getDay,
  locales
});

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

const DnDCalendar: any = withDragAndDrop(Calendar as any);

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

const getRangeForDate = (date: Date, view: CalendarView) => {
  if (view === "day") {
    return {
      from: startOfDay(date).toISOString(),
      to: endOfDay(date).toISOString()
    };
  }

  return {
    from: startOfWeek(date, { weekStartsOn: 1 }).toISOString(),
    to: endOfWeek(date, { weekStartsOn: 1 }).toISOString()
  };
};

const formatDateTimeLabel = (value: Date) => format(value, "HH:mm");

const makeDefaultForm = (start?: Date, end?: Date, resourceId?: string): JobFormState => {
  const normalizedStart = start ? new Date(start) : new Date();
  normalizedStart.setMinutes(0, 0, 0);
  if (!start) {
    normalizedStart.setHours(normalizedStart.getHours() + 1);
  }
  const normalizedEnd =
    end && end.getTime() > normalizedStart.getTime()
      ? new Date(end)
      : new Date(normalizedStart.getTime() + 60 * 60 * 1000);

  return {
    title: "",
    service: "andet",
    status: "unassigned",
    startAt: toInputDateTime(normalizedStart.toISOString()),
    endAt: toInputDateTime(normalizedEnd.toISOString()),
    assignedEmployeeId: resourceId && resourceId !== "unassigned" ? resourceId : "",
    location: "",
    address: "",
    notes: "",
    leadId: ""
  };
};

const EventCard = ({ event }: EventProps<CalendarEvent>) => {
  return (
    <div className="space-y-0.5 text-[11px] leading-tight">
      <p className="font-semibold">{event.title}</p>
      <p className="opacity-90">
        {formatDateTimeLabel(event.start)}-{formatDateTimeLabel(event.end)}
      </p>
    </div>
  );
};

export const CalendarBoard = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<CalendarView>("week");
  const [statusFilter, setStatusFilter] = useState("alle");

  const [employees, setEmployees] = useState<EmployeeItem[]>([]);
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saveError, setSaveError] = useState("");

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [form, setForm] = useState<JobFormState>(() => makeDefaultForm());

  const { from: visibleFrom, to: visibleTo } = useMemo(
    () => getRangeForDate(currentDate, currentView),
    [currentDate, currentView]
  );

  const loadEmployees = async () => {
    try {
      const response = await fetch("/api/admin/employees?all=1", { cache: "no-store" });
      const payload = (await response.json()) as EmployeeResponse;
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
      const params = new URLSearchParams({
        from: visibleFrom,
        to: visibleTo
      });
      if (statusFilter !== "alle") {
        params.set("status", statusFilter);
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
  }, []);

  useEffect(() => {
    loadJobs();
  }, [visibleFrom, visibleTo, statusFilter]);

  const resources = useMemo<ResourceItem[]>(() => {
    const activeOrAssigned = employees.filter((employee) => {
      if (employee.isActive) {
        return true;
      }
      return jobs.some((job) => job.assignedEmployeeId === employee.id);
    });

    return [
      {
        resourceId: "unassigned",
        resourceTitle: "Unassigned",
        calendarColor: "#6b7280"
      },
      ...activeOrAssigned.map((employee) => ({
        resourceId: employee.id,
        resourceTitle: employee.name,
        calendarColor: employee.calendarColor
      }))
    ];
  }, [employees, jobs]);

  const events = useMemo<CalendarEvent[]>(() => {
    return jobs
      .map((item) => {
        const start = new Date(item.startAt);
        const end = new Date(item.endAt);
        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
          return null;
        }
        return {
          id: item.id,
          title: item.title,
          start,
          end,
          resourceId: item.assignedEmployeeId || "unassigned",
          status: item.status,
          service: item.service,
          location: item.location
        };
      })
      .filter((item): item is CalendarEvent => Boolean(item));
  }, [jobs]);

  const resourceColorMap = useMemo(() => {
    const map = new Map<string, string>();
    resources.forEach((resource) => {
      map.set(resource.resourceId, resource.calendarColor || "#f97316");
    });
    return map;
  }, [resources]);

  const employeeOptions = useMemo(
    () => resources.filter((resource) => resource.resourceId !== "unassigned"),
    [resources]
  );

  const navigateRange = (direction: "prev" | "next" | "today") => {
    if (direction === "today") {
      setCurrentDate(new Date());
      return;
    }

    const dayStep = currentView === "day" ? 1 : 7;
    const delta = direction === "prev" ? -dayStep : dayStep;
    setCurrentDate((current) => addDays(current, delta));
  };

  const openCreateModal = (start?: Date, end?: Date, resourceId?: string) => {
    setEditingJobId(null);
    setSaveError("");
    setForm(makeDefaultForm(start, end, resourceId));
    setEditorOpen(true);
  };

  const openEditModal = (event: CalendarEvent) => {
    const job = jobs.find((item) => item.id === event.id);
    if (!job) {
      return;
    }

    setEditingJobId(job.id);
    setSaveError("");
    setForm({
      title: job.title,
      service: (job.service as JobService) || "andet",
      status: (job.status as JobStatus) || "unassigned",
      startAt: toInputDateTime(job.startAt),
      endAt: toInputDateTime(job.endAt),
      assignedEmployeeId: job.assignedEmployeeId || "",
      location: job.location || "",
      address: job.address || "",
      notes: job.notes || "",
      leadId: job.leadId || ""
    });
    setEditorOpen(true);
  };

  const saveJob = async () => {
    setBusy(true);
    setSaveError("");

    try {
      const startAtIso = fromInputDateTime(form.startAt);
      const endAtIso = fromInputDateTime(form.endAt);
      if (!startAtIso || !endAtIso) {
        setSaveError("Start/slut tidspunkt er ugyldigt.");
        return;
      }

      const endpoint = editingJobId ? `/api/admin/jobs/${editingJobId}` : "/api/admin/jobs";
      const method = editingJobId ? "PATCH" : "POST";
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
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
      setEditingJobId(null);
      await loadJobs();
    } catch (persistError) {
      console.error(persistError);
      setSaveError("Netværksfejl ved gemning.");
    } finally {
      setBusy(false);
    }
  };

  const patchJob = async (jobId: string, updates: Record<string, string | null>) => {
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/jobs/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        setError(payload.message || "Kunne ikke opdatere job.");
        return;
      }
      await loadJobs();
    } catch (updateError) {
      console.error(updateError);
      setError("Netværksfejl ved opdatering af job.");
    } finally {
      setBusy(false);
    }
  };

  const onSelectSlot = (slotInfo: SlotInfo) => {
    const start = slotInfo.start instanceof Date ? slotInfo.start : new Date(slotInfo.start);
    const end = slotInfo.end instanceof Date ? slotInfo.end : new Date(slotInfo.end);
    const resourceId = typeof slotInfo.resourceId === "string" ? slotInfo.resourceId : undefined;
    openCreateModal(start, end, resourceId);
  };

  const onEventDrop = async (args: {
    event: CalendarEvent;
    start: Date;
    end: Date;
    resourceId?: string | number;
  }) => {
    const { event, start, end, resourceId } = args;
    const assignedEmployeeId =
      typeof resourceId === "string"
        ? resourceId === "unassigned"
          ? null
          : resourceId
        : event.resourceId === "unassigned"
          ? null
          : event.resourceId;

    await patchJob(event.id, {
      start_at: start.toISOString(),
      end_at: end.toISOString(),
      assigned_employee_id: assignedEmployeeId
    });
  };

  const onEventResize = async (args: { event: CalendarEvent; start: Date; end: Date }) => {
    const { event, start, end } = args;
    await patchJob(event.id, {
      start_at: start.toISOString(),
      end_at: end.toISOString()
    });
  };

  const eventPropGetter = (event: CalendarEvent) => {
    const background = resourceColorMap.get(event.resourceId) || "#f97316";
    return {
      style: {
        backgroundColor: `${background}dd`,
        border: "none",
        borderRadius: "10px",
        color: "#ffffff",
        boxShadow: "0 4px 10px rgba(0,0,0,0.16)",
        padding: "2px 4px"
      }
    };
  };

  const calendarLabel =
    currentView === "day"
      ? format(currentDate, "EEEE d. MMMM yyyy", { locale: da })
      : `${format(startOfWeek(currentDate, { weekStartsOn: 1 }), "d. MMM", { locale: da })} - ${format(
          endOfWeek(currentDate, { weekStartsOn: 1 }),
          "d. MMM yyyy",
          { locale: da }
        )}`;

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">Calendar Board</h1>
          <p className="text-sm text-muted-foreground">
            Planlæg jobs pr. medarbejder, flyt tider med drag/drop, og håndtér unassigned opgaver.
          </p>
        </div>
        <Button onClick={() => openCreateModal()}>Nyt job</Button>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-white px-4 py-3">
        <Button variant="outline" onClick={() => navigateRange("today")}>
          Today
        </Button>
        <Button variant="outline" onClick={() => navigateRange("prev")}>
          Prev
        </Button>
        <Button variant="outline" onClick={() => navigateRange("next")}>
          Next
        </Button>
        <span className="mx-2 text-sm font-medium text-foreground">{calendarLabel}</span>
        <div className="ml-auto flex items-center gap-2">
          <div className="inline-flex rounded-md border border-border bg-muted/30 p-1">
            <button
              type="button"
              className={`rounded px-3 py-1 text-sm ${currentView === "day" ? "bg-primary text-white" : "text-foreground"}`}
              onClick={() => setCurrentView("day")}
            >
              Day
            </button>
            <button
              type="button"
              className={`rounded px-3 py-1 text-sm ${currentView === "week" ? "bg-primary text-white" : "text-foreground"}`}
              onClick={() => setCurrentView("week")}
            >
              Week
            </button>
          </div>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-10 rounded-md border border-border bg-white px-3 text-sm"
          >
            <option value="alle">Alle status</option>
            {JOB_STATUS_VALUES.map((status) => (
              <option key={status} value={status}>
                {statusLabels[status]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}

      <div className="admin-calendar h-[760px] overflow-hidden rounded-2xl border border-border bg-white p-3">
        <DnDCalendar
          localizer={localizer}
          events={events}
          resources={resources}
          resourceAccessor="resourceId"
          resourceIdAccessor="resourceId"
          resourceTitleAccessor="resourceTitle"
          defaultView={Views.WEEK}
          view={currentView as View}
          date={currentDate}
          onNavigate={(nextDate: Date) => setCurrentDate(nextDate)}
          onView={(nextView: View) => setCurrentView((nextView as CalendarView) || "week")}
          step={30}
          timeslots={2}
          selectable
          resizable
          popup
          toolbar={false}
          onSelectSlot={onSelectSlot}
          onSelectEvent={(event: CalendarEvent) => openEditModal(event)}
          onEventDrop={onEventDrop}
          onEventResize={onEventResize}
          eventPropGetter={eventPropGetter}
          components={{ event: EventCard }}
          style={{ height: "100%" }}
        />
      </div>

      {loading || busy ? <p className="text-xs text-muted-foreground">Opdaterer kalender...</p> : null}

      {editorOpen ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
          <div className="h-full w-full max-w-2xl overflow-y-auto bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">{editingJobId ? "Redigér job" : "Nyt job"}</h2>
                <p className="text-sm text-muted-foreground">Administrér tid, medarbejder og status for opgaven.</p>
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
                    <option key={employee.resourceId} value={employee.resourceId}>
                      {employee.resourceTitle}
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
              <Button onClick={saveJob} disabled={busy}>
                {busy ? "Gemmer..." : editingJobId ? "Gem ændringer" : "Opret job"}
              </Button>
              <Button variant="outline" onClick={() => setEditorOpen(false)}>
                Annuller
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <style jsx global>{`
        .admin-calendar .rbc-time-view,
        .admin-calendar .rbc-month-view {
          border-radius: 14px;
          border: 1px solid #e5ddd5;
          overflow: hidden;
        }
        .admin-calendar .rbc-header {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: #6b5b4f;
          padding: 8px 6px;
          background: #f8f3ee;
        }
        .admin-calendar .rbc-time-header-content {
          border-left: 1px solid #ece3db;
        }
        .admin-calendar .rbc-day-slot .rbc-time-slot {
          border-top: 1px solid #f0e8e0;
        }
        .admin-calendar .rbc-timeslot-group {
          min-height: 72px;
        }
        .admin-calendar .rbc-today {
          background: #fdf7f1;
        }
        .admin-calendar .rbc-event {
          padding: 2px 5px;
        }
      `}</style>
    </section>
  );
};
