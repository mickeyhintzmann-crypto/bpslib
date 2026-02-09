import type { BordpladeExtras } from "@/lib/bordplade/extras";

export const ESTIMATOR_BUCKET = "estimator-images";

export const GATING_OPTIONS = ["ja", "nej", "ved_ikke"] as const;
export type GatingAnswer = (typeof GATING_OPTIONS)[number];

export const BORDPLADE_TYPE_OPTIONS = ["køkken", "bad", "bord", "andet"] as const;
export const TRAESORT_OPTIONS = ["eg", "bøg", "ask", "valnød", "bambus", "andet", "ved_ikke"] as const;
export const OVERFLADE_OPTIONS = ["olie", "lak", "sæbe", "ukendt"] as const;
export const SKADE_OPTIONS = [
  "ridser",
  "skjolder_vand",
  "brændemærker",
  "hakkede_kanter",
  "misfarvning_vask"
] as const;

export const STATUS_VALUES = {
  new: "Ny",
  inReview: "Under review",
  quoteSent: "Tilbud sendt",
  booked: "Booket",
  closed: "Lukket"
} as const;

export const ESTIMATOR_STATUS_FLOW = [
  STATUS_VALUES.new,
  STATUS_VALUES.inReview,
  STATUS_VALUES.quoteSent,
  STATUS_VALUES.booked,
  STATUS_VALUES.closed
] as const;

export type EstimatorStatus = (typeof ESTIMATOR_STATUS_FLOW)[number];

export type EstimatorFormFields = {
  navn: string;
  telefon: string;
  email?: string;
  note?: string;
  laengdeCm?: number;
  dybdeCm?: number;
  antal?: number;
  extras?: BordpladeExtras;
};
