import { notFound } from "next/navigation";
import { createMetadata } from "@/lib/seo/metadata";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getSupabaseEnvStatus } from "@/lib/env.supabase";
import { StatusSelect } from "@/components/admin/status-select";
import { PartnersSelect } from "@/components/admin/partners-select";
import { NotesEditor } from "@/components/admin/notes-editor";
import { WhatsAppCopyButton } from "@/components/admin/whatsapp-copy";
import { LeadSummaryCopy } from "@/components/admin/lead-summary";
import { type LeadStatus } from "@/lib/admin/status";

export const metadata = createMetadata({
  title: "Lead Detail",
  description: "Lead detail view.",
  path: "/admin/leads",
  noIndex: true
});

export default async function LeadDetailPage({ params }: { params: { id: string } }) {
  const { ok, missing } = getSupabaseEnvStatus();
  if (!ok) {
    return (
      <section className="space-y-4">
        <h2 className="font-display text-2xl">Missing Supabase configuration</h2>
        <p className="text-neutral-600">
          Add the following environment variables to enable the admin CRM.
        </p>
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 text-sm text-neutral-700">
          {missing.join(", ")}
        </div>
      </section>
    );
  }

  const supabase = createServerSupabaseClient();
  const { data: lead, error } = await supabase
    .from("leads")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !lead) {
    notFound();
  }

  const { data: partners } = await supabase
    .from("partners")
    .select("id,name,is_active")
    .eq("is_active", true)
    .order("name", { ascending: true });

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h2 className="font-display text-2xl">{lead.name}</h2>
        <p className="text-neutral-600">Lead ID: {lead.id}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-3xl border border-neutral-200 bg-white p-6 md:col-span-2">
          <h3 className="font-display text-xl">Lead details</h3>
          <div className="mt-4 grid gap-3 text-sm text-neutral-700 md:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Contact</p>
              <p className="mt-2">{lead.email}</p>
              <p>{lead.phone}</p>
              <p className="text-neutral-500">Preferred: {lead.preferred_contact}</p>
              {lead.phone ? (
                <a
                  href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex rounded-full border border-neutral-900 bg-neutral-900 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white"
                >
                  Open WhatsApp
                </a>
              ) : null}
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Criteria</p>
              <p className="mt-2">Areas: {lead.areas?.join(", ")}</p>
              <p>Budget: {lead.budget_band}</p>
              <p>Timeline: {lead.timeline}</p>
              <p>Purpose: {lead.purpose}</p>
              <p>Financing: {lead.financing}</p>
              <p>Must-haves: {(lead.must_haves ?? []).join(", ")}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Source</p>
              <p className="mt-2">{lead.page_type}</p>
              <p>
                {lead.area} {lead.intent ? ` / ${lead.intent}` : ""}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">UTM</p>
              <p className="mt-2">{lead.utm?.utm_source ?? ""}</p>
              <p>{lead.utm?.utm_campaign ?? ""}</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-neutral-200 bg-white p-6">
          <h3 className="font-display text-xl">Status</h3>
          <div className="mt-4">
            <StatusSelect leadId={lead.id} value={lead.status as LeadStatus} />
          </div>
          <div className="mt-6 space-y-2 text-sm text-neutral-600">
            <p>Lead score: {lead.lead_score}</p>
            <p>Created: {new Date(lead.created_at).toLocaleString()}</p>
            {lead.assigned_at ? <p>Assigned: {new Date(lead.assigned_at).toLocaleString()}</p> : null}
            {lead.booked_at ? <p>Booked: {new Date(lead.booked_at).toLocaleString()}</p> : null}
            {lead.closed_at ? <p>Closed: {new Date(lead.closed_at).toLocaleString()}</p> : null}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-neutral-200 bg-white p-6">
        <h3 className="font-display text-xl">Copy lead summary</h3>
        <p className="mt-2 text-sm text-neutral-600">
          Share internally with or without masked contact details.
        </p>
        <div className="mt-4">
          <LeadSummaryCopy
            lead={{
              name: lead.name,
              email: lead.email,
              phone: lead.phone,
              preferred_contact: lead.preferred_contact,
              areas: lead.areas,
              budget_band: lead.budget_band,
              timeline: lead.timeline,
              purpose: lead.purpose,
              financing: lead.financing,
              must_haves: lead.must_haves,
              lead_score: lead.lead_score,
              status: lead.status,
              page_type: lead.page_type,
              area: lead.area,
              intent: lead.intent,
              utm: lead.utm,
              created_at: lead.created_at
            }}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-neutral-200 bg-white p-6">
          <h3 className="font-display text-xl">Assign partners</h3>
          <p className="mt-2 text-sm text-neutral-600">
            Choose 1–3 partners for this lead.
          </p>
          <div className="mt-4">
            <PartnersSelect
              leadId={lead.id}
              partners={partners ?? []}
              selected={lead.assigned_partner_ids ?? []}
            />
          </div>
        </div>
        <div className="rounded-3xl border border-neutral-200 bg-white p-6">
          <h3 className="font-display text-xl">Notes</h3>
          <div className="mt-4">
            <NotesEditor leadId={lead.id} initialNotes={lead.notes} />
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-neutral-200 bg-white p-6">
        <h3 className="font-display text-xl">WhatsApp follow-up</h3>
        <p className="mt-2 text-sm text-neutral-600">
          Copy a personalized message based on their criteria.
        </p>
        <div className="mt-4">
          <WhatsAppCopyButton
            areas={lead.areas}
            budgetBand={lead.budget_band}
            timeline={lead.timeline}
            purpose={lead.purpose}
            mustHaves={lead.must_haves}
          />
        </div>
      </div>

      <div className="rounded-3xl border border-neutral-200 bg-white p-6">
        <h3 className="font-display text-xl">Raw JSON</h3>
        <pre className="mt-4 overflow-x-auto rounded-2xl bg-neutral-50 p-4 text-xs text-neutral-700">
          {JSON.stringify(lead, null, 2)}
        </pre>
      </div>
    </div>
  );
}
