import OpenAI from "openai";

import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { ESTIMATOR_BUCKET } from "@/lib/estimator";

/* ─── Types ─── */

export type BordpladeFeatures = {
  waterfallCount: number;
  waterfallDescription: string | null;
  boardCount: number;
  estimatedTotalLengthCm: number | null;
  surfaceCondition: "let" | "middel" | "kraftig";
  hasEdgeDamage: boolean;
  hasBurnMarks: boolean;
  hasWaterStains: boolean;
  woodType: string | null;
  notes: string | null;
};

export type VisionAnalysisResult = {
  ok: true;
  features: BordpladeFeatures;
  rawResponse: string;
} | {
  ok: false;
  error: string;
};

/* ─── OpenAI client ─── */

const getOpenAI = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new OpenAI({ apiKey });
};

/* ─── Sign Supabase image URLs ─── */

const signImageUrls = async (imagePaths: string[]): Promise<string[]> => {
  if (imagePaths.length === 0) return [];
  const supabase = createSupabaseServiceClient();
  const { data } = await supabase.storage
    .from(ESTIMATOR_BUCKET)
    .createSignedUrls(imagePaths, 60 * 15); // 15 min

  return (data || [])
    .map((entry) => entry.signedUrl)
    .filter((url): url is string => Boolean(url));
};

/* ─── System prompt ─── */

const BORDPLADE_SYSTEM_PROMPT = `Du er en ekspert i bordpladeslibning. Du analyserer billeder af bordplader og køkkener for at identificere detaljer der påvirker prisen.

VIGTIGSTE OPGAVE: Identificer "vandfald" (waterfall edges) — dette er når bordpladematerialet fortsætter ned langs siden af et skab, fra bordpladehøjde til gulvet. Vandfald koster markant mere at slibe fordi de kræver ekstra arbejde.

Svar ALTID i dette JSON-format og INTET andet:
{
  "waterfallCount": <antal vandfald du kan se, 0 hvis ingen>,
  "waterfallDescription": <kort beskrivelse af vandfaldene hvis nogen, ellers null>,
  "boardCount": <antal separate bordplader du kan tælle>,
  "estimatedTotalLengthCm": <estimeret samlet længde i cm hvis muligt, ellers null>,
  "surfaceCondition": <"let" | "middel" | "kraftig" baseret på synligt slid>,
  "hasEdgeDamage": <true/false>,
  "hasBurnMarks": <true/false>,
  "hasWaterStains": <true/false>,
  "woodType": <"eg" | "bøg" | "ask" | "valnød" | "bambus" | "andet" | null>,
  "notes": <eventuelle andre relevante observationer, ellers null>
}

Regler:
- Et vandfald er KUN når bordpladematerialet fortsætter vertikalt ned langs siden af et skab
- Tæl hvert vandfald separat (en ø-bordplade kan have 2-4 vandfald)
- Vær konservativ — sig kun der er vandfald hvis du er sikker
- surfaceCondition: "let" = minimalt slid, "middel" = synlige ridser/pletter, "kraftig" = dybe skader
- boardCount: tæl separate bordpladesektioner (L-form = 2, ø = 1 stor, etc.)`;

/* ─── Main analysis function ─── */

export const analyzeEstimatorImages = async (
  imagePaths: string[],
  service: string = "bordplade"
): Promise<VisionAnalysisResult> => {
  if (service !== "bordplade") {
    return { ok: false, error: `Vision-analyse understøttes kun for bordplade (fik: ${service})` };
  }

  const openai = getOpenAI();
  if (!openai) {
    return { ok: false, error: "OPENAI_API_KEY er ikke konfigureret." };
  }

  if (imagePaths.length === 0) {
    return { ok: false, error: "Ingen billeder at analysere." };
  }

  try {
    const signedUrls = await signImageUrls(imagePaths);
    if (signedUrls.length === 0) {
      return { ok: false, error: "Kunne ikke generere signerede URLs til billeder." };
    }

    const imageMessages: OpenAI.Chat.Completions.ChatCompletionContentPart[] = signedUrls.map((url) => ({
      type: "image_url" as const,
      image_url: { url, detail: "high" as const },
    }));

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 800,
      temperature: 0.1,
      messages: [
        { role: "system", content: BORDPLADE_SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            { type: "text", text: "Analysér disse billeder af bordplader. Identificer vandfald, tilstand, og andre prispåvirkende features." },
            ...imageMessages,
          ],
        },
      ],
    });

    const raw = response.choices[0]?.message?.content || "";

    // Parse JSON fra response (håndter markdown code blocks)
    let jsonStr = raw.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
    }

    const parsed = JSON.parse(jsonStr) as BordpladeFeatures;

    // Validér og normalisér
    const features: BordpladeFeatures = {
      waterfallCount: typeof parsed.waterfallCount === "number" ? Math.max(0, Math.round(parsed.waterfallCount)) : 0,
      waterfallDescription: typeof parsed.waterfallDescription === "string" ? parsed.waterfallDescription : null,
      boardCount: typeof parsed.boardCount === "number" ? Math.max(1, Math.round(parsed.boardCount)) : 1,
      estimatedTotalLengthCm: typeof parsed.estimatedTotalLengthCm === "number" ? Math.round(parsed.estimatedTotalLengthCm) : null,
      surfaceCondition: ["let", "middel", "kraftig"].includes(parsed.surfaceCondition) ? parsed.surfaceCondition : "middel",
      hasEdgeDamage: Boolean(parsed.hasEdgeDamage),
      hasBurnMarks: Boolean(parsed.hasBurnMarks),
      hasWaterStains: Boolean(parsed.hasWaterStains),
      woodType: typeof parsed.woodType === "string" ? parsed.woodType : null,
      notes: typeof parsed.notes === "string" ? parsed.notes : null,
    };

    return { ok: true, features, rawResponse: raw };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ukendt fejl ved billedanalyse.";
    console.error("[vision-analyze] error:", message);
    return { ok: false, error: message };
  }
};
