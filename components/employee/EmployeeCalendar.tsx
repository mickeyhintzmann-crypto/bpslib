"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

type JobLead = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  message: string | null;
};

type JobItem = {
  id: string;
  title: string;
  service: string | null;
  status: string;
  startAt: string;
  endAt: string;
  city?: string | null;
  location: string | null;
  address: string | null;
  notes: string | null;
  taskDescription?: string | null;
  lead: JobLead | null;
  priceMin: number | null;
  priceMax: number | null;
  priceLabel: string;
  mapsUrl: string | null;
  invoiceStatus: string | null;
  invoicedAt: string | null;
};

type AvailabilityType = "sick" | "vacation" | "personal";

type AvailabilityItem = {
  id: string;
  type: AvailabilityType;
  note: string | null;
  startAt: string;
  endAt: string;
  createdAt: string;
};

type JobsResponse = {
  items?: JobItem[];
  message?: string;
  employee?: {
    id: string;
    name: string;
    email: string | null;
    dineroConnected: boolean;
    dineroOrganizationId: string | null;
    dineroLastError: string | null;
  };
};

type AvailabilityResponse = {
  items?: AvailabilityItem[];
  message?: string;
};

type ViewMode = "day" | "week";

type CalendarEvent =
  | {
      kind: "job";
      id: string;
      startAt: string;
      endAt: string;
      startMs: number;
      title: string;
      subtitle: string;
      selected: boolean;
    }
  | {
      kind: "absence";
      id: string;
      startAt: string;
      endAt: string;
      startMs: number;
      type: AvailabilityType;
      note: string | null;
    };

const addDays = (date: Date, delta: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + delta);
  return next;
};

const startOfDay = (date: Date) => {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
};

const endOfDay = (date: Date) => {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
};

const startOfWeekMonday = (date: Date) => {
  const dayStart = startOfDay(date);
  const day = dayStart.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  return addDays(dayStart, diff);
};

const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const isWeekendDateKey = (dateKey: string) => {
  const [yearRaw, monthRaw, dayRaw] = dateKey.split("-");
  const year = Number.parseInt(yearRaw || "", 10);
  const month = Number.parseInt(monthRaw || "", 10);
  const day = Number.parseInt(dayRaw || "", 10);
  if ([year, month, day].some((value) => Number.isNaN(value))) {
    return false;
  }
  const date = new Date(year, month - 1, day, 12, 0, 0, 0);
  const weekday = date.getDay();
  return weekday === 0 || weekday === 6;
};

const toIso = (date: Date) => date.toISOString();

const parseIso = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString("da-DK", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });

const formatDayHeader = (date: Date) =>
  date.toLocaleDateString("da-DK", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit"
  });

const formatTimeRange = (startAt: string, endAt: string) => {
  const start = new Date(startAt);
  const end = new Date(endAt);
  const startLabel = start.toLocaleTimeString("da-DK", { hour: "2-digit", minute: "2-digit" });
  const endLabel = end.toLocaleTimeString("da-DK", { hour: "2-digit", minute: "2-digit" });

  const isFullDay =
    start.getHours() === 0 &&
    start.getMinutes() === 0 &&
    end.getHours() === 23 &&
    end.getMinutes() >= 55;

  return isFullDay ? "Heldag" : `${startLabel}-${endLabel}`;
};

const overlap = (startMs: number, endMs: number, dayStartMs: number, dayEndMs: number) =>
  startMs < dayEndMs && endMs > dayStartMs;

const typeLabel: Record<AvailabilityType, string> = {
  sick: "Syg",
  vacation: "Ferie",
  personal: "Fri"
};

const statusLabel: Record<string, string> = {
  new: "Ny",
  confirmed: "Bekræftet",
  in_progress: "I gang",
  done: "Færdig",
  invoiced: "Faktureret",
  cancelled: "Annulleret",
  pending: "Afventer",
  pending_confirmation: "Afventer"
};

const serviceLabel: Record<string, string> = {
  bordplade: "Bordpladeslibning",
  gulv: "Gulvbehandling",
  toemrer: "Tømrer",
  maler: "Maler",
  murer: "Murer",
  andet: "Andet"
};

const statusBadgeCls = (status: string) => {
  switch (status) {
    case "new":
    case "pending":
    case "pending_confirmation":
      return "bg-blue-100 text-blue-700";
    case "confirmed":
      return "bg-emerald-100 text-emerald-700";
    case "in_progress":
      return "bg-amber-100 text-amber-700";
    case "done":
      return "bg-gray-200 text-gray-700";
    case "invoiced":
      return "bg-purple-100 text-purple-700";
    case "cancelled":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

const formatDateOnly = (value: string) =>
  new Date(value).toLocaleDateString("da-DK", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric"
  });

const SLOT_RANGES = [
  { label: "08:00", start: "08:00", end: "11:00" },
  { label: "11:00", start: "11:00", end: "13:30" },
  { label: "13:30", start: "13:30", end: "16:00" }
] as const;

const combineDateAndTimeToIso = (dateKey: string, hhmm: string) => {
  const [yearRaw, monthRaw, dayRaw] = dateKey.split("-");
  const [hourRaw, minuteRaw] = hhmm.split(":");
  const year = Number.parseInt(yearRaw || "", 10);
  const month = Number.parseInt(monthRaw || "", 10);
  const day = Number.parseInt(dayRaw || "", 10);
  const hour = Number.parseInt(hourRaw || "", 10);
  const minute = Number.parseInt(minuteRaw || "", 10);

  if ([year, month, day, hour, minute].some((value) => Number.isNaN(value))) {
    return null;
  }

  return new Date(year, month - 1, day, hour, minute, 0, 0).toISOString();
};

const inferDefaultPriceExVat = (job: JobItem | null) => {
  if (!job) {
    return 0;
  }
  if (typeof job.priceMax === "number" && job.priceMax > 0) {
    return Math.round(job.priceMax);
  }
  if (typeof job.priceMin === "number" && job.priceMin > 0) {
    return Math.round(job.priceMin);
  }
  const digits = (job.priceLabel || "").replace(/[^\d]/g, "");
  if (!digits) {
    return 0;
  }
  const parsed = Number.parseInt(digits, 10);
  return Number.isFinite(parsed) ? parsed : 0;
};

const compactText = (value: string | null | undefined) => (value || "").replace(/\s+/g, " ").trim();

const truncate = (value: string, max: number) => (value.length > max ? `${value.slice(0, max - 1)}…` : value);

const buildDefaultInvoiceDescription = (job: JobItem) => {
  const city = compactText(job.city || job.location || job.lead?.location);
  const details = compactText(job.taskDescription) || compactText(job.notes) || compactText(job.lead?.message);
  const parts = [job.title];
  if (city) {
    parts.push(`By: ${city}`);
  }
  if (job.service) {
    parts.push(`Service: ${job.service}`);
  }
  if (details) {
    parts.push(`Opgave: ${truncate(details, 280)}`);
  }
  return parts.join(" · ");
};

const joinAddressParts = (...parts: Array<string | null | undefined>) => {
  const seen = new Set<string>();
  const values: string[] = [];
  parts.forEach((part) => {
    const normalized = compactText(part);
    if (!normalized) {
      return;
    }
    const key = normalized.toLowerCase();
    if (seen.has(key)) {
      return;
    }
    seen.add(key);
    values.push(normalized);
  });
  return values.join(", ");
};

export const EmployeeCalendar = () => {
  const router = useRouter();

  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [availability, setAvailability] = useState<AvailabilityItem[]>([]);
  const [employeeName, setEmployeeName] = useState("Medarbejder");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [anchorDate, setAnchorDate] = useState(() => new Date());

  const [absenceType, setAbsenceType] = useState<AvailabilityType>("personal");
  const [absenceDateKey, setAbsenceDateKey] = useState(() => toDateKey(new Date()));
  const [absenceAllDay, setAbsenceAllDay] = useState(true);
  const [absenceStart, setAbsenceStart] = useState("09:00");
  const [absenceEnd, setAbsenceEnd] = useState("12:00");
  const [absenceNote, setAbsenceNote] = useState("");
  const [absenceBusy, setAbsenceBusy] = useState(false);
  const [absenceError, setAbsenceError] = useState("");
  const [absenceMessage, setAbsenceMessage] = useState("");
  const [dineroConnected, setDineroConnected] = useState(false);
  const [dineroOrganizationId, setDineroOrganizationId] = useState("");
  const [dineroApiKey, setDineroApiKey] = useState("");
  const [dineroBusy, setDineroBusy] = useState(false);
  const [dineroError, setDineroError] = useState("");
  const [dineroMessage, setDineroMessage] = useState("");
  const [completeBusy, setCompleteBusy] = useState(false);
  const [completeError, setCompleteError] = useState("");
  const [completeMessage, setCompleteMessage] = useState("");
  const [showCompleteForm, setShowCompleteForm] = useState(false);
  const [invoiceCustomerName, setInvoiceCustomerName] = useState("");
  const [invoiceCustomerEmail, setInvoiceCustomerEmail] = useState("");
  const [invoiceCustomerPhone, setInvoiceCustomerPhone] = useState("");
  const [invoiceCustomerAddress, setInvoiceCustomerAddress] = useState("");
  const [invoiceDescription, setInvoiceDescription] = useState("");
  const [invoiceAmountExVat, setInvoiceAmountExVat] = useState("");
  const [invoiceVatPercent, setInvoiceVatPercent] = useState("25");
  const [invoicePaymentMethod, setInvoicePaymentMethod] = useState<"mobilepay" | "paid" | "net0">("net0");

  // Reschedule state (only for bookings)
  const [showReschedule, setShowReschedule] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleSlot, setRescheduleSlot] = useState<"08:00" | "11:00" | "13:30">("08:00");
  const [rescheduleCount, setRescheduleCount] = useState<"1" | "2" | "3">("1");
  const [rescheduleBusy, setRescheduleBusy] = useState(false);
  const [rescheduleError, setRescheduleError] = useState("");
  const [rescheduleMessage, setRescheduleMessage] = useState("");

  const period = useMemo(() => {
    const base = startOfDay(anchorDate);
    const start = viewMode === "day" ? base : startOfWeekMonday(base);
    const daysCount = viewMode === "day" ? 1 : 7;
    const days: Date[] = [];
    for (let index = 0; index < daysCount; index += 1) {
      days.push(addDays(start, index));
    }
    const fromDate = startOfDay(days[0]);
    const toDate = endOfDay(days[days.length - 1]);

    const label =
      viewMode === "day"
        ? days[0].toLocaleDateString("da-DK", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })
        : `${days[0].toLocaleDateString("da-DK", {
            day: "2-digit",
            month: "2-digit"
          })} - ${days[days.length - 1].toLocaleDateString("da-DK", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
          })}`;

    return {
      days,
      fromIso: toIso(fromDate),
      toIso: toIso(toDate),
      label
    };
  }, [anchorDate, viewMode]);

  const selectedJob = useMemo(() => jobs.find((job) => job.id === selectedJobId) || null, [jobs, selectedJobId]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();

    period.days.forEach((day) => {
      map.set(toDateKey(day), []);
    });

    jobs.forEach((job) => {
      const startDate = parseIso(job.startAt);
      const endDate = parseIso(job.endAt);
      if (!startDate || !endDate) {
        return;
      }
      const startMs = startDate.getTime();
      const endMs = endDate.getTime();

      period.days.forEach((day) => {
        const key = toDateKey(day);
        const dayStart = startOfDay(day).getTime();
        const dayEnd = endOfDay(day).getTime();
        if (!overlap(startMs, endMs, dayStart, dayEnd)) {
          return;
        }
        const bucket = map.get(key) || [];
        bucket.push({
          kind: "job",
          id: job.id,
          startAt: job.startAt,
          endAt: job.endAt,
          startMs,
          title: job.title,
          subtitle: `${job.address || job.city || job.location || "Adresse mangler"}`,
          selected: job.id === selectedJobId
        });
        map.set(key, bucket);
      });
    });

    availability.forEach((item) => {
      const startDate = parseIso(item.startAt);
      const endDate = parseIso(item.endAt);
      if (!startDate || !endDate) {
        return;
      }
      const startMs = startDate.getTime();
      const endMs = endDate.getTime();

      period.days.forEach((day) => {
        const key = toDateKey(day);
        const dayStart = startOfDay(day).getTime();
        const dayEnd = endOfDay(day).getTime();
        if (!overlap(startMs, endMs, dayStart, dayEnd)) {
          return;
        }
        const bucket = map.get(key) || [];
        bucket.push({
          kind: "absence",
          id: item.id,
          startAt: item.startAt,
          endAt: item.endAt,
          startMs,
          type: item.type,
          note: item.note
        });
        map.set(key, bucket);
      });
    });

    map.forEach((value, key) => {
      value.sort((a, b) => a.startMs - b.startMs);
      map.set(key, value);
    });

    return map;
  }, [availability, jobs, period.days, selectedJobId]);

  const load = useCallback(async () => {
    setBusy(true);
    setError("");

    try {
      const params = new URLSearchParams({
        from: period.fromIso,
        to: period.toIso
      });

      const [jobsResponse, availabilityResponse] = await Promise.all([
        fetch(`/api/employee/jobs?${params.toString()}`, { cache: "no-store" }),
        fetch(`/api/employee/availability?${params.toString()}`, { cache: "no-store" })
      ]);

      const jobsPayload = (await jobsResponse.json()) as JobsResponse;
      const availabilityPayload = (await availabilityResponse.json()) as AvailabilityResponse;

      if (jobsResponse.status === 401 || availabilityResponse.status === 401) {
        router.push("/login");
        router.refresh();
        return;
      }

      if (!jobsResponse.ok || !jobsPayload.items) {
        setJobs([]);
        setError(jobsPayload.message || "Kunne ikke hente opgaver.");
        return;
      }
      const jobsItems = jobsPayload.items;

      if (!availabilityResponse.ok || !availabilityPayload.items) {
        setAvailability([]);
        setError(availabilityPayload.message || "Kunne ikke hente fravær.");
      } else {
        setAvailability(availabilityPayload.items);
      }

      setJobs(jobsItems);
      setEmployeeName(jobsPayload.employee?.name || "Medarbejder");
      setDineroConnected(Boolean(jobsPayload.employee?.dineroConnected));
      setDineroOrganizationId(jobsPayload.employee?.dineroOrganizationId || "");
      setDineroError(jobsPayload.employee?.dineroLastError || "");
      setSelectedJobId((current) => {
        if (current && jobsItems.some((item) => item.id === current)) {
          return current;
        }
        return jobsItems[0]?.id || null;
      });
    } catch (fetchError) {
      console.error(fetchError);
      setError("Netværksfejl ved hentning af kalender.");
    } finally {
      setBusy(false);
    }
  }, [period.fromIso, period.toIso, router]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setAbsenceDateKey(toDateKey(anchorDate));
  }, [anchorDate]);

  useEffect(() => {
    setShowCompleteForm(false);
    setCompleteError("");
    setCompleteMessage("");
    setShowReschedule(false);
    setRescheduleError("");
    setRescheduleMessage("");
  }, [selectedJobId]);

  const logout = async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
    } finally {
      router.push("/login");
      router.refresh();
    }
  };

  const createAbsence = async (options: {
    type: AvailabilityType;
    dateKey: string;
    allDay: boolean;
    startTime: string;
    endTime: string;
    note: string;
  }) => {
    const { type, dateKey, allDay, startTime, endTime, note } = options;

    const startAt = allDay
      ? combineDateAndTimeToIso(dateKey, "00:00")
      : combineDateAndTimeToIso(dateKey, startTime);
    const endAt = allDay
      ? combineDateAndTimeToIso(dateKey, "23:59")
      : combineDateAndTimeToIso(dateKey, endTime);

    if (!startAt || !endAt) {
      setAbsenceError("Ugyldig dato eller tid.");
      return false;
    }

    setAbsenceBusy(true);
    setAbsenceError("");
    setAbsenceMessage("");

    try {
      const response = await fetch("/api/employee/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          startAt,
          endAt,
          note: note.trim() || null
        })
      });

      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        setAbsenceError(payload.message || "Kunne ikke gemme fravær.");
        return false;
      }

      setAbsenceMessage("Fravær gemt.");
      setAbsenceNote("");
      await load();
      return true;
    } catch (saveError) {
      console.error(saveError);
      setAbsenceError("Netværksfejl ved gemning af fravær.");
      return false;
    } finally {
      setAbsenceBusy(false);
    }
  };

  const submitAbsenceForm = async () => {
    await createAbsence({
      type: absenceType,
      dateKey: absenceDateKey,
      allDay: absenceAllDay,
      startTime: absenceStart,
      endTime: absenceEnd,
      note: absenceNote
    });
  };

  const createQuickAllDay = async (dateKey: string, type: AvailabilityType) => {
    await createAbsence({
      type,
      dateKey,
      allDay: true,
      startTime: "00:00",
      endTime: "23:59",
      note: ""
    });
  };

  const deleteAbsence = async (id: string) => {
    setAbsenceBusy(true);
    setAbsenceError("");
    setAbsenceMessage("");

    try {
      const response = await fetch(`/api/employee/availability?id=${encodeURIComponent(id)}`, {
        method: "DELETE"
      });
      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        setAbsenceError(payload.message || "Kunne ikke slette fravær.");
        return;
      }
      setAbsenceMessage("Fravær slettet.");
      await load();
    } catch (removeError) {
      console.error(removeError);
      setAbsenceError("Netværksfejl ved sletning.");
    } finally {
      setAbsenceBusy(false);
    }
  };

  const connectDinero = async () => {
    if (!dineroOrganizationId.trim() || !dineroApiKey.trim()) {
      setDineroError("Udfyld både organization-id og API-nøgle.");
      return;
    }

    setDineroBusy(true);
    setDineroError("");
    setDineroMessage("");

    try {
      const response = await fetch("/api/employee/dinero", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: dineroOrganizationId.trim(),
          apiKey: dineroApiKey.trim()
        })
      });
      const payload = (await response.json()) as { message?: string; connected?: boolean };
      if (!response.ok) {
        setDineroError(payload.message || "Kunne ikke forbinde Dinero.");
        return;
      }

      setDineroConnected(Boolean(payload.connected));
      setDineroApiKey("");
      setDineroMessage("Dinero er nu forbundet.");
      await load();
    } catch (connectError) {
      console.error(connectError);
      setDineroError("Netværksfejl ved Dinero-opsætning.");
    } finally {
      setDineroBusy(false);
    }
  };

  const disconnectDinero = async () => {
    setDineroBusy(true);
    setDineroError("");
    setDineroMessage("");
    try {
      const response = await fetch("/api/employee/dinero", { method: "DELETE" });
      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        setDineroError(payload.message || "Kunne ikke frakoble Dinero.");
        return;
      }
      setDineroConnected(false);
      setDineroMessage("Dinero er frakoblet.");
      await load();
    } catch (disconnectError) {
      console.error(disconnectError);
      setDineroError("Netværksfejl ved frakobling.");
    } finally {
      setDineroBusy(false);
    }
  };

  const openCompleteForm = () => {
    if (!selectedJob) {
      return;
    }
    const defaultAmount = inferDefaultPriceExVat(selectedJob);
    setInvoiceCustomerName(selectedJob.lead?.name || "");
    setInvoiceCustomerEmail(selectedJob.lead?.email || "");
    setInvoiceCustomerPhone(selectedJob.lead?.phone || "");
    setInvoiceCustomerAddress(
      joinAddressParts(selectedJob.address, selectedJob.city, selectedJob.location || selectedJob.lead?.location)
    );
    setInvoiceDescription(buildDefaultInvoiceDescription(selectedJob));
    setInvoiceAmountExVat(defaultAmount > 0 ? String(defaultAmount) : "");
    setInvoiceVatPercent("25");
    setCompleteError("");
    setCompleteMessage("");
    setShowCompleteForm(true);
  };

  const submitCompleteJob = async () => {
    if (!selectedJob) {
      return;
    }

    setCompleteBusy(true);
    setCompleteError("");
    setCompleteMessage("");
    try {
      const response = await fetch(`/api/employee/jobs/${encodeURIComponent(selectedJob.id)}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: invoiceCustomerName,
          customerEmail: invoiceCustomerEmail,
          customerPhone: invoiceCustomerPhone,
          customerAddress: invoiceCustomerAddress,
          description: invoiceDescription,
          amountExVat: invoiceAmountExVat,
          vatPercent: invoiceVatPercent,
          paymentMethod: invoicePaymentMethod
        })
      });

      const payload = (await response.json()) as { message?: string; alreadySent?: boolean };
      if (!response.ok) {
        setCompleteError(payload.message || "Kunne ikke afslutte opgaven.");
        return;
      }

      setCompleteMessage(payload.alreadySent ? "Faktura var allerede sendt." : "Opgave afsluttet og faktura sendt.");
      setShowCompleteForm(false);
      await load();
    } catch (completeRequestError) {
      console.error(completeRequestError);
      setCompleteError("Netværksfejl ved afslutning af opgave.");
    } finally {
      setCompleteBusy(false);
    }
  };

  const submitReschedule = async () => {
    if (!selectedJob || !selectedJob.id.startsWith("booking:")) {
      return;
    }
    setRescheduleBusy(true);
    setRescheduleError("");
    setRescheduleMessage("");
    try {
      const response = await fetch(`/api/employee/jobs/${encodeURIComponent(selectedJob.id)}/reschedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: rescheduleDate,
          startSlot: rescheduleSlot,
          slotCount: Number.parseInt(rescheduleCount, 10)
        })
      });
      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        setRescheduleError(payload.message || "Kunne ikke flytte opgaven.");
        return;
      }
      setRescheduleMessage("Opgaven er flyttet.");
      setShowReschedule(false);
      await load();
    } catch {
      setRescheduleError("Netværksfejl ved flytning af opgave.");
    } finally {
      setRescheduleBusy(false);
    }
  };

  const getSlotOccupancy = useCallback(
    (dateKey: string, slotIndex: number) => {
      if (isWeekendDateKey(dateKey)) {
        return { kind: "closed" } as const;
      }

      const slot = SLOT_RANGES[slotIndex];
      if (!slot) {
        return { kind: "free" } as const;
      }

      const slotStartIso = combineDateAndTimeToIso(dateKey, slot.start);
      const slotEndIso = combineDateAndTimeToIso(dateKey, slot.end);
      if (!slotStartIso || !slotEndIso) {
        return { kind: "free" } as const;
      }

      const slotStartMs = new Date(slotStartIso).getTime();
      const slotEndMs = new Date(slotEndIso).getTime();

      const slotJob = jobs.find((job) => {
        const startDate = parseIso(job.startAt);
        const endDate = parseIso(job.endAt);
        if (!startDate || !endDate) {
          return false;
        }
        return overlap(startDate.getTime(), endDate.getTime(), slotStartMs, slotEndMs);
      });
      if (slotJob) {
        return { kind: "job", job: slotJob } as const;
      }

      const slotAbsence = availability.find((item) => {
        const startDate = parseIso(item.startAt);
        const endDate = parseIso(item.endAt);
        if (!startDate || !endDate) {
          return false;
        }
        return overlap(startDate.getTime(), endDate.getTime(), slotStartMs, slotEndMs);
      });
      if (slotAbsence) {
        return { kind: "absence", item: slotAbsence } as const;
      }

      return { kind: "free" } as const;
    },
    [availability, jobs]
  );

  const selectSlotForAbsence = (dateKey: string, slotIndex: number) => {
    const slot = SLOT_RANGES[slotIndex];
    if (!slot) {
      return;
    }
    setAbsenceDateKey(dateKey);
    setAbsenceAllDay(false);
    setAbsenceStart(slot.start);
    setAbsenceEnd(slot.end);
    setAbsenceType("personal");
    setAbsenceError("");
    setAbsenceMessage(`Slot ${slot.label} valgt. Vælg type og tryk "Gem fravær".`);
  };

  return (
    <main className="mx-auto w-full max-w-[1280px] px-4 py-8 md:px-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-white p-4">
        <div>
          <p className="text-xs uppercase text-muted-foreground">Medarbejder</p>
          <h1 className="font-display text-2xl font-semibold text-foreground">Kalender · {employeeName}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={load} disabled={busy || absenceBusy}>
            {busy ? "Opdaterer..." : "Opdater"}
          </Button>
          <Button variant="outline" onClick={logout}>
            Log ud
          </Button>
        </div>
      </div>

      <section className="mb-4 rounded-2xl border border-border bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={viewMode === "day" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("day")}
            >
              Dag
            </Button>
            <Button
              variant={viewMode === "week" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("week")}
            >
              Uge
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAnchorDate((prev) => addDays(prev, viewMode === "day" ? -1 : -7))}
            >
              Forrige
            </Button>
            <Button variant="outline" size="sm" onClick={() => setAnchorDate(new Date())}>
              I dag
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAnchorDate((prev) => addDays(prev, viewMode === "day" ? 1 : 7))}
            >
              Næste
            </Button>
          </div>
        </div>
        <p className="mt-3 text-sm font-semibold text-foreground">{period.label}</p>
      </section>

      <section className="mb-4 rounded-2xl border border-border bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Dinero fakturering</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Status: {dineroConnected ? `Forbundet (${dineroOrganizationId || "ukendt org"})` : "Ikke forbundet"}
            </p>
          </div>
          {dineroConnected ? (
            <Button variant="outline" onClick={disconnectDinero} disabled={dineroBusy}>
              {dineroBusy ? "Frakobler..." : "Frakobl Dinero"}
            </Button>
          ) : null}
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <label className="grid gap-1 text-sm">
            <span className="text-xs text-muted-foreground">Organization-id</span>
            <input
              value={dineroOrganizationId}
              onChange={(event) => setDineroOrganizationId(event.target.value)}
              className="h-10 rounded-md border border-border bg-white px-3 text-sm"
              placeholder="Dinero organization id"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-xs text-muted-foreground">Dinero API-nøgle</span>
            <input
              type="password"
              value={dineroApiKey}
              onChange={(event) => setDineroApiKey(event.target.value)}
              className="h-10 rounded-md border border-border bg-white px-3 text-sm"
              placeholder={dineroConnected ? "Indtast ny nøgle for at opdatere" : "Indsæt API-nøgle"}
            />
          </label>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <Button onClick={connectDinero} disabled={dineroBusy}>
            {dineroBusy ? "Gemmer..." : dineroConnected ? "Opdater Dinero-forbindelse" : "Forbind Dinero"}
          </Button>
        </div>

        <div className="mt-4 rounded-xl border border-border/70 bg-muted/30 p-3">
          <h3 className="text-sm font-semibold text-foreground">Guide: Forbind Dinero</h3>
          <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm text-foreground">
            <li>Find dit <strong>Organization-id</strong> og en gyldig <strong>Dinero API-nøgle</strong> i Dinero.</li>
            <li>Indsæt begge felter ovenfor og klik <strong>Forbind Dinero</strong>.</li>
            <li>Når status viser <strong>Forbundet</strong>, er opsætningen færdig.</li>
          </ol>
          <p className="mt-2 text-xs text-muted-foreground">
            Sikkerhed: Del ikke API-nøglen i mail/chat. Ved tvivl, opret en ny nøgle i Dinero og opdater forbindelsen.
          </p>
        </div>

        {dineroError ? <p className="mt-2 text-xs font-medium text-red-700">{dineroError}</p> : null}
        {dineroMessage ? <p className="mt-2 text-xs font-medium text-emerald-700">{dineroMessage}</p> : null}
      </section>

      {error ? <p className="mb-4 text-sm font-medium text-red-700">{error}</p> : null}

      <section className="rounded-2xl border border-border bg-white p-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Kalender</h2>

        <div className={`grid gap-3 ${viewMode === "day" ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2 2xl:grid-cols-7"}`}>
          {period.days.map((day) => {
            const dateKey = toDateKey(day);
            const events = eventsByDay.get(dateKey) || [];

            return (
              <article key={dateKey} className="rounded-xl border border-border/70 bg-white p-3">
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    className="text-left"
                    onClick={() => {
                      setAnchorDate(day);
                      setViewMode("day");
                    }}
                  >
                    <p className="text-sm font-semibold text-foreground">{formatDayHeader(day)}</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => createQuickAllDay(dateKey, "personal")}
                    className="rounded-md border border-border px-2 py-1 text-[11px] font-medium"
                    disabled={absenceBusy}
                  >
                    Fri
                  </button>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-1.5">
                  {SLOT_RANGES.map((slot, slotIndex) => {
                    const occupancy = getSlotOccupancy(dateKey, slotIndex);
                    const isFree = occupancy.kind === "free";

                    return (
                      <button
                        key={`${dateKey}-${slot.label}`}
                        type="button"
                        onClick={() => {
                          if (occupancy.kind === "job") {
                            if (!occupancy.job.id.startsWith("booking:")) {
                              router.push(`/medarbejder/opgaver/${encodeURIComponent(occupancy.job.id)}`);
                              return;
                            }
                            setSelectedJobId(occupancy.job.id);
                            setAbsenceError("");
                            setAbsenceMessage(`Åbnede booking i slot ${slot.label}.`);
                            return;
                          }
                          if (occupancy.kind === "closed") {
                            setAbsenceError("");
                            setAbsenceMessage("Weekend er lukket.");
                            return;
                          }
                          selectSlotForAbsence(dateKey, slotIndex);
                        }}
                        className={`rounded-md border px-1.5 py-1 text-left text-[10px] font-semibold ${
                          isFree
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-red-200 bg-red-50 text-red-700"
                        }`}
                        title={
                          occupancy.kind === "job"
                            ? `Optaget med opgave (${slot.label})`
                            : occupancy.kind === "closed"
                              ? `Weekend lukket (${slot.label})`
                            : occupancy.kind === "absence"
                              ? `Ikke ledig (${typeLabel[occupancy.item.type]})`
                              : `Ledig (${slot.label})`
                        }
                      >
                        <div>{slot.label}</div>
                        <div>
                          {occupancy.kind === "job"
                            ? "Optaget"
                            : occupancy.kind === "closed"
                              ? "Lukket"
                            : occupancy.kind === "absence"
                              ? "Ikke ledig"
                              : "Ledig"}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {events.length === 0 ? (
                  <p className="mt-3 text-xs text-muted-foreground">Ingen opgaver eller fravær.</p>
                ) : (
                  <div className="mt-3 space-y-2">
                    {events.map((event) => {
                      if (event.kind === "job") {
                        return (
                          <button
                            key={`job-${event.id}-${event.startAt}`}
                            type="button"
                            onClick={() => {
                              if (!event.id.startsWith("booking:")) {
                                router.push(`/medarbejder/opgaver/${encodeURIComponent(event.id)}`);
                                return;
                              }
                              setSelectedJobId(event.id);
                            }}
                            className={`w-full rounded-lg border px-2 py-2 text-left ${
                              event.selected ? "border-primary bg-primary/5" : "border-border"
                            }`}
                          >
                            <p className="text-xs font-semibold text-foreground">{event.title}</p>
                            <p className="text-[11px] text-muted-foreground">{formatTimeRange(event.startAt, event.endAt)}</p>
                            <p className="text-[11px] text-muted-foreground">{event.subtitle}</p>
                          </button>
                        );
                      }

                      return (
                        <div key={`absence-${event.id}-${event.startAt}`} className="rounded-lg border border-amber-200 bg-amber-50 px-2 py-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-xs font-semibold text-amber-900">{typeLabel[event.type]}</p>
                              <p className="text-[11px] text-amber-800">{formatTimeRange(event.startAt, event.endAt)}</p>
                              {event.note ? <p className="text-[11px] text-amber-700">{event.note}</p> : null}
                            </div>
                            <button
                              type="button"
                              onClick={() => deleteAbsence(event.id)}
                              className="text-[11px] font-medium text-amber-900 underline"
                              disabled={absenceBusy}
                            >
                              Slet
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[380px_1fr]">
        <div className="rounded-2xl border border-border bg-white p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Markér fravær</h2>

          <div className="mt-3 space-y-3">
            <label className="grid gap-1 text-sm">
              <span className="text-xs text-muted-foreground">Type</span>
              <select
                value={absenceType}
                onChange={(event) => setAbsenceType(event.target.value as AvailabilityType)}
                className="h-10 rounded-md border border-border bg-white px-3 text-sm"
              >
                <option value="sick">Syg</option>
                <option value="personal">Fri</option>
                <option value="vacation">Ferie</option>
              </select>
            </label>

            <label className="grid gap-1 text-sm">
              <span className="text-xs text-muted-foreground">Dato</span>
              <input
                type="date"
                value={absenceDateKey}
                onChange={(event) => setAbsenceDateKey(event.target.value)}
                className="h-10 rounded-md border border-border bg-white px-3 text-sm"
              />
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={absenceAllDay}
                onChange={(event) => setAbsenceAllDay(event.target.checked)}
              />
              Heldag
            </label>

            {!absenceAllDay ? (
              <div className="grid grid-cols-2 gap-2">
                <label className="grid gap-1 text-sm">
                  <span className="text-xs text-muted-foreground">Fra</span>
                  <input
                    type="time"
                    value={absenceStart}
                    onChange={(event) => setAbsenceStart(event.target.value)}
                    className="h-10 rounded-md border border-border bg-white px-3 text-sm"
                  />
                </label>
                <label className="grid gap-1 text-sm">
                  <span className="text-xs text-muted-foreground">Til</span>
                  <input
                    type="time"
                    value={absenceEnd}
                    onChange={(event) => setAbsenceEnd(event.target.value)}
                    className="h-10 rounded-md border border-border bg-white px-3 text-sm"
                  />
                </label>
              </div>
            ) : null}

            <label className="grid gap-1 text-sm">
              <span className="text-xs text-muted-foreground">Note (valgfri)</span>
              <textarea
                value={absenceNote}
                onChange={(event) => setAbsenceNote(event.target.value)}
                className="min-h-20 rounded-md border border-border bg-white px-3 py-2 text-sm"
                placeholder="Fx lægetid 10:30"
              />
            </label>

            {absenceError ? <p className="text-xs font-medium text-red-700">{absenceError}</p> : null}
            {absenceMessage ? <p className="text-xs font-medium text-emerald-700">{absenceMessage}</p> : null}

            <Button onClick={submitAbsenceForm} disabled={absenceBusy}>
              {absenceBusy ? "Gemmer..." : "Gem fravær"}
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-white p-5">
          {!selectedJob ? (
            <p className="text-sm text-muted-foreground">Vælg en opgave i kalenderen for at se detaljer.</p>
          ) : (
            <div className="space-y-4">

              {/* ── Header: service + status + dato ── */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-xl font-semibold text-foreground">
                      {serviceLabel[selectedJob.service || ""] || selectedJob.title}
                    </h2>
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusBadgeCls(selectedJob.status)}`}>
                      {statusLabel[selectedJob.status] || selectedJob.status}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm capitalize text-muted-foreground">
                    {formatDateOnly(selectedJob.startAt)}
                  </p>
                  {selectedJob.invoiceStatus === "sent" ? (
                    <p className="mt-0.5 text-xs font-medium text-emerald-600">
                      ✓ Faktura sendt{selectedJob.invoicedAt ? ` · ${formatDateTime(selectedJob.invoicedAt)}` : ""}
                    </p>
                  ) : null}
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-lg font-bold text-foreground">{selectedJob.priceLabel}</p>
                </div>
              </div>

              {/* ── Adresse ── */}
              {selectedJob.address || selectedJob.city || selectedJob.location ? (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/20 px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Adresse</p>
                    <p className="mt-0.5 text-sm font-medium text-foreground">
                      {[selectedJob.address, selectedJob.city || selectedJob.location].filter(Boolean).join(", ")}
                    </p>
                  </div>
                  {selectedJob.mapsUrl ? (
                    <a
                      href={selectedJob.mapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-9 shrink-0 items-center rounded-lg bg-primary px-3 text-xs font-semibold text-white"
                    >
                      Naviger
                    </a>
                  ) : null}
                </div>
              ) : null}

              {/* ── Kundekort ── */}
              <div className="rounded-xl border border-border bg-white px-4 py-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Kunde</p>
                <div className="mt-2 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-base font-semibold text-foreground">{selectedJob.lead?.name || "-"}</p>
                    {selectedJob.lead?.phone ? (
                      <p className="mt-0.5 text-sm text-foreground">{selectedJob.lead.phone}</p>
                    ) : null}
                    {selectedJob.lead?.email ? (
                      <a href={`mailto:${selectedJob.lead.email}`} className="mt-0.5 block truncate text-sm text-primary">
                        {selectedJob.lead.email}
                      </a>
                    ) : null}
                    {(selectedJob.city || selectedJob.lead?.location) ? (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {selectedJob.city || selectedJob.lead?.location}
                      </p>
                    ) : null}
                  </div>
                  {selectedJob.lead?.phone ? (
                    <a
                      href={`tel:${selectedJob.lead.phone}`}
                      className="inline-flex h-10 shrink-0 items-center rounded-full bg-primary px-4 text-sm font-semibold text-white"
                    >
                      Ring
                    </a>
                  ) : null}
                </div>
                {selectedJob.lead?.phone ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <a
                      href={`sms:${selectedJob.lead.phone}`}
                      className="inline-flex h-8 items-center rounded-lg border border-border px-3 text-xs font-medium"
                    >
                      Send SMS
                    </a>
                    {selectedJob.lead?.email ? (
                      <a
                        href={`mailto:${selectedJob.lead.email}`}
                        className="inline-flex h-8 items-center rounded-lg border border-border px-3 text-xs font-medium"
                      >
                        Send email
                      </a>
                    ) : null}
                  </div>
                ) : null}
              </div>

              {/* ── Opgavebeskrivelse ── */}
              {selectedJob.taskDescription || selectedJob.notes || selectedJob.lead?.message ? (
                <div className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Opgave</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">
                    {selectedJob.taskDescription || selectedJob.notes || selectedJob.lead?.message}
                  </p>
                </div>
              ) : null}

              {/* ── Flyt opgave (kun bookinger) ── */}
              {selectedJob.id.startsWith("booking:") && selectedJob.status !== "cancelled" && selectedJob.status !== "invoiced" ? (
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!showReschedule) {
                        setRescheduleDate(selectedJob.startAt.slice(0, 10));
                        setRescheduleSlot("08:00");
                        setRescheduleCount("1");
                        setRescheduleError("");
                        setRescheduleMessage("");
                      }
                      setShowReschedule((prev) => !prev);
                    }}
                    className="text-sm font-medium text-primary underline underline-offset-2"
                  >
                    {showReschedule ? "Luk" : "Flyt opgave til ny dato/tid"}
                  </button>

                  {showReschedule ? (
                    <div className="mt-3 space-y-3 rounded-xl border border-border bg-white p-4">
                      <p className="text-sm font-semibold text-foreground">Flyt opgave</p>
                      <div className="grid gap-3 sm:grid-cols-3">
                        <div className="space-y-1">
                          <label className="block text-xs font-medium text-muted-foreground">Ny dato</label>
                          <input
                            type="date"
                            value={rescheduleDate}
                            onChange={(e) => setRescheduleDate(e.target.value)}
                            className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-xs font-medium text-muted-foreground">Starttid</label>
                          <select
                            value={rescheduleSlot}
                            onChange={(e) => setRescheduleSlot(e.target.value as "08:00" | "11:00" | "13:30")}
                            className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
                          >
                            <option value="08:00">08:00</option>
                            <option value="11:00">11:00</option>
                            <option value="13:30">13:30</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="block text-xs font-medium text-muted-foreground">Slots</label>
                          <select
                            value={rescheduleCount}
                            onChange={(e) => setRescheduleCount(e.target.value as "1" | "2" | "3")}
                            className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
                          >
                            <option value="1">1 slot</option>
                            <option value="2">2 slots</option>
                            <option value="3">3 slots</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button onClick={submitReschedule} disabled={rescheduleBusy}>
                          {rescheduleBusy ? "Flytter..." : "Bekræft flytning"}
                        </Button>
                        <Button variant="outline" onClick={() => setShowReschedule(false)} disabled={rescheduleBusy}>
                          Annuller
                        </Button>
                      </div>
                      {rescheduleError ? (
                        <p className="text-xs font-medium text-red-700">{rescheduleError}</p>
                      ) : null}
                    </div>
                  ) : null}
                  {rescheduleMessage ? (
                    <p className="mt-1 text-xs font-medium text-emerald-700">{rescheduleMessage}</p>
                  ) : null}
                </div>
              ) : null}

              {/* ── Afslut opgave / faktura ── */}
              <div className="rounded-xl border border-border bg-white px-4 py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground">
                    {selectedJob.status === "invoiced" ? "Faktura sendt ✓" : "Afslut og send faktura"}
                  </p>
                  {!dineroConnected ? (
                    <p className="text-xs font-medium text-amber-700">Forbind Dinero ovenfor</p>
                  ) : null}
                </div>

                {!showCompleteForm && selectedJob.status !== "invoiced" ? (
                  <Button
                    className="mt-3 w-full"
                    onClick={openCompleteForm}
                    disabled={completeBusy || selectedJob.status === "cancelled" || !dineroConnected}
                  >
                    Afslut opgave og send faktura
                  </Button>
                ) : null}

                {completeError ? <p className="mt-2 text-xs font-medium text-red-700">{completeError}</p> : null}
                {completeMessage ? <p className="mt-2 text-xs font-medium text-emerald-700">{completeMessage}</p> : null}

                {showCompleteForm ? (
                  <div className="mt-4 space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="grid gap-1 text-sm">
                        <span className="text-xs text-muted-foreground">Kundenavn</span>
                        <input
                          value={invoiceCustomerName}
                          onChange={(event) => setInvoiceCustomerName(event.target.value)}
                          className="h-10 rounded-md border border-border bg-white px-3 text-sm"
                        />
                      </label>
                      <label className="grid gap-1 text-sm">
                        <span className="text-xs text-muted-foreground">Email</span>
                        <input
                          type="email"
                          value={invoiceCustomerEmail}
                          onChange={(event) => setInvoiceCustomerEmail(event.target.value)}
                          className="h-10 rounded-md border border-border bg-white px-3 text-sm"
                        />
                      </label>
                      <label className="grid gap-1 text-sm">
                        <span className="text-xs text-muted-foreground">Telefon</span>
                        <input
                          value={invoiceCustomerPhone}
                          onChange={(event) => setInvoiceCustomerPhone(event.target.value)}
                          className="h-10 rounded-md border border-border bg-white px-3 text-sm"
                        />
                      </label>
                      <label className="grid gap-1 text-sm">
                        <span className="text-xs text-muted-foreground">Adresse</span>
                        <input
                          value={invoiceCustomerAddress}
                          onChange={(event) => setInvoiceCustomerAddress(event.target.value)}
                          className="h-10 rounded-md border border-border bg-white px-3 text-sm"
                        />
                      </label>
                      <label className="grid gap-1 text-sm sm:col-span-2">
                        <span className="text-xs text-muted-foreground">Beskrivelse (faktura)</span>
                        <input
                          value={invoiceDescription}
                          onChange={(event) => setInvoiceDescription(event.target.value)}
                          className="h-10 rounded-md border border-border bg-white px-3 text-sm"
                        />
                      </label>
                      <label className="grid gap-1 text-sm">
                        <span className="text-xs text-muted-foreground">Pris ex. moms (DKK)</span>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={invoiceAmountExVat}
                          onChange={(event) => setInvoiceAmountExVat(event.target.value)}
                          className="h-10 rounded-md border border-border bg-white px-3 text-sm"
                        />
                      </label>
                      <label className="grid gap-1 text-sm">
                        <span className="text-xs text-muted-foreground">Moms %</span>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="1"
                          value={invoiceVatPercent}
                          onChange={(event) => setInvoiceVatPercent(event.target.value)}
                          className="h-10 rounded-md border border-border bg-white px-3 text-sm"
                        />
                      </label>
                    </div>

                    <label className="grid gap-1 text-sm">
                      <span className="text-xs text-muted-foreground">Betaling</span>
                      <select
                        value={invoicePaymentMethod}
                        onChange={(event) => setInvoicePaymentMethod(event.target.value as "mobilepay" | "paid" | "net0")}
                        className="h-10 rounded-md border border-border bg-white px-3 text-sm"
                      >
                        <option value="net0">0 dage – ikke betalt endnu</option>
                        <option value="paid">Betalt kontant</option>
                        <option value="mobilepay">Betalt med MobilePay</option>
                      </select>
                    </label>

                    <div className="flex flex-wrap gap-2 pt-1">
                      <Button onClick={submitCompleteJob} disabled={completeBusy}>
                        {completeBusy ? "Sender faktura..." : "Godkend og send faktura"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowCompleteForm(false);
                          setCompleteError("");
                        }}
                        disabled={completeBusy}
                      >
                        Annuller
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>

            </div>
          )}
        </div>
      </section>
    </main>
  );
};
