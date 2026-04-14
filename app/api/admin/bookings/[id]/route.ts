import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
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
  city?: unknown;
  note?: unknown;
  taskDescription?: unknown;
  task_description?: unknown;
  internalNote?: unknown;
  extras?: unknown;
  assigned_to?: unknown;
  price_total?: unknown;
  price_net?: unknown;
  price_vat?: unknown;
};

type BookingRow = {
  id: string;
  created_at: string | null;
  status: string | null;
  service_type: string | null;
  source: string | null;
  assigned_to: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  address: string | null;
  postal_code: string | null;
  city?: string | null;
  date: string | null;
  start_slot_index: number | null;
  slot_count: number | null;
  notes: string | null;
  task_description?: string | null;
  internal_note: string | null;
  estimator_request_id?: string | null;
  extras: unknown | null;
  price_total?: number | null;
  price_net?: number | null;
  price_vat?: number | null;
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
const BOOKING_SELECT_WITH_CITY_TASK =
  "id, created_at, status, service_type, source, assigned_to, customer_name, customer_phone, customer_email, address, postal_code, city, date, start_slot_index, slot_count, notes, task_description, internal_note, estimator_request_id, extras, price_total, price_net, price_vat";
const BOOKING_SELECT_WITH_CITY_TASK_NO_ESTIMATOR =
  "id, created_at, status, service_type, source, assigned_to, customer_name, customer_phone, customer_email, address, postal_code, city, date, start_slot_index, slot_count, notes, task_description, internal_note, extras, price_total, price_net, price_vat";
const BOOKING_SELECT_LEGACY =
  "id, created_at, status, service_type, source, assigned_to, customer_name, customer_phone, customer_email, address, postal_code, date, start_slot_index, slot_count, notes, internal_note, estimator_request_id, extras, price_total, price_net, price_vat";
const BOOKING_SELECT_LEGACY_NO_ESTIMATOR =
  "id, created_at, status, service_type, source, assigned_to, customer_name, customer_phone, customer_email, address, postal_code, date, start_slot_index, slot_count, notes, internal_note, extras, price_total, price_net, price_vat";

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

const isMissingCityTaskColumns = (message: string | undefined) => {
  const normalized = (message || "").toLowerCase();
  return normalized.includes("bookings.city") || normalized.includes("bookings.task_description");
};

const isKnownStatus = (value: unknown): value is (typeof STATUS_FLOW)[number] =>
  typeof value === "string" && STATUS_FLOW.includes(value as (typeof STATUS_FLOW)[number]);

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

const toNullableInt = (value: unknown) => {
  if (value === null || value === undefined || value === "") {
    return { valid: true, value: null as number | null };
  }

  if (typeof value === "number" && Number.isInteger(value)) {
    return { valid: true, value };
  }

  if (typeof value === "string" && /^\d+$/.test(value)) {
    return { valid: true, value: Number.parseInt(value, 10) };
  }

  return { valid: false, value: null as number | null };
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const params = await Promise.resolve(context.params);
    const { session, error: authError } = requireAdmin(request, ["owner", "admin", "employee", "viewer"]);
    if (authError) {
      return authError;
    }

    const supabase = createSupabaseServiceClient();
    const fetchById = async (columns: string) => {
      const response = await supabase.from("bookings").select(columns).eq("id", params.id).single();
      return {
        data: (response.data as BookingRow | null) ?? null,
        error: response.error
      };
    };

    let { data, error } = await fetchById(BOOKING_SELECT_WITH_CITY_TASK);
    if (error && isMissingColumn(error.message) && isMissingCityTaskColumns(error.message)) {
      ({ data, error } = await fetchById(BOOKING_SELECT_LEGACY));
    }

    if (error || !data) {
      if (isMissingRelation(error?.message, "bookings")) {
        return NextResponse.json({ message: "Tabellen bookings mangler i databasen." }, { status: 503 });
      }
      return NextResponse.json({ message: error?.message || "Booking blev ikke fundet." }, { status: 404 });
    }

    if (session?.role === "employee" && data.assigned_to !== session.id) {
      return NextResponse.json({ message: "Du har ikke adgang til denne booking." }, { status: 403 });
    }

    const startSlotIndex =
      typeof data.start_slot_index === "number" && Number.isInteger(data.start_slot_index)
        ? data.start_slot_index
        : null;
    const slotCount =
      typeof data.slot_count === "number" && Number.isInteger(data.slot_count) ? data.slot_count : null;
    const slotRange =
      data.date && startSlotIndex !== null && slotCount !== null
        ? getSlotRangeForBooking(data.date, startSlotIndex, slotCount)
        : null;

    return NextResponse.json(
      {
        item: {
          ...data,
          slot_start: slotRange?.slotStartIso ?? null,
          slot_end: slotRange?.slotEndIso ?? null
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
    const { session, error: authError } = requireAdmin(request, ["owner", "admin", "employee"]);
    if (authError) {
      return authError;
    }

    const payload = (await request.json()) as UpdatePayload;
    if (!payload || typeof payload !== "object") {
      return NextResponse.json({ message: "Ugyldigt payload." }, { status: 400 });
    }

    const supabase = createSupabaseServiceClient();
    const fetchCurrent = async (columns: string) => {
      const response = await supabase.from("bookings").select(columns).eq("id", params.id).single();
      return {
        data: (response.data as BookingRow | null) ?? null,
        error: response.error
      };
    };

    let { data: current, error: currentError } = await fetchCurrent(BOOKING_SELECT_WITH_CITY_TASK_NO_ESTIMATOR);
    if (currentError && isMissingColumn(currentError.message) && isMissingCityTaskColumns(currentError.message)) {
      ({ data: current, error: currentError } = await fetchCurrent(BOOKING_SELECT_LEGACY_NO_ESTIMATOR));
    }

    if (currentError || !current) {
      if (isMissingRelation(currentError?.message, "bookings")) {
        return NextResponse.json({ message: "Tabellen bookings mangler i databasen." }, { status: 503 });
      }
      return NextResponse.json({ message: currentError?.message || "Booking blev ikke fundet." }, { status: 404 });
    }

    if (session?.role === "employee" && current.assigned_to !== session.id) {
      return NextResponse.json({ message: "Du har ikke adgang til denne booking." }, { status: 403 });
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

    if ("taskDescription" in payload || "task_description" in payload) {
      const incoming = "taskDescription" in payload ? payload.taskDescription : payload.task_description;
      if (incoming === null || incoming === "") {
        updateData.task_description = null;
      } else if (typeof incoming === "string") {
        updateData.task_description = incoming.trim();
      } else {
        return NextResponse.json({ message: "Opgavebeskrivelse skal være tekst." }, { status: 400 });
      }
    }

    if ("city" in payload) {
      if (payload.city === null || payload.city === "") {
        updateData.city = null;
      } else if (typeof payload.city === "string") {
        updateData.city = payload.city.trim();
      } else {
        return NextResponse.json({ message: "By skal være tekst." }, { status: 400 });
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
      if (session?.role === "employee") {
        return NextResponse.json({ message: "Kun admin kan ændre tilvalg." }, { status: 403 });
      }
      if (payload.extras === null || payload.extras === "") {
        updateData.extras = null;
      } else {
        const extras = sanitizeExtras(payload.extras);
        updateData.extras = hasSelectedExtras(extras) ? extras : null;
      }
    }

    const currentDate = current.date || "";
    const currentStartIndex =
      typeof current.start_slot_index === "number" && Number.isInteger(current.start_slot_index)
        ? current.start_slot_index
        : 0;
    const currentSlotCount =
      typeof current.slot_count === "number" && Number.isInteger(current.slot_count) ? current.slot_count : 1;

    if (session?.role === "employee" && ("date" in payload || "startSlot" in payload || "start_slot_index" in payload || "slot_count" in payload)) {
      return NextResponse.json({ message: "Kun admin kan flytte tider." }, { status: 403 });
    }

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

      updateData.date = nextDate;
      updateData.start_slot_index = nextStartIndex;
      updateData.slot_count = nextSlotCount;
    }

    if ("assigned_to" in payload) {
      if (session?.role === "employee") {
        return NextResponse.json({ message: "Kun admin kan tildele medarbejder." }, { status: 403 });
      }
      if (payload.assigned_to === null || payload.assigned_to === "") {
        updateData.assigned_to = null;
      } else if (typeof payload.assigned_to === "string") {
        updateData.assigned_to = payload.assigned_to;
      } else {
        return NextResponse.json({ message: "assigned_to skal være tekst." }, { status: 400 });
      }
    }

    if ("price_total" in payload || "price_net" in payload || "price_vat" in payload) {
      if (session?.role === "employee") {
        return NextResponse.json({ message: "Kun admin kan opdatere pris." }, { status: 403 });
      }
      const totalParsed = toNullableInt(payload.price_total);
      const netParsed = toNullableInt(payload.price_net);
      const vatParsed = toNullableInt(payload.price_vat);

      if (!totalParsed.valid || !netParsed.valid || !vatParsed.valid) {
        return NextResponse.json({ message: "Prisfelter skal være tal." }, { status: 400 });
      }

      let priceNet = netParsed.value;
      let priceVat = vatParsed.value;
      if (totalParsed.value !== null && (priceNet === null || priceVat === null)) {
        priceNet = Math.round(totalParsed.value / 1.25);
        priceVat = totalParsed.value - priceNet;
      }

      updateData.price_total = totalParsed.value;
      updateData.price_net = priceNet;
      updateData.price_vat = priceVat;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: "Ingen felter at opdatere." }, { status: 400 });
    }

    const updateBooking = async (updates: Record<string, unknown>, columns: string) => {
      const response = await supabase
        .from("bookings")
        .update(updates)
        .eq("id", params.id)
        .select(columns)
        .single();
      return {
        data: (response.data as BookingRow | null) ?? null,
        error: response.error
      };
    };

    let appliedChanges = { ...updateData };
    let { data, error } = await updateBooking(appliedChanges, BOOKING_SELECT_WITH_CITY_TASK_NO_ESTIMATOR);

    if (error && isMissingColumn(error.message) && isMissingCityTaskColumns(error.message)) {
      const { city: _city, task_description: _taskDescription, ...legacyChanges } = appliedChanges;
      if (Object.keys(legacyChanges).length === 0) {
        return NextResponse.json(
          {
            message:
              "Kolonnen city/opgavebeskrivelse mangler i databasen. Kør migrationen supabase/migrations/20260305000120_booking_job_city_task_description.sql."
          },
          { status: 503 }
        );
      }
      appliedChanges = legacyChanges;
      ({ data, error } = await updateBooking(appliedChanges, BOOKING_SELECT_LEGACY_NO_ESTIMATOR));
    }

    if (error || !data) {
      if (isMissingRelation(error?.message, "bookings")) {
        return NextResponse.json({ message: "Tabellen bookings mangler i databasen." }, { status: 503 });
      }
      if (isMissingColumn(error?.message)) {
        return NextResponse.json(
          {
            message:
              "Kolonner til admin-bookings mangler i databasen. Kør migrationerne i supabase/migrations/20260208000008_bookings_admin_columns.sql og 20260208000016_booking_extras.sql."
              + " Kør også supabase/migrations/20260305000120_booking_job_city_task_description.sql."
          },
          { status: 503 }
        );
      }
      return NextResponse.json({ message: error?.message || "Kunne ikke opdatere booking." }, { status: 500 });
    }

    const updatedStartSlotIndex =
      typeof data.start_slot_index === "number" && Number.isInteger(data.start_slot_index)
        ? data.start_slot_index
        : null;
    const updatedSlotCount =
      typeof data.slot_count === "number" && Number.isInteger(data.slot_count) ? data.slot_count : null;
    const slotRange =
      data.date && updatedStartSlotIndex !== null && updatedSlotCount !== null
        ? getSlotRangeForBooking(data.date, updatedStartSlotIndex, updatedSlotCount)
        : null;

    await auditLog({
      action: "booking.update",
      entityType: "booking",
      entityId: data.id,
      meta: {
        before: current,
        after: data,
        changes: appliedChanges
      },
      req: request,
      actor: session?.email,
      role: session?.role
    });

    return NextResponse.json(
      {
        item: {
          ...data,
          slot_start: slotRange?.slotStartIso ?? null,
          slot_end: slotRange?.slotEndIso ?? null
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Uventet fejl ved opdatering af booking." }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const params = await Promise.resolve(context.params);
    const { session, error: authError } = requireAdmin(request, ["owner", "admin"]);
    if (authError) {
      return authError;
    }

    const supabase = createSupabaseServiceClient();

    const { data: existing, error: fetchError } = await supabase
      .from("bookings")
      .select("id, customer_name, date, status")
      .eq("id", params.id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ message: "Booking blev ikke fundet." }, { status: 404 });
    }

    const { error: deleteError } = await supabase
      .from("bookings")
      .delete()
      .eq("id", params.id);

    if (deleteError) {
      return NextResponse.json(
        { message: deleteError.message || "Kunne ikke slette booking." },
        { status: 500 }
      );
    }

    await auditLog({
      action: "booking.delete",
      entityType: "booking",
      entityId: existing.id,
      meta: { deleted: existing },
      req: request,
      actor: session?.email,
      role: session?.role
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Uventet fejl ved sletning af booking." }, { status: 500 });
  }
}
