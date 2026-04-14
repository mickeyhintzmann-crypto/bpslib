import { NextResponse } from "next/server";

import { ESTIMATOR_BUCKET } from "@/lib/estimator";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ token: string }> | { token: string };
};

const isMissingRelation = (message: string | undefined, relationName: string) => {
  const normalized = (message || "").toLowerCase();
  return (
    normalized.includes(`relation \"${relationName}\" does not exist`) ||
    normalized.includes(`could not find the table 'public.${relationName}'`)
  );
};

type StoredImage = {
  path: string;
  name?: string;
};

const parseImages = (images: unknown): StoredImage[] => {
  if (!Array.isArray(images)) return [];
  const parsed: StoredImage[] = [];
  images.forEach((image, idx) => {
    if (image && typeof image === "object" && "path" in image) {
      const item = image as Partial<StoredImage>;
      if (typeof item.path === "string" && item.path.length > 0) {
        parsed.push({ path: item.path, name: item.name || `Billede ${idx + 1}` });
      }
    }
  });
  return parsed;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const params = await Promise.resolve(context.params);
    const token = params.token?.trim();

    if (!token || token.length < 20) {
      return NextResponse.json({ message: "Ugyldigt token." }, { status: 404 });
    }

    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("estimator_requests")
      .select(
        "id, created_at, status, fields, images, price_min, price_max, ai_price_min, ai_price_max, ai_status, customer_approval_status, admin_adjustment_note, approved_at"
      )
      .eq("manage_token", token)
      .single();

    if (error || !data) {
      if (isMissingRelation(error?.message, "estimator_requests")) {
        return NextResponse.json(
          { message: "Prisberegneren er ikke klargjort i databasen." },
          { status: 503 }
        );
      }
      return NextResponse.json({ message: "Linket er ugyldigt." }, { status: 404 });
    }

    const fields = (data.fields || {}) as Record<string, unknown>;

    /* Generate signed URLs for images (15 min valid) */
    const parsedImages = parseImages(data.images);
    const signedImages: Array<{ name: string; url: string | null }> = [];
    if (parsedImages.length > 0) {
      const paths = parsedImages.map((img) => img.path);
      const { data: signedData } = await supabase.storage
        .from(ESTIMATOR_BUCKET)
        .createSignedUrls(paths, 60 * 15);
      parsedImages.forEach((img, idx) => {
        signedImages.push({
          name: img.name || `Billede ${idx + 1}`,
          url: signedData?.[idx]?.signedUrl || null,
        });
      });
    }

    /* Effektiv pris: hvis admin har rettet price_min/price_max, brug den; ellers AI-estimat */
    const displayMin = typeof data.price_min === "number" ? data.price_min : data.ai_price_min;
    const displayMax = typeof data.price_max === "number" ? data.price_max : data.ai_price_max;

    return NextResponse.json(
      {
        item: {
          id: data.id,
          createdAt: data.created_at,
          customerName: typeof fields.navn === "string" ? fields.navn : null,
          service: typeof fields.service === "string" ? fields.service : "bordplade",
          boardCount: typeof fields.boardCount === "number" ? fields.boardCount : null,
          priceMin: displayMin,
          priceMax: displayMax,
          aiPriceMin: data.ai_price_min,
          aiPriceMax: data.ai_price_max,
          adminPriceMin: data.price_min,
          adminPriceMax: data.price_max,
          approvalStatus: data.customer_approval_status || "pending",
          adjustmentNote: data.admin_adjustment_note,
          approvedAt: data.approved_at,
          images: signedImages,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Uventet fejl." }, { status: 500 });
  }
}
