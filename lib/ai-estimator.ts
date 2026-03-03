import type { SupabaseClient } from "@supabase/supabase-js";

import { getExtrasPriceRange, type BordpladeExtras } from "@/lib/bordplade/extras";
import type { EstimatorFormFields } from "@/lib/estimator";

export type EstimatorAiSettings = {
  enabled: boolean;
  minSamples: number;
  interval: number;
  minPrice: number;
  maxPrice: number;
  fixedPrice: boolean;
  roundTo: number;
};

type ServiceHardLimits = {
  min: number;
  max: number;
};

const SERVICE_HARD_LIMITS: Record<string, ServiceHardLimits> = {
  bordplade: { min: 3200, max: 4000 },
  // Gulv bruger pris pr. m2 i læringen.
  gulvafslibning: { min: 80, max: 1200 }
};

const FALLBACK_HARD_LIMITS: ServiceHardLimits = { min: 100, max: 100000 };

export type EstimatorAiEstimate = {
  min: number;
  max: number;
  sampleCount: number;
};

export const ESTIMATOR_AI_DEFAULTS: EstimatorAiSettings = {
  enabled: true,
  minSamples: 1,
  interval: 300,
  minPrice: SERVICE_HARD_LIMITS.bordplade.min,
  maxPrice: SERVICE_HARD_LIMITS.bordplade.max,
  fixedPrice: false,
  roundTo: 100
};

const SERVICE_DEFAULTS: Record<string, EstimatorAiSettings> = {
  bordplade: ESTIMATOR_AI_DEFAULTS,
  gulvafslibning: {
    enabled: true,
    minSamples: 1,
    interval: 40,
    minPrice: SERVICE_HARD_LIMITS.gulvafslibning.min,
    maxPrice: SERVICE_HARD_LIMITS.gulvafslibning.max,
    fixedPrice: false,
    roundTo: 10
  }
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

export const getEstimatorAiSettings = async (
  supabase: SupabaseClient,
  service: string = "bordplade"
): Promise<EstimatorAiSettings> => {
  const defaults = SERVICE_DEFAULTS[service] || ESTIMATOR_AI_DEFAULTS;
  const hardLimits = SERVICE_HARD_LIMITS[service] || FALLBACK_HARD_LIMITS;
  const settingsKey = service === "bordplade" ? "estimator_ai" : `estimator_ai_${service}`;

  try {
    const { data, error } = await supabase
      .from("settings")
      .select("value")
      .eq("key", settingsKey)
      .maybeSingle();

    if (error) {
      return defaults;
    }

    const value = (data?.value || {}) as Partial<EstimatorAiSettings>;

    const enabled = parseBoolean(value.enabled);
    const minSamples = parseIntValue(value.minSamples);
    const interval = parseIntValue(value.interval);
    const minPrice = parseIntValue(value.minPrice);
    const maxPrice = parseIntValue(value.maxPrice);
    const fixedPrice = parseBoolean(value.fixedPrice);
    const roundTo = parseIntValue(value.roundTo);

    let resolvedMinPrice = minPrice ?? defaults.minPrice;
    let resolvedMaxPrice = maxPrice ?? defaults.maxPrice;

    resolvedMinPrice = Math.max(resolvedMinPrice, hardLimits.min);
    resolvedMaxPrice = Math.min(resolvedMaxPrice, hardLimits.max);
    if (resolvedMaxPrice < resolvedMinPrice) {
      resolvedMaxPrice = resolvedMinPrice;
    }

    return {
      enabled: enabled ?? defaults.enabled,
      minSamples: minSamples ?? defaults.minSamples,
      interval: interval ?? defaults.interval,
      minPrice: resolvedMinPrice,
      maxPrice: resolvedMaxPrice,
      fixedPrice: fixedPrice ?? defaults.fixedPrice,
      roundTo: roundTo ?? defaults.roundTo
    };
  } catch (error) {
    console.error("Kunne ikke hente estimator AI settings:", error);
    return defaults;
  }
};

type EstimatorAiInput = {
  fields?: EstimatorFormFields | null;
  extras?: BordpladeExtras | null;
  service?: string | null;
};

const ESTIMATOR_AI_SERVICES = [
  "bordplade",
  "gulvafslibning",
  "gulvbelaegning",
  "microcement",
  "maler",
  "toemrer",
  "murer",
  "andet"
] as const;

type EstimatorAiService = (typeof ESTIMATOR_AI_SERVICES)[number];

const normalizeService = (value: unknown): EstimatorAiService => {
  if (typeof value !== "string") {
    return "bordplade";
  }
  const cleaned = value.trim().toLowerCase();
  if (ESTIMATOR_AI_SERVICES.includes(cleaned as EstimatorAiService)) {
    return cleaned as EstimatorAiService;
  }
  return "bordplade";
};

const getServiceFromFields = (value: unknown): EstimatorAiService => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return "bordplade";
  }
  return normalizeService((value as Record<string, unknown>).service);
};

const getBoardCount = (input?: EstimatorAiInput) => {
  const boardCountRaw = input?.fields?.boardCount;
  return Number.isFinite(boardCountRaw)
    ? Math.max(1, Math.min(6, Math.floor(boardCountRaw as number)))
    : 1;
};

const parseAreaM2 = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value > 0 ? value : null;
  }
  if (typeof value === "string") {
    const normalized = value.trim().replace(",", ".");
    const parsed = Number.parseFloat(normalized);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }
  return null;
};

const getAreaM2FromFields = (value: unknown) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  return parseAreaM2((value as Record<string, unknown>).areaM2);
};

const parseBoardCount = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(1, Math.min(6, Math.floor(value)));
  }
  if (typeof value === "string") {
    const parsed = Number.parseInt(value.trim(), 10);
    if (Number.isFinite(parsed)) {
      return Math.max(1, Math.min(6, parsed));
    }
  }
  return 1;
};

const parsePriceRange = (value: unknown) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { min: null as number | null, max: null as number | null };
  }
  const obj = value as Record<string, unknown>;
  const range =
    obj.price_range && typeof obj.price_range === "object" && !Array.isArray(obj.price_range)
      ? (obj.price_range as Record<string, unknown>)
      : {};

  const min = parseSampleNumber(range.min ?? obj.price_min);
  const max = parseSampleNumber(range.max ?? obj.price_max);
  return { min, max };
};

const buildFallbackEstimate = (
  settings: EstimatorAiSettings,
  service: string,
  input?: EstimatorAiInput
) => {
  const boardCount = getBoardCount(input);
  const areaM2 = parseAreaM2(input?.fields?.areaM2);
  const extraRange = getExtrasPriceRange(input?.extras ?? null);
  const halfInterval = Math.max(0, Math.round(settings.interval / 2));
  const fallbackMid = (settings.minPrice + settings.maxPrice) / 2;

  let baseMin = Math.round(fallbackMid - halfInterval);
  let baseMax = Math.round(fallbackMid + halfInterval);

  baseMin = clamp(baseMin, settings.minPrice, settings.maxPrice);
  baseMax = clamp(baseMax, settings.minPrice, settings.maxPrice);

  let min = 0;
  let max = 0;

  if (service === "gulvafslibning" && areaM2) {
    min = Math.round(baseMin * areaM2);
    max = Math.round(baseMax * areaM2);
  } else {
    min = Math.round(baseMin * boardCount + extraRange.min);
    max = Math.round(baseMax * boardCount + extraRange.max);
  }

  if (max - min < settings.interval) {
    max = min + settings.interval;
  }

  if (min > max) {
    min = max;
  }

  ({ min, max } = clampFinalRange(service, min, max));

  if (settings.fixedPrice) {
    const rounded = roundFixedPrice(settings, (min + max) / 2);
    return { min: rounded, max: rounded, sampleCount: 0 };
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

const roundFixedPrice = (settings: EstimatorAiSettings, value: number) => {
  const roundTo = settings.roundTo > 0 ? settings.roundTo : 100;
  const rounded = Math.round(value / roundTo) * roundTo;
  return clamp(Math.round(rounded), settings.minPrice, settings.maxPrice);
};

const clampFinalRange = (service: string, min: number, max: number) => {
  const limits = SERVICE_HARD_LIMITS[service] || FALLBACK_HARD_LIMITS;
  let clampedMin = clamp(min, limits.min, limits.max);
  let clampedMax = clamp(max, limits.min, limits.max);
  if (clampedMin > clampedMax) {
    clampedMax = clampedMin;
  }
  return { min: clampedMin, max: clampedMax };
};

export const estimateAiPrice = async (
  supabase: SupabaseClient,
  input?: EstimatorAiInput
): Promise<EstimatorAiEstimate | null> => {
  const targetService = normalizeService(input?.service ?? input?.fields?.service);
  const settings = await getEstimatorAiSettings(supabase, targetService);

  if (!settings.enabled) {
    // Hvis AI er slået fra, returnér stadig et fallback-estimat,
    // så kunden kan få en pris uden at flowet stopper.
    return buildFallbackEstimate(settings, targetService, input);
  }

  const [estimatorResult, aiReviewedResult] = await Promise.all([
    supabase
      .from("estimator_requests")
      .select("price_min, price_max, fields")
      .not("price_min", "is", null)
      .not("price_max", "is", null)
      .order("created_at", { ascending: false })
      .limit(240),
    supabase
      .from("ai_quote_results")
      .select("review_status, admin_override, output, request:request_id(service, inputs)")
      .in("review_status", ["approved", "edited"])
      .order("created_at", { ascending: false })
      .limit(240)
  ]);

  if (estimatorResult.error) {
    console.error("Kunne ikke hente estimator samples:", estimatorResult.error);
    return buildFallbackEstimate(settings, targetService, input);
  }

  type SampleRow = { baseMid: number };
  const estimatorSamples: SampleRow[] = (estimatorResult.data || [])
    .map((row) => {
      if (getServiceFromFields(row.fields) !== targetService) {
        return null;
      }

      const min = parseSampleNumber(row.price_min);
      const max = parseSampleNumber(row.price_max);
      if (min === null || max === null) {
        return null;
      }

      let baseMid = toBaseMid(min, max);
      if (!baseMid) {
        return null;
      }

      // Gulv læres som pris pr. m2; bordplade og øvrige services følger eksisterende model.
      if (targetService === "gulvafslibning") {
        const areaM2 = getAreaM2FromFields(row.fields);
        if (!areaM2) {
          return null;
        }
        baseMid = baseMid / areaM2;
      }

      if (!baseMid) {
        return null;
      }

      return { baseMid };
    })
    .filter((row): row is SampleRow => Boolean(row));

  const aiReviewedSamples: SampleRow[] = [];
  if (aiReviewedResult.error) {
    console.error("Kunne ikke hente AI review samples:", aiReviewedResult.error);
  } else {
    type AiReviewedRow = {
      review_status: string;
      admin_override: Record<string, unknown> | null;
      output: Record<string, unknown> | null;
      request:
        | { service: string; inputs: Record<string, unknown> | null }
        | Array<{ service: string; inputs: Record<string, unknown> | null }>
        | null;
    };

    ((aiReviewedResult.data || []) as AiReviewedRow[]).forEach((row) => {
      const request = Array.isArray(row.request) ? row.request[0] || null : row.request;
      if (normalizeService(request?.service) !== targetService) {
        return;
      }
      const boardCount = parseBoardCount(request?.inputs?.boardCount);
      const inputFields =
        request?.inputs && typeof request.inputs === "object" && !Array.isArray(request.inputs)
          ? ((request.inputs as Record<string, unknown>).fields as Record<string, unknown> | undefined)
          : undefined;
      const areaM2 = parseAreaM2(inputFields?.areaM2 ?? (request?.inputs as Record<string, unknown> | null)?.areaM2);

      const overrideRange = parsePriceRange(row.admin_override);
      const outputRange = parsePriceRange(row.output);

      const min = overrideRange.min ?? outputRange.min;
      const max = overrideRange.max ?? outputRange.max;
      if (min === null || max === null || min <= 0 || max <= 0 || max < min) {
        return;
      }

      const normalizedBase =
        targetService === "gulvafslibning" ? ((min + max) / 2) / (areaM2 || 1) : ((min + max) / 2) / boardCount;
      if (targetService === "gulvafslibning" && !areaM2) {
        return;
      }
      const baseMid = toBaseMid(normalizedBase, normalizedBase);
      if (!baseMid) {
        return;
      }

      // "edited" vurderinger er direkte menneske-korrigerede og vægtes højere.
      if (row.review_status === "edited") {
        aiReviewedSamples.push({ baseMid });
      }
      aiReviewedSamples.push({ baseMid });
    });
  }

  const samples = [...estimatorSamples, ...aiReviewedSamples];

  if (samples.length === 0 || samples.length < settings.minSamples) {
    return buildFallbackEstimate(settings, targetService, input);
  }

  const extraRange = getExtrasPriceRange(input?.extras ?? null);
  const boardCount = getBoardCount(input);
  const areaM2 = parseAreaM2(input?.fields?.areaM2);
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

  let min = 0;
  let max = 0;

  if (targetService === "gulvafslibning" && areaM2) {
    min = Math.round(baseMin * areaM2);
    max = Math.round(baseMax * areaM2);
  } else {
    min = Math.round(baseMin * boardCount + extraRange.min);
    max = Math.round(baseMax * boardCount + extraRange.max);
  }

  if (max - min < settings.interval) {
    max = min + settings.interval;
  }

  if (min > max) {
    min = max;
  }

  ({ min, max } = clampFinalRange(targetService, min, max));

  if (settings.fixedPrice) {
    const rounded = roundFixedPrice(settings, (min + max) / 2);
    min = rounded;
    max = rounded;
  }

  return {
    min,
    max,
    sampleCount: samples.length
  };
};
