import { NextResponse } from "next/server";

import { applyRateLimit } from "@/lib/rate-limit";
import { siteConfig } from "@/lib/site-config";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { getSmtpAdminTo, logEmail, sendMail } from "@/lib/mailer";

type TilbudstidPayload = {
  name?: unknown;
  phone?: unknown;
  postalCode?: unknown;
  service?: unknown;
  note?: unknown;
};

const SERVICE_VALUES = ["gulv", "toemrer", "maler", "murer", "andet"] as const;
type ServiceValue = (typeof SERVICE_VALUES)[number];

const asString = (value: unknown) => (typeof value === "string" ? value.trim() : "");

const normalizePhone = (value: string) => value.replace(/\s+/g, "");

const isMissingLeadsTable = (message: string | undefined) => {
  const normalized = (message || "").toLowerCase();
  return (
    normalized.includes("could not find the table 'public.leads'") ||
    normalized.includes('relation "leads" does not exist')
  );
};

const isMissingColumn = (message: string | undefined) => {
  const normalized = (message || "").toLowerCase();
  return normalized.includes("column") && normalized.includes("does not exist");
};

export async function POST(request: Request) {
  try {
    const rateLimit = await applyRateLimit({
      request,
      action: "tilbudstid_submit",
      limit: siteConfig.rateLimit.contactSubmitPerHour,
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

    const payload = (await request.json()) as TilbudstidPayload;

    const name = asString(payload.name);
    const phoneRaw = asString(payload.phone);
    const postalCode = asString(payload.postalCode);
    const service = asString(payload.service);
    const note = asString(payload.note);

    if (!name || name.length < 2) {
      return NextResponse.json({ message: "Skriv venligst dit navn." }, { status: 400 });
    }

    const phone = normalizePhone(phoneRaw);
    if (!phone || phone.length < 8) {
      return NextResponse.json({ message: "Skriv venligst et gyldigt telefonnummer." }, { status: 400 });
    }

    if (!/^\d{4}$/.test(postalCode)) {
      return NextResponse.json({ message: "Postnr. skal være 4 cifre." }, { status: 400 });
    }

    if (!SERVICE_VALUES.includes(service as ServiceValue)) {
      return NextResponse.json({ message: "Vælg venligst en gyldig ydelse." }, { status: 400 });
    }

    if (note.length > 1000) {
      return NextResponse.json({ message: "Beskeden er for lang. Hold den under 1000 tegn." }, { status: 400 });
    }

    const supabase = createSupabaseServiceClient();

    const { data, error } = await supabase
      .from("leads")
      .insert({
        source: "tilbudstid",
        service,
        name,
        phone,
        postal_code: postalCode,
        note: note || null,
        status: "new"
      })
      .select("id")
      .single();

    if (error || !data) {
      if (isMissingLeadsTable(error?.message) || isMissingColumn(error?.message)) {
        return NextResponse.json(
          {
            message:
              "Tilbudstid er ikke klargjort i databasen endnu. Kør migrationen i supabase/migrations/20260208_000005_leads.sql."
          },
          { status: 503 }
        );
      }
      return NextResponse.json({ message: error?.message || "Kunne ikke gemme forespørgslen." }, { status: 500 });
    }

    const adminTo = getSmtpAdminTo();
    if (adminTo) {
      const subject = "Ny tilbudstid lead";
      const text = [
        `Lead-ID: ${data.id}`,
        `Service: ${service}`,
        `Navn: ${name}`,
        `Telefon: ${phone}`,
        `Postnr: ${postalCode}`,
        note ? `Note: ${note}` : ""
      ]
        .filter(Boolean)
        .join("\n");

      const result = await sendMail({
        to: adminTo,
        subject,
        text
      });

      await logEmail({
        kind: "lead.tilbudstid",
        to: adminTo,
        subject,
        ok: result.ok,
        error: result.error || null,
        meta: { leadId: data.id, source: "tilbudstid" }
      });
    }

    return NextResponse.json({ ok: true, leadId: data.id }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Uventet fejl ved indsendelse. Prøv igen." },
      { status: 500 }
    );
  }
}
