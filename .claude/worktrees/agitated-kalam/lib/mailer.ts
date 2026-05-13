import nodemailer from "nodemailer";

import { createSupabaseServiceClient } from "@/lib/supabase/server";

type SendMailInput = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

type SendMailResult = {
  ok: boolean;
  error?: string;
};

type LogInput = {
  kind: string;
  to: string;
  subject: string;
  ok: boolean;
  error?: string | null;
  meta?: Record<string, unknown> | null;
};

const getEnv = (key: string) => process.env[key] || "";

const getSmtpConfig = () => {
  const host = getEnv("SMTP_HOST");
  const port = Number.parseInt(getEnv("SMTP_PORT"), 10);
  const user = getEnv("SMTP_USER");
  const pass = getEnv("SMTP_PASS");
  const from = getEnv("SMTP_FROM");
  const replyTo = getEnv("SMTP_REPLY_TO");
  const adminTo = getEnv("SMTP_ADMIN_TO");

  return {
    host,
    port: Number.isFinite(port) ? port : 0,
    user,
    pass,
    from,
    replyTo,
    adminTo
  };
};

const hasSmtpConfig = (config: ReturnType<typeof getSmtpConfig>) => {
  return Boolean(config.host && config.port && config.user && config.pass && config.from);
};

export const sendMail = async (input: SendMailInput): Promise<SendMailResult> => {
  const config = getSmtpConfig();
  if (!hasSmtpConfig(config)) {
    return { ok: false, error: "SMTP er ikke konfigureret." };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.port === 465,
      auth: {
        user: config.user,
        pass: config.pass
      }
    });

    await transporter.sendMail({
      from: config.from,
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html,
      replyTo: config.replyTo || undefined
    });

    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ukendt fejl ved email.";
    return { ok: false, error: message };
  }
};

export const logEmail = async (input: LogInput) => {
  try {
    const supabase = createSupabaseServiceClient();
    await supabase.from("email_log").insert({
      kind: input.kind,
      to_email: input.to,
      subject: input.subject,
      ok: input.ok,
      error: input.error || null,
      meta: input.meta || null
    });
  } catch (error) {
    console.error(error);
  }
};

export const getSmtpAdminTo = () => getEnv("SMTP_ADMIN_TO");
