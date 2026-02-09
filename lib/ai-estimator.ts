import type { SupabaseClient } from "@supabase/supabase-js";

import { getExtrasPriceRange, sanitizeExtras, type BordpladeExtras } from "@/lib/bordplade/extras";
import type { EstimatorFormFields } from "@/lib/estimator";

export type EstimatorAiSettings = {
  enabled: boolean;
  minSamples: number;
  interval: number;
  minPrice: number;
  maxPrice: number;
};

export type EstimatorAiEstimate = {
  min: number;
  max: number;
  sampleCount: number;
};

export const ESTIMATOR_AI_DEFAULTS: EstimatorAiSettings = {
  enabled: true,
  minSamples: 1,
  interval: 300,
  minPrice: 3000,
  maxPrice: 5000
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const parseBoolean = (value: unknown) => (typeof value === "boolean" ? value : null);

const parseIntValue = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.round(value);
  }
  if (typeof value === "string" && /^\d+$/.test(value.trim())) {
    return Number.parseInt(value, 10);
  }
  return null;
};

export const getEstimatorAiSettings = async (supabase: SupabaseClient): Promise<EstimatorAiSettings> => {
  try {
    const { data, error } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "estimator_ai")
      .maybeSingle();

    if (error) {
      return ESTIMATOR_AI_DEFAULTS;
    }

    const value = (data?.value || {}) as Partial<EstimatorAiSettings>;

    const enabled = parseBoolean(value.enabled);
    const minSamples = parseIntValue(value.minSamples);
    const interval = parseIntValue(value.interval);
    const minPrice = parseIntValue(value.minPrice);
    const maxPrice = parseIntValue(value.maxPrice);

    return {
      enabled: enabled ?? ESTIMATOR_AI_DEFAULTS.enabled,
      minSamples: minSamples ?? ESTIMATOR_AI_DEFAULTS.minSamples,
      interval: interval ?? ESTIMATOR_AI_DEFAULTS.interval,
      minPrice: minPrice ?? ESTIMATOR_AI_DEFAULTS.minPrice,
      maxPrice: maxPrice ?? ESTIMATOR_AI_DEFAULTS.maxPrice
    };
  } catch (error) {
    console.error("Kunne ikke hente estimator AI settings:", error);
    return ESTIMATOR_AI_DEFAULTS;
  }
};

type EstimatorAiInput = {
  fields?: EstimatorFormFields | null;
  extras?: BordpladeExtras | null;
};

const parseNumber = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim()) {
    const parsed = Number.parseFloat(value.trim().replace(",", "."));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const areaFromFields = (fields: EstimatorFormFields | null | undefined) => {
  if (!fields) {
    return null;
  }
  const lengthCm = parseNumber(fields.laengdeCm);
  const depthCm = parseNumber(fields.dybdeCm);
  const count = parseNumber(fields.antal);
  if (!lengthCm || !depthCm || !count) {
    return null;
  }
  if (lengthCm <= 0 || depthCm <= 0 || count <= 0) {
    return null;
  }
  const areaM2 = (lengthCm * depthCm * count) / 10000;
  return areaM2 > 0 ? areaM2 : null;
};

const estimateBaseFromArea = (areaM2: number) => {
  if (areaM2 <= 2.5) {
    return { min: 3000, max: 3500 };
  }
  if (areaM2 <= 3.5) {
    return { min: 3400, max: 3900 };
  }
  if (areaM2 <= 4.5) {
    return { min: 3800, max: 4400 };
  }
  if (areaM2 <= 6) {
    return { min: 4300, max: 5000 };
  }
  return { min: 4700, max: 5000 };
};

export const estimateAiPrice = async (
  supabase: SupabaseClient,
  input?: EstimatorAiInput
): Promise<EstimatorAiEstimate | null> => {
  const settings = await getEstimatorAiSettings(supabase);

  if (!settings.enabled) {
    return null;
  }

  const { data, error } = await supabase
    .from("estimator_requests")
    .select("price_min, price_max, fields")
    .not("price_min", "is", null)
    .not("price_max", "is", null)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    console.error("Kunne ikke hente estimator samples:", error);
    return null;
  }

  const samples = (data || [])
    .map((row) => {
      const min = typeof row.price_min === "number" ? row.price_min : null;
      const max = typeof row.price_max === "number" ? row.price_max : null;
      if (min === null || max === null) {
        return null;
      }

      const fields = row.fields as EstimatorFormFields | null;
      const area = areaFromFields(fields);
      if (!area) {
        return null;
      }

      const extras = sanitizeExtras(fields?.extras ?? null);
      const extrasRange = getExtrasPriceRange(extras);

      const baseMin = min - extrasRange.max;
      const baseMax = max - extrasRange.min;
      if (!Number.isFinite(baseMin) || !Number.isFinite(baseMax) || baseMin <= 0 || baseMax <= 0) {
        return null;
      }

      const baseMid = (baseMin + baseMax) / 2;
      const pricePerM2 = baseMid / area;
      if (!Number.isFinite(pricePerM2) || pricePerM2 <= 0) {
        return null;
      }

      return { pricePerM2 };
    })
    .filter((row): row is { pricePerM2: number } => Boolean(row));

  const inputArea = areaFromFields(input?.fields ?? null);
  if (!inputArea) {
    return null;
  }

  const extraRange = getExtrasPriceRange(input?.extras ?? null);
  const halfInterval = Math.max(0, Math.round(settings.interval / 2));

  let baseMin: number;
  let baseMax: number;

  if (samples.length >= settings.minSamples) {
    const avgPerM2 = samples.reduce((sum, row) => sum + row.pricePerM2, 0) / samples.length;
    const baseMid = avgPerM2 * inputArea;
    baseMin = Math.round(baseMid - halfInterval);
    baseMax = Math.round(baseMid + halfInterval);
  } else {
    const fallback = estimateBaseFromArea(inputArea);
    baseMin = fallback.min;
    baseMax = fallback.max;
  }

  baseMin = clamp(baseMin, settings.minPrice, settings.maxPrice);
  baseMax = clamp(baseMax, settings.minPrice, settings.maxPrice);

  if (baseMax - baseMin < settings.interval) {
    if (baseMin <= settings.minPrice) {
      baseMax = clamp(baseMin + settings.interval, settings.minPrice, settings.maxPrice);
    } else if (baseMax >= settings.maxPrice) {
      baseMin = clamp(baseMax - settings.interval, settings.minPrice, settings.maxPrice);
    } else {
      baseMax = clamp(baseMin + settings.interval, settings.minPrice, settings.maxPrice);
    }
  }

  let min = Math.round(baseMin + extraRange.min);
  let max = Math.round(baseMax + extraRange.max);

  if (max - min < settings.interval) {
    max = min + settings.interval;
  }

  if (min > max) {
    min = max;
  }

  return {
    min,
    max,
    sampleCount: samples.length
  };
};
