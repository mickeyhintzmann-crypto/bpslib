import { NextResponse, type NextRequest } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

const MESSAGE_KINDS = ["note", "outbound"] as const;
const MESSAGE_CHANNELS = ["admin", "email", "phone", "whatsapp"] as const;
const LEADS_SCHEMA_MIGRATION = "supabase/migrations/20260302000030_admin_leads_schema.sql";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const asTrimmed = (value: unknown) => (typeof value === "string" ? value.trim() : "");

const asUuidOrNull = (value: string | null | undefined) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value || "")
    ? value
    : null;

const isMissingTable = (message: string | undefined, table: string) => {
  const normalized = (message || "").toLowerCase();
  return (
    normalized.includes(`could not find the table 'public.${table}'`) ||
    normalized.includes(`relation \"${table}\" does not exist`)
  );
};

const resolveId = async (context: RouteContext) => {
  const params = await context.params;
  return params?.id || "";
};

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { session, error: authError } = requireAdmin(request, ["owner", "admin"]);
    if (authError) {
      return authError;
    }

    const leadId = await resolveId(context);
    if (!leadId) {
      return NextResponse.json({ message: "Mangler lead-id." }, { status: 400 });
    }

    const payload = (await request.json()) as Record<string, unknown>;
    const content = asTrimmed(payload.content);
    const kind = asTrimmed(payload.kind) || "note";
    const channel = asTrimmed(payload.channel) || "admin";

    if (!content) {
      return NextResponse.json({ message: "Beskedindhold mangler." }, { status: 400 });
    }

    if (!MESSAGE_KINDS.includes(kind as (typeof MESSAGE_KINDS)[number])) {
      return NextResponse.json({ message: "Ugyldig kind." }, { status: 400 });
    }

    if (!MESSAGE_CHANNELS.includes(channel as (typeof MESSAGE_CHANNELS)[number])) {
      return NextResponse.json({ message: "Ugyldig channel." }, { status: 400 });
    }

    const supabase = createSupabaseServiceClient();

    const { data, error } = await supabase
      .from("lead_messages")
      .insert({
        lead_id: leadId,
        kind,
        channel,
        content,
        created_by: asUuidOrNull(session?.id)
      })
      .select("id, lead_id, created_at, kind, channel, content, created_by")
      .single();

    if (error || !data) {
      if (isMissingTable(error?.message, "lead_messages")) {
        return NextResponse.json(
          {
            message: `Lead_messages-tabellen mangler. Kør migrationen ${LEADS_SCHEMA_MIGRATION}.`
          },
          { status: 503 }
        );
      }
      return NextResponse.json({ message: error?.message || "Kunne ikke oprette besked." }, { status: 500 });
    }

    return NextResponse.json(
      {
        item: {
          id: data.id,
          leadId: data.lead_id,
          createdAt: data.created_at,
          kind: data.kind,
          channel: data.channel,
          content: data.content,
          createdBy: data.created_by
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Uventet fejl ved oprettelse af besked." }, { status: 500 });
  }
}
