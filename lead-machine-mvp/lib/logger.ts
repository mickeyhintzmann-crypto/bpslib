type LogLevel = "info" | "warn" | "error";

type LogPayload = Record<string, unknown>;

export function maskEmail(email?: string | null) {
  if (!email) return undefined;
  const [name, domain] = email.split("@");
  if (!domain) return "***";
  const prefix = name.slice(0, 2);
  return `${prefix}***@${domain}`;
}

export function maskPhone(phone?: string | null) {
  if (!phone) return undefined;
  const digits = phone.replace(/\D/g, "");
  const tail = digits.slice(-2);
  return `***${tail}`;
}

export function logEvent(event: string, payload: LogPayload = {}, level: LogLevel = "info") {
  const message = {
    level,
    event,
    timestamp: new Date().toISOString(),
    ...payload
  };
  const output = JSON.stringify(message);
  if (level === "error") {
    console.error(output);
  } else if (level === "warn") {
    console.warn(output);
  } else {
    console.log(output);
  }
}
