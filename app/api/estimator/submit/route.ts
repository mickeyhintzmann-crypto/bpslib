import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { estimateAiPrice } from "@/lib/ai-estimator";
import { ESTIMATOR_BUCKET, STATUS_VALUES, type EstimatorFormFields } from "@/lib/estimator";
import { applyRateLimit } from "@/lib/rate-limit";
import { siteConfig } from "@/lib/site-config";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

const asString = (value: FormDataEntryValue | null) => (typeof value === "string" ? value.trim() : "");
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MIN_IMAGES = 1;
const MAX_IMAGES = 6;
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_TOTAL_UPLOAD_BYTES = 20 * 1024 * 1024;

const isMissingEstimatorTable = (message: string | undefined) => {
  const normalized = (message || "").toLowerCase();
  return (
    normalized.includes("could not find the table 'public.estimator_requests'") ||
    normalized.includes('relation "estimator_requests" does not exist')
  );
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
        { message: "Kun JPEG, PNG eller WEBP billeder er tilladt." },
        { status: 400 }
      );
    }

    const oversizedFile = images.find((file) => file.size > MAX_IMAGE_SIZE_BYTES);
    if (oversizedFile) {
      return NextResponse.json(
        { message: `Billedet "${oversizedFile.name}" er for stort. Maks 5 MB pr. billede.` },
        { status: 400 }
      );
    }

    const totalUploadBytes = images.reduce((sum, file) => sum + file.size, 0);
    if (totalUploadBytes > MAX_TOTAL_UPLOAD_BYTES) {
      return NextResponse.json(
        { message: "Den samlede upload er for stor. Maks 20 MB i alt." },
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
