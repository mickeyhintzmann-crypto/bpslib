import { NextResponse, type NextRequest } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { AI_CONTROL_ROOM_MIGRATION, isMissingAiTable } from "@/lib/ai-estimator-control-room";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type PromptRow = {
  id: string;
  created_at: string;
  name: string;
  service: string;
  prompt: string;
  rules: Record<string, unknown> | null;
  is_active: boolean;
};

const resolveId = async (context: RouteContext) => {
  const params = await context.params;
  return params?.id || "";
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

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { error: authError } = requireAdmin(request, ["owner", "admin"]);
    if (authError) {
      return authError;
    }

    const id = await resolveId(context);
    if (!id) {
      return NextResponse.json({ message: "Mangler prompt version id." }, { status: 400 });
    }

    const supabase = createSupabaseServiceClient();

    const { data: current, error: currentError } = await supabase
      .from("ai_prompt_versions")
      .select("id, service")
      .eq("id", id)
      .single();

    if (currentError || !current) {
      if (isMissingAiTable(currentError?.message, "ai_prompt_versions")) {
        return NextResponse.json(
          {
            message: `AI control room-tabeller mangler. Kør migrationen ${AI_CONTROL_ROOM_MIGRATION}.`
          },
          { status: 503 }
        );
      }
      return NextResponse.json({ message: currentError?.message || "Prompt version blev ikke fundet." }, { status: 404 });
    }

    const service = String(current.service);

    const { error: deactivateError } = await supabase
      .from("ai_prompt_versions")
      .update({ is_active: false })
      .eq("service", service);

    if (deactivateError) {
      return NextResponse.json({ message: deactivateError.message }, { status: 500 });
    }

    const { error: activateError } = await supabase
      .from("ai_prompt_versions")
      .update({ is_active: true })
      .eq("id", id);

    if (activateError) {
      return NextResponse.json({ message: activateError.message }, { status: 500 });
    }

    const { data, error } = await supabase
      .from("ai_prompt_versions")
      .select("id, created_at, name, service, prompt, rules, is_active")
      .eq("service", service)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({ items: ((data || []) as PromptRow[]).map(toPromptItem) }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Uventet fejl ved aktivering af prompt version." }, { status: 500 });
  }
}
