import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

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

const addDays = (dateKey: string, delta: number) => {
  if (!dateRegex.test(dateKey)) {
    return null;
  }
  const base = new Date(`${dateKey}T12:00:00.000Z`);
  if (Number.isNaN(base.getTime())) {
    return null;
  }
  base.setUTCDate(base.getUTCDate() + delta);
  const yyyy = base.getUTCFullYear();
  const mm = `${base.getUTCMonth() + 1}`.padStart(2, "0");
  const dd = `${base.getUTCDate()}`.padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export async function GET(request: Request) {
  try {
    const { error: authError } = requireAdmin(request, ["owner", "admin"]);
    if (authError) {
      return authError;
    }

    const url = new URL(request.url);
    const from = url.searchParams.get("from") || "";
    const to = url.searchParams.get("to") || "";

    if (!dateRegex.test(from) || !dateRegex.test(to)) {
      return NextResponse.json(
        { message: "Ugyldigt datointerval. Brug YYYY-MM-DD." },
        { status: 400 }
      );
    }

    const toExclusive = addDays(to, 1);
    if (!toExclusive) {
      return NextResponse.json({ message: "Kunne ikke beregne slutdato." }, { status: 400 });
    }

    const supabase = createSupabaseServiceClient();

    const [overrideResult, bookingResult] = await Promise.all([
      supabase
        .from("day_overrides")
        .select("date, open_slots_count, show_on_acute_page, note")
        .gte("date", from)
        .lte("date", to)
        .order("date", { ascending: true }),
      supabase
        .from("bookings")
        .select(
          "id, date, start_slot_index, slot_count, source, status, customer_name, postal_code, address, assigned_to, service_type"
        )
        .gte("date", from)
        .lt("date", toExclusive)
    ]);

    if (overrideResult.error) {
      if (isMissingRelation(overrideResult.error.message, "day_overrides")) {
        return NextResponse.json(
          { message: "Tabellen day_overrides mangler i databasen." },
          { status: 503 }
        );
      }
      if (isMissingColumn(overrideResult.error.message)) {
        return NextResponse.json(
          { message: "Kolonner til day_overrides mangler i databasen. Kør migrationen." },
          { status: 503 }
        );
      }
      return NextResponse.json({ message: overrideResult.error.message }, { status: 500 });
    }

    if (bookingResult.error) {
      if (isMissingRelation(bookingResult.error.message, "bookings")) {
        return NextResponse.json({ message: "Tabellen bookings mangler i databasen." }, { status: 503 });
      }
      return NextResponse.json({ message: bookingResult.error.message }, { status: 500 });
    }

    const bookings = (bookingResult.data || []).map((booking) => ({
      id: booking.id,
      date: booking.date || "",
      start_slot_index:
        typeof booking.start_slot_index === "number" && Number.isInteger(booking.start_slot_index)
          ? booking.start_slot_index
          : null,
      slot_count:
        typeof booking.slot_count === "number" && Number.isInteger(booking.slot_count)
          ? booking.slot_count
          : 1,
      source: booking.source ?? null,
      status: booking.status ?? null,
      customer_name: booking.customer_name ?? null,
      postal_code: booking.postal_code ?? null,
      address: booking.address ?? null,
      assigned_to: booking.assigned_to ?? null,
      service_type: booking.service_type ?? null
    }));

    return NextResponse.json(
      {
        overrides: overrideResult.data || [],
        bookings
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Uventet fejl ved hentning af kalenderdata." }, { status: 500 });
  }
}
