import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

import { checkBookingAvailability, getSlotRangeForBooking } from "@/lib/admin-availability";
import { SLOT_TIMES } from "@/lib/booking-schedule";
import { formatExtrasSummary, hasSelectedExtras, sanitizeExtras } from "@/lib/bordplade/extras";
import { getSmtpAdminTo, logEmail, sendMail } from "@/lib/mailer";
import { applyRateLimit } from "@/lib/rate-limit";
import { siteConfig } from "@/lib/site-config";
import { getSiteUrl } from "@/lib/site-url";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const validPhoneRegex = /^[+0-9()\s-]{6,25}$/;
const validEmailRegex = /^\S+@\S+\.\S+$/;
const COPENHAGEN_TIME_ZONE = "Europe/Copenhagen";

const copenhagenDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: COPENHAGEN_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit"
});

const asString = (value: FormDataEntryValue | null) => (typeof value === "string" ? value.trim() : "");

const parseStartSlotIndex = (value: string) => {
  if (SLOT_TIMES.includes(value as (typeof SLOT_TIMES)[number])) {
    return SLOT_TIMES.findIndex((slot) => slot === value);
  }
  if (/^\d+$/.test(value)) {
    return Number.parseInt(value, 10);
  }
  return NaN;
};

const getTodayDateKeyInCopenhagen = () => copenhagenDateFormatter.format(new Date());

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

const isOverlapError = (message: string | undefined) => {
  const normalized = (message || "").toLowerCase();
  return normalized.includes("overlapper") || normalized.includes("overlap");
};

export async function POST(request: Request) {
  try {
    const rateLimit = await applyRateLimit({
      request,
      action: "booking_submit",
      limit: siteConfig.rateLimit.bookingSubmitPerHour,
      windowSeconds: siteConfig.rateLimit.windowSeconds
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { message: "Du har sendt mange forespørgsler. Prøv igen om lidt eller ring til os." },
        {
          status: 429,
          headers:
            rateLimit.retryAfterSeconds > 0
              ? { "Retry-After": String(rateLimit.retryAfterSeconds) }
              : undefined
        }
      );
    }

    const formData = await request.formData();

    const date = asString(formData.get("date"));
    const name = asString(formData.get("name"));
    const phone = asString(formData.get("phone"));
    const email = asString(formData.get("email"));
    const address = asString(formData.get("address"));
    const postalCode = asString(formData.get("postalCode"));
    const note = asString(formData.get("note"));
    const startSlotRaw = asString(formData.get("startSlot"));
    const startSlotIndexRaw = asString(formData.get("start_slot_index"));
    const estimatorRequestId = asString(formData.get("estimatorRequestId"));

    const startSlotIndex = parseStartSlotIndex(startSlotRaw || startSlotIndexRaw);
    const slotCount = 1;

    let extras = sanitizeExtras(null);
    try {
      const rawExtras = asString(formData.get("extras"));
      extras = sanitizeExtras(rawExtras ? (JSON.parse(rawExtras) as unknown) : null);
    } catch {
      return NextResponse.json({ message: "Tilvalg kunne ikke læses korrekt." }, { status: 400 });
    }

    if (!dateRegex.test(date)) {
      return NextResponse.json({ message: "Ugyldig dato. Brug format YYYY-MM-DD." }, { status: 400 });
    }

    const today = getTodayDateKeyInCopenhagen();
    if (date < today) {
      return NextResponse.json({ message: "Datoen kan ikke ligge i fortiden." }, { status: 400 });
    }

    if (!Number.isInteger(startSlotIndex) || startSlotIndex < 0 || startSlotIndex > 2) {
      return NextResponse.json(
        { message: "Ugyldig starttid. Vælg 08:00, 11:00 eller 13:30." },
        { status: 400 }
      );
    }

    if (!name || name.length < 2) {
      return NextResponse.json({ message: "Skriv venligst dit navn." }, { status: 400 });
    }

    if (!phone || !validPhoneRegex.test(phone)) {
      return NextResponse.json({ message: "Skriv venligst et gyldigt telefonnummer." }, { status: 400 });
    }

    if (email && !validEmailRegex.test(email)) {
      return NextResponse.json({ message: "Email ser ikke gyldig ud." }, { status: 400 });
    }

    if (!address || address.length < 3) {
      return NextResponse.json({ message: "Skriv venligst adresse." }, { status: 400 });
    }

    if (!/^\d{4}$/.test(postalCode)) {
      return NextResponse.json({ message: "Postnr. skal være 4 cifre." }, { status: 400 });
    }

    if (note.length > 1200) {
      return NextResponse.json({ message: "Beskeden er for lang. Hold den under 1200 tegn." }, { status: 400 });
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
      return NextResponse.json(
        { message: "Den valgte tid kan ikke rumme det ønskede antal slots." },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServiceClient();
    const manageToken = randomUUID();

    let priceEstimateMin: number | null = null;
    let priceEstimateMax: number | null = null;

    if (estimatorRequestId) {
      const { data: estimatorData } = await supabase
        .from("estimator_requests")
        .select("ai_price_min, ai_price_max")
        .eq("id", estimatorRequestId)
        .single();
      if (estimatorData) {
        if (typeof estimatorData.ai_price_min === "number") {
          priceEstimateMin = estimatorData.ai_price_min;
        }
        if (typeof estimatorData.ai_price_max === "number") {
          priceEstimateMax = estimatorData.ai_price_max;
        }
      }
    }

    const { data, error } = await supabase
      .from("bookings")
      .insert({
        customer_name: name,
        customer_phone: phone,
        customer_email: email || null,
        address,
        postal_code: postalCode,
        date,
        start_slot_index: startSlotIndex,
        slot_count: slotCount,
        slot_start: slotRange.slotStartIso,
        slot_end: slotRange.slotEndIso,
        manage_token: manageToken,
        status: "pending_confirmation",
        notes: note || null,
        source: "normal",
        service_type: "bordplade",
        extras: hasSelectedExtras(extras) ? extras : null,
        estimator_request_id: estimatorRequestId || null,
        price_estimate_min: priceEstimateMin,
        price_estimate_max: priceEstimateMax
      })
      .select("id")
      .single();

    if (error || !data) {
      if (isOverlapError(error?.message)) {
        return NextResponse.json(
          { message: "Tiden er desværre lige blevet taget. Vælg en ny tid." },
          { status: 409 }
        );
      }

      if (isMissingRelation(error?.message, "bookings")) {
        return NextResponse.json({ message: "Tabellen bookings mangler i databasen." }, { status: 503 });
      }

      if (isMissingColumn(error?.message)) {
        return NextResponse.json(
          {
            message:
              "Kolonner mangler i bookings-tabellen. Kør migrationen supabase/migrations/20260209_000017_estimator_ai.sql."
          },
          { status: 503 }
        );
      }

      return NextResponse.json(
        { message: error?.message || "Kunne ikke oprette booking." },
        { status: 500 }
      );
    }

    const manageLink = `${getSiteUrl()}/booking/manage/${manageToken}`;
    const extrasSummary = hasSelectedExtras(extras) ? formatExtrasSummary(extras) : "Ingen";

    const estimateLine =
      priceEstimateMin !== null && priceEstimateMax !== null
        ? `AI-prisestimat: ${priceEstimateMin}–${priceEstimateMax} kr.`
        : "";

    const baseTextLines = [
      `Booking-ID: ${data.id}`,
      `Dato: ${date}`,
      `Tid: ${slotRange.startTime}`,
      `Slots: ${slotCount}`,
      `Navn: ${name}`,
      `Telefon: ${phone}`,
      `Email: ${email || "Ikke angivet"}`,
      `Adresse: ${address}`,
      `Postnr: ${postalCode}`,
      note ? `Note: ${note}` : "",
      extrasSummary !== "Ingen" ? `Tilvalg: ${extrasSummary}` : "",
      estimateLine,
      manageLink ? `Administrer booking: ${manageLink}` : "",
      "Status: Afventer pris og bekræftelse"
    ]
      .filter(Boolean)
      .join("\n");

    const adminTo = getSmtpAdminTo();
    if (adminTo) {
      const adminResult = await sendMail({
        to: adminTo,
        subject: "Ny booking (bordplade) - afventer bekræftelse",
        text: baseTextLines
      });
      await logEmail({
        kind: "booking.normal",
        to: adminTo,
        subject: "Ny booking (bordplade) - afventer bekræftelse",
        ok: adminResult.ok,
        error: adminResult.error || null,
        meta: { bookingId: data.id, source: "normal" }
      });
    }

    if (email) {
      const customerResult = await sendMail({
        to: email,
        subject: "Tak - vi har modtaget din bookingforespørgsel",
        text: baseTextLines
      });
      await logEmail({
        kind: "booking.normal",
        to: email,
        subject: "Tak - vi har modtaget din bookingforespørgsel",
        ok: customerResult.ok,
        error: customerResult.error || null,
        meta: { bookingId: data.id, recipient: "customer" }
      });
    }

    return NextResponse.json({ ok: true, bookingId: data.id }, { status: 200 });
  } catch (error) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Uventet fejl under booking.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
