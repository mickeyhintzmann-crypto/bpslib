import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { auditLog } from "@/lib/audit";
import { STATUS_VALUES, type EstimatorFormFields } from "@/lib/estimator";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { findOrCreateCustomer } from "@/lib/customer-match";
import { sendEstimatorStatusUpdate } from "@/lib/estimator-confirmation";

type ManualCreatePayload = {
  name?: unknown;
  phone?: unknown;
  email?: unknown;
  postalCode?: unknown;
  priceMin?: unknown;
  priceMax?: unknown;
  note?: unknown;
  source?: unknown; // "phone" | "contact_form" | "manual"
  sendNotification?: unknown;
};

const asStr = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const toInt = (v: unknown) => {
  if (typeof v === "number" && Number.isInteger(v)) return v;
  if (typeof v === "string" && /^\d+$/.test(v.trim())) return Number.parseInt(v.trim(), 10);
  return null;
};

const emailRegex = /^\S+@\S+\.\S+$/;
const phoneRegex = /^[+0-9()\s-]{6,25}$/;

/**
 * POST /api/admin/estimator/manual-create
 * Admin opretter en prisberegning manuelt (fx fra telefonopkald).
 * Opretter estimator_request med pris allerede bekræftet (approved),
 * genererer manage_token og kan sende besked til kunden.
 */
export async function POST(request: Request) {
  try {
    const { session, error: authError } = requireAdmin(request, ["owner", "admin"]);
    if (authError) return authError;

    const payload = (await request.json()) as ManualCreatePayload;
    const name = asStr(payload.name);
    const phone = asStr(payload.phone);
    const email = asStr(payload.email);
    const postalCode = asStr(payload.postalCode);
    const priceMin = toInt(payload.priceMin);
    const priceMax = toInt(payload.priceMax);
    const note = asStr(payload.note);
    const source = asStr(payload.source) || "manual";
    const sendNotification = payload.sendNotification !== false;

    if (!name || name.length < 2) {
      return NextResponse.json({ message: "Skriv venligst kundens navn." }, { status: 400 });
    }
    if (!phone || !phoneRegex.test(phone)) {
      return NextResponse.json({ message: "Skriv et gyldigt telefonnummer." }, { status: 400 });
    }
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json({ message: "Skriv en gyldig email (bruges til fakturering)." }, { status: 400 });
    }
    if (priceMin === null || priceMax === null) {
      return NextResponse.json({ message: "Angiv prisinterval (fra/til)." }, { status: 400 });
    }
    if (priceMin < 0 || priceMax < priceMin) {
      return NextResponse.json({ message: "Ugyldigt prisinterval." }, { status: 400 });
    }
    if (priceMin > 200000 || priceMax > 200000) {
      return NextResponse.json({ message: "Pris er urealistisk høj." }, { status: 400 });
    }

    const supabase = createSupabaseServiceClient();
    const manageToken = randomUUID();

    /* Find/opret kunde */
    let customerId: string | null = null;
    try {
      const res = await findOrCreateCustomer(supabase, {
        name,
        phone,
        email,
        postalCode: postalCode || null,
      });
      if (res.customerId) customerId = res.customerId;
    } catch (err) {
      console.error("[estimator.manual-create] customer match failed:", err);
    }

    const fields: EstimatorFormFields = {
      navn: name,
      telefon: phone,
      email,
      postalCode: postalCode || undefined,
      note: note || undefined,
      service: "bordplade",
      boardCount: 1,
    };

    const retentionDeleteAt = new Date();
    retentionDeleteAt.setDate(retentionDeleteAt.getDate() + 3650);

    const { data, error: insertError } = await supabase
      .from("estimator_requests")
      .insert({
        gating_answer: "ved_ikke",
        fields,
        images: [],
        status: STATUS_VALUES.closed,
        retention_delete_at: retentionDeleteAt.toISOString(),
        ai_price_min: priceMin,
        ai_price_max: priceMax,
        price_min: priceMin,
        price_max: priceMax,
        ai_status: "manual",
        customer_id: customerId,
        manage_token: manageToken,
        customer_approval_status: "approved",
        approved_at: new Date().toISOString(),
        internal_note: note ? `Oprettet manuelt (${source}): ${note}` : `Oprettet manuelt (${source})`,
      })
      .select("id")
      .single();

    if (insertError || !data) {
      return NextResponse.json(
        { message: insertError?.message || "Kunne ikke oprette prisberegning." },
        { status: 500 }
      );
    }

    /* Send besked til kunden med bookinglink (email + SMS) */
    let notificationStatus: string[] = [];
    if (sendNotification) {
      try {
        notificationStatus = await sendEstimatorStatusUpdate({
          estimatorId: data.id,
          customerName: name,
          customerPhone: phone,
          customerEmail: email,
          manageToken,
          action: "approved",
          priceMin,
          priceMax,
        });
      } catch (notifyErr) {
        console.error("[estimator.manual-create] notify failed:", notifyErr);
      }
    }

    await auditLog({
      action: "estimator.manual_create",
      entityType: "estimator",
      entityId: data.id,
      meta: { name, email, phone, priceMin, priceMax, source, sendNotification, notificationStatus },
      req: request,
      actor: session?.email,
      role: session?.role,
    });

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bpslib.dk";

    return NextResponse.json(
      {
        ok: true,
        estimatorId: data.id,
        manageToken,
        manageUrl: `${siteUrl}/prisberegner/manage/${manageToken}`,
        bookingUrl: `${siteUrl}/bordpladeslibning/book?priceToken=${manageToken}`,
        notificationStatus,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Uventet fejl ved oprettelse." }, { status: 500 });
  }
}
