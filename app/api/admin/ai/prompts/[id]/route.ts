import { NextResponse, type NextRequest } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import {
  AI_CONTROL_ROOM_MIGRATION,
  asTrimmed,
  isAiService,
  isMissingAiTable,
  sanitizeObject
} from "@/lib/ai-estimator-control-room";
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

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { error: authError } = requireAdmin(request, ["owner", "admin"]);
    if (authError) {
      return authError;
    }

    const id = await resolveId(context);
    if (!id) {
      return NextResponse.json({ message: "Mangler prompt version id." }, { status: 400 });
    }

    const payload = (await request.json()) as Record<string, unknown>;
    const updates: Record<string, unknown> = {};

    if (Object.prototype.hasOwnProperty.call(payload, "name")) {
      const name = asTrimmed(payload.name);
      if (name.length < 2) {
        return NextResponse.json({ message: "Name er påkrævet." }, { status: 400 });
      }
      updates.name = name;
    }

    if (Object.prototype.hasOwnProperty.call(payload, "service")) {
      const service = asTrimmed(payload.service).toLowerCase();
      if (!isAiService(service)) {
        return NextResponse.json({ message: "Ugyldig service." }, { status: 400 });
      }
      updates.service = service;
    }

    if (Object.prototype.hasOwnProperty.call(payload, "prompt")) {
      const prompt = asTrimmed(payload.prompt);
      if (prompt.length < 10) {
        return NextResponse.json({ message: "Prompt er for kort." }, { status: 400 });
      }
      updates.prompt = prompt;
    }

    if (Object.prototype.hasOwnProperty.call(payload, "rules")) {
      updates.rules = sanitizeObject(payload.rules);
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ message: "Ingen felter at opdatere." }, { status: 400 });
    }

    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("ai_prompt_versions")
      .update(updates)
      .eq("id", id)
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
      return NextResponse.json({ message: error?.message || "Kunne ikke opdatere prompt version." }, { status: 500 });
    }

    return NextResponse.json({ item: toPromptItem(data as PromptRow) }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Uventet fejl ved opdatering af prompt version." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
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
    const { data, error } = await supabase
      .from("ai_prompt_versions")
      .update({ is_active: false })
      .eq("id", id)
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
      return NextResponse.json({ message: error?.message || "Kunne ikke deaktivere prompt version." }, { status: 500 });
    }

    return NextResponse.json(
      { item: toPromptItem(data as PromptRow), message: "Prompt version deaktiveret." },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Uventet fejl ved deaktivering af prompt version." }, { status: 500 });
  }
}
