/**
 * Auto-svar til kunder der har brugt prisberegneren.
 * Sender email + SMS med foreløbig pris og link til manage-side.
 */

import { wrapInEmailTemplate } from "@/lib/email-template";
import { sendMail, logEmail } from "@/lib/mailer";
import { sendSms, hasTwilioConfig } from "@/lib/sms";

type EstimatorInfo = {
  estimatorId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  manageToken?: string;
  aiPriceMin?: number | null;
  aiPriceMax?: number | null;
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://bpslib.dk";

const formatPriceRange = (min: number | null | undefined, max: number | null | undefined) => {
  if (typeof min !== "number" || typeof max !== "number") return null;
  if (min === max) return `${min.toLocaleString("da-DK")} kr`;
  return `${min.toLocaleString("da-DK")}–${max.toLocaleString("da-DK")} kr`;
};

/**
 * Sender et auto-svar til kunden efter prisberegning er indsendt.
 * Informerer om foreløbig pris og at den bekræftes/justeres snart.
 */
export const sendEstimatorAutoReply = async (info: EstimatorInfo) => {
  const name = info.customerName || "kunde";
  const subject = `BP Slib – Din foreløbige pris`;
  const results: string[] = [];

  const manageLink = info.manageToken
    ? `${SITE_URL}/prisberegner/manage/${info.manageToken}`
    : "";

  const priceRange = formatPriceRange(info.aiPriceMin, info.aiPriceMax);
  const priceLine = priceRange ? `Din foreløbige pris: ${priceRange}` : "Vi er i gang med at beregne din pris";

  const messageText = `Tak for din prisberegning hos BP Slib.\n\n${priceLine}\n\nBemærk: Prisen er et foreløbigt estimat baseret på dine billeder og oplysninger. Vi gennemgår din sag hurtigst muligt og bekræfter eller justerer prisen.\n\nSe din beregning her: ${manageLink}`;

  const messageHtml = `Tak for din prisberegning hos BP Slib.<br><br><strong>${priceLine}</strong><br><br><em>Bemærk: Prisen er et foreløbigt estimat baseret på dine billeder og oplysninger. Vi gennemgår din sag hurtigst muligt og bekræfter eller justerer prisen.</em>${
    manageLink
      ? `<br><br><a href="${manageLink}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;">Se din beregning</a>`
      : ""
  }`;

  /* ---- Email ---- */
  if (info.customerEmail) {
    const textBody = `Hej ${name},\n\n${messageText}\n\nVenlig hilsen\nBP Slib`;
    const htmlBody = wrapInEmailTemplate({
      greeting: `Hej ${name},`,
      body: messageHtml,
    });

    const emailResult = await sendMail({
      to: info.customerEmail,
      subject,
      text: textBody,
      html: htmlBody,
    });

    await logEmail({
      kind: "estimator.autoreply",
      to: info.customerEmail,
      subject,
      ok: emailResult.ok,
      error: emailResult.error || null,
      meta: { estimatorId: info.estimatorId, channel: "email" },
    });

    results.push(emailResult.ok ? "email_ok" : "email_fail");
  }

  /* ---- SMS ---- */
  if (info.customerPhone && hasTwilioConfig()) {
    try {
      const smsBody = `Hej ${name},\n\nTak for din prisberegning hos BP Slib. ${priceLine}. Prisen er foreløbig og bekræftes/justeres af os hurtigst muligt.${
        manageLink ? `\n\nSe din beregning her: ${manageLink}` : ""
      }`;
      const smsResult = await sendSms({ to: info.customerPhone, body: smsBody });

      if (!smsResult.ok) {
        console.error(`[estimator-autoreply] SMS fejlede for ${info.estimatorId}:`, smsResult.error);
      }
      results.push(smsResult.ok ? "sms_ok" : "sms_fail");
    } catch (smsError) {
      console.error(`[estimator-autoreply] SMS undtagelse for ${info.estimatorId}:`, smsError);
      results.push("sms_error");
    }
  }

  return results;
};

/**
 * Sender besked til kunde når admin har bekræftet/justeret prisen.
 * action: "approved" = pris godkendt som estimeret
 * action: "adjusted" = pris er rettet af admin (nye priceMin/priceMax)
 */
export const sendEstimatorStatusUpdate = async (
  info: EstimatorInfo & {
    action: "approved" | "adjusted";
    adjustmentNote?: string;
    priceMin?: number | null;
    priceMax?: number | null;
  }
) => {
  const name = info.customerName || "kunde";
  const manageLink = info.manageToken
    ? `${SITE_URL}/prisberegner/manage/${info.manageToken}`
    : "";

  const priceRange = formatPriceRange(info.priceMin, info.priceMax);
  const priceRangeText = priceRange ? priceRange : "";
  const results: string[] = [];

  let subject: string;
  let bodyText: string;
  let bodyHtml: string;
  let smsBody: string;

  if (info.action === "approved") {
    subject = `BP Slib – Din pris er bekræftet`;
    bodyText = `Hej ${name},\n\nDin pris er bekræftet${priceRangeText ? `: ${priceRangeText}` : ""}.\n\nDu kan nu booke din tid med denne pris via linket nedenfor.${
      manageLink ? `\n\nSe din beregning og book tid: ${manageLink}` : ""
    }\n\nVenlig hilsen\nBP Slib`;
    bodyHtml = `Din pris er bekræftet${priceRangeText ? `: <strong>${priceRangeText}</strong>` : ""}.<br><br>Du kan nu booke din tid med denne pris via knappen nedenfor.${
      manageLink
        ? `<br><br><a href="${manageLink}" style="display:inline-block;padding:12px 24px;background:#16a34a;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;">Book din tid</a>`
        : ""
    }`;
    smsBody = `Hej ${name},\n\nDin pris er bekræftet${priceRangeText ? `: ${priceRangeText}` : ""}. Du kan nu booke din tid med denne pris.${
      manageLink ? `\n\nBook her: ${manageLink}` : ""
    }\n\nBP Slib`;
  } else {
    subject = `BP Slib – Din pris er justeret`;
    bodyText = `Hej ${name},\n\nVi har gennemgået din sag og justeret prisen til ${priceRangeText || "et nyt niveau"}.${
      info.adjustmentNote ? `\n\nBegrundelse: ${info.adjustmentNote}` : ""
    }\n\nDu kan booke din tid med den nye pris via linket nedenfor.${
      manageLink ? `\n\nSe din beregning og book tid: ${manageLink}` : ""
    }\n\nVenlig hilsen\nBP Slib`;
    bodyHtml = `Vi har gennemgået din sag og justeret prisen til <strong>${priceRangeText || "et nyt niveau"}</strong>.${
      info.adjustmentNote ? `<br><br><em>Begrundelse: ${info.adjustmentNote}</em>` : ""
    }<br><br>Du kan booke din tid med den nye pris via knappen nedenfor.${
      manageLink
        ? `<br><br><a href="${manageLink}" style="display:inline-block;padding:12px 24px;background:#ea580c;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;">Book din tid</a>`
        : ""
    }`;
    smsBody = `Hej ${name},\n\nVi har justeret din pris til ${priceRangeText || "et nyt niveau"}.${
      info.adjustmentNote ? ` Begrundelse: ${info.adjustmentNote}` : ""
    } Du kan booke med den nye pris.${manageLink ? `\n\nBook her: ${manageLink}` : ""}\n\nBP Slib`;
  }

  /* ---- Email ---- */
  if (info.customerEmail) {
    const htmlBody = wrapInEmailTemplate({
      greeting: `Hej ${name},`,
      body: bodyHtml,
    });

    const emailResult = await sendMail({
      to: info.customerEmail,
      subject,
      text: bodyText,
      html: htmlBody,
    });

    await logEmail({
      kind: `estimator.status.${info.action}`,
      to: info.customerEmail,
      subject,
      ok: emailResult.ok,
      error: emailResult.error || null,
      meta: { estimatorId: info.estimatorId, action: info.action, channel: "email" },
    });

    results.push(emailResult.ok ? "email_ok" : "email_fail");
  }

  /* ---- SMS ---- */
  if (info.customerPhone && hasTwilioConfig()) {
    try {
      const smsResult = await sendSms({ to: info.customerPhone, body: smsBody });
      if (!smsResult.ok) {
        console.error(`[estimator-status] SMS fejlede for ${info.estimatorId}:`, smsResult.error);
      }
      results.push(smsResult.ok ? "sms_ok" : "sms_fail");
    } catch (smsError) {
      console.error(`[estimator-status] SMS undtagelse for ${info.estimatorId}:`, smsError);
      results.push("sms_error");
    }
  }

  return results;
};
