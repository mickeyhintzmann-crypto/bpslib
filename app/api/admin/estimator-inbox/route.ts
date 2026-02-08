import { NextResponse } from "next/server";

import { assertAdminToken } from "@/lib/admin-auth";
import {
  ESTIMATOR_BUCKET,
  ESTIMATOR_STATUS_FLOW,
  STATUS_VALUES,
  type EstimatorStatus
} from "@/lib/estimator";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

const DEFAULT_STATUS = STATUS_VALUES.new;

type StoredImage = {
  path: string;
  name?: string;
  isEdge?: boolean;
};

type EstimatorFields = {
  navn?: string;
  telefon?: string;
  postnr?: string;
  [key: string]: unknown;
};

type EstimatorListRow = {
  id: string;
  created_at: string;
  status: string;
  gating_answer: string;
  fields: unknown;
  images: unknown;
  price_min: number | null;
  price_max: number | null;
  slot_count: number | null;
};

const isMissingEstimatorTable = (message: string | undefined) => {
  const normalized = (message || "").toLowerCase();
  return (
    normalized.includes("could not find the table 'public.estimator_requests'") ||
    normalized.includes('relation "estimator_requests" does not exist')
  );
};

const getImagePaths = (images: unknown): string[] => {
  if (!Array.isArray(images)) {
    return [];
  }

  return images
    .map((image) => {
      if (typeof image === "string") {
        return image;
      }
      if (image && typeof image === "object" && "path" in image) {
        return (image as StoredImage).path;
      }
      return null;
    })
    .filter((item): item is string => Boolean(item));
};

const parseFields = (fields: unknown): EstimatorFields => {
  if (!fields || typeof fields !== "object") {
    return {};
  }
  return fields as EstimatorFields;
};

const normalizeStatusFilter = (rawStatus: string | null): EstimatorStatus | null => {
  if (!rawStatus) {
    return DEFAULT_STATUS;
  }
  if (rawStatus.toLowerCase() === "alle") {
    return null;
  }
  if (ESTIMATOR_STATUS_FLOW.includes(rawStatus as EstimatorStatus)) {
    return rawStatus as EstimatorStatus;
  }
  return DEFAULT_STATUS;
};

const matchesSearch = (fields: EstimatorFields, searchQuery: string) => {
  if (!searchQuery) {
    return true;
  }

  const phone = typeof fields.telefon === "string" ? fields.telefon.toLowerCase() : "";
  const postnr = typeof fields.postnr === "string" ? fields.postnr.toLowerCase() : "";
  return phone.includes(searchQuery) || postnr.includes(searchQuery);
};

export async function GET(request: Request) {
  try {
    const authError = assertAdminToken(request);
    if (authError) {
      return authError;
    }

    const url = new URL(request.url);
    const statusFilter = normalizeStatusFilter(url.searchParams.get("status"));
    const searchQuery = (url.searchParams.get("q") || "").trim().toLowerCase();

    const supabase = createSupabaseServiceClient();

    let query = supabase
      .from("estimator_requests")
      .select(
        "id, created_at, status, gating_answer, fields, images, price_min, price_max, slot_count"
      )
      .order("created_at", { ascending: false })
      .limit(120);

    if (statusFilter) {
      query = query.eq("status", statusFilter);
    }

    const { data, error } = await query;

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
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    const rows = ((data || []) as EstimatorListRow[]).filter((row) =>
      matchesSearch(parseFields(row.fields), searchQuery)
    );

    const signedById = new Map<string, string[]>();

    for (const row of rows) {
      const paths = getImagePaths(row.images).slice(0, 3);

      if (paths.length === 0) {
        signedById.set(row.id, []);
        continue;
      }

      const { data: signedData, error: signedError } = await supabase.storage
        .from(ESTIMATOR_BUCKET)
        .createSignedUrls(paths, 60 * 60);

      if (signedError) {
        signedById.set(row.id, []);
        continue;
      }

      const urls = (signedData || [])
        .map((entry) => entry.signedUrl)
        .filter((signedUrl): signedUrl is string => Boolean(signedUrl));

      signedById.set(row.id, urls);
    }

    const items = rows.map((row) => {
      const fields = parseFields(row.fields);
      return {
        id: row.id,
        createdAt: row.created_at,
        status: row.status,
        gatingAnswer: row.gating_answer,
        navn: typeof fields.navn === "string" ? fields.navn : "Ikke angivet",
        telefon: typeof fields.telefon === "string" ? fields.telefon : "Ikke angivet",
        postnr: typeof fields.postnr === "string" ? fields.postnr : "Ikke angivet",
        priceMin: row.price_min,
        priceMax: row.price_max,
        slotCount: row.slot_count,
        thumbnails: signedById.get(row.id) || []
      };
    });

    return NextResponse.json({ items }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Uventet fejl i estimator inbox." }, { status: 500 });
  }
}
