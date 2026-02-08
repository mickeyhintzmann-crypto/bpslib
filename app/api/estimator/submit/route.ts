import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import {
  ESTIMATOR_BUCKET,
  GATING_OPTIONS,
  STATUS_VALUES,
  type EstimatorFormFields,
  type GatingAnswer
} from "@/lib/estimator";
import { applyRateLimit } from "@/lib/rate-limit";
import { siteConfig } from "@/lib/site-config";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

const parseBoolean = (value: FormDataEntryValue | null) => value === "true";

const asString = (value: FormDataEntryValue | null) => (typeof value === "string" ? value.trim() : "");

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MIN_IMAGES = 3;
const MAX_IMAGES = 6;
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_TOTAL_UPLOAD_BYTES = 20 * 1024 * 1024;

const parseGating = (value: string): GatingAnswer | null => {
  return GATING_OPTIONS.includes(value as GatingAnswer) ? (value as GatingAnswer) : null;
};

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

    const gatingAnswer = parseGating(asString(formData.get("gatingAnswer")));
    const noPrice = parseBoolean(formData.get("noPrice"));
    const edgeImageIndexRaw = asString(formData.get("edgeImageIndex"));

    const images = formData
      .getAll("images")
      .filter((entry): entry is File => entry instanceof File)
      .filter((file) => file.size > 0);

    if (!gatingAnswer) {
      return NextResponse.json({ message: "Ugyldigt svar på massiv træ-gating." }, { status: 400 });
    }

    if (images.length < MIN_IMAGES || images.length > MAX_IMAGES) {
      return NextResponse.json({ message: "Upload mindst 3 og maks 6 billeder." }, { status: 400 });
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

    if (!noPrice && gatingAnswer === "nej") {
      return NextResponse.json(
        { message: "Vi giver kun pris på massive træbordplader." },
        { status: 400 }
      );
    }

    const requiresEdgeImage = gatingAnswer === "ja" || gatingAnswer === "ved_ikke";
    const edgeImageIndex = Number.parseInt(edgeImageIndexRaw, 10);

    if (requiresEdgeImage && (!Number.isInteger(edgeImageIndex) || edgeImageIndex < 0 || edgeImageIndex >= images.length)) {
      return NextResponse.json({ message: "Markér hvilket billede der viser kant/ende." }, { status: 400 });
    }

    let parsedSkader: string[] = [];
    try {
      const rawSkader = asString(formData.get("skader"));
      parsedSkader = rawSkader ? (JSON.parse(rawSkader) as string[]) : [];
      if (!Array.isArray(parsedSkader)) {
        parsedSkader = [];
      }
    } catch {
      return NextResponse.json({ message: "Skader kunne ikke læses korrekt." }, { status: 400 });
    }

    const fields: EstimatorFormFields = {
      bordpladeType: asString(formData.get("bordpladeType")),
      traesort: asString(formData.get("traesort")),
      overflade: asString(formData.get("overflade")),
      skader: parsedSkader,
      laengdeCm: asString(formData.get("laengdeCm")),
      dybdeCm: asString(formData.get("dybdeCm")),
      antal: asString(formData.get("antal")),
      postnr: asString(formData.get("postnr")),
      navn: asString(formData.get("navn")),
      telefon: asString(formData.get("telefon")),
      email: asString(formData.get("email")),
      note: asString(formData.get("note")),
      noPrice
    };

    if (!/^\d{4}$/.test(fields.postnr)) {
      return NextResponse.json({ message: "Postnr skal være 4 tal." }, { status: 400 });
    }

    if (!fields.navn || !fields.telefon || !fields.email) {
      return NextResponse.json(
        { message: "Navn, telefon og email er obligatoriske." },
        { status: 400 }
      );
    }

    const laengde = Number(fields.laengdeCm);
    const dybde = Number(fields.dybdeCm);

    if (!Number.isFinite(laengde) || laengde <= 0 || !Number.isFinite(dybde) || dybde <= 0) {
      return NextResponse.json({ message: "Længde og dybde skal være gyldige tal." }, { status: 400 });
    }

    const supabase = createSupabaseServiceClient();
    const requestId = randomUUID();

    const uploadedImages: Array<{ path: string; name: string; isEdge: boolean }> = [];

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
        isEdge: Number.isInteger(edgeImageIndex) && edgeImageIndex === index
      });
    }

    const retentionDeleteAt = new Date();
    retentionDeleteAt.setDate(retentionDeleteAt.getDate() + siteConfig.estimatorRetentionDays);

    const { data, error: insertError } = await supabase
      .from("estimator_requests")
      .insert({
        gating_answer: gatingAnswer,
        fields,
        images: uploadedImages,
        status: STATUS_VALUES.new,
        retention_delete_at: retentionDeleteAt.toISOString()
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

    return NextResponse.json({ id: data.id }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Uventet fejl under behandling af prisberegner." },
      { status: 500 }
    );
  }
}
