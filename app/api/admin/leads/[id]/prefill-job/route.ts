import { NextResponse, type NextRequest } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { isJobService } from "@/lib/admin/jobs";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

const LEADS_SCHEMA_MIGRATION = "supabase/migrations/20260302_000030_admin_leads_schema.sql";

type RouteContext = {
  params: Promise<{ id: string }>;
};

type LeadRow = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  message: string | null;
  service: string | null;
  page_url: string | null;
};

const asTrimmed = (value: unknown) => (typeof value === "string" ? value.trim() : "");

const short = (value: string | null | undefined) => asTrimmed(value);

const resolveId = async (context: RouteContext) => {
  const params = await context.params;
  return params?.id || "";
};

const isMissingTable = (message: string | undefined, table: string) => {
  const normalized = (message || "").toLowerCase();
  return (
    normalized.includes(`could not find the table 'public.${table}'`) ||
    normalized.includes(`relation \"${table}\" does not exist`)
  );
};

const buildDefaultWindow = () => {
  const start = new Date();
  start.setMinutes(0, 0, 0);
  start.setHours(start.getHours() + 1);

  const end = new Date(start);
  end.setHours(end.getHours() + 2);

  return {
    start_at: start.toISOString(),
    end_at: end.toISOString()
  };
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { error: authError } = requireAdmin(request, ["owner", "admin"]);
    if (authError) {
      return authError;
    }

    const id = await resolveId(context);
    if (!id) {
      return NextResponse.json({ message: "Mangler lead-id." }, { status: 400 });
    }

    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("leads")
      .select("id, name, email, phone, location, message, service, page_url")
      .eq("id", id)
      .single();

    if (error || !data) {
      if (isMissingTable(error?.message, "leads")) {
        return NextResponse.json(
          {
            message: `Leads-tabellen mangler. Kør migrationen ${LEADS_SCHEMA_MIGRATION}.`
          },
          { status: 503 }
        );
      }
      return NextResponse.json({ message: error?.message || "Lead blev ikke fundet." }, { status: 404 });
    }

    const lead = data as LeadRow;
    const service = isJobService(short(lead.service)) ? short(lead.service) : "andet";
    const location = short(lead.location) || "ukendt lokation";

    const name = short(lead.name);
    const phone = short(lead.phone);
    const email = short(lead.email);
    const message = short(lead.message);
    const pageUrl = short(lead.page_url);

    const notes = [
      `Lead: ${name || "Ukendt"}${phone ? ` · ${phone}` : ""}${email ? ` · ${email}` : ""}`,
      "",
      "Besked:",
      message || "-",
      "",
      "Side:",
      pageUrl || "-"
    ].join("\n");

    return NextResponse.json(
      {
        lead: {
          id: lead.id,
          name: lead.name,
          phone: lead.phone,
          email: lead.email,
          location: lead.location,
          message: lead.message,
          service: lead.service
        },
        jobDraft: {
          lead_id: lead.id,
          title: `Opgave: ${service} — ${location}`,
          service,
          location: lead.location || "",
          address: "",
          notes,
          status: "unassigned",
          ...buildDefaultWindow()
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Uventet fejl ved job-prefill." }, { status: 500 });
  }
}
