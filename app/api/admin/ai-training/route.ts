import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { auditLog } from "@/lib/audit";
import { sanitizeExtras } from "@/lib/bordplade/extras";
import { ESTIMATOR_BUCKET, STATUS_VALUES, type EstimatorFormFields } from "@/lib/estimator";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

const asString = (value: FormDataEntryValue | null) => (typeof value === "string" ? value.trim() : "");

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MIN_IMAGES = 3;
const MAX_IMAGES = 6;
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_TOTAL_UPLOAD_BYTES = 20 * 1024 * 1024;

const parseNumber = (value: string, min: number, max: number) => {
  if (!value) {
    return null;
  }
  const normalized = value.replace(",", ".").replace(/[^0-9.]/g, "");
  const parsed = Number.parseFloat(normalized);
  if (!Number.isFinite(parsed)) {
    return null;
  }
  const rounded = Math.round(parsed);
  if (rounded < min || rounded > max) {
    return null;
  }
  return rounded;
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
    const { session, error: authError } = requireAdmin(request, ["owner", "admin"]);
    if (authError) {
      return authError;
    }

    const formData = await request.formData();

    const edgeImageIndexRaw = asString(formData.get("edgeImageIndex"));
    const kitchenImageIndexRaw = asString(formData.get("kitchenImageIndex"));
    const priceMinRaw = asString(formData.get("priceMin"));
    const priceMaxRaw = asString(formData.get("priceMax"));
    const label = asString(formData.get("label"));
    const note = asString(formData.get("note"));

    const images = formData
      .getAll("images")
      .filter((entry): entry is File => entry instanceof File)
      .filter((file) => file.size > 0);

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

    const edgeImageIndex = Number.parseInt(edgeImageIndexRaw, 10);
    const kitchenImageIndex = Number.parseInt(kitchenImageIndexRaw, 10);

    if (!Number.isInteger(kitchenImageIndex) || kitchenImageIndex < 0 || kitchenImageIndex >= images.length) {
      return NextResponse.json(
        { message: "Markér hvilket billede der viser hele køkkenet/bordpladen." },
        { status: 400 }
      );
    }

    const priceMin = parseNumber(priceMinRaw, 500, 20000);
    const priceMax = parseNumber(priceMaxRaw, 500, 20000);

    if (priceMin === null || priceMax === null) {
      return NextResponse.json({ message: "Angiv prisinterval (min/max)." }, { status: 400 });
    }
    if (priceMin > priceMax) {
      return NextResponse.json({ message: "Prisinterval: min må ikke være større end max." }, { status: 400 });
    }

    let extras = sanitizeExtras(null);
    try {
      const rawExtras = asString(formData.get("extras"));
      extras = sanitizeExtras(rawExtras ? (JSON.parse(rawExtras) as unknown) : null);
    } catch {
      return NextResponse.json({ message: "Tilvalg kunne ikke læses korrekt." }, { status: 400 });
    }

    const supabase = createSupabaseServiceClient();
    const requestId = randomUUID();

    const uploadedImages: Array<{ path: string; name: string; isEdge: boolean; isOverview: boolean }> = [];

    for (const [index, file] of images.entries()) {
      const extension = file.name.includes(".") ? file.name.split(".").pop() || "jpg" : "jpg";
      const cleanExtension = extension.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
      const filePath = `training/${requestId}/${Date.now()}-${index}.${cleanExtension}`;

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
        isEdge: Number.isInteger(edgeImageIndex) && edgeImageIndex === index,
        isOverview: kitchenImageIndex === index
      });
    }

    const retentionDeleteAt = new Date();
    retentionDeleteAt.setDate(retentionDeleteAt.getDate() + 3650);

    const fields: EstimatorFormFields = {
      navn: label || "Træning",
      telefon: "00000000",
      note: note || undefined,
      extras
    };

    const { data, error: insertError } = await supabase
      .from("estimator_requests")
      .insert({
        gating_answer: "ved_ikke",
        fields,
        images: uploadedImages,
        status: STATUS_VALUES.closed,
        retention_delete_at: retentionDeleteAt.toISOString(),
        price_min: priceMin,
        price_max: priceMax,
        ai_price_min: null,
        ai_price_max: null,
        ai_status: "training"
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
        { message: insertError?.message || "Kunne ikke gemme træningscase i databasen." },
        { status: 500 }
      );
    }

    await auditLog({
      action: "estimator.training",
      entityType: "estimator",
      entityId: data.id,
      meta: {
        priceMin,
        priceMax,
        imageCount: uploadedImages.length
      },
      req: request,
      actor: session?.email,
      role: session?.role
    });

    return NextResponse.json({ id: data.id }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Uventet fejl under upload." }, { status: 500 });
  }
}
