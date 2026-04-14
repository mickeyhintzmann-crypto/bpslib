import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { auditLog } from "@/lib/audit";
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

const normalizeOpenSlots = (value: unknown) => {
  if (typeof value === "number" && Number.isInteger(value)) {
    return value;
  }
  if (typeof value === "string" && /^\d+$/.test(value)) {
    return Number.parseInt(value, 10);
  }
  return NaN;
};

const normalizeBlockedSlots = (value: unknown): number[] | null => {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) return null;
  const result: number[] = [];
  for (const entry of value) {
    const num = typeof entry === "number" ? entry : typeof entry === "string" ? Number.parseInt(entry, 10) : NaN;
    if (!Number.isInteger(num) || num < 0 || num > 2) {
      return null;
    }
    if (!result.includes(num)) result.push(num);
  }
  return result.sort();
};

const isWeekendDateKey = (dateKey: string) => {
  if (!dateRegex.test(dateKey)) {
    return false;
  }
  const date = new Date(`${dateKey}T12:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    return false;
  }
  const weekday = date.getUTCDay();
  return weekday === 0 || weekday === 6;
};

export async function GET(request: Request) {
  try {
    const { session, error: authError } = requireAdmin(request, ["owner", "admin"]);
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

    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("day_overrides")
      .select("date, open_slots_count, show_on_acute_page, note, blocked_slot_indices, updated_at")
      .gte("date", from)
      .lte("date", to)
      .order("date", { ascending: true });

    if (error) {
      if (isMissingRelation(error.message, "day_overrides")) {
        return NextResponse.json(
          { message: "Tabellen day_overrides mangler i databasen." },
          { status: 503 }
        );
      }
      if (isMissingColumn(error.message)) {
        return NextResponse.json(
          { message: "Kolonner til day_overrides mangler i databasen. Kør migrationen." },
          { status: 503 }
        );
      }
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({ items: data || [] }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Uventet fejl ved hentning af overrides." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { session, error: authError } = requireAdmin(request, ["owner", "admin"]);
    if (authError) {
      return authError;
    }

    const payload = (await request.json()) as Record<string, unknown>;
    const date = typeof payload.date === "string" ? payload.date.trim() : "";
    const note = typeof payload.note === "string" ? payload.note.trim() : "";
    const showOnAcute = typeof payload.show_on_acute_page === "boolean" ? payload.show_on_acute_page : null;
    const openSlotsCount = normalizeOpenSlots(payload.open_slots_count);
    const blockedSlots = normalizeBlockedSlots(payload.blocked_slot_indices);

    if (blockedSlots === null) {
      return NextResponse.json(
        { message: "blocked_slot_indices skal være en array af tal 0-2." },
        { status: 400 }
      );
    }

    if (!dateRegex.test(date)) {
      return NextResponse.json(
        { message: "Ugyldig dato. Brug format YYYY-MM-DD." },
        { status: 400 }
      );
    }

    if (!Number.isInteger(openSlotsCount) || openSlotsCount < 0 || openSlotsCount > 3) {
      return NextResponse.json(
        { message: "open_slots_count skal være et tal mellem 0 og 3." },
        { status: 400 }
      );
    }

    if (showOnAcute === null) {
      return NextResponse.json(
        { message: "show_on_acute_page skal være true/false." },
        { status: 400 }
      );
    }

    const isWeekend = isWeekendDateKey(date);
    const normalizedOpenSlots = isWeekend ? 0 : openSlotsCount;
    const normalizedShowOnAcute = isWeekend ? false : showOnAcute;

    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("day_overrides")
      .upsert(
        {
          date,
          open_slots_count: normalizedOpenSlots,
          show_on_acute_page: normalizedShowOnAcute,
          note: note || null,
          blocked_slot_indices: isWeekend ? [] : blockedSlots,
          updated_at: new Date().toISOString()
        },
        { onConflict: "date" }
      )
      .select("date, open_slots_count, show_on_acute_page, note, blocked_slot_indices, updated_at")
      .single();

    if (error || !data) {
      if (isMissingRelation(error?.message, "day_overrides")) {
        return NextResponse.json(
          { message: "Tabellen day_overrides mangler i databasen." },
          { status: 503 }
        );
      }
      if (isMissingColumn(error?.message)) {
        return NextResponse.json(
          { message: "Kolonner til day_overrides mangler i databasen. Kør migrationen." },
          { status: 503 }
        );
      }
      return NextResponse.json({ message: error?.message || "Kunne ikke gemme override." }, { status: 500 });
    }

    await auditLog({
      action: "day_override.upsert",
      entityType: "day_override",
      entityId: data.date,
      meta: { after: data },
      req: request,
      actor: session?.email,
      role: session?.role
    });

    return NextResponse.json({ item: data }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Uventet fejl ved gemning af override." }, { status: 500 });
  }
}
