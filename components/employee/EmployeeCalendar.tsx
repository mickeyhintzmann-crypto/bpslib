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
  location: string | null;
  address: string | null;
  notes: string | null;
  lead: JobLead | null;
  priceMin: number | null;
  priceMax: number | null;
  priceLabel: string;
  mapsUrl: string | null;
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
  employee?: { name: string; email: string | null };
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
  personal: "Privat"
};

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
          subtitle: `${job.address || job.location || "Adresse mangler"}`,
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
        router.push("/medarbejder/login");
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

  const logout = async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
    } finally {
      router.push("/medarbejder/login");
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

  const getSlotOccupancy = useCallback(
    (dateKey: string, slotIndex: number) => {
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
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => createQuickAllDay(dateKey, "sick")}
                      className="rounded-md border border-border px-2 py-1 text-[11px] font-medium"
                      disabled={absenceBusy}
                    >
                      Syg
                    </button>
                    <button
                      type="button"
                      onClick={() => createQuickAllDay(dateKey, "vacation")}
                      className="rounded-md border border-border px-2 py-1 text-[11px] font-medium"
                      disabled={absenceBusy}
                    >
                      Ferie
                    </button>
                  </div>
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
                            setSelectedJobId(occupancy.job.id);
                            setAbsenceError("");
                            setAbsenceMessage(`Åbnede opgave i slot ${slot.label}.`);
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
                            : occupancy.kind === "absence"
                              ? `Ikke ledig (${typeLabel[occupancy.item.type]})`
                              : `Ledig (${slot.label})`
                        }
                      >
                        <div>{slot.label}</div>
                        <div>
                          {occupancy.kind === "job"
                            ? "Optaget"
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
                            onClick={() => setSelectedJobId(event.id)}
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
                <option value="vacation">Ferie</option>
                <option value="personal">Privat/læge</option>
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
              <div>
                <h2 className="font-display text-2xl font-semibold text-foreground">{selectedJob.title}</h2>
                <p className="text-sm text-muted-foreground">
                  {formatDateTime(selectedJob.startAt)} - {formatDateTime(selectedJob.endAt)}
                </p>
              </div>

              <div className="grid gap-3 rounded-xl border border-border/70 bg-muted/20 p-4 md:grid-cols-2">
                <p>
                  <strong>Status:</strong> {selectedJob.status}
                </p>
                <p>
                  <strong>Service:</strong> {selectedJob.service || "-"}
                </p>
                <p>
                  <strong>Pris:</strong> {selectedJob.priceLabel}
                </p>
                <p>
                  <strong>Adresse:</strong> {selectedJob.address || selectedJob.location || "-"}
                </p>
              </div>

              <div className="grid gap-3 rounded-xl border border-border/70 p-4 md:grid-cols-2">
                <p>
                  <strong>Kunde navn:</strong> {selectedJob.lead?.name || "-"}
                </p>
                <p>
                  <strong>Telefon:</strong> {selectedJob.lead?.phone || "-"}
                </p>
                <p>
                  <strong>Email:</strong> {selectedJob.lead?.email || "-"}
                </p>
                <p>
                  <strong>Lokation:</strong> {selectedJob.lead?.location || selectedJob.location || "-"}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {selectedJob.mapsUrl ? (
                  <a
                    href={selectedJob.mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-white"
                  >
                    Naviger til adresse
                  </a>
                ) : null}
                {selectedJob.lead?.phone ? (
                  <a href={`tel:${selectedJob.lead.phone}`} className="inline-flex h-10 items-center rounded-md border border-border px-4 text-sm">
                    Ring kunde
                  </a>
                ) : null}
                {selectedJob.lead?.email ? (
                  <a href={`mailto:${selectedJob.lead.email}`} className="inline-flex h-10 items-center rounded-md border border-border px-4 text-sm">
                    Send email
                  </a>
                ) : null}
              </div>

              <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Job note</p>
                <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">{selectedJob.notes || "-"}</p>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
};
