import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import {
  AI_CONTROL_ROOM_MIGRATION,
  asTrimmed,
  isAiService,
  isMissingAiTable,
  sanitizeObject
} from "@/lib/ai-estimator-control-room";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

type PromptRow = {
  id: string;
  created_at: string;
  name: string;
  service: string;
  prompt: string;
  rules: Record<string, unknown> | null;
  is_active: boolean;
};

const toPromptItem = (row: PromptRow) => ({
  id: row.id,
  created_at: row.created_at,
  name: row.name,
  service: row.service,
  prompt: row.prompt,
  rules: row.rules || {},
  is_active: row.is_active
});

export async function GET(request: Request) {
  try {
    const { error: authError } = requireAdmin(request, ["owner", "admin", "viewer"]);
    if (authError) {
      return authError;
    }

    const url = new URL(request.url);
    const service = asTrimmed(url.searchParams.get("service")).toLowerCase();

    const supabase = createSupabaseServiceClient();
    let query = supabase
      .from("ai_prompt_versions")
      .select("id, created_at, name, service, prompt, rules, is_active")
      .order("service", { ascending: true })
      .order("created_at", { ascending: false });

    if (service && service !== "alle" && isAiService(service)) {
      query = query.eq("service", service);
    }

    const { data, error } = await query;
    if (error) {
      if (isMissingAiTable(error.message, "ai_prompt_versions")) {
        return NextResponse.json(
          {
            message: `AI control room-tabeller mangler. Kør migrationen ${AI_CONTROL_ROOM_MIGRATION}.`
          },
          { status: 503 }
        );
      }
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({ items: ((data || []) as PromptRow[]).map(toPromptItem) }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Uventet fejl ved hentning af prompt versions." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { error: authError } = requireAdmin(request, ["owner", "admin"]);
    if (authError) {
      return authError;
    }

    const payload = (await request.json()) as Record<string, unknown>;
    const name = asTrimmed(payload.name);
    const serviceRaw = asTrimmed(payload.service).toLowerCase();
    const prompt = asTrimmed(payload.prompt);
    const isActive = payload.is_active === true || payload.isActive === true;
    const rules = sanitizeObject(payload.rules);

    if (name.length < 2) {
      return NextResponse.json({ message: "Name er påkrævet." }, { status: 400 });
    }
    if (!isAiService(serviceRaw)) {
      return NextResponse.json({ message: "Ugyldig service." }, { status: 400 });
    }
    if (prompt.length < 10) {
      return NextResponse.json({ message: "Prompt er for kort." }, { status: 400 });
    }

    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("ai_prompt_versions")
      .insert({
        name,
        service: serviceRaw,
        prompt,
        rules,
        is_active: isActive
      })
      .select("id, created_at, name, service, prompt, rules, is_active")
      .single();

    if (error || !data) {
      if (isMissingAiTable(error?.message, "ai_prompt_versions")) {
        return NextResponse.json(
          {
            message: `AI control room-tabeller mangler. Kør migrationen ${AI_CONTROL_ROOM_MIGRATION}.`
          },
          { status: 503 }
        );
      }
      return NextResponse.json({ message: error?.message || "Kunne ikke oprette prompt version." }, { status: 500 });
    }

    if (isActive) {
      await supabase
        .from("ai_prompt_versions")
        .update({ is_active: false })
        .eq("service", serviceRaw)
        .neq("id", (data as PromptRow).id);
    }

    return NextResponse.json({ item: toPromptItem(data as PromptRow) }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Uventet fejl ved oprettelse af prompt version." }, { status: 500 });
  }
}
