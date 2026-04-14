import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { auditLog } from "@/lib/audit";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { sendEstimatorStatusUpdate } from "@/lib/estimator-confirmation";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type AdjustPayload = {
  priceMin?: unknown;
  priceMax?: unknown;
  note?: unknown;
};

const toInt = (value: unknown) => {
  if (typeof value === "number" && Number.isInteger(value)) return value;
  if (typeof value === "string" && /^\d+$/.test(value.trim())) return Number.parseInt(value.trim(), 10);
  return null;
};

/**
 * POST /api/admin/estimator/[id]/adjust
 * Justerer prisen og sender besked til kunden med begrundelse.
 */
export async function POST(request: Request, context: RouteContext) {
  try {
    const params = await context.params;
    const { session, error: authError } = requireAdmin(request, ["owner", "admin"]);
    if (authError) return authError;

    const payload = (await request.json()) as AdjustPayload;
    const priceMin = toInt(payload.priceMin);
    const priceMax = toInt(payload.priceMax);
    const note = typeof payload.note === "string" ? payload.note.trim() : "";

    if (priceMin === null || priceMax === null) {
      return NextResponse.json({ message: "Angiv både minimum- og maksimumpris." }, { status: 400 });
    }
    if (priceMin < 0 || priceMax < priceMin) {
      return NextResponse.json({ message: "Ugyldigt prisinterval." }, { status: 400 });
    }
    if (priceMin > 200000 || priceMax > 200000) {
      return NextResponse.json({ message: "Pris er urealistisk høj." }, { status: 400 });
    }

    const supabase = createSupabaseServiceClient();

    const { data: existing, error: fetchError } = await supabase
      .from("estimator_requests")
      .select("id, fields, manage_token")
      .eq("id", params.id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ message: "Prisberegning blev ikke fundet." }, { status: 404 });
    }

    const { error: updateError } = await supabase
      .from("estimator_requests")
      .update({
        price_min: priceMin,
        price_max: priceMax,
        customer_approval_status: "adjusted",
        admin_adjustment_note: note || null,
        approved_at: new Date().toISOString(),
      })
      .eq("id", params.id);

    if (updateError) {
      return NextResponse.json({ message: updateError.message }, { status: 500 });
    }

    /* Send besked til kunden */
    const fields = (existing.fields || {}) as Record<string, unknown>;
    const customerName = typeof fields.navn === "string" ? fields.navn : "kunde";
    const customerPhone = typeof fields.telefon === "string" ? fields.telefon : undefined;
    const customerEmail = typeof fields.email === "string" ? fields.email : undefined;

    try {
      await sendEstimatorStatusUpdate({
        estimatorId: existing.id,
        customerName,
        customerPhone,
        customerEmail,
        manageToken: existing.manage_token || undefined,
        action: "adjusted",
        adjustmentNote: note || undefined,
        priceMin,
        priceMax,
      });
    } catch (notifyError) {
      console.error("[estimator.adjust] notification failed:", notifyError);
    }

    await auditLog({
      action: "estimator.adjust",
      entityType: "estimator",
      entityId: existing.id,
      meta: { priceMin, priceMax, note: note || null },
      req: request,
      actor: session?.email,
      role: session?.role,
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Uventet fejl ved justering." }, { status: 500 });
  }
}
