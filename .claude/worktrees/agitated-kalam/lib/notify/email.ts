import { Resend } from "resend";

type SendEmailInput = {
  to?: string | string[];
  subject: string;
  html: string;
  text?: string;
  enabled?: boolean;
};

type SendEmailResult = {
  ok: boolean;
  id?: string;
  error?: string;
};

const asTrimmed = (value: unknown) => (typeof value === "string" ? value.trim() : "");

const parseRecipients = (value: string) =>
  value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

const resolveRecipients = (input: SendEmailInput) => {
  if (Array.isArray(input.to)) {
    return input.to.map((value) => value.trim()).filter(Boolean);
  }
  const direct = asTrimmed(input.to);
  if (direct) {
    return [direct];
  }
  return parseRecipients(process.env.NOTIFY_EMAIL_TO || "");
};

export const sendEmail = async (input: SendEmailInput): Promise<SendEmailResult> => {
  if (input.enabled === false) {
    return { ok: true, id: "skipped" };
  }

  const apiKey = asTrimmed(process.env.RESEND_API_KEY);
  const from = asTrimmed(process.env.NOTIFY_EMAIL_FROM);
  const to = resolveRecipients(input);

  if (!apiKey || !from || to.length === 0) {
    return { ok: true, id: "skipped" };
  }

  try {
    const resend = new Resend(apiKey);
    const response = await resend.emails.send({
      from,
      to,
      subject: input.subject,
      html: input.html,
      text: input.text
    });

    if (response.error) {
      return { ok: false, error: response.error.message || "Resend fejl." };
    }

    return { ok: true, id: response.data?.id || "sent" };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Ukendt fejl ved email-notification."
    };
  }
};
