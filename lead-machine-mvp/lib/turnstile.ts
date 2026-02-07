export type TurnstileResult = {
  ok: boolean;
  error?: string;
};

export async function verifyTurnstile({
  token,
  ip
}: {
  token?: string | null;
  ip?: string | null;
}): Promise<TurnstileResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    return { ok: true };
  }

  if (!token) {
    return { ok: false, error: "Missing Turnstile token." };
  }

  try {
    const formData = new URLSearchParams();
    formData.append("secret", secret);
    formData.append("response", token);
    if (ip) {
      formData.append("remoteip", ip);
    }

    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: formData
    });

    if (!res.ok) {
      return { ok: false, error: "Turnstile verification failed." };
    }

    const data = (await res.json()) as { success: boolean };
    return { ok: data.success };
  } catch (error) {
    console.warn("turnstile_verify_failed", error);
    return { ok: false, error: "Turnstile verification failed." };
  }
}
