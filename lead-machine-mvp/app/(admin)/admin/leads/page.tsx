import Link from "next/link";
import { createMetadata } from "@/lib/seo/metadata";
import { getSupabaseEnvStatus } from "@/lib/env.supabase";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { StatusSelect } from "@/components/admin/status-select";
import { LEAD_STATUSES, STATUS_LABELS, type LeadStatus } from "@/lib/admin/status";
import { getAreas, intentLabels } from "@/lib/areas";

export const metadata = createMetadata({
  title: "Leads",
  description: "Lead Machine CRM leads list.",
  path: "/admin/leads",
  noIndex: true
});

type SearchParams = {
  status?: string;
  area?: string;
  intent?: string;
  minScore?: string;
  from?: string;
  to?: string;
  overdue?: string;
};

export default async function LeadsPage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
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
  let query = supabase.from("leads").select("*").order("created_at", { ascending: false });

  if (searchParams.status) {
    query = query.eq("status", searchParams.status);
  }
  if (searchParams.area) {
    query = query.contains("areas", [searchParams.area]);
  }
  if (searchParams.intent) {
    query = query.eq("intent", searchParams.intent);
  }
  if (searchParams.minScore) {
    const minScore = Number(searchParams.minScore);
    if (!Number.isNaN(minScore)) {
      query = query.gte("lead_score", minScore);
    }
  }
  if (searchParams.from) {
    query = query.gte("created_at", searchParams.from);
  }
  if (searchParams.to) {
    query = query.lte("created_at", searchParams.to);
  }
  if (searchParams.overdue === "1") {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    query = query
      .lte("created_at", cutoff)
      .is("contacted_at", null)
      .in("status", ["new", "qualified", "assigned"]);
  }

  const { data, error } = await query.limit(100);
  if (error) {
    return (
      <section className="space-y-4">
        <h2 className="font-display text-2xl">Unable to load leads</h2>
        <p className="text-neutral-600">{error.message}</p>
      </section>
    );
  }

  const leads = data ?? [];
  const areas = getAreas();

  const baseParams = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value) baseParams.set(key, value);
  });

  const buildLink = (overrides: Partial<SearchParams>, clear: Array<keyof SearchParams> = []) => {
    const params = new URLSearchParams(baseParams);
    clear.forEach((key) => params.delete(key));
    Object.entries(overrides).forEach(([key, value]) => {
      if (!value) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    const query = params.toString();
    return query ? `/admin/leads?${query}` : "/admin/leads";
  };

  const chipFilters = [
    {
      label: "All",
      href: buildLink({}, ["status", "overdue"])
    },
    {
      label: "New",
      href: buildLink({ status: "new" }, ["overdue"])
    },
    {
      label: "Qualified",
      href: buildLink({ status: "qualified" }, ["overdue"])
    },
    {
      label: "Assigned",
      href: buildLink({ status: "assigned" }, ["overdue"])
    },
    {
      label: "Overdue SLA",
      href: buildLink({ overdue: "1" }, ["status"])
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="font-display text-2xl">Leads</h2>
        <p className="text-neutral-600">Latest inbound leads and quick status updates.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {chipFilters.map((chip) => {
          const isActive =
            (chip.label === "Overdue SLA" && searchParams.overdue === "1") ||
            (chip.label !== "Overdue SLA" &&
              chip.label !== "All" &&
              searchParams.status === chip.label.toLowerCase()) ||
            (chip.label === "All" && !searchParams.status && !searchParams.overdue);
          return (
            <Link
              key={chip.label}
              href={chip.href}
              className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.2em] ${
                isActive
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400"
              }`}
            >
              {chip.label}
            </Link>
          );
        })}
      </div>

      <form className="grid gap-3 rounded-3xl border border-neutral-200 bg-white p-4 text-sm md:grid-cols-6">
        <select
          name="status"
          defaultValue={searchParams.status ?? ""}
          className="rounded-2xl border border-neutral-200 px-3 py-2"
        >
          <option value="">All statuses</option>
          {LEAD_STATUSES.map((status) => (
            <option key={status} value={status}>
              {STATUS_LABELS[status]}
            </option>
          ))}
        </select>
        <select
          name="area"
          defaultValue={searchParams.area ?? ""}
          className="rounded-2xl border border-neutral-200 px-3 py-2"
        >
          <option value="">All areas</option>
          {areas.map((area) => (
            <option key={area.slug} value={area.slug}>
              {area.name}
            </option>
          ))}
        </select>
        <select
          name="intent"
          defaultValue={searchParams.intent ?? ""}
          className="rounded-2xl border border-neutral-200 px-3 py-2"
        >
          <option value="">All intents</option>
          {intentLabels.map((intent) => (
            <option key={intent.slug} value={intent.slug}>
              {intent.name}
            </option>
          ))}
        </select>
        <input
          name="minScore"
          type="number"
          min={0}
          max={100}
          defaultValue={searchParams.minScore ?? ""}
          placeholder="Min score"
          className="rounded-2xl border border-neutral-200 px-3 py-2"
        />
        <input
          name="from"
          type="date"
          defaultValue={searchParams.from ?? ""}
          className="rounded-2xl border border-neutral-200 px-3 py-2"
        />
        <input
          name="to"
          type="date"
          defaultValue={searchParams.to ?? ""}
          className="rounded-2xl border border-neutral-200 px-3 py-2"
        />
        <button
          type="submit"
          className="rounded-2xl border border-neutral-900 bg-neutral-900 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white md:col-span-2"
        >
          Apply filters
        </button>
      </form>

      <div className="overflow-x-auto rounded-3xl border border-neutral-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-neutral-50 text-xs uppercase tracking-[0.2em] text-neutral-500">
            <tr>
              <th className="px-4 py-3 text-left">Created</th>
              <th className="px-4 py-3 text-left">Contact</th>
              <th className="px-4 py-3 text-left">Areas</th>
              <th className="px-4 py-3 text-left">Budget</th>
              <th className="px-4 py-3 text-left">Timeline</th>
              <th className="px-4 py-3 text-left">Purpose</th>
              <th className="px-4 py-3 text-left">Score</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Source</th>
              <th className="px-4 py-3 text-left">UTM</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className="border-t border-neutral-200">
                <td className="px-4 py-3 whitespace-nowrap">
                  {new Date(lead.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-neutral-900">{lead.name}</div>
                  <div className="text-neutral-500">{lead.email}</div>
                  <div className="text-neutral-500">{lead.phone}</div>
                </td>
                <td className="px-4 py-3 text-neutral-600">
                  {lead.areas?.join(", ")}
                </td>
                <td className="px-4 py-3 text-neutral-600">{lead.budget_band}</td>
                <td className="px-4 py-3 text-neutral-600">{lead.timeline}</td>
                <td className="px-4 py-3 text-neutral-600">{lead.purpose}</td>
                <td className="px-4 py-3 font-semibold text-neutral-900">{lead.lead_score}</td>
                <td className="px-4 py-3">
                  <StatusSelect leadId={lead.id} value={lead.status as LeadStatus} />
                </td>
                <td className="px-4 py-3 text-neutral-600">
                  {lead.page_type}
                  {lead.area ? ` / ${lead.area}` : ""}
                  {lead.intent ? ` / ${lead.intent}` : ""}
                </td>
                <td className="px-4 py-3 text-neutral-600">
                  <div>{lead.utm?.utm_source ?? ""}</div>
                  <div>{lead.utm?.utm_campaign ?? ""}</div>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/leads/${lead.id}`}
                    className="text-xs uppercase tracking-[0.2em] text-neutral-600 hover:text-neutral-900"
                  >
                    Open
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
