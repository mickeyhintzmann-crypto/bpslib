import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

import { assertAdminToken } from "@/lib/admin-auth";
import { getAvailabilityRange, getSlotRangeForBooking } from "@/lib/admin-availability";
import { formatExtrasSummary, hasSelectedExtras, sanitizeExtras } from "@/lib/bordplade/extras";
import { STATUS_VALUES } from "@/lib/estimator";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

type ConvertPayload = {
  estimator_id?: unknown;
  date?: unknown;
  start_slot_index?: unknown;
  slot_count?: unknown;
};

type EstimatorRow = {
  id: string;
  status: string;
  slot_count: number | null;
  fields: Record<string, unknown> | null;
  booking_id: string | null;
};

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

const isMissingRelation = (message: string | undefined, relationName: string) => {
  const normalized = (message || "").toLowerCase();
  return (
    normalized.includes(`relation \"${relationName}\" does not exist`) ||
    normalized.includes(`could not find the table 'public.${relationName}'`)
  );
};

const asText = (value: unknown) => (typeof value === "string" ? value.trim() : "");

export async function POST(request: Request) {
  try {
    const authError = assertAdminToken(request);
    if (authError) {
      return authError;
    }

    const payload = (await request.json()) as ConvertPayload;

    const estimatorId = typeof payload.estimator_id === "string" ? payload.estimator_id : "";
    const date = typeof payload.date === "string" ? payload.date : "";
    const startSlotIndex =
      typeof payload.start_slot_index === "number"
        ? payload.start_slot_index
        : Number.parseInt(String(payload.start_slot_index ?? ""), 10);
    const slotCountFromPayload =
      typeof payload.slot_count === "number"
        ? payload.slot_count
        : Number.parseInt(String(payload.slot_count ?? ""), 10);

    if (!uuidRegex.test(estimatorId)) {
      return NextResponse.json({ message: "Ugyldigt estimator_id." }, { status: 400 });
    }

    if (!dateRegex.test(date)) {
      return NextResponse.json({ message: "Ugyldig dato. Brug format YYYY-MM-DD." }, { status: 400 });
    }

    if (!Number.isInteger(startSlotIndex) || startSlotIndex < 0 || startSlotIndex > 2) {
      return NextResponse.json(
        { message: "Ugyldig start_slot_index. Brug 0, 1 eller 2." },
        { status: 400 }
      );
    }

    if (
      Number.isInteger(slotCountFromPayload) &&
      ![1, 2, 3].includes(slotCountFromPayload)
    ) {
      return NextResponse.json({ message: "slot_count skal være 1, 2 eller 3." }, { status: 400 });
    }

    const supabase = createSupabaseServiceClient();

    const { data: estimatorData, error: estimatorError } = await supabase
      .from("estimator_requests")
      .select("id, status, slot_count, fields, booking_id")
      .eq("id", estimatorId)
      .single();

    if (estimatorError || !estimatorData) {
      if (isMissingRelation(estimatorError?.message, "estimator_requests")) {
        return NextResponse.json(
          { message: "Tabellen estimator_requests mangler i databasen." },
          { status: 503 }
        );
      }
      return NextResponse.json(
        { message: estimatorError?.message || "Estimator-sag blev ikke fundet." },
        { status: 404 }
      );
    }

    const estimator = estimatorData as EstimatorRow;

    if (estimator.booking_id) {
      return NextResponse.json(
        {
          message: "Denne estimator-sag er allerede konverteret til en booking.",
          bookingId: estimator.booking_id
        },
        { status: 409 }
      );
    }

    const slotCount =
      Number.isInteger(slotCountFromPayload) && [1, 2, 3].includes(slotCountFromPayload)
        ? slotCountFromPayload
        : estimator.slot_count && [1, 2, 3].includes(estimator.slot_count)
          ? estimator.slot_count
          : 1;

    const availability = await getAvailabilityRange({
      from: date,
      days: 1,
      slotCount
    });

    if (!availability.data) {
      return NextResponse.json(
        { message: availability.error || "Kunne ikke beregne ledige tider." },
        { status: availability.status || 500 }
      );
    }

    const day = availability.data.items[0];
    const validStart = day?.availableStartSlots.find(
      (slot) => slot.startSlotIndex === startSlotIndex
    );

    if (!day || !validStart) {
      return NextResponse.json(
        {
          message: "Starttid er ikke længere ledig. Vælg en ny tid.",
          nextOptions: day?.availableStartSlots || []
        },
        { status: 409 }
      );
    }

    const slotRange = getSlotRangeForBooking(date, startSlotIndex, slotCount);
    if (!slotRange) {
      return NextResponse.json({ message: "Kunne ikke beregne slot-interval." }, { status: 400 });
    }

    const fields = estimator.fields || {};
    const customerName = asText(fields.navn) || "Ikke angivet";
    const customerPhone = asText(fields.telefon) || "Ikke angivet";
    const customerEmail = asText(fields.email) || null;
    const noteFromEstimator = asText(fields.note);
    const postnr = asText(fields.postnr);
    const extras = sanitizeExtras(fields.extras);
    const extrasSummary = formatExtrasSummary(extras);

    const noteParts = [
      "Oprettet via estimator-konvertering.",
      `Estimator ID: ${estimator.id}`,
      `Slot-count: ${slotCount}`,
      postnr ? `Postnr: ${postnr}` : "",
      noteFromEstimator ? `Kundenote: ${noteFromEstimator}` : "",
      hasSelectedExtras(extras) ? `Tilvalg: ${extrasSummary}` : ""
    ].filter(Boolean);

    const { data: bookingData, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail,
        service_type: "bordplade",
        slot_start: slotRange.slotStartIso,
        slot_end: slotRange.slotEndIso,
        manage_token: randomUUID(),
        status: "pending_confirmation",
        notes: noteParts.join(" | "),
        source: "estimator",
        estimator_request_id: estimator.id,
        extras: hasSelectedExtras(extras) ? extras : null
      })
      .select("id, slot_start, slot_end")
      .single();

    if (bookingError || !bookingData) {
      if (isMissingRelation(bookingError?.message, "bookings")) {
        return NextResponse.json(
          { message: "Tabellen bookings mangler i databasen." },
          { status: 503 }
        );
      }
      return NextResponse.json(
        { message: bookingError?.message || "Kunne ikke oprette booking." },
        { status: 500 }
      );
    }

    const { error: updateError } = await supabase
      .from("estimator_requests")
      .update({
        booking_id: bookingData.id,
        status: STATUS_VALUES.booked,
        slot_count: slotCount
      })
      .eq("id", estimator.id);

    if (updateError) {
      return NextResponse.json(
        {
          message:
            "Booking blev oprettet, men estimator-sagen kunne ikke opdateres. Tjek data manuelt.",
          bookingId: bookingData.id
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        bookingId: bookingData.id,
        estimatorId: estimator.id,
        status: STATUS_VALUES.booked,
        slotCount,
        slotLabel: validStart.label,
        slotStart: bookingData.slot_start,
        slotEnd: bookingData.slot_end,
        adminBookingPath: `/admin/bookinger/${bookingData.id}`
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Uventet fejl ved konvertering fra estimator til booking." },
      { status: 500 }
    );
  }
}
