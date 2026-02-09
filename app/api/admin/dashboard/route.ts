import { NextResponse } from "next/server";

import { assertAdminToken } from "@/lib/admin-auth";
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

export async function GET(request: Request) {
  try {
    const authError = assertAdminToken(request);
    if (authError) {
      return authError;
    }

    const supabase = createSupabaseServiceClient();

    const today = copenhagenDateFormatter.format(new Date());
    const nextWeek = addDaysToDateKey(today, 7);

    if (!nextWeek) {
      return NextResponse.json({ message: "Kunne ikke beregne datointerval." }, { status: 500 });
    }

    const bookingStart = `${today}T00:00:00.000Z`;
    const todayEndExclusive = `${addDaysToDateKey(today, 1)}T00:00:00.000Z`;
    const bookingEndExclusive = `${addDaysToDateKey(nextWeek, 1)}T00:00:00.000Z`;

    const [
      leadsNewResult,
      estimatorsNewResult,
      bookingsTodayResult,
      bookingsNextResult,
      upcomingBookingsResult,
      latestLeadsResult,
      latestEstimatorsResult
    ] = await Promise.all([
      supabase.from("leads").select("id", { count: "exact", head: true }).eq("status", "new"),
      supabase
        .from("estimator_requests")
        .select("id", { count: "exact", head: true })
        .eq("status", "Ny"),
      supabase
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .gte("slot_start", bookingStart)
        .lt("slot_start", todayEndExclusive),
      supabase
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .gte("slot_start", bookingStart)
        .lt("slot_start", bookingEndExclusive),
      supabase
        .from("bookings")
        .select("id, slot_start, customer_name, source, status")
        .gte("slot_start", bookingStart)
        .order("slot_start", { ascending: true })
        .limit(10),
      supabase
        .from("leads")
        .select("id, created_at, service, name, phone, status")
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("estimator_requests")
        .select("id, created_at, fields, status")
        .order("created_at", { ascending: false })
        .limit(10)
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

    const latestEstimators = (latestEstimatorsResult.data || []).map((item) => {
      const fields = (item.fields || {}) as { name?: string; navn?: string };
      return {
        id: item.id,
        created_at: item.created_at,
        name: fields.name || fields.navn || "Ukendt",
        status: item.status
      };
    });

    return NextResponse.json(
      {
        counts: {
          leadsNew: leadsNewResult.count ?? 0,
          estimatorsNew: estimatorsNewResult.count ?? 0,
          bookingsToday: bookingsTodayResult.count ?? 0,
          bookingsNext7: bookingsNextResult.count ?? 0
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
