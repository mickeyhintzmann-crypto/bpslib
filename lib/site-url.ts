const normalizeBaseUrl = (value: string) => {
  if (!value) {
    return "";
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }
  return trimmed.endsWith("/") ? trimmed.slice(0, -1) : trimmed;
};

export const getSiteUrl = () => {
  const explicit = normalizeBaseUrl(process.env.NEXT_PUBLIC_SITE_URL || "");
  if (explicit) {
    return explicit;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3002";
};
