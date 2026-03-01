export const UTM_STORAGE_KEY = "bpslib_utm";

export type UtmPayload = {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
};

type UtmRecord = Record<string, unknown>;

const MAX_UTM_VALUE_LENGTH = 200;

const asCleanString = (value: unknown) => {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim().slice(0, MAX_UTM_VALUE_LENGTH);
};

export const sanitizeUtm = (value: unknown): UtmPayload | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as UtmRecord;
  const sanitized: UtmPayload = {
    source: asCleanString(record.source),
    medium: asCleanString(record.medium),
    campaign: asCleanString(record.campaign),
    term: asCleanString(record.term),
    content: asCleanString(record.content)
  };

  if (!sanitized.source && !sanitized.medium && !sanitized.campaign && !sanitized.term && !sanitized.content) {
    return null;
  }

  return sanitized;
};

