"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { SLOT_TIMES, slotRange } from "@/lib/booking-schedule";
import { useAdminSession } from "@/components/admin/AdminSessionContext";

const WEEKDAYS = ["Søn", "Man", "Tir", "Ons", "Tor", "Fre", "Lør"];

type OverrideItem = {
  date: string;
  open_slots_count: number | null;
  show_on_acute_page: boolean | null;
  note: string | null;
  blocked_slot_indices: number[] | null;
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

type UnavailabilityItem = {
  id: string;
  employee_id: string | null;
  created_by_user_id: string | null;
  type: "sick" | "vacation" | "personal" | null;
  note: string | null;
  start_at: string | null;
  end_at: string | null;
  employee_name: string | null;
  employee_email: string | null;
};

type RepTaskItem = {
  id: string;
  title: string | null;
  notes: string | null;
  start_at: string | null;
  assigned_employee_id: string | null;
  employee_name: string | null;
};

type AdminUser = {
  id: string;
  name: string | null;
  email: string | null;
  role: string | null;
  is_active: boolean | null;
};

type EmployeeProfile = {
  id: string;
  name: string | null;
  email: string | null;
  isActive: boolean | null;
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
  blockedSlotIndices: number[];
};

type SlotActionState = {
  dateKey: string;
  slotIndex: number;
  slotLabel: string;
  bookingId: string | null;
  slotOpenByOverride: boolean;
  absenceSummary: string | null;
  isWeekend: boolean;
};

type CalendarResponse = {
  overrides?: OverrideItem[];
  bookings?: BookingItem[];
  unavailability?: UnavailabilityItem[];
  repTasks?: RepTaskItem[];
  message?: string;
};

type UsersResponse = {
  items?: AdminUser[];
  message?: string;
};

type EmployeesResponse = {
  items?: EmployeeProfile[];
  message?: string;
};

const SLOT_RANGES = [
  { start: "08:00", end: "11:00" },
  { start: "11:00", end: "13:30" },
  { start: "13:30", end: "16:00" }
] as const;

const UNAVAILABILITY_LABELS = {
  sick: "Syg",
  vacation: "Ferie",
  personal: "Privat"
} as const;

const parseIsoToMs = (value: string | null) => {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  const ms = date.getTime();
  if (Number.isNaN(ms)) {
    return null;
  }
  return ms;
};

const combineDateTimeToMs = (dateKey: string, hhmm: string) => {
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
  return new Date(year, month - 1, day, hour, minute, 0, 0).getTime();
};

const overlaps = (startMs: number, endMs: number, windowStartMs: number, windowEndMs: number) =>
  startMs < windowEndMs && endMs > windowStartMs;

const formatAbsenceRange = (startAt: string | null, endAt: string | null) => {
  const start = startAt ? new Date(startAt) : null;
  const end = endAt ? new Date(endAt) : null;
  if (!start || !end || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return "Tid ikke angivet";
  }

  const sameDay = start.toDateString() === end.toDateString();
  const startLabel = start.toLocaleTimeString("da-DK", { hour: "2-digit", minute: "2-digit" });
  const endLabel = end.toLocaleTimeString("da-DK", { hour: "2-digit", minute: "2-digit" });
  const isAllDay =
    start.getHours() === 0 &&
    start.getMinutes() === 0 &&
    end.getHours() === 23 &&
    end.getMinutes() >= 55;

  if (sameDay && isAllDay) {
    return "Heldag";
  }

  if (sameDay) {
    return `${startLabel}-${endLabel}`;
  }

  return `${start.toLocaleDateString("da-DK", {
    day: "2-digit",
    month: "2-digit"
  })} ${startLabel} - ${end.toLocaleDateString("da-DK", {
    day: "2-digit",
    month: "2-digit"
  })} ${endLabel}`;
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

const isWeekendDateKey = (dateKey: string) => {
  const [yearRaw, monthRaw, dayRaw] = dateKey.split("-");
  const year = Number.parseInt(yearRaw || "", 10);
  const month = Number.parseInt(monthRaw || "", 10);
  const day = Number.parseInt(dayRaw || "", 10);
  if ([year, month, day].some((value) => Number.isNaN(value))) {
    return false;
  }
  const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  const weekday = date.getUTCDay();
  return weekday === 0 || weekday === 6;
};

const defaultDaySettings = (dateKey: string): DaySettings => {
  const isWeekend = isWeekendDateKey(dateKey);
  return {
    openSlotsCount: isWeekend ? 0 : 3,
    showOnAcutePage: !isWeekend,
    note: "",
    blockedSlotIndices: []
  };
};

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

const getBookingForSlot = (dayBookings: BookingItem[], slotIndex: number) => {
  for (const booking of dayBookings) {
    if (!isActiveStatus(booking.status)) {
      continue;
    }
    const startIndex = typeof booking.start_slot_index === "number" ? booking.start_slot_index : null;
    if (startIndex === null || startIndex < 0 || startIndex > 2) {
      continue;
    }
    const slotCount = normalizeSlotCount(booking.slot_count ?? 1);
    const endExclusive = startIndex + slotCount;
    if (slotIndex >= startIndex && slotIndex < endExclusive && slotIndex <= 2) {
      return booking;
    }
  }
  return null;
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
  const router = useRouter();
  const session = useAdminSession();
  const canAssign = session?.role === "owner" || session?.role === "admin";

  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()));
  const [gridDays, setGridDays] = useState<CalendarDay[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedDateKey, setSelectedDateKey] = useState("");
  const [daySettings, setDaySettings] = useState<Record<string, DaySettings>>({});
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [unavailability, setUnavailability] = useState<UnavailabilityItem[]>([]);
  const [repTasks, setRepTasks] = useState<RepTaskItem[]>([]);
  const [repCreateTitle, setRepCreateTitle] = useState("");
  const [repCreateNotes, setRepCreateNotes] = useState("");
  const [repCreateEmployee, setRepCreateEmployee] = useState("");
  const [repCreateBusy, setRepCreateBusy] = useState(false);
  const [repCreateError, setRepCreateError] = useState("");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [employeeProfiles, setEmployeeProfiles] = useState<EmployeeProfile[]>([]);
  const [employeeFilter, setEmployeeFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [slotAction, setSlotAction] = useState<SlotActionState | null>(null);
  const [slotActionBusy, setSlotActionBusy] = useState(false);
  const [slotActionMessage, setSlotActionMessage] = useState("");
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
      baseSettings[day.dateKey] = defaultDaySettings(day.dateKey);
    });
    setDaySettings(baseSettings);
  }, [currentMonth]);

  useEffect(() => {
    const loadPeople = async () => {
      try {
        const [usersResponse, employeesResponse] = await Promise.all([
          fetch("/api/admin/users?active=1", { cache: "no-store" }),
          fetch("/api/admin/employees?all=1", { cache: "no-store" })
        ]);

        const usersPayload = (await usersResponse.json()) as UsersResponse;
        if (!usersResponse.ok) {
          return;
        }

        const employeesPayload = (await employeesResponse.json()) as EmployeesResponse;
        if (!employeesResponse.ok) {
          setUsers(usersPayload.items || []);
          return;
        }

        setUsers(usersPayload.items || []);
        setEmployeeProfiles(
          (employeesPayload.items || []).filter((item) => item.isActive !== false)
        );
      } catch (fetchError) {
        console.error(fetchError);
      }
    };

    loadPeople();
  }, []);

  const employeeOptions = useMemo(
    () => users.filter((user) => user.role === "employee" || user.role === "admin" || user.role === "owner"),
    [users]
  );

  const userById = useMemo(() => {
    const map = new Map<string, AdminUser>();
    users.forEach((user) => {
      map.set(user.id, user);
    });
    return map;
  }, [users]);

  const employeeByEmail = useMemo(() => {
    const map = new Map<string, EmployeeProfile>();
    employeeProfiles.forEach((profile) => {
      if (!profile.email) {
        return;
      }
      map.set(profile.email.trim().toLowerCase(), profile);
    });
    return map;
  }, [employeeProfiles]);

  const matchesUnavailabilityToUser = useCallback(
    (item: UnavailabilityItem, userId: string) => {
      if (item.created_by_user_id && item.created_by_user_id === userId) {
        return true;
      }
      const user = userById.get(userId);
      if (!user) {
        return false;
      }
      const userEmail = user.email?.trim().toLowerCase() || "";
      const employeeProfile = userEmail ? employeeByEmail.get(userEmail) : null;
      if (employeeProfile?.id && item.employee_id && employeeProfile.id === item.employee_id) {
        return true;
      }
      if (!user?.email || !item.employee_email) {
        return false;
      }
      return user.email.trim().toLowerCase() === item.employee_email.trim().toLowerCase();
    },
    [employeeByEmail, userById]
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

  const visibleUnavailability = useMemo(() => {
    if (employeeFilter === "all") {
      return [] as UnavailabilityItem[];
    }
    return unavailability.filter((item) => matchesUnavailabilityToUser(item, employeeFilter));
  }, [employeeFilter, matchesUnavailabilityToUser, unavailability]);

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
      setUnavailability(payload.unavailability || []);
      setRepTasks(payload.repTasks || []);
      setDaySettings((current) => {
        const next = { ...current };
        payload.overrides?.forEach((override) => {
          if (!override.date) {
            return;
          }
          const currentSettings = next[override.date] ?? defaultDaySettings(override.date);
          const weekend = isWeekendDateKey(override.date);
          next[override.date] = {
            openSlotsCount:
              weekend
                ? 0
                : typeof override.open_slots_count === "number"
                  ? override.open_slots_count
                  : currentSettings.openSlotsCount,
            showOnAcutePage:
              weekend
                ? false
                : typeof override.show_on_acute_page === "boolean"
                  ? override.show_on_acute_page
                  : currentSettings.showOnAcutePage,
            note: override.note || "",
            blockedSlotIndices: weekend ? [] : Array.isArray(override.blocked_slot_indices) ? override.blocked_slot_indices : []
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
        ...(current[dateKey] || defaultDaySettings(dateKey)),
        ...patch
      }
    }));
  };

  const saveSelectedDay = async () => {
    if (!selectedDateKey) {
      return;
    }

    const settings = daySettings[selectedDateKey] || defaultDaySettings(selectedDateKey);
    setSaveMessage("Gemmer...");

    try {
      const response = await fetch("/api/admin/day-overrides", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDateKey,
          open_slots_count: settings.openSlotsCount,
          show_on_acute_page: settings.showOnAcutePage,
          note: settings.note.trim() ? settings.note.trim() : null,
          blocked_slot_indices: settings.blockedSlotIndices
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

  const openCreateBookingForSlot = (dateKey: string, slotLabel: string) => {
    const query = new URLSearchParams({
      date: dateKey,
      startSlot: slotLabel,
      slotCount: "1"
    });
    router.push(`/admin/bookings/new?${query.toString()}`);
  };

  const closeSlotByOverride = async (dateKey: string, slotIndex: number, slotLabel: string) => {
    const currentSettings = daySettings[dateKey] || defaultDaySettings(dateKey);
    const currentBlocked = Array.isArray(currentSettings.blockedSlotIndices) ? currentSettings.blockedSlotIndices : [];

    if (currentBlocked.includes(slotIndex)) {
      setSlotActionMessage("Tiden er allerede lukket.");
      return;
    }

    const nextBlocked = Array.from(new Set([...currentBlocked, slotIndex])).sort();

    setSlotActionBusy(true);
    setSlotActionMessage("");

    try {
      const response = await fetch("/api/admin/day-overrides", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: dateKey,
          open_slots_count: currentSettings.openSlotsCount,
          show_on_acute_page: currentSettings.showOnAcutePage,
          note: currentSettings.note.trim() ? currentSettings.note.trim() : null,
          blocked_slot_indices: nextBlocked
        })
      });

      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        setSlotActionMessage(payload.message || "Kunne ikke lukke tiden.");
        return;
      }

      updateDaySettings(dateKey, { blockedSlotIndices: nextBlocked });
      setSaveMessage(`Tid ${slotLabel} lukket.`);
      setTimeout(() => setSaveMessage(""), 1500);
      setSlotAction(null);
    } catch (closeError) {
      console.error(closeError);
      setSlotActionMessage("Netværksfejl ved lukning af tid.");
    } finally {
      setSlotActionBusy(false);
    }
  };

  const reopenSlotByOverride = async (dateKey: string, slotIndex: number, slotLabel: string) => {
    const currentSettings = daySettings[dateKey] || defaultDaySettings(dateKey);
    const currentBlocked = Array.isArray(currentSettings.blockedSlotIndices) ? currentSettings.blockedSlotIndices : [];

    if (!currentBlocked.includes(slotIndex)) {
      setSlotActionMessage("Tiden er ikke lukket.");
      return;
    }

    const nextBlocked = currentBlocked.filter((idx) => idx !== slotIndex);

    setSlotActionBusy(true);
    setSlotActionMessage("");

    try {
      const response = await fetch("/api/admin/day-overrides", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: dateKey,
          open_slots_count: currentSettings.openSlotsCount,
          show_on_acute_page: currentSettings.showOnAcutePage,
          note: currentSettings.note.trim() ? currentSettings.note.trim() : null,
          blocked_slot_indices: nextBlocked
        })
      });

      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        setSlotActionMessage(payload.message || "Kunne ikke genåbne tiden.");
        return;
      }

      updateDaySettings(dateKey, { blockedSlotIndices: nextBlocked });
      setSaveMessage(`Tid ${slotLabel} genåbnet.`);
      setTimeout(() => setSaveMessage(""), 1500);
      setSlotAction(null);
    } catch (closeError) {
      console.error(closeError);
      setSlotActionMessage("Netværksfejl ved genåbning af tid.");
    } finally {
      setSlotActionBusy(false);
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

  const repTasksByDate = useMemo(() => {
    const map: Record<string, RepTaskItem[]> = {};
    repTasks.forEach((task) => {
      if (!task.start_at) {
        return;
      }
      const dateKey = task.start_at.slice(0, 10);
      if (!map[dateKey]) {
        map[dateKey] = [];
      }
      map[dateKey].push(task);
    });
    return map;
  }, [repTasks]);

  const createRepTask = async (dateKey: string) => {
    if (!repCreateTitle.trim()) {
      setRepCreateError("Titel er påkrævet.");
      return;
    }
    setRepCreateBusy(true);
    setRepCreateError("");
    try {
      const response = await fetch("/api/admin/rep-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: repCreateTitle.trim(),
          date: dateKey,
          notes: repCreateNotes.trim() || null,
          assignedEmployeeId: repCreateEmployee || null
        })
      });
      let payload: { id?: string; message?: string } = {};
      try {
        payload = (await response.json()) as { id?: string; message?: string };
      } catch {
        setRepCreateError(`Serverfejl (${response.status}).`);
        setRepCreateBusy(false);
        return;
      }
      if (!response.ok || !payload.id) {
        setRepCreateError(payload.message || "Kunne ikke oprette rep-opgave.");
        setRepCreateBusy(false);
        return;
      }
      const employeeName = repCreateEmployee
        ? (employeeOptions.find((u) => u.id === repCreateEmployee)?.name ?? null)
        : null;
      setRepTasks((current) => [
        ...current,
        {
          id: payload.id!,
          title: repCreateTitle.trim(),
          notes: repCreateNotes.trim() || null,
          start_at: `${dateKey}T07:00:00.000Z`,
          assigned_employee_id: repCreateEmployee || null,
          employee_name: employeeName
        }
      ]);
      setRepCreateTitle("");
      setRepCreateNotes("");
      setRepCreateEmployee("");
    } catch (err) {
      console.error(err);
      setRepCreateError("Netværksfejl.");
    } finally {
      setRepCreateBusy(false);
    }
  };

  const deleteRepTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/admin/rep-tasks?id=${encodeURIComponent(taskId)}`, {
        method: "DELETE"
      });
      if (!response.ok) {
        return;
      }
      setRepTasks((current) => current.filter((t) => t.id !== taskId));
    } catch (err) {
      console.error(err);
    }
  };

  const errorIsMissingTable =
    error.toLowerCase().includes("day_overrides") ||
    error.toLowerCase().includes("employee_unavailability") ||
    error.toLowerCase().includes("mangler i databasen");

  const selectedSettings = selectedDateKey ? daySettings[selectedDateKey] || defaultDaySettings(selectedDateKey) : null;
  const selectedBookings = selectedDateKey ? visibleBookingsByDate[selectedDateKey] || [] : [];
  const selectedDateLabel = selectedDateKey
    ? new Date(`${selectedDateKey}T12:00:00`).toLocaleDateString("da-DK", {
        weekday: "long",
        day: "numeric",
        month: "long"
      })
    : "";

  const selectedDayRangeMs = useMemo(() => {
    if (!selectedDateKey) {
      return null;
    }
    const startMs = combineDateTimeToMs(selectedDateKey, "00:00");
    const endMs = combineDateTimeToMs(selectedDateKey, "23:59");
    if (startMs === null || endMs === null) {
      return null;
    }
    return { startMs, endMs };
  }, [selectedDateKey]);

  const getSlotAbsenceForDay = useCallback(
    (dateKey: string, slotIndex: number) => {
      if (employeeFilter === "all") {
        return null;
      }
      const slotRange = SLOT_RANGES[slotIndex];
      if (!slotRange) {
        return null;
      }
      const slotStartMs = combineDateTimeToMs(dateKey, slotRange.start);
      const slotEndMs = combineDateTimeToMs(dateKey, slotRange.end);
      if (slotStartMs === null || slotEndMs === null) {
        return null;
      }

      for (const item of visibleUnavailability) {
        const startMs = parseIsoToMs(item.start_at);
        const endMs = parseIsoToMs(item.end_at);
        if (startMs === null || endMs === null) {
          continue;
        }
        if (overlaps(startMs, endMs, slotStartMs, slotEndMs)) {
          return item;
        }
      }
      return null;
    },
    [employeeFilter, visibleUnavailability]
  );

  const employeeSchedule = useMemo(() => {
    if (!selectedDateKey || !selectedDayRangeMs) {
      return [];
    }
    return employeeOptions.map((user) => ({
      user,
      items: (bookingsByDate[selectedDateKey] || []).filter((booking) => booking.assigned_to === user.id),
      absences: unavailability.filter((item) => {
        if (!matchesUnavailabilityToUser(item, user.id)) {
          return false;
        }
        const startMs = parseIsoToMs(item.start_at);
        const endMs = parseIsoToMs(item.end_at);
        if (startMs === null || endMs === null) {
          return false;
        }
        return overlaps(startMs, endMs, selectedDayRangeMs.startMs, selectedDayRangeMs.endMs);
      })
    }));
  }, [bookingsByDate, employeeOptions, matchesUnavailabilityToUser, selectedDateKey, selectedDayRangeMs, unavailability]);

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
            <button
              type="button"
              onClick={() => {
                if (selectedDateKey) {
                  dayDetailRef.current?.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-800 hover:bg-amber-100"
            >
              🔧 Opret rep-opgave
            </button>
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
                Kør migrationen: <code>supabase/migrations/20260208000009_day_overrides.sql</code> og{" "}
                <code>supabase/migrations/20260304000090_employee_unavailability.sql</code>
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
            {employeeFilter !== "all" ? (
              <button
                type="button"
                onClick={() => setEmployeeFilter("all")}
                className="rounded-md border border-border bg-white px-2 py-1 text-xs text-muted-foreground"
              >
                Vis alle
              </button>
            ) : null}
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
            const isWeekend = isWeekendDateKey(day.dateKey);
            const settings = daySettings[day.dateKey] || defaultDaySettings(day.dateKey);
            const dayBookingsAll = bookingsByDate[day.dateKey] || [];
            const dayBookingsForSlots = employeeFilter === "all" ? dayBookingsAll : visibleBookingsByDate[day.dateKey] || [];
            const blocked = computeBlockedSlots(dayBookingsForSlots);
            const openSlots = settings.openSlotsCount;
            const bookedCount = Math.min(openSlots, blocked.size);
            const remaining = Math.max(0, openSlots - bookedCount);
            const isSelected = selectedDateKey === day.dateKey;

            return (
              <div
                key={day.dateKey}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedDateKey(day.dateKey)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelectedDateKey(day.dateKey);
                  }
                }}
                className={`min-h-[120px] cursor-pointer rounded-xl border px-2 py-2 text-left transition ${
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
                  <div className="grid grid-cols-3 gap-1.5">
                    {[0, 1, 2].map((slotIndex) => {
                      const slotLabel = SLOT_TIMES[slotIndex] || `${slotIndex + 1}`;
                      const slotBooking = getBookingForSlot(dayBookingsForSlots, slotIndex);
                      const slotAbsence = getSlotAbsenceForDay(day.dateKey, slotIndex);
                      const blockedList = Array.isArray(settings.blockedSlotIndices) ? settings.blockedSlotIndices : [];
                      const slotOpenByOverride = slotIndex < openSlots && !blockedList.includes(slotIndex);
                      const slotAvailable = slotOpenByOverride && !slotBooking && !slotAbsence;
                      const isRed = !slotAvailable;
                      const absenceSummary = slotAbsence
                        ? `${UNAVAILABILITY_LABELS[slotAbsence.type || "personal"] || "Fravær"} (${formatAbsenceRange(slotAbsence.start_at, slotAbsence.end_at)})`
                        : null;

                      return (
                        <button
                          key={`${day.dateKey}-slot-${slotIndex}`}
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setSlotActionMessage("");
                          setSlotAction({
                            dateKey: day.dateKey,
                            slotIndex,
                            slotLabel,
                            bookingId: slotBooking?.id || null,
                            slotOpenByOverride,
                            absenceSummary,
                            isWeekend
                          });
                        }}
                          className={`rounded-md border px-1.5 py-2 text-center text-[10px] font-semibold ${
                            isRed
                              ? "border-red-200 bg-red-50 text-red-700"
                              : "border-emerald-200 bg-emerald-50 text-emerald-700"
                          }`}
                          title={
                            slotBooking
                              ? `Optaget: ${slotLabel} (klik for valg)`
                              : isWeekend
                                ? `Weekend lukket: ${slotLabel}`
                              : slotAbsence
                                ? `Fravær: ${slotLabel} (klik for valg)`
                              : slotOpenByOverride
                                ? `Ledig: ${slotLabel} (klik for valg)`
                                : `Ikke ledig: ${slotLabel} (klik for valg)`
                          }
                        >
                          <div>{slotLabel}</div>
                        </button>
                      );
                    })}
                  </div>
                  {(repTasksByDate[day.dateKey] || []).length > 0 ? (
                    <div className="mt-1 space-y-0.5">
                      {(repTasksByDate[day.dateKey] || []).map((task) => (
                        <div
                          key={task.id}
                          className="truncate rounded px-1 py-0.5 text-[9px] font-semibold bg-amber-50 text-amber-800 border border-amber-200"
                          title={`Rep: ${task.title || "Vedligehold"}${task.employee_name ? ` · ${task.employee_name}` : ""}`}
                        >
                          🔧 {task.title || "Rep"}
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
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
                      disabled={isWeekendDateKey(selectedDateKey) && count > 0}
                      className={`rounded-full border px-3 py-1 text-xs ${
                        selectedSettings.openSlotsCount === count
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground"
                      } ${isWeekendDateKey(selectedDateKey) && count > 0 ? "cursor-not-allowed opacity-50" : ""}`}
                    >
                      {count === 0 ? "Lukket" : `${count} slots`}
                    </button>
                  ))}
                </div>
                {isWeekendDateKey(selectedDateKey) ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Lørdag og søndag er altid lukket.
                  </p>
                ) : null}
              </div>

              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground">Vis på akutte tider</p>
                <label className="mt-2 flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedSettings.showOnAcutePage}
                    disabled={isWeekendDateKey(selectedDateKey)}
                    onChange={(event) =>
                      updateDaySettings(selectedDateKey, { showOnAcutePage: event.target.checked })
                    }
                  />
                  {selectedSettings.showOnAcutePage ? "Ja" : "Nej"}
                </label>
                {isWeekendDateKey(selectedDateKey) ? (
                  <p className="mt-1 text-xs text-muted-foreground">Weekend vises aldrig på akutte tider.</p>
                ) : null}
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
              {selectedBookings.length === 0
                ? "Ingen bookinger"
                : `${selectedBookings.length} booking${selectedBookings.length === 1 ? "" : "er"}`}
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
              <h3 className="text-sm font-semibold text-foreground">Rep-opgaver denne dag</h3>
              <p className="text-xs text-muted-foreground">Let slib og olie / vedligeholdelse – optager ikke et slot.</p>

              {(repTasksByDate[selectedDateKey] || []).length > 0 ? (
                <div className="mt-3 space-y-2">
                  {(repTasksByDate[selectedDateKey] || []).map((task) => (
                    <div key={task.id} className="flex items-start justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
                      <div>
                        <p className="text-sm font-semibold text-amber-900">{task.title || "Rep-opgave"}</p>
                        {task.employee_name ? (
                          <p className="text-xs text-amber-700">{task.employee_name}</p>
                        ) : null}
                        {task.notes ? (
                          <p className="text-xs text-amber-700">{task.notes}</p>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteRepTask(task.id)}
                        className="shrink-0 rounded border border-amber-300 bg-white px-2 py-0.5 text-[11px] text-amber-800 hover:bg-red-50"
                        title="Slet rep-opgave"
                      >
                        Slet
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-xs text-muted-foreground">Ingen rep-opgaver denne dag.</p>
              )}

              <div className="mt-4 space-y-2 rounded-xl border border-amber-100 bg-amber-50/60 p-3">
                <p className="text-xs font-semibold uppercase text-amber-800">Tilføj rep-opgave</p>
                <input
                  value={repCreateTitle}
                  onChange={(e) => setRepCreateTitle(e.target.value)}
                  placeholder="Titel (fx let slib og olie)"
                  className="h-9 w-full rounded-md border border-border bg-white px-2 text-sm"
                />
                <input
                  value={repCreateNotes}
                  onChange={(e) => setRepCreateNotes(e.target.value)}
                  placeholder="Note (valgfri)"
                  className="h-9 w-full rounded-md border border-border bg-white px-2 text-sm"
                />
                <select
                  value={repCreateEmployee}
                  onChange={(e) => setRepCreateEmployee(e.target.value)}
                  className="h-9 w-full rounded-md border border-border bg-white px-2 text-sm"
                >
                  <option value="">Medarbejder (valgfri)</option>
                  {employeeOptions.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name || user.email}
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-3">
                  <Button size="sm" disabled={repCreateBusy} onClick={() => createRepTask(selectedDateKey)}>
                    {repCreateBusy ? "Opretter..." : "Opret rep-opgave"}
                  </Button>
                  {repCreateError ? <span className="text-xs text-red-600">{repCreateError}</span> : null}
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-border/60 pt-4">
              <h3 className="text-sm font-semibold text-foreground">Medarbejder-oversigt (valgt dag)</h3>
              <p className="text-xs text-muted-foreground">
                Klik på en medarbejder for at vise deres kalender og opgaver.
              </p>
              <div className="mt-3 space-y-3">
                {employeeSchedule.map(({ user, items, absences }) => (
                  <div
                    key={user.id}
                    className={`rounded-lg border bg-white p-3 ${
                      employeeFilter === user.id ? "border-primary/70 bg-primary/5" : "border-border/60"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">{user.name || user.email || "Medarbejder"}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {items.length} opgave{items.length === 1 ? "" : "r"} · {absences.length} fravær
                        </span>
                        <button
                          type="button"
                          onClick={() => setEmployeeFilter((current) => (current === user.id ? "all" : user.id))}
                          className="rounded-md border border-border bg-white px-2 py-1 text-xs font-medium text-foreground"
                        >
                          {employeeFilter === user.id ? "Vis alle" : "Vis kalender"}
                        </button>
                      </div>
                    </div>
                    {items.length === 0 && absences.length === 0 ? (
                      <p className="mt-2 text-xs text-muted-foreground">Ingen opgaver eller fravær denne dag.</p>
                    ) : null}
                    {absences.length > 0 ? (
                      <div className="mt-2 space-y-2">
                        {absences.map((item) => {
                          const absenceType = item.type || "personal";
                          return (
                            <div key={item.id} className="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs">
                              <p className="font-semibold text-red-700">
                                {UNAVAILABILITY_LABELS[absenceType] || "Fravær"} · {formatAbsenceRange(item.start_at, item.end_at)}
                              </p>
                              {item.note ? <p className="text-[11px] text-red-600">{item.note}</p> : null}
                            </div>
                          );
                        })}
                      </div>
                    ) : null}
                    {items.length > 0 ? (
                      <div className="mt-2 space-y-2">
                        {items.map((booking) => (
                          <Link
                            key={booking.id}
                            href={`/admin/bookings/${booking.id}`}
                            className="block rounded-md bg-[#f6f9ff] px-2 py-1 text-xs hover:bg-[#eaf1ff]"
                          >
                            <p className="font-semibold text-foreground">
                              {formatSlotLabel(booking)} · {booking.customer_name || "Ukendt"}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {booking.postal_code || booking.address || "Postnr. mangler"}
                            </p>
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {slotAction ? (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/30 p-4 md:items-center">
          <div className="w-full max-w-md rounded-2xl border border-border bg-white p-5 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase text-muted-foreground">Tidspunkt</p>
                <h3 className="text-lg font-semibold text-foreground">
                  {new Date(`${slotAction.dateKey}T12:00:00`).toLocaleDateString("da-DK", {
                    weekday: "short",
                    day: "numeric",
                    month: "long"
                  })}{" "}
                  · {slotAction.slotLabel}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSlotAction(null)}
                className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground"
              >
                Luk
              </button>
            </div>

            <div className="mt-4 space-y-2">
              {slotAction.bookingId ? (
                <Button
                  className="w-full"
                  onClick={() => {
                    const bookingId = slotAction.bookingId;
                    setSlotAction(null);
                    if (bookingId) {
                      router.push(`/admin/bookings/${bookingId}`);
                    }
                  }}
                >
                  Åbn eksisterende opgave
                </Button>
              ) : (
                <>
                  {slotAction.isWeekend ? (
                    <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                      Lørdag og søndag er permanent lukket.
                    </p>
                  ) : null}
                  {slotAction.absenceSummary ? (
                    <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                      Registreret fravær: {slotAction.absenceSummary}
                    </p>
                  ) : null}
                  <Button
                    className="w-full"
                    disabled={slotAction.isWeekend}
                    onClick={() => {
                      const { dateKey, slotLabel } = slotAction;
                      setSlotAction(null);
                      openCreateBookingForSlot(dateKey, slotLabel);
                    }}
                  >
                    Tilføj ny opgave
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"
                    onClick={() => {
                      const { dateKey } = slotAction;
                      setSlotAction(null);
                      setSelectedDateKey(dateKey);
                      setTimeout(() => dayDetailRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
                    }}
                  >
                    🔧 Opret rep-opgave
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    disabled={slotAction.isWeekend || !slotAction.slotOpenByOverride || slotActionBusy}
                    onClick={() =>
                      closeSlotByOverride(slotAction.dateKey, slotAction.slotIndex, slotAction.slotLabel)
                    }
                  >
                    {slotActionBusy ? "Lukker tid..." : "Luk tid"}
                  </Button>
                  {!slotAction.isWeekend && !slotAction.slotOpenByOverride ? (
                    <>
                      <Button
                        variant="outline"
                        className="w-full border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        disabled={slotActionBusy}
                        onClick={() =>
                          reopenSlotByOverride(slotAction.dateKey, slotAction.slotIndex, slotAction.slotLabel)
                        }
                      >
                        {slotActionBusy ? "Genåbner tid..." : "Genåbn tid"}
                      </Button>
                      <p className="text-xs text-muted-foreground">Denne tid er lukket.</p>
                    </>
                  ) : null}
                </>
              )}
            </div>

            {slotActionMessage ? <p className="mt-3 text-xs text-red-600">{slotActionMessage}</p> : null}
          </div>
        </div>
      ) : null}
    </section>
  );
};
