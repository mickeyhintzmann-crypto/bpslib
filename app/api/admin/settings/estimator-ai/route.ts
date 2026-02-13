import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { auditLog } from "@/lib/audit";
import { ESTIMATOR_AI_DEFAULTS, type EstimatorAiSettings } from "@/lib/ai-estimator";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

const isMissingRelation = (message: string | undefined, relationName: string) => {
  const normalized = (message || "").toLowerCase();
  return (
    normalized.includes(`relation \"${relationName}\" does not exist`) ||
    normalized.includes(`could not find the table 'public.${relationName}'`)
  );
};

const isMissingRow = (code: string | undefined) => code === "PGRST116";

const parseBoolean = (value: unknown) => (typeof value === "boolean" ? value : null);
const parseNumber = (value: unknown) => (typeof value === "number" && Number.isFinite(value) ? value : null);

export async function GET(request: Request) {
  try {
    const { error: authError } = requireAdmin(request, ["owner"]);
    if (authError) {
      return authError;
    }

    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("settings")
      .select("key, value")
      .eq("key", "estimator_ai")
      .maybeSingle();

    if (error) {
      if (isMissingRelation(error.message, "settings")) {
        return NextResponse.json({ item: ESTIMATOR_AI_DEFAULTS }, { status: 200 });
      }
      if (isMissingRow(error.code)) {
        return NextResponse.json({ item: ESTIMATOR_AI_DEFAULTS }, { status: 200 });
      }
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    const value = (data?.value || {}) as Partial<EstimatorAiSettings>;

    return NextResponse.json(
      {
        item: {
          enabled: typeof value.enabled === "boolean" ? value.enabled : ESTIMATOR_AI_DEFAULTS.enabled,
          minSamples: typeof value.minSamples === "number" ? value.minSamples : ESTIMATOR_AI_DEFAULTS.minSamples,
          interval: typeof value.interval === "number" ? value.interval : ESTIMATOR_AI_DEFAULTS.interval,
          minPrice: typeof value.minPrice === "number" ? value.minPrice : ESTIMATOR_AI_DEFAULTS.minPrice,
          maxPrice: typeof value.maxPrice === "number" ? value.maxPrice : ESTIMATOR_AI_DEFAULTS.maxPrice,
          fixedPrice: typeof value.fixedPrice === "boolean" ? value.fixedPrice : ESTIMATOR_AI_DEFAULTS.fixedPrice,
          roundTo: typeof value.roundTo === "number" ? value.roundTo : ESTIMATOR_AI_DEFAULTS.roundTo
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Uventet fejl ved hentning af AI-indstillinger." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { session, error: authError } = requireAdmin(request, ["owner"]);
    if (authError) {
      return authError;
    }

    const payload = (await request.json()) as Record<string, unknown>;
    const enabled = parseBoolean(payload.enabled);
    const fixedPrice = parseBoolean(payload.fixedPrice);
    const roundTo = parseNumber(payload.roundTo);

    if (enabled === null) {
      return NextResponse.json({ message: "enabled skal være true/false." }, { status: 400 });
    }

    const supabase = createSupabaseServiceClient();
    const { data: existing } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "estimator_ai")
      .maybeSingle();

    const existingValue = (existing?.value || {}) as Partial<EstimatorAiSettings>;
    const nextValue: EstimatorAiSettings = {
      enabled,
      minSamples:
        typeof existingValue.minSamples === "number" ? existingValue.minSamples : ESTIMATOR_AI_DEFAULTS.minSamples,
      interval: typeof existingValue.interval === "number" ? existingValue.interval : ESTIMATOR_AI_DEFAULTS.interval,
      minPrice: typeof existingValue.minPrice === "number" ? existingValue.minPrice : ESTIMATOR_AI_DEFAULTS.minPrice,
      maxPrice: typeof existingValue.maxPrice === "number" ? existingValue.maxPrice : ESTIMATOR_AI_DEFAULTS.maxPrice,
      fixedPrice:
        fixedPrice ??
        (typeof existingValue.fixedPrice === "boolean"
          ? existingValue.fixedPrice
          : ESTIMATOR_AI_DEFAULTS.fixedPrice),
      roundTo:
        roundTo ??
        (typeof existingValue.roundTo === "number" ? existingValue.roundTo : ESTIMATOR_AI_DEFAULTS.roundTo)
    };

    const { data, error } = await supabase
      .from("settings")
      .upsert(
        {
          key: "estimator_ai",
          value: nextValue,
          updated_at: new Date().toISOString()
        },
        { onConflict: "key" }
      )
      .select("value")
      .single();

    if (error) {
      if (isMissingRelation(error.message, "settings")) {
        return NextResponse.json(
          { message: "Tabellen settings mangler i databasen. Kør migrationen." },
          { status: 503 }
        );
      }
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    await auditLog({
      action: "setting.update",
      entityType: "setting",
      entityId: "estimator_ai",
      meta: { after: data?.value ?? nextValue },
      req: request,
      actor: session?.email,
      role: session?.role
    });

    return NextResponse.json({ item: data?.value ?? nextValue }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Uventet fejl ved gemning af AI-indstillinger." }, { status: 500 });
  }
}
