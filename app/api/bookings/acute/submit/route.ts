import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

import { getAvailabilityRange, getSlotRangeForBooking } from "@/lib/admin-availability";
import { SLOT_TIMES, type SlotTime } from "@/lib/booking-schedule";
import { applyRateLimit } from "@/lib/rate-limit";
import { siteConfig } from "@/lib/site-config";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { getSmtpAdminTo, logEmail, sendMail } from "@/lib/mailer";

type AcuteSubmitPayload = {
  date?: unknown;
  startSlot?: unknown;
  start_slot_index?: unknown;
  name?: unknown;
  phone?: unknown;
  email?: unknown;
  address?: unknown;
  postalCode?: unknown;
  note?: unknown;
};

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const validPhoneRegex = /^[+0-9()\s-]{6,25}$/;
const validEmailRegex = /^\S+@\S+\.\S+$/;
const COPENHAGEN_TIME_ZONE = "Europe/Copenhagen";
const DEFAULT_ACUTE_SETTINGS = {
  enabled: true,
  price: 3000,
  windowDays: 14
};

const copenhagenDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: COPENHAGEN_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit"
});

const asString = (value: unknown) => (typeof value === "string" ? value.trim() : "");

const getTodayDateKeyInCopenhagen = () => copenhagenDateFormatter.format(new Date());

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

const parseStartSlotIndex = (payload: AcuteSubmitPayload) => {
  if (typeof payload.startSlot === "string") {
    const fromSlot = SLOT_TIMES.findIndex((slot) => slot === payload.startSlot);
    if (fromSlot >= 0) {
      return fromSlot;
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

const isMissingRelation = (message: string | undefined, relationName: string) => {
  const normalized = (message || "").toLowerCase();
  return (
    normalized.includes(`relation \"${relationName}\" does not exist`) ||
    normalized.includes(`could not find the table 'public.${relationName}'`)
  );
};

const isOverlapError = (message: string | undefined) => {
  const normalized = (message || "").toLowerCase();
  return normalized.includes("overlapper") || normalized.includes("overlap");
};

const loadAcuteSettings = async () => {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "acute")
    .maybeSingle();

  if (error) {
    const code = (error as { code?: string }).code;
    if (code !== "PGRST205") {
      console.error(error);
    }
    return DEFAULT_ACUTE_SETTINGS;
  }

  const value = (data?.value || {}) as Partial<typeof DEFAULT_ACUTE_SETTINGS>;
  return {
    enabled: typeof value.enabled === "boolean" ? value.enabled : DEFAULT_ACUTE_SETTINGS.enabled,
    price: typeof value.price === "number" ? value.price : DEFAULT_ACUTE_SETTINGS.price,
    windowDays: typeof value.windowDays === "number" ? value.windowDays : DEFAULT_ACUTE_SETTINGS.windowDays
  };
};

export async function POST(request: Request) {
  try {
    const rateLimit = await applyRateLimit({
      request,
      action: "acute_booking_submit",
      limit: siteConfig.rateLimit.acuteBookingSubmitPerHour,
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

    const payload = (await request.json()) as AcuteSubmitPayload;
    const acuteSettings = await loadAcuteSettings();

    if (!acuteSettings.enabled) {
      return NextResponse.json(
        { message: "Akutte tider er ikke aktive lige nu." },
        { status: 400 }
      );
    }

    const date = asString(payload.date);
    const name = asString(payload.name);
    const phone = asString(payload.phone);
    const email = asString(payload.email);
    const address = asString(payload.address);
    const postalCode = asString(payload.postalCode);
    const note = asString(payload.note);
    const startSlotIndex = parseStartSlotIndex(payload);

    if (!dateRegex.test(date)) {
      return NextResponse.json({ message: "Ugyldig dato. Brug format YYYY-MM-DD." }, { status: 400 });
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

    const today = getTodayDateKeyInCopenhagen();
    const maxDate = addDaysToDateKey(today, acuteSettings.windowDays);

    if (!maxDate) {
      return NextResponse.json({ message: "Kunne ikke beregne datovindue for akutte tider." }, { status: 500 });
    }

    if (date < today || date > maxDate) {
      return NextResponse.json(
        {
          message: `Akutte tider kan kun bookes fra i dag og ${acuteSettings.windowDays} dage frem.`
        },
        { status: 400 }
      );
    }

    const slotCount = 1;
    const fixedPrice = acuteSettings.price;
    const startSlot = SLOT_TIMES[startSlotIndex] as SlotTime;

    const availability = await getAvailabilityRange({
      from: date,
      days: 1,
      slotCount,
      respectAcuteVisibility: true
    });

    if (!availability.data) {
      return NextResponse.json(
        { message: availability.error || "Kunne ikke kontrollere ledig tid." },
        { status: availability.status || 500 }
      );
    }

    const day = availability.data.items[0];
    const isAvailable = day?.availableStartSlots.some((slot) => slot.startSlotIndex === startSlotIndex);

    if (!day || !isAvailable) {
      return NextResponse.json(
        { message: "Tiden er desværre lige blevet taget. Vælg en ny tid." },
        { status: 409 }
      );
    }

    const slotRange = getSlotRangeForBooking(date, startSlotIndex, slotCount);
    if (!slotRange) {
      return NextResponse.json({ message: "Kunne ikke beregne tidsinterval for booking." }, { status: 400 });
    }

    const notes = [
      "Akut booking via /akutte-tider.",
      `Fast pris: ${fixedPrice} kr`,
      `Slot-count: ${slotCount}`,
      `Startslot: ${startSlot}`,
      `Adresse: ${address}`,
      `Postnr: ${postalCode}`,
      note ? `Kundenote: ${note}` : ""
    ]
      .filter(Boolean)
      .join(" | ");

    const supabase = createSupabaseServiceClient();
    const manageToken = randomUUID();
    const { data, error } = await supabase
      .from("bookings")
      .insert({
        customer_name: name,
        customer_phone: phone,
        customer_email: email || null,
        service_type: "bordplade",
        slot_start: slotRange.slotStartIso,
        slot_end: slotRange.slotEndIso,
        manage_token: manageToken,
        status: "confirmed",
        notes,
        source: "acute"
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
        return NextResponse.json(
          { message: "Tabellen bookings mangler i databasen." },
          { status: 503 }
        );
      }

      return NextResponse.json(
        { message: error?.message || "Kunne ikke oprette akut booking." },
        { status: 500 }
      );
    }

    const adminTo = getSmtpAdminTo();
    const manageLink = manageToken ? `https://bpslib.dk/booking/manage/${manageToken}` : "";
    const baseTextLines = [
      `Booking-ID: ${data.id}`,
      `Dato: ${date}`,
      `Tid: ${startSlot}`,
      `Slots: ${slotCount}`,
      `Fast pris: ${fixedPrice} kr`,
      `Navn: ${name}`,
      `Telefon: ${phone}`,
      `Email: ${email || "Ikke angivet"}`,
      `Postnr: ${postalCode}`,
      `Adresse: ${address}`,
      note ? `Note: ${note}` : "",
      manageLink ? `Administrer booking: ${manageLink}` : ""
    ]
      .filter(Boolean)
      .join("\n");

    if (adminTo) {
      const adminResult = await sendMail({
        to: adminTo,
        subject: "Ny booking (akut)",
        text: baseTextLines
      });
      await logEmail({
        kind: "booking.acute",
        to: adminTo,
        subject: "Ny booking (akut)",
        ok: adminResult.ok,
        error: adminResult.error || null,
        meta: { bookingId: data.id, source: "acute" }
      });
    }

    if (email) {
      const customerResult = await sendMail({
        to: email,
        subject: "Bekræftelse på akut tid",
        text: baseTextLines
      });
      await logEmail({
        kind: "booking.acute",
        to: email,
        subject: "Bekræftelse på akut tid",
        ok: customerResult.ok,
        error: customerResult.error || null,
        meta: { bookingId: data.id, recipient: "customer" }
      });
    }

    return NextResponse.json({ ok: true, bookingId: data.id }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Uventet fejl under akut booking." },
      { status: 500 }
    );
  }
}
