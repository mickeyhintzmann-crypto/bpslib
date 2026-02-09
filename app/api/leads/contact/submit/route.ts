import { NextResponse } from "next/server";

import { applyRateLimit } from "@/lib/rate-limit";
import { siteConfig } from "@/lib/site-config";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { getSmtpAdminTo, logEmail, sendMail } from "@/lib/mailer";

type ContactPayload = {
  name?: unknown;
  phone?: unknown;
  email?: unknown;
  message?: unknown;
  postalCode?: unknown;
  website?: unknown;
};

const asString = (value: unknown) => (typeof value === "string" ? value.trim() : "");

const normalizePhone = (value: string) => value.replace(/\s+/g, "");

const isValidPhone = (value: string) => /^[+0-9()\s-]{6,25}$/.test(value);

const isValidEmail = (value: string) => /^\S+@\S+\.\S+$/.test(value);

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
      action: "contact_submit",
      limit: siteConfig.rateLimit.contactSubmitPerHour,
      windowSeconds: siteConfig.rateLimit.windowSeconds
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { message: "Du har sendt mange henvendelser. Prøv igen om lidt eller ring til os." },
        {
          status: 429,
          headers:
            rateLimit.retryAfterSeconds > 0
              ? { "Retry-After": String(rateLimit.retryAfterSeconds) }
              : undefined
        }
      );
    }

    const payload = (await request.json()) as ContactPayload;

    const name = asString(payload.name);
    const phoneRaw = asString(payload.phone);
    const email = asString(payload.email);
    const message = asString(payload.message);
    const postalCode = asString(payload.postalCode);
    const website = asString(payload.website);

    if (website) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    if (!name || name.length < 2) {
      return NextResponse.json({ message: "Skriv venligst dit navn." }, { status: 400 });
    }

    const phone = normalizePhone(phoneRaw);
    if (!phone || !isValidPhone(phone)) {
      return NextResponse.json({ message: "Skriv venligst et gyldigt telefonnummer." }, { status: 400 });
    }

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ message: "Skriv venligst en gyldig email." }, { status: 400 });
    }

    if (!message || message.length < 5) {
      return NextResponse.json({ message: "Skriv venligst en kort besked." }, { status: 400 });
    }

    if (message.length > 2000) {
      return NextResponse.json({ message: "Beskeden er for lang. Hold den under 2000 tegn." }, { status: 400 });
    }

    if (postalCode && !/^\d{4}$/.test(postalCode)) {
      return NextResponse.json({ message: "Postnr. skal være 4 cifre." }, { status: 400 });
    }

    const supabase = createSupabaseServiceClient();

    const { data, error } = await supabase
      .from("leads")
      .insert({
        source: "kontakt",
        service: "andet",
        name,
        phone,
        email,
        postal_code: postalCode || null,
        message,
        status: "new"
      })
      .select("id")
      .single();

    if (error || !data) {
      if (isMissingLeadsTable(error?.message) || isMissingColumn(error?.message)) {
        return NextResponse.json(
          {
            message:
              "Kontaktformularen er ikke klargjort i databasen endnu. Kør migrationen i supabase/migrations/20260208_000009_leads_contact_columns.sql."
          },
          { status: 503 }
        );
      }
      return NextResponse.json({ message: error?.message || "Kunne ikke sende beskeden." }, { status: 500 });
    }

    const adminTo = getSmtpAdminTo();
    if (adminTo) {
      const subject = "Ny kontakt";
      const text = [
        `Lead-ID: ${data.id}`,
        `Navn: ${name}`,
        `Telefon: ${phone}`,
        `Email: ${email}`,
        postalCode ? `Postnr: ${postalCode}` : "",
        `Besked: ${message}`
      ]
        .filter(Boolean)
        .join("\n");

      const result = await sendMail({
        to: adminTo,
        subject,
        text
      });

      await logEmail({
        kind: "lead.kontakt",
        to: adminTo,
        subject,
        ok: result.ok,
        error: result.error || null,
        meta: { leadId: data.id, source: "kontakt" }
      });
    }

    return NextResponse.json({ ok: true, leadId: data.id }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Uventet fejl ved afsendelse. Prøv igen." },
      { status: 500 }
    );
  }
}
