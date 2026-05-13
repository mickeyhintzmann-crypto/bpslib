export const AI_CONTROL_ROOM_MIGRATION =
  "supabase/migrations/20260302000050_ai_estimator_control_room.sql";

export const AI_SERVICES = [
  "bordplade",
  "gulvafslibning",
  "gulvbelaegning",
  "microcement",
  "maler",
  "toemrer",
  "murer",
  "andet"
] as const;

export const AI_REVIEW_STATUS_VALUES = [
  "unreviewed",
  "approved",
  "edited",
  "rejected"
] as const;

export type AiService = (typeof AI_SERVICES)[number];
export type AiReviewStatus = (typeof AI_REVIEW_STATUS_VALUES)[number];

export const isAiService = (value: string): value is AiService =>
  AI_SERVICES.includes(value as AiService);

export const isAiReviewStatus = (value: string): value is AiReviewStatus =>
  AI_REVIEW_STATUS_VALUES.includes(value as AiReviewStatus);

export const asTrimmed = (value: unknown) => (typeof value === "string" ? value.trim() : "");

export const sanitizeObject = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  return value as Record<string, unknown>;
};

export const sanitizeArray = (value: unknown): unknown[] => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value;
};

export const asSingleRelation = <T>(value: T | T[] | null | undefined): T | null => {
  if (Array.isArray(value)) {
    return value[0] || null;
  }
  return value || null;
};

export const parsePositiveInt = (value: string | null, fallback: number) => {
  if (!value) {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 1) {
    return fallback;
  }
  return parsed;
};

export const isMissingAiTable = (message: string | undefined, table: string) => {
  const normalized = (message || "").toLowerCase();
  return (
    normalized.includes(`could not find the table 'public.${table}'`) ||
    normalized.includes(`relation "${table}" does not exist`) ||
    normalized.includes(`relation \"${table}\" does not exist`)
  );
};

export const summarizeOutput = (value: unknown) => {
  const output = sanitizeObject(value);
  const explanation = asTrimmed(output.explanation);
  const text = asTrimmed(output.text);
  const summary = explanation || text;
  if (!summary) {
    return "Ingen output-tekst.";
  }
  return summary.length > 180 ? `${summary.slice(0, 177)}...` : summary;
};
