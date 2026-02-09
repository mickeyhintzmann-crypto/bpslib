import { NextResponse } from "next/server";

import { applyRateLimit } from "@/lib/rate-limit";
import { siteConfig } from "@/lib/site-config";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

type ContactPayload = {
  navn?: unknown;
  telefon?: unknown;
  email?: unknown;
  besked?: unknown;
  website?: unknown;
};

const asString = (value: unknown) => (typeof value === "string" ? value.trim() : "");

const isValidPhone = (value: string) => /^[+0-9()\s-]{6,25}$/.test(value);

const isValidEmail = (value: string) => /^\S+@\S+\.\S+$/.test(value);

const isMissingLeadsTable = (message: string) => {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("could not find the table 'public.leads'") ||
    normalized.includes('relation "leads" does not exist')
  );
};

const isMissingColumn = (message: string) => {
  const normalized = message.toLowerCase();
  return normalized.includes("column") && normalized.includes("does not exist");
};

const safeLogFallback = (navn: string, telefon: string, email: string, besked: string) => {
  console.info("[kontakt] Gemmer fallback-log (ingen leads tabel):", {
    navnLaengde: navn.length,
    telefonEnde: telefon.slice(-4),
    harEmail: Boolean(email),
    beskedLaengde: besked.length
  });
};

const tryInsertLead = async ({
  navn,
  telefon,
  email,
  besked
}: {
  navn: string;
  telefon: string;
  email: string;
  besked: string;
}) => {
  const supabase = createSupabaseServiceClient();

  const candidateRows: Array<Record<string, unknown>> = [
    {
      name: navn,
      phone: telefon,
      email: email || null,
      message: besked || null,
      source: "kontakt",
      status: "Ny"
    },
    {
      navn,
      telefon,
      email: email || null,
      besked: besked || null,
      source: "kontakt",
      status: "Ny"
    },
    {
      fields: {
        navn,
        telefon,
        email,
        besked
      },
      source: "kontakt",
      status: "Ny"
    }
  ];

  for (const row of candidateRows) {
    const { error } = await supabase.from("leads").insert(row);

    if (!error) {
      return { saved: true as const };
    }

    if (isMissingLeadsTable(error.message)) {
      return { saved: false as const, reason: "missing_table" as const };
    }

    if (isMissingColumn(error.message)) {
      continue;
    }

    console.error("[kontakt] Fejl ved indsættelse i leads:", error.message);
    return { saved: false as const, reason: "insert_error" as const };
  }

  return { saved: false as const, reason: "unsupported_schema" as const };
};

export async function POST(request: Request) {
  try {
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
    } catch (rateLimitError) {
      console.error("[kontakt] Rate limit kunne ikke anvendes:", rateLimitError);
    }

    const payload = (await request.json()) as ContactPayload;

    const navn = asString(payload.navn);
    const telefon = asString(payload.telefon);
    const email = asString(payload.email);
    const besked = asString(payload.besked);
    const website = asString(payload.website);

    if (website) {
      return NextResponse.json({ message: "Tak for din henvendelse." }, { status: 200 });
    }

    if (!navn || navn.length < 2) {
      return NextResponse.json({ message: "Skriv venligst dit navn." }, { status: 400 });
    }

    if (!telefon || !isValidPhone(telefon)) {
      return NextResponse.json({ message: "Skriv venligst et gyldigt telefonnummer." }, { status: 400 });
    }

    if (email && !isValidEmail(email)) {
      return NextResponse.json({ message: "Email ser ikke gyldig ud." }, { status: 400 });
    }

    if (besked.length > 3000) {
      return NextResponse.json({ message: "Beskeden er for lang. Hold den under 3000 tegn." }, { status: 400 });
    }

    const leadResult = await tryInsertLead({ navn, telefon, email, besked });

    if (!leadResult.saved) {
      safeLogFallback(navn, telefon, email, besked);
    }

    return NextResponse.json(
      {
        message: "Tak for din henvendelse. Vi vender tilbage hurtigst muligt."
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[kontakt] Uventet fejl i submit:", error);
    return NextResponse.json(
      {
        message: "Tak for din henvendelse. Vi vender tilbage hurtigst muligt."
      },
      { status: 200 }
    );
  }
}
