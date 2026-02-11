import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

const COPENHAGEN_TIME_ZONE = "Europe/Copenhagen";

const copenhagenDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: COPENHAGEN_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit"
});

const addDaysToDateKey = (dateKey: string, days: number) => {
  if (!dateRegex.test(dateKey)) {
    return null;
  }
  const [yearRaw, monthRaw, dayRaw] = dateKey.split("-");
  const year = Number.parseInt(yearRaw, 10);
  const month = Number.parseInt(monthRaw, 10);
  const day = Number.parseInt(dayRaw, 10);

  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return null;
  }

  const baseDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  if (Number.isNaN(baseDate.getTime())) {
    return null;
  }

  baseDate.setUTCDate(baseDate.getUTCDate() + days);
  return copenhagenDateFormatter.format(baseDate);
};

const isMissingRelation = (message: string | undefined, relationName: string) => {
  const normalized = (message || "").toLowerCase();
  return (
    normalized.includes(`relation \"${relationName}\" does not exist`) ||
    normalized.includes(`could not find the table 'public.${relationName}'`)
  );
};

const SLOT_TIMES = ["08:00", "11:00", "13:30"] as const;
const SLOT_END_TIMES = ["11:00", "13:30", "16:00"] as const;

const slotCountFromRange = (slotStart: string | null | undefined, slotEnd: string | null | undefined) => {
  const startTime = slotStart ? slotStart.slice(11, 16) : "";
  const endTime = slotEnd ? slotEnd.slice(11, 16) : "";
  const startIndex = SLOT_TIMES.indexOf(startTime as (typeof SLOT_TIMES)[number]);
  const endIndex = SLOT_END_TIMES.indexOf(endTime as (typeof SLOT_END_TIMES)[number]);
  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
    return 0;
  }
  return endIndex - startIndex + 1;
};

const isActiveBooking = (status: string | null) => {
  if (!status) {
    return true;
  }
  const normalized = status.toLowerCase();
  return normalized !== "cancelled" && normalized !== "annulleret";
};

export async function GET(request: Request) {
  try {
    const { session, error } = requireAdmin(request, ["owner", "admin", "employee", "viewer"]);
    if (error) {
      return error;
    }

    const supabase = createSupabaseServiceClient();
    const isEmployee = session?.role === "employee";

    const today = copenhagenDateFormatter.format(new Date());
    const nextWeek = addDaysToDateKey(today, 7);
    const nextMonth = addDaysToDateKey(today, 30);

    if (!nextWeek) {
      return NextResponse.json({ message: "Kunne ikke beregne datointerval." }, { status: 500 });
    }

    const bookingStart = `${today}T00:00:00.000Z`;
    const todayEndExclusive = `${addDaysToDateKey(today, 1)}T00:00:00.000Z`;
    const bookingEndExclusive = `${addDaysToDateKey(nextWeek, 1)}T00:00:00.000Z`;

    const bookingsTodayQuery = supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .gte("slot_start", bookingStart)
      .lt("slot_start", todayEndExclusive);
    const bookingsNextQuery = supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .gte("slot_start", bookingStart)
      .lt("slot_start", bookingEndExclusive);
    const upcomingBookingsQuery = supabase
      .from("bookings")
      .select("id, slot_start, customer_name, source, status, assigned_to")
      .gte("slot_start", bookingStart)
      .order("slot_start", { ascending: true })
      .limit(10);

    if (isEmployee && session?.id) {
      bookingsTodayQuery.eq("assigned_to", session.id);
      bookingsNextQuery.eq("assigned_to", session.id);
      upcomingBookingsQuery.eq("assigned_to", session.id);
    }

    const includeLeads = !isEmployee;
    const includeEstimators = !isEmployee;

    const [
      leadsNewResult,
      estimatorsNewResult,
      bookingsTodayResult,
      bookingsNextResult,
      upcomingBookingsResult,
      latestLeadsResult,
      latestEstimatorsResult
    ] = await Promise.all([
      includeLeads
        ? supabase.from("leads").select("id", { count: "exact", head: true }).eq("status", "new")
        : Promise.resolve({ data: null, count: 0, error: null }),
      includeEstimators
        ? supabase
            .from("estimator_requests")
            .select("id", { count: "exact", head: true })
            .eq("status", "Ny")
        : Promise.resolve({ data: null, count: 0, error: null }),
      bookingsTodayQuery,
      bookingsNextQuery,
      upcomingBookingsQuery,
      includeLeads
        ? supabase
            .from("leads")
            .select("id, created_at, service, name, phone, status")
            .order("created_at", { ascending: false })
            .limit(10)
        : Promise.resolve({ data: [], error: null }),
      includeEstimators
        ? supabase
            .from("estimator_requests")
            .select("id, created_at, fields, status, booking_id")
            .order("created_at", { ascending: false })
            .limit(10)
        : Promise.resolve({ data: [], error: null })
    ]);

    const errors = [
      leadsNewResult.error,
      estimatorsNewResult.error,
      bookingsTodayResult.error,
      bookingsNextResult.error,
      upcomingBookingsResult.error,
      latestLeadsResult.error,
      latestEstimatorsResult.error
    ].filter(Boolean) as { message?: string }[];

    if (errors.length > 0) {
      const firstError = errors[0];
      if (isMissingRelation(firstError.message, "leads")) {
        return NextResponse.json({ message: "Tabellen leads mangler i databasen." }, { status: 503 });
      }
      if (isMissingRelation(firstError.message, "estimator_requests")) {
        return NextResponse.json(
          { message: "Tabellen estimator_requests mangler i databasen." },
          { status: 503 }
        );
      }
      if (isMissingRelation(firstError.message, "bookings")) {
        return NextResponse.json({ message: "Tabellen bookings mangler i databasen." }, { status: 503 });
      }
      return NextResponse.json({ message: firstError.message || "Fejl i dashboard." }, { status: 500 });
    }

    const latestEstimators = (latestEstimatorsResult.data || []).map((item: any) => {
      const fields = (item.fields || {}) as { name?: string; navn?: string };
      return {
        id: item.id,
        created_at: item.created_at,
        name: fields.name || fields.navn || "Ukendt",
        status: item.status,
        booking_id: item.booking_id || null
      };
    });

    let revenueWeek = 0;
    let revenueMonth = 0;
    let bookingCount = 0;
    let occupancy = 0;
    let conversion = 0;

    if (!isEmployee) {
      const revenueWeekRangeEnd = addDaysToDateKey(today, 7) || today;
      const revenueMonthRangeEnd = nextMonth || today;
      const revenueWeekQuery = supabase
        .from("bookings")
        .select("id, price_total, status, slot_start, slot_end")
        .gte("slot_start", `${today}T00:00:00.000Z`)
        .lt("slot_start", `${revenueWeekRangeEnd}T00:00:00.000Z`);
      const revenueMonthQuery = supabase
        .from("bookings")
        .select("id, price_total, status, slot_start, slot_end")
        .gte("slot_start", `${today}T00:00:00.000Z`)
        .lt("slot_start", `${revenueMonthRangeEnd}T00:00:00.000Z`);

      if (isEmployee && session?.id) {
        revenueWeekQuery.eq("assigned_to", session.id);
        revenueMonthQuery.eq("assigned_to", session.id);
      }

      const [weekData, monthData, estimatorAll, estimatorBooked, overridesResult, bookingsForSlots] =
        await Promise.all([
          revenueWeekQuery,
          revenueMonthQuery,
          supabase.from("estimator_requests").select("id", { count: "exact", head: true }),
          supabase.from("estimator_requests").select("id", { count: "exact", head: true }).not("booking_id", "is", null),
          supabase
            .from("day_overrides")
            .select("date, open_slots_count")
            .gte("date", today)
            .lte("date", nextWeek || today),
          supabase
            .from("bookings")
            .select("slot_start, slot_end, status")
            .gte("slot_start", bookingStart)
            .lt("slot_start", bookingEndExclusive)
        ]);

      if (!weekData.error && weekData.data) {
        revenueWeek = weekData.data.reduce((sum: number, row: any) => {
          if (!row.price_total) return sum;
          const status = (row.status || "").toLowerCase();
          if (!["done", "invoiced", "closed"].includes(status)) return sum;
          return sum + row.price_total;
        }, 0);
      }

      if (!monthData.error && monthData.data) {
        revenueMonth = monthData.data.reduce((sum: number, row: any) => {
          if (!row.price_total) return sum;
          const status = (row.status || "").toLowerCase();
          if (!["done", "invoiced", "closed"].includes(status)) return sum;
          return sum + row.price_total;
        }, 0);
      }

      bookingCount = bookingsNextResult.count ?? 0;

      const estimatorTotal = estimatorAll.count ?? 0;
      const estimatorBookedCount = estimatorBooked.count ?? 0;
      conversion = estimatorTotal > 0 ? Math.round((estimatorBookedCount / estimatorTotal) * 100) : 0;

      if (!overridesResult.error && !bookingsForSlots.error) {
        const overridesMap = new Map<string, number>();
        (overridesResult.data || []).forEach((item: any) => {
          overridesMap.set(item.date, typeof item.open_slots_count === "number" ? item.open_slots_count : 3);
        });

        let totalSlots = 0;
        let usedSlots = 0;
        for (let idx = 0; idx < 7; idx += 1) {
          const dateKey = addDaysToDateKey(today, idx);
          if (!dateKey) continue;
          totalSlots += overridesMap.get(dateKey) ?? 3;
        }

        const activeBookings = (bookingsForSlots.data || []).filter((row: any) => isActiveBooking(row.status));
        usedSlots = activeBookings.reduce((sum: number, row: any) => sum + slotCountFromRange(row.slot_start, row.slot_end), 0);
        occupancy = totalSlots > 0 ? Math.round((usedSlots / totalSlots) * 100) : 0;
      }
    }

    return NextResponse.json(
      {
        counts: {
          leadsNew: leadsNewResult.count ?? 0,
          estimatorsNew: estimatorsNewResult.count ?? 0,
          bookingsToday: bookingsTodayResult.count ?? 0,
          bookingsNext7: bookingsNextResult.count ?? 0
        },
        kpis: {
          revenueWeek,
          revenueMonth,
          bookings: bookingCount,
          conversion,
          occupancy
        },
        upcomingBookings: upcomingBookingsResult.data || [],
        latestLeads: latestLeadsResult.data || [],
        latestEstimators
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Uventet fejl ved dashboard." }, { status: 500 });
  }
}
