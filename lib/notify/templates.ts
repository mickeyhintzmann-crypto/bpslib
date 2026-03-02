const APP_BASE_URL = (process.env.APP_BASE_URL || "https://bpslib.dk").replace(/\/+$/, "");

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const asTrimmed = (value: unknown) => (typeof value === "string" ? value.trim() : "");

const short = (value: unknown, fallback = "-") => {
  const cleaned = asTrimmed(value);
  return cleaned || fallback;
};

const toTextBlock = (value: unknown) => escapeHtml(typeof value === "string" ? value : JSON.stringify(value, null, 2));

type EmailTemplate = {
  subject: string;
  html: string;
  text: string;
};

export const buildNewLeadTemplate = (input: {
  leadId: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  location?: string | null;
  service?: string | null;
  source?: string | null;
  pageUrl?: string | null;
  message?: string | null;
}): EmailTemplate => {
  const subject = `Ny lead: ${short(input.service, "ukendt service")} · ${short(input.location, "ukendt lokation")}`;
  const adminUrl = `${APP_BASE_URL}/admin/leads?open=${input.leadId}`;

  const html = `
    <h2>Ny lead modtaget</h2>
    <p><strong>Navn:</strong> ${escapeHtml(short(input.name))}</p>
    <p><strong>Email:</strong> ${escapeHtml(short(input.email))}</p>
    <p><strong>Telefon:</strong> ${escapeHtml(short(input.phone))}</p>
    <p><strong>Lokation:</strong> ${escapeHtml(short(input.location))}</p>
    <p><strong>Service:</strong> ${escapeHtml(short(input.service))}</p>
    <p><strong>Kilde:</strong> ${escapeHtml(short(input.source))}</p>
    <p><strong>Side:</strong> ${escapeHtml(short(input.pageUrl))}</p>
    <p><strong>Besked:</strong><br/>${toTextBlock(short(input.message))}</p>
    <p><a href="${adminUrl}">Åbn lead i admin</a></p>
  `;

  const text = [
    "Ny lead modtaget",
    `Navn: ${short(input.name)}`,
    `Email: ${short(input.email)}`,
    `Telefon: ${short(input.phone)}`,
    `Lokation: ${short(input.location)}`,
    `Service: ${short(input.service)}`,
    `Kilde: ${short(input.source)}`,
    `Side: ${short(input.pageUrl)}`,
    `Besked: ${short(input.message)}`,
    `Åbn i admin: ${adminUrl}`
  ].join("\n");

  return { subject, html, text };
};

export const buildNewAiQuoteTemplate = (input: {
  leadId?: string | null;
  service?: string | null;
  leadName?: string | null;
  leadEmail?: string | null;
  leadPhone?: string | null;
  confidence?: number | null;
  needsReview?: boolean;
  inputs?: Record<string, unknown>;
  outputSummary?: string;
}): EmailTemplate => {
  const subject = `Ny AI quote: ${short(input.service, "ukendt service")} (${input.needsReview ? "needs review" : "unreviewed"})`;
  const adminUrl = `${APP_BASE_URL}/admin/ai-estimator`;
  const leadUrl = input.leadId ? `${APP_BASE_URL}/admin/leads?open=${input.leadId}` : "";
  const confidence = typeof input.confidence === "number" ? input.confidence.toFixed(2) : "n/a";

  const html = `
    <h2>Ny AI quote til review</h2>
    <p><strong>Service:</strong> ${escapeHtml(short(input.service))}</p>
    <p><strong>Lead:</strong> ${escapeHtml(short(input.leadName))} · ${escapeHtml(short(input.leadPhone))} · ${escapeHtml(short(input.leadEmail))}</p>
    <p><strong>Confidence:</strong> ${escapeHtml(confidence)}</p>
    <p><strong>Needs review:</strong> ${input.needsReview ? "Ja" : "Nej"}</p>
    <p><strong>Output:</strong> ${escapeHtml(short(input.outputSummary))}</p>
    <p><strong>Inputs:</strong><br/><pre>${toTextBlock(input.inputs || {})}</pre></p>
    <p><a href="${adminUrl}">Åbn AI dashboard</a>${leadUrl ? ` · <a href="${leadUrl}">Åbn lead</a>` : ""}</p>
  `;

  const text = [
    "Ny AI quote til review",
    `Service: ${short(input.service)}`,
    `Lead: ${short(input.leadName)} · ${short(input.leadPhone)} · ${short(input.leadEmail)}`,
    `Confidence: ${confidence}`,
    `Needs review: ${input.needsReview ? "Ja" : "Nej"}`,
    `Output: ${short(input.outputSummary)}`,
    `Inputs: ${JSON.stringify(input.inputs || {}, null, 2)}`,
    `AI dashboard: ${adminUrl}`,
    leadUrl ? `Lead: ${leadUrl}` : ""
  ]
    .filter(Boolean)
    .join("\n");

  return { subject, html, text };
};

export const buildJobNotificationTemplate = (input: {
  action: "created" | "updated";
  title: string;
  service?: string | null;
  status: string;
  startAt: string;
  endAt: string;
  employeeName?: string | null;
  location?: string | null;
  address?: string | null;
}): EmailTemplate => {
  const subject = `Job ${input.action === "created" ? "oprettet" : "opdateret"}: ${short(input.title)}`;
  const adminUrl = `${APP_BASE_URL}/admin/calendar`;

  const html = `
    <h2>Job ${input.action === "created" ? "oprettet" : "opdateret"}</h2>
    <p><strong>Titel:</strong> ${escapeHtml(short(input.title))}</p>
    <p><strong>Service:</strong> ${escapeHtml(short(input.service))}</p>
    <p><strong>Status:</strong> ${escapeHtml(short(input.status))}</p>
    <p><strong>Tid:</strong> ${escapeHtml(short(input.startAt))} → ${escapeHtml(short(input.endAt))}</p>
    <p><strong>Medarbejder:</strong> ${escapeHtml(short(input.employeeName, "Unassigned"))}</p>
    <p><strong>Lokation:</strong> ${escapeHtml(short(input.location))}</p>
    <p><strong>Adresse:</strong> ${escapeHtml(short(input.address))}</p>
    <p><a href="${adminUrl}">Åbn kalender</a></p>
  `;

  const text = [
    `Job ${input.action === "created" ? "oprettet" : "opdateret"}`,
    `Titel: ${short(input.title)}`,
    `Service: ${short(input.service)}`,
    `Status: ${short(input.status)}`,
    `Tid: ${short(input.startAt)} -> ${short(input.endAt)}`,
    `Medarbejder: ${short(input.employeeName, "Unassigned")}`,
    `Lokation: ${short(input.location)}`,
    `Adresse: ${short(input.address)}`,
    `Kalender: ${adminUrl}`
  ].join("\n");

  return { subject, html, text };
};
