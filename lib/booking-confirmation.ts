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
  source: "normal" | "acute";
};

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

  /* ---- Email ---- */
  if (info.customerEmail) {
    const textBody = `Hej ${name},\n\n${STANDARD_MESSAGE}\n\nVenlig hilsen\nBP Slib`;
    const htmlBody = wrapInEmailTemplate({
      greeting: `Hej ${name},`,
      body: STANDARD_MESSAGE,
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
    const smsBody = `Hej ${name},\n\n${STANDARD_MESSAGE}\n\nVenlig hilsen\nBP Slib`;
    const smsResult = await sendSms({ to: info.customerPhone, body: smsBody });

    results.push(smsResult.ok ? "sms_ok" : "sms_fail");
  }

  return results;
};
