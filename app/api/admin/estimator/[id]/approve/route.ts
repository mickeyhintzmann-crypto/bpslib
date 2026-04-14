import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { auditLog } from "@/lib/audit";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { sendEstimatorStatusUpdate } from "@/lib/estimator-confirmation";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * POST /api/admin/estimator/[id]/approve
 * Bekræfter AI-estimatet som korrekt og sender besked til kunden.
 * Sætter price_min/price_max = ai_price_min/ai_price_max.
 */
export async function POST(request: Request, context: RouteContext) {
  try {
    const params = await context.params;
    const { session, error: authError } = requireAdmin(request, ["owner", "admin"]);
    if (authError) return authError;

    const supabase = createSupabaseServiceClient();

    const { data: existing, error: fetchError } = await supabase
      .from("estimator_requests")
      .select("id, fields, ai_price_min, ai_price_max, price_min, price_max, manage_token, customer_approval_status")
      .eq("id", params.id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ message: "Prisberegning blev ikke fundet." }, { status: 404 });
    }

    const aiMin = existing.ai_price_min;
    const aiMax = existing.ai_price_max;
    const existingMin = existing.price_min;
    const existingMax = existing.price_max;

    // Brug admin-pris hvis sat, ellers AI-pris
    const finalMin = typeof existingMin === "number" ? existingMin : aiMin;
    const finalMax = typeof existingMax === "number" ? existingMax : aiMax;

    if (typeof finalMin !== "number" || typeof finalMax !== "number") {
      return NextResponse.json(
        { message: "Ingen pris at bekræfte. Sæt en pris først eller ret prisen." },
        { status: 400 }
      );
    }

    const { error: updateError } = await supabase
      .from("estimator_requests")
      .update({
        price_min: finalMin,
        price_max: finalMax,
        customer_approval_status: "approved",
        approved_at: new Date().toISOString(),
        admin_adjustment_note: null,
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
        action: "approved",
        priceMin: finalMin,
        priceMax: finalMax,
      });
    } catch (notifyError) {
      console.error("[estimator.approve] notification failed:", notifyError);
    }

    await auditLog({
      action: "estimator.approve",
      entityType: "estimator",
      entityId: existing.id,
      meta: { priceMin: finalMin, priceMax: finalMax },
      req: request,
      actor: session?.email,
      role: session?.role,
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Uventet fejl ved bekræftelse." }, { status: 500 });
  }
}
