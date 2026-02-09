import {
  SLOT_TIMES,
  slotRange,
  type SlotTime
} from "@/lib/booking-schedule";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

type DayOverrideRow = {
  date: string;
  open_slots_count: number | null;
  show_on_acute_page: boolean | null;
  note: string | null;
};

type BookingRow = {
  id: string;
  slot_start: string;
  slot_end: string;
  status: string | null;
};

export type AvailabilityStartSlot = {
  startSlotIndex: number;
  startTime: SlotTime;
  label: string;
};

export type AvailabilityDay = {
  date: string;
  dateLabel: string;
  availableStartSlots: AvailabilityStartSlot[];
  openSlotCount: number;
  blockedSlotCount: number;
  remainingSlotCount: number;
};

export type AvailabilityResult = {
  from: string;
  days: number;
  slotCount: number;
  items: AvailabilityDay[];
};

const SLOT_END_TIMES = ["11:00", "13:30", "16:00"] as const;

const dateKeyRegex = /^\d{4}-\d{2}-\d{2}$/;

const toDateKey = (date: Date) => {
  const year = date.getUTCFullYear();
  const month = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  const day = `${date.getUTCDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseDateKey = (dateKey: string) => {
  if (!dateKeyRegex.test(dateKey)) {
    return null;
  }
  const date = new Date(`${dateKey}T12:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date;
};

const addDays = (dateKey: string, delta: number) => {
  const date = parseDateKey(dateKey);
  if (!date) {
    return null;
  }
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + delta);
  return toDateKey(next);
};

const formatDateLabel = (dateKey: string) => {
  const date = parseDateKey(dateKey);
  if (!date) {
    return dateKey;
  }
  return new Intl.DateTimeFormat("da-DK", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit"
  }).format(date);
};

const timeToMinutes = (timeValue: string | null) => {
  if (!timeValue) {
    return null;
  }
  const normalized = timeValue.slice(0, 5);
  if (!/^\d{2}:\d{2}$/.test(normalized)) {
    return null;
  }
  const [hoursRaw, minutesRaw] = normalized.split(":");
  const hours = Number.parseInt(hoursRaw, 10);
  const minutes = Number.parseInt(minutesRaw, 10);
  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) {
    return null;
  }
  return hours * 60 + minutes;
};

const baseOpenSlotIndexes = (dateKey: string) => {
  const date = parseDateKey(dateKey);
  if (!date) {
    return [0, 1, 2];
  }

  const weekday = date.getUTCDay();
  if (weekday === 0) {
    return [0];
  }
  if (weekday === 6) {
    return [0, 1];
  }
  return [0, 1, 2];
};

const activeStatus = (status: string | null) =>
  !status || (status.toLowerCase() !== "cancelled" && status.toLowerCase() !== "annulleret");

const createUtcDate = (dateKey: string, timeValue: string) => {
  return new Date(`${dateKey}T${timeValue}:00.000Z`);
};

const findBlockedSlotIndexes = (dateKey: string, bookings: BookingRow[]) => {
  const blocked = new Set<number>();

  bookings.forEach((booking) => {
    if (!activeStatus(booking.status)) {
      return;
    }

    const bookingStart = new Date(booking.slot_start);
    const bookingEnd = new Date(booking.slot_end);

    if (Number.isNaN(bookingStart.getTime()) || Number.isNaN(bookingEnd.getTime())) {
      return;
    }

    SLOT_TIMES.forEach((time, index) => {
      const slotStart = createUtcDate(dateKey, time);
      const slotEnd = createUtcDate(dateKey, SLOT_END_TIMES[index]);
      const overlaps = bookingStart < slotEnd && bookingEnd > slotStart;
      if (overlaps) {
        blocked.add(index);
      }
    });
  });

  return blocked;
};

const normalizeOpenSlotsCount = (value: number | null | undefined) => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return null;
  }
  const rounded = Math.round(value);
  if (rounded < 0 || rounded > 3) {
    return null;
  }
  return rounded;
};

const openIndexesForOverride = (
  defaultOpenIndexes: number[],
  override: DayOverrideRow | undefined,
  respectAcuteVisibility: boolean
) => {
  let openIndexes = new Set(defaultOpenIndexes);

  if (override) {
    const openSlotsCount = normalizeOpenSlotsCount(override.open_slots_count);
    if (openSlotsCount !== null) {
      openIndexes = new Set(Array.from({ length: openSlotsCount }, (_, index) => index));
    }

    if (respectAcuteVisibility && override.show_on_acute_page === false) {
      openIndexes = new Set();
    }
  }

  return openIndexes;
};

const buildValidStartSlots = (
  openIndexes: Set<number>,
  blockedIndexes: Set<number>,
  slotCount: number
): AvailabilityStartSlot[] => {
  const starts: AvailabilityStartSlot[] = [];

  for (let startIndex = 0; startIndex < SLOT_TIMES.length; startIndex += 1) {
    const neededIndexes = Array.from({ length: slotCount }, (_, offset) => startIndex + offset);

    const inRange = neededIndexes.every((index) => index >= 0 && index < SLOT_TIMES.length);
    if (!inRange) {
      continue;
    }

    const allOpen = neededIndexes.every((index) => openIndexes.has(index));
    const allUnblocked = neededIndexes.every((index) => !blockedIndexes.has(index));

    if (!allOpen || !allUnblocked) {
      continue;
    }

    const startTime = SLOT_TIMES[startIndex];
    starts.push({
      startSlotIndex: startIndex,
      startTime,
      label: slotRange(startTime, slotCount).join(" + ")
    });
  }

  return starts;
};

const buildDateList = (from: string, days: number) => {
  const keys: string[] = [];

  for (let index = 0; index < days; index += 1) {
    const dateKey = addDays(from, index);
    if (!dateKey) {
      break;
    }
    keys.push(dateKey);
  }

  return keys;
};

const groupBookingsByDate = (bookings: BookingRow[]) => {
  const byDate = new Map<string, BookingRow[]>();

  bookings.forEach((booking) => {
    const slotStart = new Date(booking.slot_start);
    if (Number.isNaN(slotStart.getTime())) {
      return;
    }
    const dateKey = toDateKey(slotStart);
    const current = byDate.get(dateKey) || [];
    current.push(booking);
    byDate.set(dateKey, current);
  });

  return byDate;
};

const isMissingRelation = (message: string | undefined, relationName: string) => {
  const normalized = (message || "").toLowerCase();
  return (
    normalized.includes(`relation \"${relationName}\" does not exist`) ||
    normalized.includes(`could not find the table 'public.${relationName}'`)
  );
};

const isMissingColumn = (message: string | undefined) => {
  const normalized = (message || "").toLowerCase();
  return normalized.includes("column") && normalized.includes("does not exist");
};

export const getAvailabilityRange = async ({
  from,
  days,
  slotCount,
  respectAcuteVisibility = false
}: {
  from: string;
  days: number;
  slotCount: number;
  respectAcuteVisibility?: boolean;
}): Promise<{ data?: AvailabilityResult; error?: string; status?: number }> => {
  const safeDays = Math.max(1, Math.min(60, days));
  const safeSlotCount = Math.max(1, Math.min(3, slotCount));

  const startDate = parseDateKey(from);
  if (!startDate) {
    return { error: "Ugyldig from-dato. Brug format YYYY-MM-DD.", status: 400 };
  }

  const toExclusive = addDays(from, safeDays);
  if (!toExclusive) {
    return { error: "Kunne ikke beregne datointerval.", status: 400 };
  }
  const lastDateInclusive = addDays(toExclusive, -1);
  if (!lastDateInclusive) {
    return { error: "Kunne ikke beregne slutdato.", status: 400 };
  }

  const supabase = createSupabaseServiceClient();

  const [overridesResult, bookingsResult] = await Promise.all([
    supabase
      .from("day_overrides")
      .select("date, open_slots_count, show_on_acute_page, note")
      .gte("date", from)
      .lte("date", lastDateInclusive),
    supabase
      .from("bookings")
      .select("id, slot_start, slot_end, status")
      .lt("slot_start", `${toExclusive}T00:00:00.000Z`)
      .gte("slot_start", `${from}T00:00:00.000Z`)
  ]);

  if (overridesResult.error) {
    if (isMissingRelation(overridesResult.error.message, "day_overrides")) {
      return {
        error:
          "Tabellen day_overrides mangler i databasen. Opret den, så availability kan tage højde for overrides.",
        status: 503
      };
    }
    if (isMissingColumn(overridesResult.error.message)) {
      return {
        error:
          "Kolonner til day_overrides mangler i databasen. Kør migrationen for day_overrides.",
        status: 503
      };
    }
    return { error: overridesResult.error.message, status: 500 };
  }

  if (bookingsResult.error) {
    if (isMissingRelation(bookingsResult.error.message, "bookings")) {
      return {
        error:
          "Tabellen bookings mangler i databasen. Opret den, før booking-konvertering kan bruges.",
        status: 503
      };
    }
    return { error: bookingsResult.error.message, status: 500 };
  }

  const overrides = (overridesResult.data || []) as DayOverrideRow[];
  const bookings = (bookingsResult.data || []) as BookingRow[];

  const overrideByDate = new Map<string, DayOverrideRow>();
  overrides.forEach((override) => overrideByDate.set(override.date, override));

  const bookingsByDate = groupBookingsByDate(bookings);
  const dateKeys = buildDateList(from, safeDays);

  const items = dateKeys.map((dateKey) => {
    const defaultOpen = baseOpenSlotIndexes(dateKey);
    const openIndexes = openIndexesForOverride(
      defaultOpen,
      overrideByDate.get(dateKey),
      respectAcuteVisibility
    );
    const blockedIndexes = findBlockedSlotIndexes(dateKey, bookingsByDate.get(dateKey) || []);

    const availableSlotIndexes = Array.from(openIndexes).filter((index) => !blockedIndexes.has(index));
    const startSlots = buildValidStartSlots(openIndexes, blockedIndexes, safeSlotCount);

    return {
      date: dateKey,
      dateLabel: formatDateLabel(dateKey),
      availableStartSlots: startSlots,
      openSlotCount: openIndexes.size,
      blockedSlotCount: Array.from(blockedIndexes).filter((index) => openIndexes.has(index)).length,
      remainingSlotCount: availableSlotIndexes.length
    };
  });

  return {
    data: {
      from,
      days: safeDays,
      slotCount: safeSlotCount,
      items
    }
  };
};

export const getSlotRangeForBooking = (
  dateKey: string,
  startSlotIndex: number,
  slotCount: number
) => {
  const safeSlotCount = Math.max(1, Math.min(3, slotCount));
  const safeStart = Math.max(0, Math.min(SLOT_TIMES.length - 1, startSlotIndex));
  const endIndex = safeStart + safeSlotCount - 1;

  if (endIndex >= SLOT_TIMES.length) {
    return null;
  }

  const startTime = SLOT_TIMES[safeStart];
  const endTime = SLOT_END_TIMES[endIndex];

  return {
    startTime,
    endTime,
    slotLabel: slotRange(startTime, safeSlotCount).join(" + "),
    slotStartIso: `${dateKey}T${startTime}:00.000Z`,
    slotEndIso: `${dateKey}T${endTime}:00.000Z`
  };
};

export const checkBookingAvailability = async ({
  date,
  startSlotIndex,
  slotCount,
  excludeBookingId
}: {
  date: string;
  startSlotIndex: number;
  slotCount: number;
  excludeBookingId?: string;
}): Promise<{
  ok: boolean;
  status?: number;
  message?: string;
  availableSlots?: AvailabilityStartSlot[];
}> => {
  const parsedDate = parseDateKey(date);
  if (!parsedDate) {
    return { ok: false, status: 400, message: "Ugyldig dato. Brug format YYYY-MM-DD." };
  }

  if (!Number.isInteger(startSlotIndex) || startSlotIndex < 0 || startSlotIndex > 2) {
    return { ok: false, status: 400, message: "Ugyldig starttid. Vælg 08:00, 11:00 eller 13:30." };
  }

  const safeSlotCount = Math.max(1, Math.min(3, slotCount));

  const toExclusive = addDays(date, 1);
  if (!toExclusive) {
    return { ok: false, status: 400, message: "Kunne ikke beregne slutdato." };
  }

  const supabase = createSupabaseServiceClient();

  const [overrideResult, bookingsResult] = await Promise.all([
    supabase.from("day_overrides").select("date, open_slots_count, show_on_acute_page, note").eq("date", date),
    supabase
      .from("bookings")
      .select("id, slot_start, slot_end, status")
      .gte("slot_start", `${date}T00:00:00.000Z`)
      .lt("slot_start", `${toExclusive}T00:00:00.000Z`)
  ]);

  if (overrideResult.error) {
    if (isMissingRelation(overrideResult.error.message, "day_overrides")) {
      return {
        ok: false,
        status: 503,
        message: "Tabellen day_overrides mangler i databasen. Opret den før booking kan flyttes."
      };
    }
    if (isMissingColumn(overrideResult.error.message)) {
      return {
        ok: false,
        status: 503,
        message:
          "Kolonner til day_overrides mangler i databasen. Kør migrationen for day_overrides."
      };
    }
    return { ok: false, status: 500, message: overrideResult.error.message };
  }

  if (bookingsResult.error) {
    if (isMissingRelation(bookingsResult.error.message, "bookings")) {
      return { ok: false, status: 503, message: "Tabellen bookings mangler i databasen." };
    }
    return { ok: false, status: 500, message: bookingsResult.error.message };
  }

  const overrideRow = Array.isArray(overrideResult.data) ? overrideResult.data[0] : null;
  const bookings = (bookingsResult.data || []) as BookingRow[];
  const filteredBookings = excludeBookingId
    ? bookings.filter((booking) => booking.id !== excludeBookingId)
    : bookings;

  const defaultOpen = baseOpenSlotIndexes(date);
  const openIndexes = openIndexesForOverride(defaultOpen, overrideRow || undefined, false);
  const blockedIndexes = findBlockedSlotIndexes(date, filteredBookings as BookingRow[]);
  const availableSlots = buildValidStartSlots(openIndexes, blockedIndexes, safeSlotCount);

  const isAvailable = availableSlots.some((slot) => slot.startSlotIndex === startSlotIndex);

  if (!isAvailable) {
    return {
      ok: false,
      status: 409,
      message: "Tiden er allerede optaget. Vælg en ny tid.",
      availableSlots
    };
  }

  return { ok: true, availableSlots };
};
