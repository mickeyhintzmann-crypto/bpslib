"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { SLOT_TIMES, slotRange } from "@/lib/booking-schedule";
import { useAdminSession } from "@/components/admin/AdminSessionContext";

const WEEKDAYS = ["Søn", "Man", "Tir", "Ons", "Tor", "Fre", "Lør"];

type OverrideItem = {
  date: string;
  open_slots_count: number | null;
  show_on_acute_page: boolean | null;
  note: string | null;
};

type BookingItem = {
  id: string;
  date: string;
  start_slot_index: number | null;
  slot_count: number | null;
  source: string | null;
  status: string | null;
  customer_name: string | null;
  postal_code: string | null;
  address: string | null;
  assigned_to: string | null;
  service_type: string | null;
};

type AdminUser = {
  id: string;
  name: string | null;
  email: string | null;
  role: string | null;
  is_active: boolean | null;
};

type CalendarDay = {
  dateKey: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  weekdayIndex: number;
};

type DaySettings = {
  openSlotsCount: number;
  showOnAcutePage: boolean;
  note: string;
};

type CalendarResponse = {
  overrides?: OverrideItem[];
  bookings?: BookingItem[];
  message?: string;
};

type UsersResponse = {
  items?: AdminUser[];
  message?: string;
};

const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const addMonths = (date: Date, delta: number) => {
  const next = new Date(date);
  next.setMonth(next.getMonth() + delta);
  next.setDate(1);
  return next;
};

const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);

const endOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0);

const formatMonthLabel = (date: Date) =>
  date.toLocaleDateString("da-DK", { month: "long", year: "numeric" });

const buildMonthGrid = (month: Date) => {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);

  const gridStart = new Date(monthStart);
  gridStart.setDate(monthStart.getDate() - monthStart.getDay());

  const gridEnd = new Date(monthEnd);
  gridEnd.setDate(monthEnd.getDate() + (6 - monthEnd.getDay()));

  const days: CalendarDay[] = [];
  const cursor = new Date(gridStart);

  while (cursor <= gridEnd) {
    days.push({
      dateKey: toDateKey(cursor),
      dayNumber: cursor.getDate(),
      isCurrentMonth: cursor.getMonth() === month.getMonth(),
      weekdayIndex: cursor.getDay()
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  return {
    days,
    from: toDateKey(gridStart),
    to: toDateKey(gridEnd)
  };
};

const defaultDaySettings = (): DaySettings => ({
  openSlotsCount: 3,
  showOnAcutePage: true,
  note: ""
});

const sortBookingsByTime = (items: BookingItem[]) =>
  [...items].sort((a, b) => {
    const aIndex = typeof a.start_slot_index === "number" ? a.start_slot_index : 99;
    const bIndex = typeof b.start_slot_index === "number" ? b.start_slot_index : 99;
    if (aIndex !== bIndex) {
      return aIndex - bIndex;
    }
    const aName = a.customer_name || "";
    const bName = b.customer_name || "";
    return aName.localeCompare(bName, "da");
  });

const isActiveStatus = (status: string | null) => {
  if (!status) {
    return true;
  }
  const normalized = status.toLowerCase();
  return normalized !== "cancelled" && normalized !== "annulleret";
};

const normalizeSlotCount = (count: number | null) => {
  if (!count || Number.isNaN(count)) {
    return 1;
  }
  return Math.max(1, Math.min(3, Math.round(count)));
};

const computeBlockedSlots = (dayBookings: BookingItem[]) => {
  const blocked = new Set<number>();

  dayBookings.forEach((booking) => {
    if (!isActiveStatus(booking.status)) {
      return;
    }
    const startIndex = typeof booking.start_slot_index === "number" ? booking.start_slot_index : null;
    if (startIndex === null || startIndex < 0 || startIndex > 2) {
      return;
    }
    const slotCount = normalizeSlotCount(booking.slot_count ?? 1);
    for (let offset = 0; offset < slotCount; offset += 1) {
      const slotIndex = startIndex + offset;
      if (slotIndex <= 2) {
        blocked.add(slotIndex);
      }
    }
  });

  return blocked;
};

const formatSlotLabel = (booking: BookingItem) => {
  const startIndex = typeof booking.start_slot_index === "number" ? booking.start_slot_index : 0;
  const slotCount = normalizeSlotCount(booking.slot_count ?? 1);
  const startTime = SLOT_TIMES[startIndex] ?? SLOT_TIMES[0];
  const range = slotRange(startTime, slotCount);
  if (range.length === 0) {
    return startTime;
  }
  if (range.length === 1) {
    return range[0];
  }
  return `${range[0]} + ${range.slice(1).join(" + ")}`;
};

export const CalendarAdmin = () => {
  const session = useAdminSession();
  const canAssign = session?.role === "owner" || session?.role === "admin";

  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()));
  const [gridDays, setGridDays] = useState<CalendarDay[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedDateKey, setSelectedDateKey] = useState("");
  const [daySettings, setDaySettings] = useState<Record<string, DaySettings>>({});
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [employeeFilter, setEmployeeFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const dayDetailRef = useRef<HTMLDivElement | null>(null);

  const monthLabel = useMemo(() => formatMonthLabel(currentMonth), [currentMonth]);

  useEffect(() => {
    const { days, from, to } = buildMonthGrid(currentMonth);
    setGridDays(days);
    setDateFrom(from);
    setDateTo(to);
    const todayKey = toDateKey(new Date());
    if (days.some((day) => day.dateKey === todayKey)) {
      setSelectedDateKey(todayKey);
    } else {
      setSelectedDateKey(days[0]?.dateKey || "");
    }
    const baseSettings: Record<string, DaySettings> = {};
    days.forEach((day) => {
      baseSettings[day.dateKey] = defaultDaySettings();
    });
    setDaySettings(baseSettings);
  }, [currentMonth]);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await fetch("/api/admin/users?active=1", { cache: "no-store" });
        const payload = (await response.json()) as UsersResponse;
        if (!response.ok) {
          return;
        }
        setUsers(payload.items || []);
      } catch (fetchError) {
        console.error(fetchError);
      }
    };

    loadUsers();
  }, []);

  const userMap = useMemo(() => {
    const map = new Map<string, AdminUser>();
    users.forEach((user) => {
      map.set(user.id, user);
    });
    return map;
  }, [users]);

  const employeeOptions = useMemo(
    () => users.filter((user) => user.role === "employee" || user.role === "admin" || user.role === "owner"),
    [users]
  );

  const bookingsByDate = useMemo(() => {
    const map: Record<string, BookingItem[]> = {};
    bookings.forEach((booking) => {
      if (!booking.date) {
        return;
      }
      if (!map[booking.date]) {
        map[booking.date] = [];
      }
      map[booking.date].push(booking);
    });
    Object.keys(map).forEach((key) => {
      map[key] = sortBookingsByTime(map[key]);
    });
    return map;
  }, [bookings]);

  const visibleBookings = useMemo(() => {
    if (employeeFilter === "all") {
      return bookings;
    }
    return bookings.filter((booking) => booking.assigned_to === employeeFilter);
  }, [bookings, employeeFilter]);

  const visibleBookingsByDate = useMemo(() => {
    const map: Record<string, BookingItem[]> = {};
    visibleBookings.forEach((booking) => {
      if (!booking.date) {
        return;
      }
      if (!map[booking.date]) {
        map[booking.date] = [];
      }
      map[booking.date].push(booking);
    });
    Object.keys(map).forEach((key) => {
      map[key] = sortBookingsByTime(map[key]);
    });
    return map;
  }, [visibleBookings]);

  const unassignedBookings = useMemo(
    () => bookings.filter((booking) => !booking.assigned_to && isActiveStatus(booking.status)),
    [bookings]
  );

  const loadCalendar = async () => {
    if (!dateFrom || !dateTo) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/calendar?from=${dateFrom}&to=${dateTo}`, {
        cache: "no-store"
      });
      const payload = (await response.json()) as CalendarResponse;
      if (!response.ok || !payload.overrides || !payload.bookings) {
        setError(payload.message || "Kunne ikke hente kalenderdata.");
        return;
      }

      setBookings(payload.bookings);
      setDaySettings((current) => {
        const next = { ...current };
        payload.overrides?.forEach((override) => {
          if (!override.date) {
            return;
          }
          const currentSettings = next[override.date] ?? defaultDaySettings();
          next[override.date] = {
            openSlotsCount:
              typeof override.open_slots_count === "number" ? override.open_slots_count : currentSettings.openSlotsCount,
            showOnAcutePage:
              typeof override.show_on_acute_page === "boolean"
                ? override.show_on_acute_page
                : currentSettings.showOnAcutePage,
            note: override.note || ""
          };
        });
        return next;
      });
    } catch (fetchError) {
      console.error(fetchError);
      setError("Netværksfejl ved hentning af kalenderdata.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCalendar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFrom, dateTo]);

  const updateDaySettings = (dateKey: string, patch: Partial<DaySettings>) => {
    setDaySettings((current) => ({
      ...current,
      [dateKey]: {
        ...(current[dateKey] || defaultDaySettings()),
        ...patch
      }
    }));
  };

  const saveSelectedDay = async () => {
    if (!selectedDateKey) {
      return;
    }

    const settings = daySettings[selectedDateKey] || defaultDaySettings();
    setSaveMessage("Gemmer...");

    try {
      const response = await fetch("/api/admin/day-overrides", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDateKey,
          open_slots_count: settings.openSlotsCount,
          show_on_acute_page: settings.showOnAcutePage,
          note: settings.note.trim() ? settings.note.trim() : null
        })
      });

      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        setSaveMessage(payload.message || "Kunne ikke gemme.");
        return;
      }

      setSaveMessage("Gemt");
      setTimeout(() => setSaveMessage(""), 1500);
    } catch (saveError) {
      console.error(saveError);
      setSaveMessage("Netværksfejl");
    }
  };

  const updateAssignment = async (bookingId: string, employeeId: string | null) => {
    if (!canAssign) {
      return;
    }
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assigned_to: employeeId })
      });
      const payload = (await response.json()) as { item?: BookingItem; message?: string };
      if (!response.ok || !payload.item) {
        return;
      }
      setBookings((current) => current.map((booking) => (booking.id === bookingId ? payload.item! : booking)));
    } catch (assignError) {
      console.error(assignError);
    }
  };

  const errorIsMissingTable =
    error.toLowerCase().includes("day_overrides") || error.toLowerCase().includes("mangler i databasen");

  const selectedSettings = selectedDateKey ? daySettings[selectedDateKey] || defaultDaySettings() : null;
  const selectedBookings = selectedDateKey ? bookingsByDate[selectedDateKey] || [] : [];
  const selectedDateLabel = selectedDateKey
    ? new Date(`${selectedDateKey}T12:00:00`).toLocaleDateString("da-DK", {
        weekday: "long",
        day: "numeric",
        month: "long"
      })
    : "";

  const employeeSchedule = useMemo(() => {
    if (!selectedDateKey) {
      return [];
    }
    return employeeOptions.map((user) => ({
      user,
      items: (bookingsByDate[selectedDateKey] || []).filter((booking) => booking.assigned_to === user.id)
    }));
  }, [employeeOptions, bookingsByDate, selectedDateKey]);

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-border/70 bg-white/70 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase text-muted-foreground">Kalender</p>
            <h1 className="font-display text-2xl font-semibold text-foreground">Hovedkalender</h1>
            <p className="text-sm text-muted-foreground">Overblik over opgaver, medarbejdere og åbne tider.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/admin/bookings/new"
              className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-white"
            >
              + Opret opgave eller akut tid
            </Link>
            <Button variant="outline" size="sm" onClick={() => dayDetailRef.current?.scrollIntoView({ behavior: "smooth" })}>
              Tilgængelige tider
            </Button>
            <Button variant="outline" size="sm" onClick={loadCalendar} disabled={loading}>
              {loading ? "Henter..." : "Opdater"}
            </Button>
          </div>
        </div>

        {error ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-semibold">{error}</p>
            {errorIsMissingTable ? (
              <p className="mt-2 text-xs text-red-600">
                Kør migrationen: <code>supabase/migrations/20260208_000008_day_overrides.sql</code>
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="rounded-2xl border border-border/60 bg-white/70 p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth((prev) => addMonths(prev, -1))}
            >
              Forrige
            </Button>
            <p className="text-sm font-semibold capitalize text-foreground">{monthLabel}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth((prev) => addMonths(prev, 1))}
            >
              Næste
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted-foreground">Medarbejder:</span>
            <select
              value={employeeFilter}
              onChange={(event) => setEmployeeFilter(event.target.value)}
              className="h-9 rounded-md border border-border bg-white px-2 text-sm"
            >
              <option value="all">Alle</option>
              {employeeOptions.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name || user.email || "Medarbejder"}
                </option>
              ))}
            </select>
          </div>
        </div>

        {unassignedBookings.length > 0 ? (
          <div className="mt-5 rounded-xl border border-dashed border-border/80 bg-[#fff8f2] p-4">
            <p className="text-sm font-semibold text-foreground">Udeltelte opgaver</p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {unassignedBookings.slice(0, 6).map((booking) => (
                <div key={booking.id} className="rounded-lg border border-border/60 bg-white p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">{booking.service_type || "Bordplade"}</p>
                      <p className="text-xs text-muted-foreground">
                        {booking.date} · {formatSlotLabel(booking)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {booking.customer_name || "Ukendt"} · {booking.postal_code || "Postnr."}
                      </p>
                    </div>
                    <Link
                      href={`/admin/bookings/${booking.id}`}
                      className="text-xs font-medium text-primary underline"
                    >
                      Åbn
                    </Link>
                  </div>
                  {canAssign ? (
                    <div className="mt-2">
                      <select
                        className="h-9 w-full rounded-md border border-border bg-white px-2 text-sm"
                        value={booking.assigned_to || ""}
                        onChange={(event) => updateAssignment(booking.id, event.target.value || null)}
                      >
                        <option value="">Tildel medarbejder</option>
                        {employeeOptions.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.name || user.email}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-6 grid grid-cols-7 gap-2 text-xs text-muted-foreground">
          {WEEKDAYS.map((day) => (
            <div key={day} className="px-2 py-1 text-center font-semibold uppercase">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {gridDays.map((day) => {
            const settings = daySettings[day.dateKey] || defaultDaySettings();
            const dayBookings = bookingsByDate[day.dateKey] || [];
            const blocked = computeBlockedSlots(dayBookings);
            const openSlots = settings.openSlotsCount;
            const bookedCount = Math.min(openSlots, blocked.size);
            const remaining = Math.max(0, openSlots - bookedCount);
            const visible = visibleBookingsByDate[day.dateKey] || [];
            const isSelected = selectedDateKey === day.dateKey;

            return (
              <button
                type="button"
                key={day.dateKey}
                onClick={() => setSelectedDateKey(day.dateKey)}
                className={`min-h-[120px] rounded-xl border px-2 py-2 text-left transition ${
                  isSelected ? "border-primary bg-primary/5" : "border-border bg-white"
                } ${day.isCurrentMonth ? "" : "opacity-50"}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">{day.dayNumber}</span>
                  {openSlots === 0 ? (
                    <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-600">
                      Lukket
                    </span>
                  ) : (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                      {remaining}/{openSlots}
                    </span>
                  )}
                </div>
                <div className="mt-2 space-y-1">
                  {visible.slice(0, 3).map((booking) => (
                    <div
                      key={booking.id}
                      className={`rounded-md px-2 py-1 text-[11px] ${
                        booking.assigned_to ? "bg-[#eaf1ff]" : "bg-[#fff2e6] text-orange-700"
                      }`}
                    >
                      <p className="font-semibold text-foreground">
                        {booking.service_type || "Bordplade"}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {formatSlotLabel(booking)} · {booking.customer_name || ""}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {booking.postal_code || booking.address || "Postnr. mangler"}
                      </p>
                      {booking.assigned_to ? (
                        <p className="text-[10px] text-muted-foreground">
                          {userMap.get(booking.assigned_to)?.name || "Tildelt"}
                        </p>
                      ) : (
                        <p className="text-[10px] text-orange-600">Ikke tildelt</p>
                      )}
                    </div>
                  ))}
                  {visible.length > 3 ? (
                    <p className="text-[10px] text-muted-foreground">+{visible.length - 3} flere</p>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {selectedSettings && selectedDateKey ? (
        <div ref={dayDetailRef} className="grid gap-6 md:grid-cols-[1.1fr_1.9fr]">
          <div className="rounded-2xl border border-border/60 bg-white/80 p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground">Dagdetaljer</h2>
            <p className="text-sm text-muted-foreground">{selectedDateLabel}</p>

            <div className="mt-4 space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground">Åbne slots</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {[0, 1, 2, 3].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => updateDaySettings(selectedDateKey, { openSlotsCount: count })}
                      className={`rounded-full border px-3 py-1 text-xs ${
                        selectedSettings.openSlotsCount === count
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground"
                      }`}
                    >
                      {count === 0 ? "Lukket" : `${count} slots`}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground">Vis på akutte tider</p>
                <label className="mt-2 flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedSettings.showOnAcutePage}
                    onChange={(event) =>
                      updateDaySettings(selectedDateKey, { showOnAcutePage: event.target.checked })
                    }
                  />
                  {selectedSettings.showOnAcutePage ? "Ja" : "Nej"}
                </label>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground">Note</p>
                <input
                  value={selectedSettings.note}
                  onChange={(event) => updateDaySettings(selectedDateKey, { note: event.target.value })}
                  className="mt-2 h-9 w-full rounded-md border border-border bg-white px-2 text-sm"
                  placeholder="Kort note"
                />
              </div>

              <div className="flex items-center gap-3">
                <Button size="sm" onClick={saveSelectedDay}>
                  Gem
                </Button>
                {saveMessage ? <span className="text-xs text-muted-foreground">{saveMessage}</span> : null}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-white/80 p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-foreground">Opgaver denne dag</h2>
            <p className="text-sm text-muted-foreground">
              {selectedBookings.length === 0 ? "Ingen bookinger" : `${selectedBookings.length} bookinger`}
            </p>

            <div className="mt-4 space-y-3">
              {selectedBookings.map((booking) => (
                <div key={booking.id} className="rounded-xl border border-border/60 bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {booking.service_type || "Bordplade"} · {formatSlotLabel(booking)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {booking.customer_name || "Ukendt"} · {booking.postal_code || "Postnr."}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {booking.source || ""} · {booking.status || ""}
                      </p>
                    </div>
                    <Link
                      href={`/admin/bookings/${booking.id}`}
                      className="text-xs font-medium text-primary underline"
                    >
                      Åbn
                    </Link>
                  </div>
                  {canAssign ? (
                    <div className="mt-3">
                      <p className="text-xs font-semibold uppercase text-muted-foreground">Medarbejder</p>
                      <select
                        className="mt-2 h-9 w-full rounded-md border border-border bg-white px-2 text-sm"
                        value={booking.assigned_to || ""}
                        onChange={(event) => updateAssignment(booking.id, event.target.value || null)}
                      >
                        <option value="">Ikke tildelt</option>
                        {employeeOptions.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.name || user.email}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>

            <div className="mt-6 border-t border-border/60 pt-4">
              <h3 className="text-sm font-semibold text-foreground">Medarbejder-oversigt (valgt dag)</h3>
              <p className="text-xs text-muted-foreground">
                Se hver medarbejders opgaver for den valgte dato og tildel hurtigt.
              </p>
              <div className="mt-3 space-y-3">
                {employeeSchedule.map(({ user, items }) => (
                  <div key={user.id} className="rounded-lg border border-border/60 bg-white p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">{user.name || user.email || "Medarbejder"}</p>
                      <span className="text-xs text-muted-foreground">
                        {items.length} opgave{items.length === 1 ? "" : "r"}
                      </span>
                    </div>
                    {items.length === 0 ? (
                      <p className="mt-2 text-xs text-muted-foreground">Ingen opgaver denne dag.</p>
                    ) : (
                      <div className="mt-2 space-y-2">
                        {items.map((booking) => (
                          <div key={booking.id} className="rounded-md bg-[#f6f9ff] px-2 py-1 text-xs">
                            <p className="font-semibold text-foreground">
                              {formatSlotLabel(booking)} · {booking.customer_name || "Ukendt"}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {booking.postal_code || booking.address || "Postnr. mangler"}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
};
