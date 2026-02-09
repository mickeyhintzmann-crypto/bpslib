export type BordpladeExtraKey =
  | "spisebord"
  | "sofabord"
  | "vindueskarme"
  | "bryggers"
  | "lister"
  | "vandfald";

export type BordpladeExtras = {
  spisebord: boolean;
  sofabord: boolean;
  vindueskarme: boolean;
  bryggers: boolean;
  lister: boolean;
  vandfaldCount: number;
};

export const defaultBordpladeExtras: BordpladeExtras = {
  spisebord: false,
  sofabord: false,
  vindueskarme: false,
  bryggers: false,
  lister: false,
  vandfaldCount: 0
};

export const EXTRA_OPTIONS: Array<{
  key: Exclude<BordpladeExtraKey, "vandfald">;
  label: string;
  priceLabel: string;
}> = [
  { key: "spisebord", label: "Spisebord", priceLabel: "1.200–2.200 kr." },
  { key: "sofabord", label: "Sofabord", priceLabel: "500–1.500 kr." },
  { key: "vindueskarme", label: "Vindueskarme", priceLabel: "250–500 kr." },
  { key: "bryggers", label: "Bryggers", priceLabel: "1.000–2.500 kr." },
  { key: "lister", label: "Lister", priceLabel: "Pris efter aftale" }
];

export const VANDFALD_PRICE_LABEL = "600–900 kr. pr. stk";
export const VANDFALD_PRICE_RANGE = { min: 600, max: 900 };

export const EXTRA_PRICE_RANGES: Record<
  Exclude<BordpladeExtraKey, "vandfald">,
  { min: number; max: number }
> = {
  spisebord: { min: 1200, max: 2200 },
  sofabord: { min: 500, max: 1500 },
  vindueskarme: { min: 250, max: 500 },
  bryggers: { min: 1000, max: 2500 },
  lister: { min: 0, max: 0 }
};

const extraLabels: Record<Exclude<BordpladeExtraKey, "vandfald">, string> = {
  spisebord: "Spisebord",
  sofabord: "Sofabord",
  vindueskarme: "Vindueskarme",
  bryggers: "Bryggers",
  lister: "Lister"
};

const parseCount = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(0, Math.min(20, Math.floor(value)));
  }
  if (typeof value === "string" && value.trim()) {
    const parsed = Number.parseInt(value.trim(), 10);
    if (Number.isFinite(parsed)) {
      return Math.max(0, Math.min(20, parsed));
    }
  }
  return 0;
};

export const sanitizeExtras = (value: unknown): BordpladeExtras => {
  if (!value || typeof value !== "object") {
    return { ...defaultBordpladeExtras };
  }

  const record = value as Record<string, unknown>;

  return {
    spisebord: Boolean(record.spisebord),
    sofabord: Boolean(record.sofabord),
    vindueskarme: Boolean(record.vindueskarme),
    bryggers: Boolean(record.bryggers),
    lister: Boolean(record.lister),
    vandfaldCount: parseCount(record.vandfaldCount)
  };
};

export const hasSelectedExtras = (extras: BordpladeExtras) => {
  return (
    extras.spisebord ||
    extras.sofabord ||
    extras.vindueskarme ||
    extras.bryggers ||
    extras.lister ||
    extras.vandfaldCount > 0
  );
};

export const getExtrasPriceRange = (extras: BordpladeExtras | null | undefined) => {
  if (!extras) {
    return { min: 0, max: 0 };
  }

  let min = 0;
  let max = 0;

  (Object.keys(EXTRA_PRICE_RANGES) as Array<Exclude<BordpladeExtraKey, "vandfald">>).forEach((key) => {
    if (extras[key]) {
      min += EXTRA_PRICE_RANGES[key].min;
      max += EXTRA_PRICE_RANGES[key].max;
    }
  });

  if (extras.vandfaldCount > 0) {
    min += extras.vandfaldCount * VANDFALD_PRICE_RANGE.min;
    max += extras.vandfaldCount * VANDFALD_PRICE_RANGE.max;
  }

  return { min, max };
};

export const formatExtrasSummary = (extras: BordpladeExtras | null | undefined) => {
  if (!extras) {
    return "Ingen";
  }

  const parts: string[] = [];

  (Object.keys(extraLabels) as Array<Exclude<BordpladeExtraKey, "vandfald">>).forEach((key) => {
    if (extras[key]) {
      parts.push(extraLabels[key]);
    }
  });

  if (extras.vandfaldCount > 0) {
    parts.push(`Vandfald x${extras.vandfaldCount}`);
  }

  return parts.length > 0 ? parts.join(", ") : "Ingen";
};
