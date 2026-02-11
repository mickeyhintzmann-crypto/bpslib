import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { auditLog } from "@/lib/audit";
import { checkBookingAvailability, getSlotRangeForBooking } from "@/lib/admin-availability";
import { hasSelectedExtras, sanitizeExtras } from "@/lib/bordplade/extras";
import { SLOT_TIMES } from "@/lib/booking-schedule";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

const STATUS_FLOW = [
  "pending_confirmation",
  "new",
  "confirmed",
  "in_progress",
  "done",
  "cancelled",
  "pending"
] as const;
const SOURCE_VALUES = ["normal", "acute", "manual", "estimator"] as const;
const SERVICE_VALUES = ["bordplade", "gulv", "toemrer", "maler", "murer", "andet"] as const;
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

type BookingRow = {
  id: string;
  created_at: string;
  status: string | null;
  service_type: string | null;
  source: string | null;
  assigned_to?: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  address: string | null;
  postal_code: string | null;
  date: string | null;
  start_slot_index: number | null;
  slot_count: number | null;
  notes: string | null;
  internal_note: string | null;
  extras: unknown | null;
  price_total?: number | null;
  price_net?: number | null;
  price_vat?: number | null;
};

type CreatePayload = {
  service?: unknown;
  date?: unknown;
  startSlot?: unknown;
  start_slot_index?: unknown;
  slot_count?: unknown;
  name?: unknown;
  phone?: unknown;
  email?: unknown;
  address?: unknown;
  postal_code?: unknown;
  note?: unknown;
  extras?: unknown;
  assigned_to?: unknown;
  price_total?: unknown;
  price_net?: unknown;
  price_vat?: unknown;
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

const parseStartSlotIndex = (payload: CreatePayload) => {
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

const normalizeStatusFilter = (raw: string | null) => {
  if (!raw || raw === "alle") {
    return null;
  }
  if (STATUS_FLOW.includes(raw as (typeof STATUS_FLOW)[number])) {
    return raw;
  }
  return null;
};

const normalizeSourceFilter = (raw: string | null) => {
  if (!raw || raw === "alle") {
    return null;
  }
  if (SOURCE_VALUES.includes(raw as (typeof SOURCE_VALUES)[number])) {
    return raw;
  }
  return null;
};

const normalizeServiceFilter = (raw: string | null) => {
  if (!raw || raw === "alle") {
    return null;
  }
  if (SERVICE_VALUES.includes(raw as (typeof SERVICE_VALUES)[number])) {
    return raw;
  }
  return null;
};

const parsePositiveInt = (value: string | null, fallback: number) => {
  if (!value) {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 1) {
    return fallback;
  }
  return parsed;
};

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
  const yyyy = baseDate.getUTCFullYear();
  const mm = `${baseDate.getUTCMonth() + 1}`.padStart(2, "0");
  const dd = `${baseDate.getUTCDate()}`.padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export async function GET(request: Request) {
  try {
    const { session, error: authError } = requireAdmin(request, ["owner", "admin", "employee", "viewer"]);
    if (authError) {
      return authError;
    }

    const url = new URL(request.url);
    const statusFilter = normalizeStatusFilter(url.searchParams.get("status"));
    const sourceFilter = normalizeSourceFilter(url.searchParams.get("source"));
    const serviceFilter = normalizeServiceFilter(url.searchParams.get("service"));
    const dateFrom = url.searchParams.get("from");
    const dateTo = url.searchParams.get("to");
    const page = parsePositiveInt(url.searchParams.get("page"), 1);
    const pageSize = Math.min(parsePositiveInt(url.searchParams.get("limit"), 50), 200);
    const fromIndex = (page - 1) * pageSize;
    const toIndex = fromIndex + pageSize - 1;

    const supabase = createSupabaseServiceClient();

    let query = supabase
      .from("bookings")
      .select(
        "id, created_at, status, service_type, source, assigned_to, customer_name, customer_phone, customer_email, address, postal_code, date, start_slot_index, slot_count, notes, internal_note, extras, price_total, price_net, price_vat",
        {
          count: "exact"
        }
      )
      .order("date", { ascending: false })
      .order("start_slot_index", { ascending: false })
      .range(fromIndex, toIndex);

    if (statusFilter) {
      let values = [statusFilter];
      if (statusFilter === "new") {
        values = ["new", "pending_confirmation", "pending"];
      } else if (statusFilter === "pending_confirmation") {
        values = ["pending_confirmation", "pending"];
      }
      query = query.in("status", values);
    }

    if (sourceFilter) {
      query = query.eq("source", sourceFilter);
    }

    if (serviceFilter) {
      query = query.eq("service_type", serviceFilter);
    }

    if (dateFrom && dateRegex.test(dateFrom)) {
      query = query.gte("date", dateFrom);
    }

    if (dateTo && dateRegex.test(dateTo)) {
      const next = addDaysToDateKey(dateTo, 1);
      if (next) {
        query = query.lt("date", next);
      }
    }

    if (session?.role === "employee") {
      query = query.eq("assigned_to", session.id);
    }

    const { data, error, count } = await query;

    if (error) {
      if (isMissingRelation(error.message, "bookings")) {
        return NextResponse.json({ message: "Tabellen bookings mangler i databasen." }, { status: 503 });
      }
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    const items = ((data || []) as BookingRow[]).map((row) => {
      const slotRange =
        row.date && Number.isInteger(row.start_slot_index) && Number.isInteger(row.slot_count)
          ? getSlotRangeForBooking(row.date, row.start_slot_index as number, row.slot_count as number)
          : null;

      return {
        id: row.id,
        createdAt: row.created_at,
        status: row.status,
        service: row.service_type,
        source: row.source,
        assignedTo: row.assigned_to ?? null,
        name: row.customer_name,
        phone: row.customer_phone,
        postalCode: row.postal_code,
        slotStart: slotRange?.slotStartIso ?? null,
        slotEnd: slotRange?.slotEndIso ?? null,
        slotCount: row.slot_count ?? null,
        priceTotal: row.price_total ?? null,
        priceNet: row.price_net ?? null,
        priceVat: row.price_vat ?? null
      };
    });

    return NextResponse.json(
      {
        items,
        page,
        pageSize,
        total: count ?? null
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Uventet fejl i bookings liste." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { session, error: authError } = requireAdmin(request, ["owner", "admin"]);
    if (authError) {
      return authError;
    }

    const payload = (await request.json()) as CreatePayload;

    const date = typeof payload.date === "string" ? payload.date.trim() : "";
    const name = typeof payload.name === "string" ? payload.name.trim() : "";
    const phone = typeof payload.phone === "string" ? payload.phone.trim() : "";
    const email = typeof payload.email === "string" ? payload.email.trim() : "";
    const address = typeof payload.address === "string" ? payload.address.trim() : "";
    const postalCode = typeof payload.postal_code === "string" ? payload.postal_code.trim() : "";
    const note = typeof payload.note === "string" ? payload.note.trim() : "";
    const service = typeof payload.service === "string" ? payload.service.trim() : "bordplade";
    const extras = sanitizeExtras(payload.extras);
    const assignedTo = typeof payload.assigned_to === "string" ? payload.assigned_to.trim() : "";

    const totalParsed = toNullableInt(payload.price_total);
    const netParsed = toNullableInt(payload.price_net);
    const vatParsed = toNullableInt(payload.price_vat);

    if (!totalParsed.valid || !netParsed.valid || !vatParsed.valid) {
      return NextResponse.json({ message: "Prisfelter skal være tal." }, { status: 400 });
    }

    if (!dateRegex.test(date)) {
      return NextResponse.json({ message: "Ugyldig dato. Brug format YYYY-MM-DD." }, { status: 400 });
    }

    if (!name || name.length < 2) {
      return NextResponse.json({ message: "Skriv venligst et navn." }, { status: 400 });
    }

    if (!phone || phone.length < 6) {
      return NextResponse.json({ message: "Skriv venligst et telefonnummer." }, { status: 400 });
    }

    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ message: "Email ser ikke gyldig ud." }, { status: 400 });
    }

    if (postalCode && !/^\d{4}$/.test(postalCode)) {
      return NextResponse.json({ message: "Postnr. skal være 4 cifre." }, { status: 400 });
    }

    const startSlotIndex = parseStartSlotIndex(payload);
    if (!Number.isInteger(startSlotIndex) || startSlotIndex < 0 || startSlotIndex > 2) {
      return NextResponse.json(
        { message: "Ugyldig starttid. Vælg 08:00, 11:00 eller 13:30." },
        { status: 400 }
      );
    }

    const slotCount = parseSlotCount(payload.slot_count);
    if (!Number.isInteger(slotCount) || ![1, 2, 3].includes(slotCount)) {
      return NextResponse.json({ message: "slot_count skal være 1, 2 eller 3." }, { status: 400 });
    }

    if (service && !SERVICE_VALUES.includes(service as (typeof SERVICE_VALUES)[number])) {
      return NextResponse.json({ message: "Vælg en gyldig service." }, { status: 400 });
    }

    const availability = await checkBookingAvailability({
      date,
      startSlotIndex,
      slotCount
    });

    if (!availability.ok) {
      return NextResponse.json(
        { message: availability.message || "Tiden er allerede optaget. Vælg en ny tid." },
        { status: availability.status || 409 }
      );
    }

    const slotRange = getSlotRangeForBooking(date, startSlotIndex, slotCount);
    if (!slotRange) {
      return NextResponse.json({ message: "Kunne ikke beregne slot-interval." }, { status: 400 });
    }

    const supabase = createSupabaseServiceClient();
    let priceNet = netParsed.value;
    let priceVat = vatParsed.value;
    if (totalParsed.value !== null && (priceNet === null || priceVat === null)) {
      priceNet = Math.round(totalParsed.value / 1.25);
      priceVat = totalParsed.value - priceNet;
    }
    const { data, error } = await supabase
      .from("bookings")
      .insert({
        service_type: service || "bordplade",
        customer_name: name,
        customer_phone: phone,
        customer_email: email || null,
        address: address || null,
        postal_code: postalCode || null,
        notes: note || null,
        date,
        start_slot_index: startSlotIndex,
        slot_count: slotCount,
        slot_start: slotRange.slotStartIso,
        slot_end: slotRange.slotEndIso,
        manage_token: randomUUID(),
        status: "new",
        source: "manual",
        extras: service === "bordplade" && hasSelectedExtras(extras) ? extras : null,
        assigned_to: assignedTo || null,
        price_total: totalParsed.value,
        price_net: priceNet,
        price_vat: priceVat
      })
      .select(
        "id, created_at, status, service_type, source, assigned_to, customer_name, customer_phone, customer_email, address, postal_code, date, start_slot_index, slot_count, notes, internal_note, extras, price_total, price_net, price_vat"
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
      return NextResponse.json({ message: error?.message || "Kunne ikke oprette booking." }, { status: 500 });
    }

    await auditLog({
      action: "booking.create",
      entityType: "booking",
      entityId: data.id,
      meta: {
        after: data,
        source: "manual"
      },
      req: request,
      actor: session?.email,
      role: session?.role
    });

    return NextResponse.json(
      {
        item: {
          ...data,
          slot_start: getSlotRangeForBooking(data.date, data.start_slot_index, data.slot_count)?.slotStartIso ?? null,
          slot_end: getSlotRangeForBooking(data.date, data.start_slot_index, data.slot_count)?.slotEndIso ?? null
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Uventet fejl ved oprettelse af booking." }, { status: 500 });
  }
}
