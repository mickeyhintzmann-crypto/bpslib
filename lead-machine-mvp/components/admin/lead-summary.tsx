"use client";

import { useState } from "react";

type LeadSummary = {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  preferred_contact?: string | null;
  areas?: string[] | null;
  budget_band?: string | null;
  timeline?: string | null;
  purpose?: string | null;
  financing?: string | null;
  must_haves?: string[] | null;
  lead_score?: number | null;
  status?: string | null;
  page_type?: string | null;
  area?: string | null;
  intent?: string | null;
  utm?: { utm_source?: string; utm_campaign?: string } | null;
  created_at?: string | null;
};

function maskEmail(email?: string | null) {
  if (!email) return "";
  const [name, domain] = email.split("@");
  if (!domain) return "***";
  return `${name.slice(0, 2)}***@${domain}`;
}

function maskPhone(phone?: string | null) {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  return digits.length > 2 ? `***${digits.slice(-2)}` : "***";
}

function buildSummary(lead: LeadSummary, masked: boolean) {
  const email = masked ? maskEmail(lead.email) : lead.email ?? "";
  const phone = masked ? maskPhone(lead.phone) : lead.phone ?? "";
  const source = [lead.page_type, lead.area, lead.intent].filter(Boolean).join(" / ");

  return [
    `Lead: ${lead.name ?? ""}`,
    `Contact: ${email} | ${phone}`,
    `Preferred: ${lead.preferred_contact ?? ""}`,
    `Areas: ${(lead.areas ?? []).join(", ")}`,
    `Budget: ${lead.budget_band ?? ""}`,
    `Timeline: ${lead.timeline ?? ""}`,
    `Purpose: ${lead.purpose ?? ""}`,
    `Financing: ${lead.financing ?? ""}`,
    `Must-haves: ${(lead.must_haves ?? []).join(", ")}`,
    `Score: ${lead.lead_score ?? ""}`,
    `Status: ${lead.status ?? ""}`,
    `Source: ${source}`,
    `UTM: ${lead.utm?.utm_source ?? ""} ${lead.utm?.utm_campaign ?? ""}`,
    `Created: ${lead.created_at ?? ""}`
  ].join("\n");
}

export function LeadSummaryCopy({ lead }: { lead: LeadSummary }) {
  const [copied, setCopied] = useState<"full" | "masked" | null>(null);

  const copy = async (masked: boolean) => {
    const text = buildSummary(lead, masked);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(masked ? "masked" : "full");
      window.setTimeout(() => setCopied(null), 1500);
    } catch {
      setCopied(null);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => copy(false)}
        className="rounded-full border border-neutral-900 bg-neutral-900 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white"
      >
        {copied === "full" ? "Copied" : "Copy summary"}
      </button>
      <button
        type="button"
        onClick={() => copy(true)}
        className="rounded-full border border-neutral-200 px-4 py-2 text-xs uppercase tracking-[0.2em] text-neutral-700"
      >
        {copied === "masked" ? "Copied" : "Copy summary (masked)"}
      </button>
    </div>
  );
}
