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

    const fromIso = `${from}T00:00:00.000Z`;
    const toExclusiveIso = `${toExclusive}T00:00:00.000Z`;

    const [overrideResult, bookingResult, unavailabilityResult, repTasksResult] = await Promise.all([
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
        .lt("date", toExclusive),
      supabase
        .from("employee_unavailability")
        .select("id, employee_id, created_by_user_id, type, note, start_at, end_at, employee:employee_id(id,name,email)")
        .lt("start_at", toExclusiveIso)
        .gte("end_at", fromIso)
        .order("start_at", { ascending: true }),
      // Rep-opgaver: korte vedligeholdelsesjob der ikke optager et slot
      supabase
        .from("jobs")
        .select("id, title, notes, start_at, assigned_employee_id, employee:assigned_employee_id(name)")
        .eq("service", "rep")
        .gte("start_at", fromIso)
        .lt("start_at", toExclusiveIso)
        .order("start_at", { ascending: true })
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

    if (unavailabilityResult.error) {
      if (isMissingRelation(unavailabilityResult.error.message, "employee_unavailability")) {
        return NextResponse.json(
          {
            message:
              "Tabellen employee_unavailability mangler i databasen. Kør migrationen supabase/migrations/20260304000090_employee_unavailability.sql."
          },
          { status: 503 }
        );
      }
      return NextResponse.json({ message: unavailabilityResult.error.message }, { status: 500 });
    }

    if (repTasksResult.error) {
      if (isMissingRelation(repTasksResult.error.message, "jobs")) {
        return NextResponse.json({ message: "Tabellen jobs mangler i databasen." }, { status: 503 });
      }
      // Non-fatal: rep-tasks are optional — return empty array if column/constraint issues
      console.warn("rep-tasks query error:", repTasksResult.error.message);
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

    const unavailability = (unavailabilityResult.data || []).map((item) => {
      const employeeRelation = Array.isArray(item.employee) ? item.employee[0] : item.employee;
      return {
        id: item.id,
        employee_id: item.employee_id ?? null,
        created_by_user_id: item.created_by_user_id ?? null,
        type: item.type ?? null,
        note: item.note ?? null,
        start_at: item.start_at ?? null,
        end_at: item.end_at ?? null,
        employee_name: employeeRelation?.name ?? null,
        employee_email: employeeRelation?.email ?? null
      };
    });

    const repTasks = (repTasksResult.data || []).map((task) => {
      const employeeRelation = Array.isArray(task.employee) ? task.employee[0] : task.employee;
      return {
        id: task.id,
        title: task.title ?? null,
        notes: task.notes ?? null,
        start_at: task.start_at ?? null,
        assigned_employee_id: task.assigned_employee_id ?? null,
        employee_name: (employeeRelation as { name?: string } | null)?.name ?? null
      };
    });

    return NextResponse.json(
      {
        overrides: overrideResult.data || [],
        bookings,
        unavailability,
        repTasks
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Uventet fejl ved hentning af kalenderdata." }, { status: 500 });
  }
}
