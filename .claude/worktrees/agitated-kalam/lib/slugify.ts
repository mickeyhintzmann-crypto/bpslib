const normalizeDanish = (value: string) =>
  value
    .replace(/æ/gi, "ae")
    .replace(/ø/gi, "oe")
    .replace(/å/gi, "aa");

export const slugify = (value: string) =>
  normalizeDanish(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
