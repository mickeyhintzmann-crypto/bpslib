import { NextResponse, type NextRequest } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { logEmail, sendMail } from "@/lib/mailer";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

const LEADS_SCHEMA_MIGRATION = "supabase/migrations/20260302000030_admin_leads_schema.sql";
const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

type RouteContext = {
  params: Promise<{ id: string }>;
};

type LeadRow = {
  id: string;
  status: string;
  name: string | null;
  email: string | null;
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
    const subject = asTrimmed(payload.subject);
    const message = asTrimmed(payload.message);
    const statusAfter = asTrimmed(payload.statusAfter) || "awaiting_customer";

    if (!subject || subject.length < 3) {
      return NextResponse.json({ message: "Emne skal være mindst 3 tegn." }, { status: 400 });
    }
    if (!message || message.length < 5) {
      return NextResponse.json({ message: "Besked skal være mindst 5 tegn." }, { status: 400 });
    }
    if (!["awaiting_customer", "in_progress", "won", "lost", "new"].includes(statusAfter)) {
      return NextResponse.json({ message: "Ugyldig statusAfter." }, { status: 400 });
    }

    const supabase = createSupabaseServiceClient();
    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .select("id, status, name, email")
      .eq("id", leadId)
      .single();

    if (leadError || !lead) {
      if (isMissingTable(leadError?.message, "leads")) {
        return NextResponse.json(
          {
            message: `Leads-tabellen mangler. Kør migrationen ${LEADS_SCHEMA_MIGRATION}.`
          },
          { status: 503 }
        );
      }
      return NextResponse.json({ message: leadError?.message || "Lead blev ikke fundet." }, { status: 404 });
    }

    const leadRow = lead as LeadRow;
    const toEmail = asTrimmed(leadRow.email);
    if (!toEmail || !EMAIL_REGEX.test(toEmail)) {
      return NextResponse.json({ message: "Lead har ingen gyldig email." }, { status: 400 });
    }

    const greetingName = asTrimmed(leadRow.name) || "kunde";
    const textBody = `Hej ${greetingName},\n\n${message}\n\nVenlig hilsen\nBP Slib`;

    const sendResult = await sendMail({
      to: toEmail,
      subject,
      text: textBody
    });

    await logEmail({
      kind: "lead.reply",
      to: toEmail,
      subject,
      ok: sendResult.ok,
      error: sendResult.error || null,
      meta: {
        leadId,
        statusAfter,
        senderAdminId: session?.id || null
      }
    });

    if (!sendResult.ok) {
      return NextResponse.json({ message: sendResult.error || "Kunne ikke sende email." }, { status: 500 });
    }

    const outboundLog = `Email sendt til ${toEmail}\nEmne: ${subject}\n\n${message}`;
    const { data: messageRow, error: messageError } = await supabase
      .from("lead_messages")
      .insert({
        lead_id: leadId,
        kind: "outbound",
        channel: "email",
        content: outboundLog,
        created_by: asUuidOrNull(session?.id)
      })
      .select("id, lead_id, created_at, kind, channel, content, created_by")
      .single();

    if (messageError || !messageRow) {
      if (isMissingTable(messageError?.message, "lead_messages")) {
        return NextResponse.json(
          {
            message: `Lead_messages-tabellen mangler. Kør migrationen ${LEADS_SCHEMA_MIGRATION}.`
          },
          { status: 503 }
        );
      }
      return NextResponse.json({ message: messageError?.message || "Kunne ikke logge outbound besked." }, { status: 500 });
    }

    const { data: updatedLead, error: updateError } = await supabase
      .from("leads")
      .update({ status: statusAfter })
      .eq("id", leadId)
      .select("id, status")
      .single();

    if (updateError || !updatedLead) {
      return NextResponse.json({ message: updateError?.message || "Email sendt, men status blev ikke opdateret." }, { status: 500 });
    }

    return NextResponse.json(
      {
        item: {
          id: messageRow.id,
          leadId: messageRow.lead_id,
          createdAt: messageRow.created_at,
          kind: messageRow.kind,
          channel: messageRow.channel,
          content: messageRow.content,
          createdBy: messageRow.created_by
        },
        lead: {
          id: updatedLead.id,
          status: updatedLead.status
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Uventet fejl ved afsendelse af svar." }, { status: 500 });
  }
}
