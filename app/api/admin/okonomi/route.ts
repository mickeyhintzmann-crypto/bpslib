import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

const COMPLETED_STATUSES = new Set(["done", "invoiced", "closed"]);
const SLOT_STARTS = ["08:00", "11:00", "13:30"] as const;

const dateKeyRegex = /^\d{4}-\d{2}-\d{2}$/;

const toDateKey = (date: Date) => {
  const year = date.getUTCFullYear();
  const month = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  const day = `${date.getUTCDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const addDays = (dateKey: string, delta: number) => {
  if (!dateKeyRegex.test(dateKey)) {
    return null;
  }
  const date = new Date(`${dateKey}T12:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  date.setUTCDate(date.getUTCDate() + delta);
  return toDateKey(date);
};

const startOfWeek = (date: Date) => {
  const day = date.getUTCDay();
  const diff = (day + 6) % 7;
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 12, 0, 0));
  start.setUTCDate(start.getUTCDate() - diff);
  return start;
};

const startOfMonth = (date: Date) => {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1, 12, 0, 0));
};

const startOfQuarter = (date: Date) => {
  const quarter = Math.floor(date.getUTCMonth() / 3);
  return new Date(Date.UTC(date.getUTCFullYear(), quarter * 3, 1, 12, 0, 0));
};

const isActiveStatus = (status: string | null) =>
  !status || (status.toLowerCase() !== "cancelled" && status.toLowerCase() !== "annulleret");

const buildCsv = (rows: Array<Record<string, string | number | null>>) => {
  if (rows.length === 0) {
    return "";
  }
  const headers = Object.keys(rows[0]);
  const escapeCell = (value: string | number | null) => {
    if (value === null || value === undefined) {
      return "";
    }
    const raw = String(value);
    if (raw.includes(",") || raw.includes("\"") || raw.includes("\n")) {
      return `"${raw.replace(/\"/g, "\"\"")}"`;
    }
    return raw;
  };
  const lines = [headers.join(",")];
  rows.forEach((row) => {
    lines.push(headers.map((key) => escapeCell(row[key])).join(","));
  });
  return lines.join("\n");
};

export async function GET(request: Request) {
  const { error: authError } = requireAdmin(request, ["owner", "viewer"]);
  if (authError) {
    return authError;
  }

  const url = new URL(request.url);
  const format = url.searchParams.get("format");

  const supabase = createSupabaseServiceClient();

  const now = new Date();
  const weekStart = startOfWeek(now);
  const monthStart = startOfMonth(now);
  const quarterStart = startOfQuarter(now);

  const weekStartKey = toDateKey(weekStart);
  const monthStartKey = toDateKey(monthStart);
  const quarterStartKey = toDateKey(quarterStart);

  const { data: bookings, error: bookingsError } = await supabase
    .from("bookings")
    .select(
      "id, created_at, status, source, service_type, customer_name, customer_phone, postal_code, date, start_slot_index, slot_count, price_total"
    )
    .gte("date", quarterStartKey);

  if (bookingsError) {
    return NextResponse.json({ message: bookingsError.message }, { status: 500 });
  }

  const completedPrices: number[] = [];
  let revenueWeek = 0;
  let revenueMonth = 0;
  let revenueQuarter = 0;
  let bookingsMonth = 0;
  let acuteCount = 0;

  (bookings || []).forEach((booking) => {
    const price = booking.price_total || 0;
    const status = booking.status || "";
    const bookingDate = booking.date || "";
    if (booking.source === "acute" && bookingDate >= monthStartKey) {
      acuteCount += 1;
    }

    if (bookingDate >= monthStartKey) {
      bookingsMonth += 1;
    }

    if (!COMPLETED_STATUSES.has(status)) {
      return;
    }

    if (price > 0) {
      completedPrices.push(price);
    }
    if (bookingDate >= weekStartKey) {
      revenueWeek += price;
    }
    if (bookingDate >= monthStartKey) {
      revenueMonth += price;
    }
    revenueQuarter += price;
  });

  const bookingsTotal = bookings?.length || 0;
  const aov = completedPrices.length
    ? Math.round(completedPrices.reduce((sum, value) => sum + value, 0) / completedPrices.length)
    : 0;
  const median = (() => {
    if (completedPrices.length === 0) {
      return 0;
    }
    const sorted = [...completedPrices].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    if (sorted.length % 2 === 0) {
      return Math.round((sorted[mid - 1] + sorted[mid]) / 2);
    }
    return sorted[mid];
  })();

  const { count: estimatorTotal } = await supabase
    .from("estimator_requests")
    .select("id", { count: "exact", head: true });
  const { count: estimatorBooked } = await supabase
    .from("estimator_requests")
    .select("id", { count: "exact", head: true })
    .not("booking_id", "is", null);
  const conversionRate = estimatorTotal && estimatorTotal > 0
    ? Math.round(((estimatorBooked || 0) / estimatorTotal) * 100)
    : 0;

  const todayKey = toDateKey(now);
  const endKey = addDays(todayKey, 6) || todayKey;
  const endExclusive = addDays(todayKey, 7) || endKey;

  const { data: overrides } = await supabase
    .from("day_overrides")
    .select("date, open_slots_count")
    .gte("date", todayKey)
    .lte("date", endKey);

  const { data: upcomingBookings } = await supabase
    .from("bookings")
    .select("date, start_slot_index, slot_count, status")
    .gte("date", todayKey)
    .lt("date", endExclusive);

  const overrideMap = new Map<string, number>();
  (overrides || []).forEach((row) => {
    if (typeof row.open_slots_count === "number") {
      overrideMap.set(row.date, row.open_slots_count);
    }
  });

  const dateKeys: string[] = [];
  for (let i = 0; i < 7; i += 1) {
    const key = addDays(todayKey, i);
    if (key) {
      dateKeys.push(key);
    }
  }

  let totalSlots = 0;
  dateKeys.forEach((key) => {
    totalSlots += overrideMap.get(key) ?? 3;
  });

  let filledSlots = 0;
  (upcomingBookings || []).forEach((booking) => {
    if (!isActiveStatus(booking.status)) {
      return;
    }
    const count = typeof booking.slot_count === "number" ? booking.slot_count : 1;
    filledSlots += count;
  });

  const occupancyPercent = totalSlots > 0 ? Math.round((filledSlots / totalSlots) * 100) : 0;

  if (format === "csv") {
    const rows =
      (bookings || []).map((booking) => ({
        id: booking.id,
        date: booking.date || "",
        start_time:
          typeof booking.start_slot_index === "number" && SLOT_STARTS[booking.start_slot_index]
            ? SLOT_STARTS[booking.start_slot_index]
            : "",
        slot_count: typeof booking.slot_count === "number" ? booking.slot_count : null,
        service: booking.service_type,
        source: booking.source,
        status: booking.status,
        price_total: booking.price_total,
        name: booking.customer_name,
        phone: booking.customer_phone,
        postal_code: booking.postal_code
      })) || [];

    const csv = buildCsv(rows);
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "attachment; filename=\"bpslib-okonomi.csv\""
      }
    });
  }

  return NextResponse.json(
    {
      summary: {
        revenueWeek,
        revenueMonth,
        revenueQuarter,
        bookingsTotal,
        bookingsMonth,
        aov,
        median,
        conversionRate,
        occupancyPercent,
        acuteCount
      }
    },
    { status: 200 }
  );
}
