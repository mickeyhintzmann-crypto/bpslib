/**
 * Shared booking confirmation message builder.
 * Used for automatic emails/SMS when a customer submits a booking.
 */

import { wrapInEmailTemplate } from "@/lib/email-template";
import { sendMail, logEmail } from "@/lib/mailer";
import { sendSms, hasTwilioConfig } from "@/lib/sms";

type BookingInfo = {
  bookingId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  manageToken?: string;
  source: "normal" | "acute";
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://bpslib.dk";

const STANDARD_MESSAGE =
  "Tak for din booking hos BP Slib.\n\nVi vender tilbage hurtigst muligt med den endelige bekræftelse på din booking.";

/**
 * Sends an automatic standard reply to the customer via email and/or SMS
 * when they submit a booking through the website.
 */
export const sendBookingAutoReply = async (info: BookingInfo) => {
  const name = info.customerName || "kunde";
  const subject = `BP Slib – Vedr. din booking`;
  const results: string[] = [];

  const manageLink = info.manageToken
    ? `${SITE_URL}/booking/manage/${info.manageToken}`
    : "";

  const manageLine = manageLink
    ? `\nAdministrer din booking her: ${manageLink}`
    : "";

  const manageHtml = manageLink
    ? `<br><a href="${manageLink}" style="color:#c67a2e;text-decoration:underline;">Administrer din booking her</a>`
    : "";

  /* ---- Email ---- */
  if (info.customerEmail) {
    const textBody = `Hej ${name},\n\n${STANDARD_MESSAGE}${manageLine}\n\nVenlig hilsen\nBP Slib`;
    const htmlBody = wrapInEmailTemplate({
      greeting: `Hej ${name},`,
      body: `${STANDARD_MESSAGE}${manageHtml}`,
    });

    const emailResult = await sendMail({
      to: info.customerEmail,
      subject,
      text: textBody,
      html: htmlBody,
    });

    await logEmail({
      kind: `booking.${info.source}.autoreply`,
      to: info.customerEmail,
      subject,
      ok: emailResult.ok,
      error: emailResult.error || null,
      meta: { bookingId: info.bookingId, channel: "email" },
    });

    results.push(emailResult.ok ? "email_ok" : "email_fail");
  }

  /* ---- SMS ---- */
  if (info.customerPhone && hasTwilioConfig()) {
    try {
      const smsBody = `Hej ${name},\n\n${STANDARD_MESSAGE}${manageLine}\n\nVenlig hilsen\nBP Slib`;
      const smsResult = await sendSms({ to: info.customerPhone, body: smsBody });

      if (!smsResult.ok) {
        console.error(`[booking-autoreply] SMS fejlede for ${info.bookingId}:`, smsResult.error);
      }
      results.push(smsResult.ok ? "sms_ok" : "sms_fail");
    } catch (smsError) {
      console.error(`[booking-autoreply] SMS undtagelse for ${info.bookingId}:`, smsError);
      results.push("sms_error");
    }
  } else if (info.customerPhone) {
    console.warn(`[booking-autoreply] Twilio ikke konfigureret – SMS sprunget over for ${info.bookingId}`);
  }

  return results;
};

type ManualBookingInfo = {
  bookingId: string;
  customerName: string;
  customerEmail?: string | null;
  customerPhone?: string | null;
  manageToken?: string | null;
  date: string;        // YYYY-MM-DD
  startTime: string;   // HH:MM
  address?: string | null;
  service?: string | null;
  priceTotal?: number | null;
  sendEmail: boolean;
  sendSms: boolean;
};

const SERVICE_LABELS: Record<string, string> = {
  bordplade: "Bordpladeslibning",
  gulv: "Gulvbehandling",
  toemrer: "Tømrer",
  maler: "Maler",
  murer: "Murer",
  andet: "Opgave",
};

const formatDanishDate = (dateStr: string) => {
  const date = new Date(`${dateStr}T12:00:00`);
  return date.toLocaleDateString("da-DK", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
};

/**
 * Sends a booking confirmation to the customer when admin creates a manual booking.
 * Includes date, time and address.
 */
export const sendManualBookingConfirmation = async (info: ManualBookingInfo) => {
  const results: string[] = [];
  const name = info.customerName || "kunde";
  const serviceLabel = info.service ? (SERVICE_LABELS[info.service] || info.service) : "Opgave";
  const formattedDate = formatDanishDate(info.date);
  const subject = `BP Slib – Din booking er bekræftet`;

  const manageLink = info.manageToken ? `${SITE_URL}/booking/manage/${info.manageToken}` : "";
  const addressLine = info.address ? `\nAdresse: ${info.address}` : "";
  const priceLine = typeof info.priceTotal === "number" && info.priceTotal > 0
    ? `\nPris: ${info.priceTotal.toLocaleString("da-DK")} kr. inkl. moms`
    : "";
  const manageLineText = manageLink ? `\nAdministrer din booking her: ${manageLink}` : "";
  const manageLineHtml = manageLink
    ? `<br><a href="${manageLink}" style="color:#c67a2e;text-decoration:underline;">Administrer din booking her</a>`
    : "";
  const priceHtml = typeof info.priceTotal === "number" && info.priceTotal > 0
    ? `<br><strong>Pris: ${info.priceTotal.toLocaleString("da-DK")} kr. inkl. moms</strong>`
    : "";

  const bodyText =
    `Hej ${name},\n\n` +
    `Din booking er bekræftet.\n\n` +
    `Service: ${serviceLabel}\n` +
    `Dato: ${formattedDate}\n` +
    `Tidspunkt: Kl. ${info.startTime}` +
    addressLine +
    priceLine +
    `\n\nHar du spørgsmål, er du velkommen til at kontakte os på +45 2691 3737.` +
    manageLineText +
    `\n\nVenlig hilsen\nBP Slib`;

  const bodyHtml =
    `Service: ${serviceLabel}<br>` +
    `Dato: ${formattedDate}<br>` +
    `Tidspunkt: Kl. ${info.startTime}` +
    (info.address ? `<br>Adresse: ${info.address}` : "") +
    priceHtml +
    `<br><br>Har du spørgsmål, er du velkommen til at kontakte os på ` +
    `<a href="tel:+4526913737" style="color:#c67a2e;">+45 2691 3737</a>.` +
    manageLineHtml;

  /* ---- Email ---- */
  if (info.sendEmail && info.customerEmail) {
    const htmlBody = wrapInEmailTemplate({ greeting: `Hej ${name},<br>Din booking er bekræftet.`, body: bodyHtml });
    const emailResult = await sendMail({ to: info.customerEmail, subject, text: bodyText, html: htmlBody });

    await logEmail({
      kind: "booking.manual.confirmation",
      to: info.customerEmail,
      subject,
      ok: emailResult.ok,
      error: emailResult.error || null,
      meta: { bookingId: info.bookingId, channel: "email" },
    });

    results.push(emailResult.ok ? "email_ok" : "email_fail");
  }

  /* ---- SMS ---- */
  if (info.sendSms && info.customerPhone && hasTwilioConfig()) {
    const smsBody =
      `Hej ${name}, din booking hos BP Slib er bekræftet.\n` +
      `${serviceLabel} – ${formattedDate} kl. ${info.startTime}` +
      (info.address ? `\n${info.address}` : "") +
      (typeof info.priceTotal === "number" && info.priceTotal > 0
        ? `\nPris: ${info.priceTotal.toLocaleString("da-DK")} kr. inkl. moms`
        : "") +
      (manageLink ? `\n${manageLink}` : "");

    try {
      const smsResult = await sendSms({ to: info.customerPhone, body: smsBody });
      results.push(smsResult.ok ? "sms_ok" : "sms_fail");
    } catch {
      results.push("sms_error");
    }
  }

  return results;
};
