export async function sendSlackMessage(text: string) {
  const webhook = process.env.SLACK_WEBHOOK_URL;
  if (!webhook) return { ok: false, skipped: true };

  try {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });
    return { ok: res.ok, skipped: false };
  } catch (error) {
    console.warn("slack_notify_failed", error);
    return { ok: false, skipped: false };
  }
}

export async function sendLeadWebhook(
  payload: Record<string, unknown>,
  retry = true
) {
  const url = process.env.LEAD_WEBHOOK_URL;
  const secret = process.env.LEAD_WEBHOOK_SECRET;
  if (!url) return { ok: false, skipped: true };

  const attempt = async () =>
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(secret ? { "X-Lead-Webhook-Secret": secret } : {})
      },
      body: JSON.stringify(payload)
    });

  try {
    const res = await attempt();
    if (res.ok) return { ok: true, skipped: false };
    if (retry) {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      const retryRes = await attempt();
      return { ok: retryRes.ok, skipped: false };
    }
    return { ok: false, skipped: false };
  } catch (error) {
    console.warn("lead_webhook_failed", error);
    return { ok: false, skipped: false };
  }
}

export async function sendEmail({
  to,
  subject,
  html
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) return { ok: false, skipped: true };

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from,
        to,
        subject,
        html
      })
    });
    return { ok: res.ok, skipped: false };
  } catch (error) {
    console.warn("email_send_failed", error);
    return { ok: false, skipped: false };
  }
}
