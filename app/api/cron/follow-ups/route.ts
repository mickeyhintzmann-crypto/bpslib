import { NextResponse } from "next/server";

import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/notify/email";

const verifyCronSecret = (request: Request): boolean => {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.warn("CRON_SECRET not configured");
    return false;
  }

  const headerSecret = request.headers.get("x-cron-secret");
  return headerSecret === cronSecret;
};

interface FollowUpAction {
  type: "overdue_followup" | "stale_lead" | "old_estimator";
  itemId: string;
  itemType: string;
  name: string;
  email?: string | null;
  daysOld?: number;
}

export async function GET(request: Request) {
  try {
    // Verify cron secret
    if (!verifyCronSecret(request)) {
      return NextResponse.json(
        { message: "Unauthorized: Invalid cron secret" },
        { status: 401 }
      );
    }

    const supabase = createSupabaseServiceClient();
    const actions: FollowUpAction[] = [];
    const now = new Date().toISOString();

    // 1. Check for overdue follow-ups: leads where follow_up_at < now AND status NOT IN ('won', 'lost')
    const { data: overdueLeads, error: overdueError } = await supabase
      .from("leads")
      .select("id, name, email, follow_up_at, status")
      .lt("follow_up_at", now)
      .not("status", "in", '("won","lost")');

    if (!overdueError && overdueLeads) {
      for (const lead of overdueLeads) {
        actions.push({
          type: "overdue_followup",
          itemId: lead.id,
          itemType: "lead",
          name: lead.name || "Unknown",
          email: lead.email
        });
      }
    }

    // 2. Check for stale new leads: leads where status='new' AND created_at < now - 48 hours
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

    const { data: staleLeads, error: staleError } = await supabase
      .from("leads")
      .select("id, name, email, created_at, status")
      .eq("status", "new")
      .lt("created_at", fortyEightHoursAgo);

    if (!staleError && staleLeads) {
      for (const lead of staleLeads) {
        const createdDate = new Date(lead.created_at);
        const daysOld = Math.floor(
          (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        actions.push({
          type: "stale_lead",
          itemId: lead.id,
          itemType: "lead",
          name: lead.name || "Unknown",
          email: lead.email,
          daysOld
        });
      }
    }

    // 3. Check for old estimator requests: estimator_requests where status='Ny' AND created_at < now - 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: oldEstimators, error: estimatorError } = await supabase
      .from("estimator_requests")
      .select("id, fields, created_at, status")
      .eq("status", "Ny")
      .lt("created_at", twentyFourHoursAgo);

    if (!estimatorError && oldEstimators) {
      for (const estimator of oldEstimators) {
        const navn = estimator.fields?.navn || "Unknown";
        const email = estimator.fields?.email || null;
        actions.push({
          type: "old_estimator",
          itemId: estimator.id,
          itemType: "estimator",
          name: navn,
          email
        });
      }
    }

    // Send email notifications and update priorities for each action
    const processedActions: FollowUpAction[] = [];

    for (const action of actions) {
      try {
        let subject = "";
        let html = "";

        switch (action.type) {
          case "overdue_followup":
            subject = `Opfølgning forfalden: ${action.name}`;
            html = `<p>Opfølgning på lead fra <strong>${action.name}</strong> er forfalden.</p>
                    <p><a href="${process.env.NEXT_PUBLIC_APP_URL || "https://admin.bpslib.dk"}/admin/leads/${action.itemId}">Gå til lead</a></p>`;
            break;

          case "stale_lead":
            subject = `Stagneret lead: ${action.name} (${action.daysOld} dage)`;
            html = `<p>Lead fra <strong>${action.name}</strong> har ikke udviklet sig i ${action.daysOld} dage.</p>
                    <p><a href="${process.env.NEXT_PUBLIC_APP_URL || "https://admin.bpslib.dk"}/admin/leads/${action.itemId}">Gå til lead</a></p>`;
            break;

          case "old_estimator":
            subject = `Gammel estimatanmodning: ${action.name}`;
            html = `<p>Estimatanmodning fra <strong>${action.name}</strong> venter på svar i over 24 timer.</p>
                    <p><a href="${process.env.NEXT_PUBLIC_APP_URL || "https://admin.bpslib.dk"}/admin/estimator">Gå til estimator</a></p>`;
            break;
        }

        // Send email notification
        if (subject && html) {
          await sendEmail({
            subject,
            html,
            text: subject
          });
        }

        // Update priority for leads marked as stale
        if (action.type === "stale_lead") {
          await supabase
            .from("leads")
            .update({ priority: "urgent" })
            .eq("id", action.itemId);
        }

        processedActions.push(action);
      } catch (err) {
        console.error(`Error processing action for ${action.itemId}:`, err);
      }
    }

    return NextResponse.json(
      {
        message: "Follow-up check completed",
        summary: {
          overdueFollowups: actions.filter((a) => a.type === "overdue_followup").length,
          staleLeads: actions.filter((a) => a.type === "stale_lead").length,
          oldEstimators: actions.filter((a) => a.type === "old_estimator").length,
          totalProcessed: processedActions.length
        },
        actions: processedActions
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Cron follow-up error:", error);
    return NextResponse.json(
      {
        message: "Error during follow-up check",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
