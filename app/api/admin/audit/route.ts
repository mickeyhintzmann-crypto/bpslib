import { NextResponse } from "next/server";

import { assertAdminToken } from "@/lib/admin-auth";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

const ENTITY_TYPES = ["booking", "lead", "estimator", "day_override", "setting"] as const;

const isMissingRelation = (message: string | undefined, relationName: string) => {
  const normalized = (message || "").toLowerCase();
  return (
    normalized.includes(`relation \"${relationName}\" does not exist`) ||
    normalized.includes(`could not find the table 'public.${relationName}'`)
  );
};

const parsePositiveInt = (value: string | null, fallback: number) => {
  if (!value) {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 1) {
    return fallback;
  }
  return parsed;
};

export async function GET(request: Request) {
  try {
    const authError = assertAdminToken(request);
    if (authError) {
      return authError;
    }

    const url = new URL(request.url);
    const entityType = url.searchParams.get("entity_type");
    const action = url.searchParams.get("action");
    const entityId = url.searchParams.get("entity_id");
    const limit = Math.min(parsePositiveInt(url.searchParams.get("limit"), 200), 500);

    const supabase = createSupabaseServiceClient();
    let query = supabase
      .from("audit_log")
      .select("id, created_at, action, entity_type, entity_id, meta, ip, user_agent")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (entityType && ENTITY_TYPES.includes(entityType as (typeof ENTITY_TYPES)[number])) {
      query = query.eq("entity_type", entityType);
    }

    if (action) {
      query = query.ilike("action", `%${action}%`);
    }

    if (entityId) {
      query = query.eq("entity_id", entityId);
    }

    const { data, error } = await query;

    if (error) {
      if (isMissingRelation(error.message, "audit_log")) {
        return NextResponse.json(
          { message: "Tabellen audit_log mangler i databasen." },
          { status: 503 }
        );
      }
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({ items: data || [] }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Uventet fejl ved audit log." }, { status: 500 });
  }
}
