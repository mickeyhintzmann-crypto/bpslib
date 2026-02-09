import { NextResponse } from "next/server";

import { assertAdminToken } from "@/lib/admin-auth";
import { auditLog } from "@/lib/audit";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

const DEFAULT_SETTINGS = {
  enabled: true,
  price: 3000,
  windowDays: 14
};

const isMissingRelation = (message: string | undefined, relationName: string) => {
  const normalized = (message || "").toLowerCase();
  return (
    normalized.includes(`relation \"${relationName}\" does not exist`) ||
    normalized.includes(`could not find the table 'public.${relationName}'`)
  );
};

const isMissingRow = (code: string | undefined) => code === "PGRST116";

const parseBoolean = (value: unknown) => (typeof value === "boolean" ? value : null);

const parseIntValue = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.round(value);
  }
  if (typeof value === "string" && /^\d+$/.test(value)) {
    return Number.parseInt(value, 10);
  }
  return null;
};

export async function GET(request: Request) {
  try {
    const authError = assertAdminToken(request);
    if (authError) {
      return authError;
    }

    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("settings")
      .select("key, value")
      .eq("key", "acute")
      .maybeSingle();

    if (error) {
      if (isMissingRelation(error.message, "settings")) {
        return NextResponse.json({ item: DEFAULT_SETTINGS }, { status: 200 });
      }
      if (isMissingRow(error.code)) {
        return NextResponse.json({ item: DEFAULT_SETTINGS }, { status: 200 });
      }
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    const value = (data?.value || {}) as Partial<typeof DEFAULT_SETTINGS>;
    return NextResponse.json(
      {
        item: {
          enabled: typeof value.enabled === "boolean" ? value.enabled : DEFAULT_SETTINGS.enabled,
          price: typeof value.price === "number" ? value.price : DEFAULT_SETTINGS.price,
          windowDays: typeof value.windowDays === "number" ? value.windowDays : DEFAULT_SETTINGS.windowDays
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Uventet fejl ved hentning af indstillinger." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const authError = assertAdminToken(request);
    if (authError) {
      return authError;
    }

    const payload = (await request.json()) as Record<string, unknown>;

    const enabled = parseBoolean(payload.enabled);
    const price = parseIntValue(payload.price);
    const windowDays = parseIntValue(payload.windowDays);

    if (enabled === null) {
      return NextResponse.json({ message: "enabled skal være true/false." }, { status: 400 });
    }

    if (price === null || price < 0) {
      return NextResponse.json({ message: "Pris skal være et tal >= 0." }, { status: 400 });
    }

    if (windowDays === null || windowDays < 1 || windowDays > 30) {
      return NextResponse.json({ message: "Vindue skal være 1-30 dage." }, { status: 400 });
    }

    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("settings")
      .upsert(
        {
          key: "acute",
          value: {
            enabled,
            price,
            windowDays
          },
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
      entityId: "acute",
      meta: { after: data?.value ?? { enabled, price, windowDays } },
      req: request
    });

    return NextResponse.json({ item: data?.value ?? { enabled, price, windowDays } }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Uventet fejl ved gemning af indstillinger." }, { status: 500 });
  }
}
