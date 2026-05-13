export const JOB_STATUS_VALUES = [
  "unassigned",
  "scheduled",
  "in_progress",
  "done",
  "invoiced",
  "cancelled"
] as const;

export const JOB_SERVICE_VALUES = [
  "bordplade",
  "gulvafslibning",
  "gulvbelaegning",
  "microcement",
  "maler",
  "toemrer",
  "murer",
  "andet"
] as const;

export type JobStatus = (typeof JOB_STATUS_VALUES)[number];
export type JobService = (typeof JOB_SERVICE_VALUES)[number];

export const isJobStatus = (value: string): value is JobStatus =>
  JOB_STATUS_VALUES.includes(value as JobStatus);

export const isJobService = (value: string): value is JobService =>
  JOB_SERVICE_VALUES.includes(value as JobService);

export const toIsoDateRange = (fromRaw?: string | null, toRaw?: string | null) => {
  if (fromRaw && toRaw) {
    return { fromIso: fromRaw, toIso: toRaw };
  }

  const now = new Date();
  const from = new Date(now);
  from.setHours(0, 0, 0, 0);

  const to = new Date(from);
  to.setDate(to.getDate() + 14);
  to.setHours(23, 59, 59, 999);

  return {
    fromIso: fromRaw || from.toISOString(),
    toIso: toRaw || to.toISOString()
  };
};
