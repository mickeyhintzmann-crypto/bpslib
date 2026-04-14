import { NextResponse } from "next/server";

import { createSupabaseServiceClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ token: string }> | { token: string };
};

/**
 * GET /api/estimator/price-token/[token]
 * Returnerer låst pris (hvis godkendt/justeret) så booking-flowet kan forudfylde.
 */
export async function GET(request: Request, context: RouteContext) {
  try {
    const params = await Promise.resolve(context.params);
    const token = params.token?.trim();

    if (!token || token.length < 20) {
      return NextResponse.json({ message: "Ugyldigt token." }, { status: 404 });
    }

    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("estimator_requests")
      .select("id, fields, price_min, price_max, ai_price_min, ai_price_max, customer_approval_status")
      .eq("manage_token", token)
      .single();

    if (error || !data) {
      return NextResponse.json({ message: "Linket er ugyldigt." }, { status: 404 });
    }

    const status = data.customer_approval_status || "pending";
    if (status === "pending") {
      return NextResponse.json(
        { message: "Din pris er endnu ikke bekræftet." },
        { status: 400 }
      );
    }

    const priceMin = typeof data.price_min === "number" ? data.price_min : data.ai_price_min;
    const priceMax = typeof data.price_max === "number" ? data.price_max : data.ai_price_max;

    if (typeof priceMin !== "number" || typeof priceMax !== "number") {
      return NextResponse.json({ message: "Ingen gyldig pris fundet." }, { status: 400 });
    }

    const fields = (data.fields || {}) as Record<string, unknown>;

    return NextResponse.json(
      {
        item: {
          estimatorId: data.id,
          priceMin,
          priceMax,
          service: typeof fields.service === "string" ? fields.service : "bordplade",
          boardCount: typeof fields.boardCount === "number" ? fields.boardCount : 1,
          customerName: typeof fields.navn === "string" ? fields.navn : null,
          customerPhone: typeof fields.telefon === "string" ? fields.telefon : null,
          approvalStatus: status,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Uventet fejl." }, { status: 500 });
  }
}
