import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { estimateAiPrice } from "@/lib/ai-estimator";
import { ESTIMATOR_BUCKET, STATUS_VALUES, type EstimatorFormFields } from "@/lib/estimator";
import { applyRateLimit } from "@/lib/rate-limit";
import { siteConfig } from "@/lib/site-config";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { buildLeadMetaFromRequest, insertLeadIntake } from "@/lib/leads-intake";
import { sendEmail } from "@/lib/notify/email";
import { buildNewAiQuoteTemplate } from "@/lib/notify/templates";

const asString = (value: FormDataEntryValue | null) => (typeof value === "string" ? value.trim() : "");
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif"
]);
const MIN_IMAGES = 1;
const MAX_IMAGES = 6;
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_TOTAL_UPLOAD_BYTES = 40 * 1024 * 1024;
const AI_CONTROL_ROOM_MIGRATION =
  "supabase/migrations/20260302_000050_ai_estimator_control_room.sql";

const isMissingEstimatorTable = (message: string | undefined) => {
  const normalized = (message || "").toLowerCase();
  return (
    normalized.includes("could not find the table 'public.estimator_requests'") ||
    normalized.includes('relation "estimator_requests" does not exist')
  );
};

const isMissingAiTable = (message: string | undefined, table: string) => {
  const normalized = (message || "").toLowerCase();
  return (
    normalized.includes(`could not find the table 'public.${table}'`) ||
    normalized.includes(`relation "${table}" does not exist`) ||
    normalized.includes(`relation \"${table}\" does not exist`)
  );
};

const sanitizeObject = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  return value as Record<string, unknown>;
};

const parseRuleNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return null;
};

const resolveNeedsReview = (
  rules: Record<string, unknown>,
  input: { confidence: number | null; imageCount: number; boardCount: number; aiStatus: string }
) => {
  const minImages = parseRuleNumber(rules.min_images) ?? parseRuleNumber(rules.minImages) ?? 1;
  const minBoardCount = parseRuleNumber(rules.min_board_count) ?? parseRuleNumber(rules.minBoardCount) ?? 1;
  const minConfidence =
    parseRuleNumber(rules.min_confidence) ?? parseRuleNumber(rules.minConfidence) ?? 0.65;

  if (input.aiStatus !== "estimated") {
    return true;
  }
  if (input.imageCount < minImages) {
    return true;
  }
  if (input.boardCount < minBoardCount) {
    return true;
  }
  if (typeof input.confidence === "number" && input.confidence < minConfidence) {
    return true;
  }

  return false;
};

const summarizeOutput = (output: Record<string, unknown>) => {
  const textCandidate =
    (typeof output.text === "string" ? output.text.trim() : "") ||
    (typeof output.explanation === "string" ? output.explanation.trim() : "") ||
    (typeof output.summary === "string" ? output.summary.trim() : "");
  if (textCandidate) {
    return textCandidate.length > 180 ? `${textCandidate.slice(0, 177)}...` : textCandidate;
  }
  const priceRange =
    output.price_range && typeof output.price_range === "object"
      ? (output.price_range as Record<string, unknown>)
      : {};
  const min = priceRange.min ?? output.price_min;
  const max = priceRange.max ?? output.price_max;
  if (min || max) {
    return `Prisinterval: ${min ?? "?"} - ${max ?? "?"}`;
  }
  return "Ingen AI output tekst.";
};

export async function POST(request: Request) {
  try {
    const rateLimit = await applyRateLimit({
      request,
      action: "estimator_submit",
      limit: siteConfig.rateLimit.estimatorSubmitPerHour,
      windowSeconds: siteConfig.rateLimit.windowSeconds
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { message: "Du har sendt mange forespørgsler. Prøv igen om lidt eller ring til os." },
        {
          status: 429,
          headers:
            rateLimit.retryAfterSeconds > 0
              ? { "Retry-After": String(rateLimit.retryAfterSeconds) }
              : undefined
        }
      );
    }

    const formData = await request.formData();

    const images = formData
      .getAll("images")
      .filter((entry): entry is File => entry instanceof File)
      .filter((file) => file.size > 0);

    if (images.length < MIN_IMAGES || images.length > MAX_IMAGES) {
      return NextResponse.json({ message: "Upload mindst 1 og maks 6 billeder." }, { status: 400 });
    }

    if (images.some((file) => !ALLOWED_IMAGE_TYPES.has(file.type))) {
      return NextResponse.json(
        { message: "Kun JPEG, PNG, WEBP eller HEIC billeder er tilladt." },
        { status: 400 }
      );
    }

    const oversizedFile = images.find((file) => file.size > MAX_IMAGE_SIZE_BYTES);
    if (oversizedFile) {
      return NextResponse.json(
        { message: `Billedet "${oversizedFile.name}" er for stort. Maks 10 MB pr. billede.` },
        { status: 400 }
      );
    }

    const totalUploadBytes = images.reduce((sum, file) => sum + file.size, 0);
    if (totalUploadBytes > MAX_TOTAL_UPLOAD_BYTES) {
      return NextResponse.json(
        { message: "Den samlede upload er for stor. Maks 40 MB i alt." },
        { status: 400 }
      );
    }

    const boardCount = images.length;
    const aiNote =
      "Hvert billede repræsenterer én bordplade. Antag ikke at flere billeder er flere vinkler af samme bordplade.";

    const fields: EstimatorFormFields = {
      navn: asString(formData.get("navn")),
      telefon: asString(formData.get("telefon")),
      boardCount,
      aiNote
    };

    if (!fields.navn || !fields.telefon) {
      return NextResponse.json({ message: "Navn og telefon er obligatoriske." }, { status: 400 });
    }

    const supabase = createSupabaseServiceClient();
    const requestId = randomUUID();
    const service = "bordplade";
    const pageUrl = request.headers.get("referer") || null;
    const requestMeta = {
      ...buildLeadMetaFromRequest(request),
      endpoint: "/api/estimator/submit"
    };

    const uploadedImages: Array<{ path: string; name: string; isEdge: boolean; isOverview: boolean }> = [];

    for (const [index, file] of images.entries()) {
      const extension = file.name.includes(".") ? file.name.split(".").pop() || "jpg" : "jpg";
      const cleanExtension = extension.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
      const filePath = `${requestId}/${Date.now()}-${index}.${cleanExtension}`;

      const { error: uploadError } = await supabase.storage
        .from(ESTIMATOR_BUCKET)
        .upload(filePath, file, {
          contentType: file.type,
          upsert: false
        });

      if (uploadError) {
        return NextResponse.json(
          {
            message:
              uploadError.message ||
              "Kunne ikke uploade billeder. Kontroller at bucket 'estimator-images' findes og er privat."
          },
          { status: 500 }
        );
      }

      uploadedImages.push({
        path: filePath,
        name: file.name,
        isEdge: false,
        isOverview: true
      });
    }

    const retentionDeleteAt = new Date();
    retentionDeleteAt.setDate(retentionDeleteAt.getDate() + siteConfig.estimatorRetentionDays);

    const aiEstimate = await estimateAiPrice(supabase, { fields, extras: null });
    const aiStatus = aiEstimate ? "estimated" : "manual";

    const { data, error: insertError } = await supabase
      .from("estimator_requests")
      .insert({
        gating_answer: "ved_ikke",
        fields: {
          ...fields,
          extras: null
        },
        images: uploadedImages,
        status: STATUS_VALUES.new,
        retention_delete_at: retentionDeleteAt.toISOString(),
        ai_price_min: aiEstimate?.min ?? null,
        ai_price_max: aiEstimate?.max ?? null,
        ai_status: aiStatus
      })
      .select("id")
      .single();

    if (insertError || !data) {
      if (isMissingEstimatorTable(insertError?.message)) {
        return NextResponse.json(
          {
            message:
              "Prisberegneren er ikke klargjort i databasen endnu. Kør migrationen i supabase/migrations/20260208_000001_estimator_requests.sql."
          },
          { status: 503 }
        );
      }

      return NextResponse.json(
        { message: insertError?.message || "Kunne ikke gemme vurderingen i databasen." },
        { status: 500 }
      );
    }

    let leadId: string | null = null;
    try {
      const leadResult = await insertLeadIntake({
        source: "ai_quote",
        service,
        name: fields.navn,
        phone: fields.telefon,
        message: `Prisberegner indsendt med ${boardCount} billede(r).`,
        pageUrl,
        meta: {
          ...requestMeta,
          estimatorRequestId: data.id,
          boardCount,
          aiStatus
        }
      });
      if (leadResult.ok && leadResult.leadId) {
        leadId = leadResult.leadId;
      } else {
        console.error("[estimator_submit] lead capture failed", leadResult.error);
      }
    } catch (leadCaptureError) {
      console.error("[estimator_submit] lead capture failed", leadCaptureError);
    }

    try {
      let promptVersionId: string | null = null;
      let promptRules: Record<string, unknown> = {};

      const { data: activePrompt, error: promptError } = await supabase
        .from("ai_prompt_versions")
        .select("id, rules")
        .eq("service", service)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (promptError) {
        if (
          !isMissingAiTable(promptError.message, "ai_prompt_versions") &&
          !isMissingAiTable(promptError.message, "ai_quote_requests")
        ) {
          console.error("[estimator_submit] prompt lookup failed", promptError.message);
        }
      } else if (activePrompt) {
        promptVersionId = activePrompt.id as string;
        promptRules = sanitizeObject(activePrompt.rules);
      }

      const { data: quoteRequest, error: quoteRequestError } = await supabase
        .from("ai_quote_requests")
        .insert({
          service,
          lead_id: leadId,
          page_url: pageUrl,
          utm: {},
          inputs: {
            fields,
            boardCount,
            aiNote,
            estimatorRequestId: data.id
          },
          images: uploadedImages,
          client_meta: requestMeta
        })
        .select("id")
        .single();

      if (quoteRequestError || !quoteRequest) {
        if (
          !isMissingAiTable(quoteRequestError?.message, "ai_quote_requests") &&
          !isMissingAiTable(quoteRequestError?.message, "ai_quote_results")
        ) {
          console.error("[estimator_submit] ai_quote_requests insert failed", quoteRequestError?.message);
        }
      } else {
        const confidence = aiEstimate ? (aiStatus === "estimated" ? 0.78 : 0.45) : null;
        const needsReview = resolveNeedsReview(promptRules, {
          confidence,
          imageCount: images.length,
          boardCount,
          aiStatus
        });

        const output = {
          text: aiEstimate
            ? "AI vurdering genereret på baggrund af historiske estimater og indsendte billeder."
            : "Automatisk vurdering var ikke mulig. Sagen er markeret til manuel gennemgang.",
          price_range: aiEstimate ? { min: aiEstimate.min, max: aiEstimate.max } : null,
          explanation:
            "Prisintervallet er vejledende og valideres i den manuelle gennemgang før endeligt tilbud.",
          next_steps: [
            "Vi validerer opgavens omfang og billedmateriale.",
            "Du modtager næste konkrete skridt fra teamet."
          ],
          ai_status: aiStatus
        };

        const { error: quoteResultError } = await supabase.from("ai_quote_results").insert({
          request_id: quoteRequest.id,
          prompt_version_id: promptVersionId,
          output,
          confidence,
          needs_review: needsReview,
          review_status: "unreviewed",
          admin_feedback: null,
          admin_override: {}
        });

        if (quoteResultError && !isMissingAiTable(quoteResultError.message, "ai_quote_results")) {
          console.error("[estimator_submit] ai_quote_results insert failed", quoteResultError.message);
        } else if (!quoteResultError && (process.env.NOTIFY_AI_ENABLED || "").toLowerCase() === "true") {
          const reviewStatus = "unreviewed";
          const shouldNotify = needsReview || reviewStatus === "unreviewed";
          if (shouldNotify) {
            try {
              const template = buildNewAiQuoteTemplate({
                leadId,
                service,
                leadName: fields.navn,
                leadPhone: fields.telefon,
                confidence,
                needsReview,
                inputs: {
                  boardCount,
                  fields
                },
                outputSummary: summarizeOutput(output)
              });

              const notifyResult = await sendEmail({
                subject: template.subject,
                html: template.html,
                text: template.text,
                enabled: true
              });

              if (!notifyResult.ok) {
                console.error("[ai_notify] email failed", notifyResult.error);
              }
            } catch (notifyError) {
              console.error("[ai_notify] email failed", notifyError);
            }
          }
        }
      }
    } catch (aiControlRoomError) {
      console.error(
        `[estimator_submit] AI Control Room write failed. Ensure migration exists: ${AI_CONTROL_ROOM_MIGRATION}`,
        aiControlRoomError
      );
    }

    return NextResponse.json(
      {
        id: data.id,
        aiPriceMin: aiEstimate?.min ?? null,
        aiPriceMax: aiEstimate?.max ?? null,
        aiStatus
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Uventet fejl under behandling af prisberegner." },
      { status: 500 }
    );
  }
}
