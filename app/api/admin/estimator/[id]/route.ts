import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { auditLog } from "@/lib/audit";
import {
  ESTIMATOR_BUCKET,
  ESTIMATOR_STATUS_FLOW,
  type EstimatorStatus
} from "@/lib/estimator";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

type StoredImage = {
  path: string;
  name?: string;
  isEdge?: boolean;
  isOverview?: boolean;
};

type EstimatorFields = {
  [key: string]: unknown;
};

type EstimatorDetailRow = {
  id: string;
  created_at: string;
  status: string;
  gating_answer: string;
  fields: unknown;
  images: unknown;
  retention_delete_at: string | null;
  internal_note: string | null;
  price_min: number | null;
  price_max: number | null;
  slot_count: number | null;
  booking_id: string | null;
  ai_price_min: number | null;
  ai_price_max: number | null;
  ai_status: string | null;
};

type UpdatePayload = {
  status?: unknown;
  internalNote?: unknown;
  priceMin?: unknown;
  priceMax?: unknown;
  slotCount?: unknown;
};

type RouteContext = {
  params: Promise<{ id: string }>;
};

const isMissingEstimatorTable = (message: string | undefined) => {
  const normalized = (message || "").toLowerCase();
  return (
    normalized.includes("could not find the table 'public.estimator_requests'") ||
    normalized.includes('relation "estimator_requests" does not exist')
  );
};

const parseImages = (images: unknown): StoredImage[] => {
  if (!Array.isArray(images)) {
    return [];
  }

  const parsed: StoredImage[] = [];

  images.forEach((image, index) => {
    if (typeof image === "string") {
      parsed.push({
        path: image,
        name: `Billede ${index + 1}`,
        isEdge: false
      });
      return;
    }

    if (image && typeof image === "object" && "path" in image) {
      const item = image as Partial<StoredImage>;
      if (typeof item.path === "string" && item.path.length > 0) {
        parsed.push({
          path: item.path,
          name: item.name,
          isEdge: Boolean(item.isEdge),
          isOverview: Boolean(item.isOverview)
        });
      }
    }
  });

  return parsed;
};

const parseFields = (fields: unknown): EstimatorFields => {
  if (!fields || typeof fields !== "object") {
    return {};
  }
  return fields as EstimatorFields;
};

const toNullableInt = (value: unknown) => {
  if (value === null || value === undefined || value === "") {
    return { valid: true, value: null as number | null };
  }

  if (typeof value === "number" && Number.isInteger(value)) {
    return { valid: true, value };
  }

  if (typeof value === "string" && /^\d+$/.test(value)) {
    return { valid: true, value: Number.parseInt(value, 10) };
  }

  return { valid: false, value: null as number | null };
};

const mapRowWithSignedImages = async (row: EstimatorDetailRow) => {
  const supabase = createSupabaseServiceClient();
  const parsedImages = parseImages(row.images);
  const paths = parsedImages.map((image) => image.path);

  const signedUrlByPath = new Map<string, string | null>();

  if (paths.length > 0) {
    const { data: signedData } = await supabase.storage
      .from(ESTIMATOR_BUCKET)
      .createSignedUrls(paths, 60 * 60);

    (signedData || []).forEach((entry, index) => {
      signedUrlByPath.set(paths[index], entry.signedUrl || null);
    });
  }

  const images = parsedImages.map((image, index) => ({
    path: image.path,
    name: image.name || `Billede ${index + 1}`,
    isEdge: Boolean(image.isEdge),
    isOverview: Boolean(image.isOverview),
    url: signedUrlByPath.get(image.path) || null
  }));

  const edgeImage = images.find((image) => image.isEdge) || null;
  const overviewImage = images.find((image) => image.isOverview) || null;

  return {
    id: row.id,
    createdAt: row.created_at,
    status: row.status,
    gatingAnswer: row.gating_answer,
    fields: parseFields(row.fields),
    images,
    edgeImage,
    overviewImage,
    retentionDeleteAt: row.retention_delete_at,
    internalNote: row.internal_note,
    priceMin: row.price_min,
    priceMax: row.price_max,
    slotCount: row.slot_count,
    bookingId: row.booking_id,
    aiPriceMin: row.ai_price_min,
    aiPriceMax: row.ai_price_max,
    aiStatus: row.ai_status
  };
};

const isKnownStatus = (value: unknown): value is EstimatorStatus =>
  typeof value === "string" && ESTIMATOR_STATUS_FLOW.includes(value as EstimatorStatus);

export async function GET(request: Request, context: RouteContext) {
  try {
    const params = await context.params;
    const { error } = requireAdmin(request, ["owner", "admin", "viewer"]);
    if (error) {
      return error;
    }

    const supabase = createSupabaseServiceClient();

    const { data, error } = await supabase
      .from("estimator_requests")
      .select(
        "id, created_at, status, gating_answer, fields, images, retention_delete_at, internal_note, price_min, price_max, slot_count, booking_id, ai_price_min, ai_price_max, ai_status"
      )
      .eq("id", params.id)
      .single();

    if (error) {
      if (isMissingEstimatorTable(error.message)) {
        return NextResponse.json(
          {
            message:
              "Estimator inbox er ikke klargjort i databasen endnu. Kør migrationen i supabase/migrations/20260208_000001_estimator_requests.sql."
          },
          { status: 503 }
        );
      }
      if (error.code === "PGRST116") {
        return NextResponse.json({ message: "Estimator-request blev ikke fundet." }, { status: 404 });
      }
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    const item = await mapRowWithSignedImages(data as EstimatorDetailRow);
    return NextResponse.json({ item }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Uventet fejl ved hentning af estimator-detalje." }, { status: 500 });
  }
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const params = await context.params;
    const { session, error } = requireAdmin(request, ["owner", "admin"]);
    if (error) {
      return error;
    }

    const payload = (await request.json()) as UpdatePayload;

    if (!payload || typeof payload !== "object") {
      return NextResponse.json({ message: "Ugyldigt payload." }, { status: 400 });
    }

    const updateData: Record<string, string | number | null> = {};

    if ("status" in payload) {
      if (!isKnownStatus(payload.status)) {
        return NextResponse.json({ message: "Ugyldig status." }, { status: 400 });
      }
      updateData.status = payload.status;
    }

    if ("internalNote" in payload) {
      if (payload.internalNote === null || payload.internalNote === "") {
        updateData.internal_note = null;
      } else if (typeof payload.internalNote === "string") {
        updateData.internal_note = payload.internalNote.trim();
      } else {
        return NextResponse.json({ message: "Intern note skal være tekst." }, { status: 400 });
      }
    }

    if ("priceMin" in payload) {
      const parsed = toNullableInt(payload.priceMin);
      if (!parsed.valid) {
        return NextResponse.json({ message: "Prisinterval fra er ugyldigt." }, { status: 400 });
      }
      updateData.price_min = parsed.value;
    }

    if ("priceMax" in payload) {
      const parsed = toNullableInt(payload.priceMax);
      if (!parsed.valid) {
        return NextResponse.json({ message: "Prisinterval til er ugyldigt." }, { status: 400 });
      }
      updateData.price_max = parsed.value;
    }

    if ("slotCount" in payload) {
      const parsed = toNullableInt(payload.slotCount);
      if (!parsed.valid) {
        return NextResponse.json({ message: "Slot-count er ugyldigt." }, { status: 400 });
      }
      if (parsed.value !== null && ![1, 2, 3].includes(parsed.value)) {
        return NextResponse.json({ message: "Slot-count skal være 1, 2 eller 3." }, { status: 400 });
      }
      updateData.slot_count = parsed.value;
    }

    const priceMin =
      "price_min" in updateData ? (updateData.price_min as number | null) : null;
    const priceMax =
      "price_max" in updateData ? (updateData.price_max as number | null) : null;

    if (priceMin !== null && priceMax !== null && priceMin > priceMax) {
      return NextResponse.json(
        { message: "Prisinterval fra må ikke være større end prisinterval til." },
        { status: 400 }
      );
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: "Ingen felter at opdatere." }, { status: 400 });
    }

    const supabase = createSupabaseServiceClient();
    const { data: beforeData } = await supabase
      .from("estimator_requests")
      .select(
        "id, created_at, status, gating_answer, fields, images, retention_delete_at, internal_note, price_min, price_max, slot_count, booking_id, ai_price_min, ai_price_max, ai_status"
      )
      .eq("id", params.id)
      .single();

    const { data, error } = await supabase
      .from("estimator_requests")
      .update(updateData)
      .eq("id", params.id)
      .select(
        "id, created_at, status, gating_answer, fields, images, retention_delete_at, internal_note, price_min, price_max, slot_count, booking_id, ai_price_min, ai_price_max, ai_status"
      )
      .single();

    if (error) {
      if (isMissingEstimatorTable(error.message)) {
        return NextResponse.json(
          {
            message:
              "Estimator inbox er ikke klargjort i databasen endnu. Kør migrationen i supabase/migrations/20260208_000001_estimator_requests.sql."
          },
          { status: 503 }
        );
      }
      if (error.code === "PGRST116") {
        return NextResponse.json({ message: "Estimator-request blev ikke fundet." }, { status: 404 });
      }
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    const item = await mapRowWithSignedImages(data as EstimatorDetailRow);

    await auditLog({
      action: "estimator.update",
      entityType: "estimator",
      entityId: data.id,
      meta: {
        before: beforeData || null,
        after: data,
        changes: updateData
      },
      req: request,
      actor: session?.email,
      role: session?.role
    });

    return NextResponse.json({ item }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Uventet fejl ved opdatering af estimator." }, { status: 500 });
  }
}
