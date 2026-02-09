import { NextResponse } from "next/server";

import { assertAdminToken } from "@/lib/admin-auth";
import { auditLog } from "@/lib/audit";
import { checkBookingAvailability, getSlotRangeForBooking } from "@/lib/admin-availability";
import { hasSelectedExtras, sanitizeExtras } from "@/lib/bordplade/extras";
import { SLOT_TIMES } from "@/lib/booking-schedule";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

type UpdatePayload = {
  status?: unknown;
  date?: unknown;
  startSlot?: unknown;
  start_slot_index?: unknown;
  slot_count?: unknown;
  note?: unknown;
  internalNote?: unknown;
  extras?: unknown;
};

const STATUS_FLOW = [
  "pending_confirmation",
  "new",
  "confirmed",
  "in_progress",
  "done",
  "cancelled",
  "pending"
] as const;
const SLOT_END_TIMES = ["11:00", "13:30", "16:00"] as const;

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

const isKnownStatus = (value: unknown): value is (typeof STATUS_FLOW)[number] =>
  typeof value === "string" && STATUS_FLOW.includes(value as (typeof STATUS_FLOW)[number]);

const dateKeyFromIso = (iso: string | null | undefined) => (iso ? iso.slice(0, 10) : "");

const timeFromIso = (iso: string | null | undefined) => (iso ? iso.slice(11, 16) : "");

const slotCountFromRange = (slotStart: string | null | undefined, slotEnd: string | null | undefined) => {
  const startTime = timeFromIso(slotStart);
  const endTime = timeFromIso(slotEnd);
  const startIndex = SLOT_TIMES.indexOf(startTime as (typeof SLOT_TIMES)[number]);
  const endIndex = SLOT_END_TIMES.indexOf(endTime as (typeof SLOT_END_TIMES)[number]);
  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
    return null;
  }
  return endIndex - startIndex + 1;
};

const parseStartSlotIndex = (payload: UpdatePayload) => {
  if (typeof payload.startSlot === "string") {
    const found = SLOT_TIMES.findIndex((slot) => slot === payload.startSlot);
    if (found >= 0) {
      return found;
    }
  }

  if (typeof payload.start_slot_index === "number" && Number.isInteger(payload.start_slot_index)) {
    return payload.start_slot_index;
  }

  if (typeof payload.start_slot_index === "string" && /^\d+$/.test(payload.start_slot_index)) {
    return Number.parseInt(payload.start_slot_index, 10);
  }

  return NaN;
};

const parseSlotCount = (value: unknown) => {
  if (typeof value === "number" && Number.isInteger(value)) {
    return value;
  }
  if (typeof value === "string" && /^\d+$/.test(value)) {
    return Number.parseInt(value, 10);
  }
  return NaN;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const params = await Promise.resolve(context.params);
    const authError = assertAdminToken(request);
    if (authError) {
      return authError;
    }

    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("bookings")
      .select(
        "id, created_at, status, service_type, source, customer_name, customer_phone, customer_email, address, postal_code, slot_start, slot_end, notes, internal_note, estimator_request_id, extras"
      )
      .eq("id", params.id)
      .single();

    if (error || !data) {
      if (isMissingRelation(error?.message, "bookings")) {
        return NextResponse.json({ message: "Tabellen bookings mangler i databasen." }, { status: 503 });
      }
      return NextResponse.json({ message: error?.message || "Booking blev ikke fundet." }, { status: 404 });
    }

    const slotCount = slotCountFromRange(data.slot_start, data.slot_end);

    return NextResponse.json(
      {
        item: {
          ...data,
          slot_count: slotCount
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Uventet fejl ved hentning af booking." }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const params = await Promise.resolve(context.params);
    const authError = assertAdminToken(request);
    if (authError) {
      return authError;
    }

    const payload = (await request.json()) as UpdatePayload;
    if (!payload || typeof payload !== "object") {
      return NextResponse.json({ message: "Ugyldigt payload." }, { status: 400 });
    }

    const supabase = createSupabaseServiceClient();
    const { data: current, error: currentError } = await supabase
      .from("bookings")
      .select(
        "id, created_at, status, service_type, source, customer_name, customer_phone, customer_email, address, postal_code, slot_start, slot_end, notes, internal_note, extras"
      )
      .eq("id", params.id)
      .single();

    if (currentError || !current) {
      if (isMissingRelation(currentError?.message, "bookings")) {
        return NextResponse.json({ message: "Tabellen bookings mangler i databasen." }, { status: 503 });
      }
      return NextResponse.json({ message: currentError?.message || "Booking blev ikke fundet." }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};

    if ("status" in payload) {
      if (!isKnownStatus(payload.status)) {
        return NextResponse.json({ message: "Ugyldig status." }, { status: 400 });
      }
      updateData.status = payload.status;
    }

    if ("note" in payload) {
      if (payload.note === null || payload.note === "") {
        updateData.notes = null;
      } else if (typeof payload.note === "string") {
        updateData.notes = payload.note.trim();
      } else {
        return NextResponse.json({ message: "Note skal være tekst." }, { status: 400 });
      }
    }

    if ("internalNote" in payload) {
      if (payload.internalNote === null || payload.internalNote === "") {
        updateData.internal_note = null;
      } else if (typeof payload.internalNote === "string") {
        updateData.internal_note = payload.internalNote.trim();
      } else {
        return NextResponse.json({ message: "Intern note skal være tekst." }, { status: 400 });
      }
    }

    if ("extras" in payload) {
      if (payload.extras === null || payload.extras === "") {
        updateData.extras = null;
      } else {
        const extras = sanitizeExtras(payload.extras);
        updateData.extras = hasSelectedExtras(extras) ? extras : null;
      }
    }

    const currentDate = dateKeyFromIso(current.slot_start);
    const currentStartIndex = SLOT_TIMES.indexOf(timeFromIso(current.slot_start) as (typeof SLOT_TIMES)[number]);
    const currentSlotCount = slotCountFromRange(current.slot_start, current.slot_end) || 1;

    const nextDate = typeof payload.date === "string" ? payload.date : currentDate;
    const parsedStartIndex = parseStartSlotIndex(payload);
    const nextStartIndex = Number.isNaN(parsedStartIndex) ? currentStartIndex : parsedStartIndex;
    const parsedSlotCount = parseSlotCount(payload.slot_count);
    const nextSlotCount =
      Number.isNaN(parsedSlotCount) || ![1, 2, 3].includes(parsedSlotCount)
        ? currentSlotCount
        : parsedSlotCount;

    const slotChanged =
      nextDate !== currentDate ||
      nextStartIndex !== currentStartIndex ||
      nextSlotCount !== currentSlotCount;

    if (slotChanged) {
      const availability = await checkBookingAvailability({
        date: nextDate,
        startSlotIndex: nextStartIndex,
        slotCount: nextSlotCount,
        excludeBookingId: current.id
      });

      if (!availability.ok) {
        return NextResponse.json(
          { message: availability.message || "Tiden er allerede optaget. Vælg en ny tid." },
          { status: availability.status || 409 }
        );
      }

      const slotRange = getSlotRangeForBooking(nextDate, nextStartIndex, nextSlotCount);
      if (!slotRange) {
        return NextResponse.json({ message: "Kunne ikke beregne slot-interval." }, { status: 400 });
      }

      updateData.slot_start = slotRange.slotStartIso;
      updateData.slot_end = slotRange.slotEndIso;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: "Ingen felter at opdatere." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("bookings")
      .update(updateData)
      .eq("id", params.id)
      .select(
        "id, created_at, status, service_type, source, customer_name, customer_phone, customer_email, address, postal_code, slot_start, slot_end, notes, internal_note, extras"
      )
      .single();

    if (error || !data) {
      if (isMissingRelation(error?.message, "bookings")) {
        return NextResponse.json({ message: "Tabellen bookings mangler i databasen." }, { status: 503 });
      }
      if (isMissingColumn(error?.message)) {
        return NextResponse.json(
          {
            message:
              "Kolonner til admin-bookings mangler i databasen. Kør migrationerne i supabase/migrations/20260208_000007_bookings_admin_columns.sql og 20260208_000015_booking_extras.sql."
          },
          { status: 503 }
        );
      }
      return NextResponse.json({ message: error?.message || "Kunne ikke opdatere booking." }, { status: 500 });
    }

    const slotCount = slotCountFromRange(data.slot_start, data.slot_end);

    await auditLog({
      action: "booking.update",
      entityType: "booking",
      entityId: data.id,
      meta: {
        before: current,
        after: data,
        changes: updateData
      },
      req: request
    });

    return NextResponse.json({ item: { ...data, slot_count: slotCount } }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Uventet fejl ved opdatering af booking." }, { status: 500 });
  }
}
