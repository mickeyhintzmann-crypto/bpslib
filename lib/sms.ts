/**
 * SMS sending via Twilio with alphanumeric sender ID.
 *
 * Required env vars:
 *   TWILIO_ACCOUNT_SID    – Twilio Account SID
 *   TWILIO_AUTH_TOKEN      – Twilio Auth Token
 *   TWILIO_SENDER_NAME     – Alphanumeric sender name, e.g. "BP Slib" (max 11 chars)
 */

type SendSmsInput = {
  to: string;
  body: string;
};

type SendSmsResult = {
  ok: boolean;
  error?: string;
  sid?: string;
};

const getEnv = (key: string) => process.env[key] || "";

const hasTwilioConfig = () => {
  return Boolean(getEnv("TWILIO_ACCOUNT_SID") && getEnv("TWILIO_AUTH_TOKEN") && getEnv("TWILIO_SENDER_NAME"));
};

/**
 * Normalise a Danish phone number to E.164 (+45XXXXXXXX).
 * If it already has a country code prefix, leave it.
 */
const toE164 = (phone: string): string => {
  const digits = phone.replace(/[\s\-()]/g, "");
  if (digits.startsWith("+")) return digits;
  if (digits.startsWith("0045")) return `+${digits.slice(2)}`;
  if (digits.length === 8) return `+45${digits}`;
  return `+${digits}`;
};

export const sendSms = async (input: SendSmsInput): Promise<SendSmsResult> => {
  if (!hasTwilioConfig()) {
    return { ok: false, error: "Twilio er ikke konfigureret." };
  }

  const accountSid = getEnv("TWILIO_ACCOUNT_SID");
  const authToken = getEnv("TWILIO_AUTH_TOKEN");
  const from = getEnv("TWILIO_SENDER_NAME");
  const to = toE164(input.to);

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const credentials = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

    const body = new URLSearchParams({
      To: to,
      From: from,
      Body: input.body,
    });

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    const data = (await response.json()) as { sid?: string; message?: string; code?: number };

    if (!response.ok) {
      return { ok: false, error: data.message || `Twilio fejl (${response.status})` };
    }

    return { ok: true, sid: data.sid };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ukendt fejl ved SMS-afsendelse.";
    return { ok: false, error: message };
  }
};

export { hasTwilioConfig };
