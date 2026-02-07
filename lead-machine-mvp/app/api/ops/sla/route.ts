import { NextResponse } from "next/server";
import { requireSupabaseEnv } from "@/lib/env.supabase";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { sendEmail, sendSlackMessage } from "@/lib/ops/notifications";

const SLA_HOURS = 24;

function buildSummary(leads: Array<{ id: string; created_at: string; status: string; areas: string[] }>) {
  if (!leads.length) {
    return "SLA check: no overdue leads.";
  }

  const lines = leads.slice(0, 10).map((lead) => {
    const ageHours = Math.round(
      (Date.now() - new Date(lead.created_at).getTime()) / (1000 * 60 * 60)
    );
    return `• ${lead.id} | ${lead.status} | ${lead.areas.join(", ") || "n/a"} | ${ageHours}h`;
  });

  return `SLA breach summary: ${leads.length} leads over ${SLA_HOURS}h\n${lines.join("\n")}`;
}

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const provided = request.headers.get("x-cron-secret");
    if (provided !== cronSecret) {
      return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
    }
  }
  try {
    requireSupabaseEnv();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Missing Supabase configuration.";
    return NextResponse.json({ ok: false, error: message }, { status: 503 });
  }

  const cutoff = new Date(Date.now() - SLA_HOURS * 60 * 60 * 1000).toISOString();
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("leads")
    .select("id, created_at, status, areas")
    .in("status", ["new", "qualified", "assigned"])
    .is("contacted_at", null)
    .lte("created_at", cutoff);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  const leads = data ?? [];
  const summary = buildSummary(leads);

  if (leads.length > 0) {
    await sendSlackMessage(summary);

    const adminEmail = process.env.ADMIN_ALERT_EMAIL;
    if (adminEmail) {
      await sendEmail({
        to: adminEmail,
        subject: `SLA breach summary (${leads.length})`,
        html: `<p>${summary.replace(/\n/g, "<br/>")}</p>`
      });
    }
  }

  return NextResponse.json({ ok: true, count: leads.length, summary });
}
