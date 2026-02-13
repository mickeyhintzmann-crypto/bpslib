import type { SupabaseClient } from "@supabase/supabase-js";

import { getExtrasPriceRange, type BordpladeExtras } from "@/lib/bordplade/extras";
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

const parseSampleNumber = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    let normalized = value.trim();
    if (!normalized) {
      return null;
    }
    // Fjern valuta/tekst og mellemrum.
    normalized = normalized.replace(/[^\d.,]/g, "");
    if (!normalized) {
      return null;
    }
    // Dansk notation: punktum som tusindtalsseparator.
    if (normalized.includes(",")) {
      normalized = normalized.replace(/\./g, "").replace(",", ".");
    } else {
      normalized = normalized.replace(/\./g, "");
    }
    const parsed = Number.parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : null;
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

const getBoardCount = (input?: EstimatorAiInput) => {
  const boardCountRaw = input?.fields?.boardCount;
  return Number.isFinite(boardCountRaw)
    ? Math.max(1, Math.min(6, Math.floor(boardCountRaw as number)))
    : 1;
};

const buildFallbackEstimate = (settings: EstimatorAiSettings, input?: EstimatorAiInput) => {
  const boardCount = getBoardCount(input);
  const extraRange = getExtrasPriceRange(input?.extras ?? null);
  const halfInterval = Math.max(0, Math.round(settings.interval / 2));
  const fallbackMid = (settings.minPrice + settings.maxPrice) / 2;

  let baseMin = Math.round(fallbackMid - halfInterval);
  let baseMax = Math.round(fallbackMid + halfInterval);

  baseMin = clamp(baseMin, settings.minPrice, settings.maxPrice);
  baseMax = clamp(baseMax, settings.minPrice, settings.maxPrice);

  let min = Math.round(baseMin * boardCount + extraRange.min);
  let max = Math.round(baseMax * boardCount + extraRange.max);

  if (max - min < settings.interval) {
    max = min + settings.interval;
  }

  if (min > max) {
    min = max;
  }

  return { min, max, sampleCount: 0 };
};

const toBaseMid = (min: number, max: number) => {
  if (!Number.isFinite(min) || !Number.isFinite(max) || min <= 0 || max <= 0) {
    return null;
  }
  if (min > max) {
    return null;
  }
  return (min + max) / 2;
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
    return buildFallbackEstimate(settings, input);
  }

  const samples = (data || [])
    .map((row) => {
      const min = parseSampleNumber(row.price_min);
      const max = parseSampleNumber(row.price_max);
      if (min === null || max === null) {
        return null;
      }

      const baseMid = toBaseMid(min, max);
      if (!baseMid) {
        return null;
      }

      return { baseMid };
    })
    .filter((row): row is { baseMid: number } => Boolean(row));

  if (samples.length === 0) {
    return buildFallbackEstimate(settings, input);
  }

  const extraRange = getExtrasPriceRange(input?.extras ?? null);
  const boardCount = getBoardCount(input);
  const halfInterval = Math.max(0, Math.round(settings.interval / 2));

  let baseMin: number;
  let baseMax: number;

  const avgBase = samples.reduce((sum, row) => sum + row.baseMid, 0) / samples.length;
  baseMin = Math.round(avgBase - halfInterval);
  baseMax = Math.round(avgBase + halfInterval);

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

  let min = Math.round(baseMin * boardCount + extraRange.min);
  let max = Math.round(baseMax * boardCount + extraRange.max);

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
