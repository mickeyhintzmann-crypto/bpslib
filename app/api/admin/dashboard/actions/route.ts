import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

const COPENHAGEN_TIME_ZONE = "Europe/Copenhagen";

const isMissingColumn = (message: string | undefined) => {
  const normalized = (message || "").toLowerCase();
  return normalized.includes("column") && normalized.includes("does not exist");
};

const isMissingRelation = (message: string | undefined, relationName: string) => {
  const normalized = (message || "").toLowerCase();
  return (
    normalized.includes(`relation \"${relationName}\" does not exist`) ||
    normalized.includes(`could not find the table 'public.${relationName}'`)
  );
};

const getTodayInCopenhagen = (): string => {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: COPENHAGEN_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
  return formatter.format(new Date());
};

const getWeekAgoInCopenhagen = (): string => {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: COPENHAGEN_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
  const date = new Date();
  date.setDate(date.getDate() - 7);
  return formatter.format(date);
};

const getTwoWeeksAgoInCopenhagen = (): string => {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: COPENHAGEN_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
  const date = new Date();
  date.setDate(date.getDate() - 14);
  return formatter.format(date);
};

interface UrgentAction {
  id: string;
  type: "booking" | "lead" | "estimator";
  name?: string;
  customer_name?: string;
  phone?: string | null;
  service?: string | null;
  status?: string;
  source?: string | null;
  created_at: string;
  context?: Record<string, any>;
}

interface TodayTask {
  id: string;
  type: "booking" | "lead" | "estimator";
  name?: string;
  customer_name?: string;
  phone?: string | null;
  service?: string | null;
  status?: string;
  created_at: string;
  follow_up_at?: string | null;
  context?: Record<string, any>;
}

interface KPIData {
  new_leads_this_week: number;
  new_leads_last_week: number;
  conversion_rate: number;
  avg_response_time_hours: number;
  revenue_this_week: number;
}

interface DashboardActionsResponse {
  urgent_actions: UrgentAction[];
  today_tasks: TodayTask[];
  kpis: KPIData;
}

export async function GET(request: Request) {
  try {
    const { error: authError } = requireAdmin(request, ["owner", "admin"]);
    if (authError) {
      return authError;
    }

    const supabase = createSupabaseServiceClient();
    const today = getTodayInCopenhagen();
    const weekAgo = getWeekAgoInCopenhagen();
    const twoWeeksAgo = getTwoWeeksAgoInCopenhagen();

    // Initialize response structure
    const response: DashboardActionsResponse = {
      urgent_actions: [],
      today_tasks: [],
      kpis: {
        new_leads_this_week: 0,
        new_leads_last_week: 0,
        conversion_rate: 0,
        avg_response_time_hours: 0,
        revenue_this_week: 0
      }
    };

    // ===== URGENT ACTIONS =====

    // 1. Unconfirmed acute bookings
    try {
      const acuteBookingsResult = await supabase
        .from("bookings")
        .select(
          "id, source, status, created_at, customer_name, customer_phone, service_type"
        )
        .eq("source", "acute")
        .in("status", ["pending_confirmation", "new"]);

      if (!acuteBookingsResult.error && acuteBookingsResult.data) {
        acuteBookingsResult.data.forEach((booking: any) => {
          response.urgent_actions.push({
            id: booking.id,
            type: "booking",
            customer_name: booking.customer_name || undefined,
            phone: booking.customer_phone || null,
            service: booking.service_type || undefined,
            status: booking.status,
            source: booking.source,
            created_at: booking.created_at,
            context: { priority: "acute_unconfirmed" }
          });
        });
      }
    } catch (error) {
      console.error("Error fetching acute bookings:", error);
    }

    // 2. Stale leads (>24 hours old, status='new')
    try {
      const staleLeadsResult = await supabase
        .from("leads")
        .select("id, name, phone, service, status, created_at")
        .eq("status", "new")
        .lt("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (!staleLeadsResult.error && staleLeadsResult.data) {
        staleLeadsResult.data.forEach((lead: any) => {
          response.urgent_actions.push({
            id: lead.id,
            type: "lead",
            name: lead.name || undefined,
            phone: lead.phone || null,
            service: lead.service || undefined,
            status: lead.status,
            created_at: lead.created_at,
            context: { priority: "stale_lead" }
          });
        });
      }
    } catch (error) {
      console.error("Error fetching stale leads:", error);
    }

    // 3. Old estimator requests (>4 hours old, status='Ny')
    try {
      const oldEstimatorResult = await supabase
        .from("estimator_requests")
        .select("id, status, created_at, fields")
        .eq("status", "Ny")
        .lt("created_at", new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString());

      if (!oldEstimatorResult.error && oldEstimatorResult.data) {
        oldEstimatorResult.data.forEach((estimator: any) => {
          const fields = estimator.fields || {};
          response.urgent_actions.push({
            id: estimator.id,
            type: "estimator",
            name: fields.navn || fields.name || undefined,
            phone: fields.telefon || fields.phone || null,
            status: estimator.status,
            created_at: estimator.created_at,
            context: { priority: "old_estimator" }
          });
        });
      }
    } catch (error) {
      console.error("Error fetching old estimator requests:", error);
    }

    // ===== TODAY TASKS =====

    // 1. Bookings needing confirmation today
    try {
      const tomorrowKey = new Date();
      tomorrowKey.setDate(tomorrowKey.getDate() + 1);
      const tomorrowFormatter = new Intl.DateTimeFormat("en-CA", {
        timeZone: COPENHAGEN_TIME_ZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      });
      const tomorrow = tomorrowFormatter.format(tomorrowKey);

      const confirmBookingsResult = await supabase
        .from("bookings")
        .select(
          "id, status, created_at, customer_name, customer_phone, service_type, date"
        )
        .eq("status", "pending_confirmation")
        .gte("date", today)
        .lt("date", tomorrow);

      if (!confirmBookingsResult.error && confirmBookingsResult.data) {
        confirmBookingsResult.data.forEach((booking: any) => {
          response.today_tasks.push({
            id: booking.id,
            type: "booking",
            customer_name: booking.customer_name || undefined,
            phone: booking.customer_phone || null,
            service: booking.service_type || undefined,
            status: booking.status,
            created_at: booking.created_at,
            context: { task_type: "confirm_booking", date: booking.date }
          });
        });
      }
    } catch (error) {
      console.error("Error fetching bookings needing confirmation:", error);
    }

    // 2. Follow-ups due today
    try {
      const followUpResult = await supabase
        .from("leads")
        .select("id, name, phone, service, status, created_at, follow_up_at")
        .lte("follow_up_at", new Date().toISOString())
        .gte("follow_up_at", `${today}T00:00:00Z`)
        .not("status", "in", "(\"won\",\"lost\")");

      if (!followUpResult.error && followUpResult.data) {
        followUpResult.data.forEach((lead: any) => {
          response.today_tasks.push({
            id: lead.id,
            type: "lead",
            name: lead.name || undefined,
            phone: lead.phone || null,
            service: lead.service || undefined,
            status: lead.status,
            created_at: lead.created_at,
            follow_up_at: lead.follow_up_at || undefined,
            context: { task_type: "follow_up" }
          });
        });
      }
    } catch (error) {
      console.error("Error fetching follow-ups due today:", error);
    }

    // 3. Quotes to send (status='Under review')
    try {
      const quotesResult = await supabase
        .from("estimator_requests")
        .select("id, status, created_at, fields")
        .eq("status", "Under review");

      if (!quotesResult.error && quotesResult.data) {
        quotesResult.data.forEach((estimator: any) => {
          const fields = estimator.fields || {};
          response.today_tasks.push({
            id: estimator.id,
            type: "estimator",
            name: fields.navn || fields.name || undefined,
            phone: fields.telefon || fields.phone || null,
            status: estimator.status,
            created_at: estimator.created_at,
            context: { task_type: "send_quote" }
          });
        });
      }
    } catch (error) {
      console.error("Error fetching quotes to send:", error);
    }

    // ===== KPIs =====

    // 1. New leads this week
    try {
      const leadsThisWeekResult = await supabase
        .from("leads")
        .select("id", { count: "exact", head: true })
        .gte("created_at", `${weekAgo}T00:00:00Z`);

      if (!leadsThisWeekResult.error) {
        response.kpis.new_leads_this_week = leadsThisWeekResult.count || 0;
      }
    } catch (error) {
      console.error("Error counting leads this week:", error);
    }

    // 2. New leads last week
    try {
      const leadsLastWeekResult = await supabase
        .from("leads")
        .select("id", { count: "exact", head: true })
        .gte("created_at", `${twoWeeksAgo}T00:00:00Z`)
        .lt("created_at", `${weekAgo}T00:00:00Z`);

      if (!leadsLastWeekResult.error) {
        response.kpis.new_leads_last_week = leadsLastWeekResult.count || 0;
      }
    } catch (error) {
      console.error("Error counting leads last week:", error);
    }

    // 3. Conversion rate (this month)
    try {
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      const monthStartStr = monthStart.toISOString();

      const wonLeadsResult = await supabase
        .from("leads")
        .select("id", { count: "exact", head: true })
        .eq("status", "won")
        .gte("created_at", monthStartStr);

      const totalLeadsResult = await supabase
        .from("leads")
        .select("id", { count: "exact", head: true })
        .gte("created_at", monthStartStr);

      if (!wonLeadsResult.error && !totalLeadsResult.error) {
        const wonCount = wonLeadsResult.count || 0;
        const totalCount = totalLeadsResult.count || 0;
        response.kpis.conversion_rate = totalCount > 0 ? Math.round((wonCount / totalCount) * 100) : 0;
      }
    } catch (error) {
      console.error("Error calculating conversion rate:", error);
    }

    // 4. Average response time (lead created_at to first lead_message)
    try {
      const leadsWithMessagesResult = await supabase
        .from("lead_messages")
        .select("lead_id, created_at")
        .order("created_at", { ascending: true });

      if (!leadsWithMessagesResult.error && leadsWithMessagesResult.data && leadsWithMessagesResult.data.length > 0) {
        const leadsResult = await supabase
          .from("leads")
          .select("id, created_at");

        if (!leadsResult.error && leadsResult.data) {
          const leadsMap = new Map(leadsResult.data.map((l: any) => [l.id, l.created_at]));
          let totalHours = 0;
          let count = 0;

          // Get first message per lead
          const firstMessages = new Map<string, string>();
          leadsWithMessagesResult.data.forEach((msg: any) => {
            if (!firstMessages.has(msg.lead_id)) {
              firstMessages.set(msg.lead_id, msg.created_at);
            }
          });

          firstMessages.forEach((msgTime, leadId) => {
            const leadTime = leadsMap.get(leadId);
            if (leadTime) {
              const leadDate = new Date(leadTime);
              const msgDate = new Date(msgTime);
              const hours = (msgDate.getTime() - leadDate.getTime()) / (1000 * 60 * 60);
              if (hours >= 0) {
                totalHours += hours;
                count++;
              }
            }
          });

          response.kpis.avg_response_time_hours = count > 0 ? Math.round((totalHours / count) * 10) / 10 : 0;
        }
      }
    } catch (error) {
      console.error("Error calculating average response time:", error);
    }

    // 5. Revenue this week
    try {
      const tomorrowKey = new Date();
      tomorrowKey.setDate(tomorrowKey.getDate() + 7);
      const tomorrowFormatter = new Intl.DateTimeFormat("en-CA", {
        timeZone: COPENHAGEN_TIME_ZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      });
      const weekEnd = tomorrowFormatter.format(tomorrowKey);

      const revenueResult = await supabase
        .from("bookings")
        .select("price_total, status")
        .gte("updated_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .eq("status", "done");

      if (!revenueResult.error && revenueResult.data) {
        response.kpis.revenue_this_week = revenueResult.data.reduce((sum: number, booking: any) => {
          return sum + (booking.price_total || 0);
        }, 0);
      }
    } catch (error) {
      console.error("Error calculating revenue this week:", error);
    }

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error in dashboard actions:", error);
    return NextResponse.json(
      { message: "Uventet fejl ved hentning af dashboard actions." },
      { status: 500 }
    );
  }
}
