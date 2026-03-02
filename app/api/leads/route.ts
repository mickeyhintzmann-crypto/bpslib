import { NextResponse } from "next/server";

import { buildLeadMetaFromRequest, insertLeadIntake } from "@/lib/leads-intake";

type PublicLeadPayload = {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  location?: unknown;
  message?: unknown;
  source?: unknown;
  service?: unknown;
  page_url?: unknown;
  utm?: unknown;
  meta?: unknown;
};

const asTrimmed = (value: unknown) => (typeof value === "string" ? value.trim() : "");

const asObject = (value: unknown) =>
  value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as PublicLeadPayload;

    const name = asTrimmed(payload.name);
    const email = asTrimmed(payload.email);
    const phone = asTrimmed(payload.phone);
    const location = asTrimmed(payload.location);
    const message = asTrimmed(payload.message);
    const source = asTrimmed(payload.source) || "form";
    const service = asTrimmed(payload.service) || null;
    const pageUrl = asTrimmed(payload.page_url) || null;

    if (!email && !phone && !message) {
      return NextResponse.json(
        { message: "Indsend mindst email, telefon eller besked." },
        { status: 400 }
      );
    }

    const result = await insertLeadIntake(
      {
        source,
        service,
        name,
        email,
        phone,
        location,
        message,
        pageUrl,
        utm: asObject(payload.utm),
        meta: {
          ...asObject(payload.meta),
          ...buildLeadMetaFromRequest(request)
        }
      },
      {
        useAnonClient: true
      }
    );

    if (!result.ok || !result.leadId) {
      return NextResponse.json({ message: result.error || "Kunne ikke oprette lead." }, { status: 500 });
    }

    return NextResponse.json({ ok: true, lead_id: result.leadId }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Uventet fejl ved oprettelse af lead." }, { status: 500 });
  }
}
