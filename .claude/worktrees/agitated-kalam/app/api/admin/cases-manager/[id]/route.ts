import { NextResponse, type NextRequest } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/slugify";

const CASE_CATEGORIES = ["bordplade", "gulvafslibning", "gulvbelaegning"] as const;
const CASES_SCHEMA_MIGRATION = "supabase/migrations/20260302000021_admin_cases_schema.sql";
const CASE_IMAGES_BUCKET = "case-images";

type CaseCategory = (typeof CASE_CATEGORIES)[number];

type RouteContext = {
  params: Promise<{ id: string }>;
};

const asTrimmed = (value: unknown) => (typeof value === "string" ? value.trim() : "");

const isMissingTable = (message: string | undefined, table: string) => {
  const normalized = (message || "").toLowerCase();
  return (
    normalized.includes(`could not find the table 'public.${table}'`) ||
    normalized.includes(`relation \"${table}\" does not exist`)
  );
};

const parseTags = (value: unknown) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [] as string[];
};

const toItem = (row: Record<string, any>) => ({
  id: row.id,
  title: row.title,
  slug: row.slug,
  category: row.category,
  location: row.location || "",
  summary: row.summary || "",
  tags: Array.isArray(row.tags) ? row.tags : [],
  clientId: row.client_id || null,
  isFeatured: Boolean(row.is_featured),
  published: Boolean(row.published),
  createdAt: row.created_at
});

const resolveId = async (context: RouteContext) => {
  const params = await context.params;
  return params?.id || "";
};

const extractStoragePathFromPublicUrl = (url: string) => {
  const marker = "/storage/v1/object/public/case-images/";
  const index = url.indexOf(marker);
  if (index === -1) {
    return "";
  }
  return decodeURIComponent(url.slice(index + marker.length).split("?")[0] || "");
};

const ensureUniqueSlug = async (
  supabase: ReturnType<typeof createSupabaseServiceClient>,
  candidateBase: string,
  excludeId?: string
) => {
  const base = slugify(candidateBase) || `case-${Date.now()}`;
  let suffix = 1;

  while (true) {
    const candidate = suffix === 1 ? base : `${base}-${suffix}`;
    let query = supabase.from("cases").select("id").eq("slug", candidate).limit(1);
    if (excludeId) {
      query = query.neq("id", excludeId);
    }

    const { data, error } = await query;
    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      return candidate;
    }

    suffix += 1;
  }
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { error: authError } = requireAdmin(request, ["owner", "admin", "viewer"]);
    if (authError) {
      return authError;
    }

    const id = await resolveId(context);
    if (!id) {
      return NextResponse.json({ message: "Mangler case-id." }, { status: 400 });
    }

    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("cases")
      .select(
        "id, title, slug, category, location, summary, tags, client_id, is_featured, published, created_at"
      )
      .eq("id", id)
      .single();

    if (error || !data) {
      if (isMissingTable(error?.message, "cases")) {
        return NextResponse.json(
          {
            message: `Cases-tabellen mangler. Kør migrationen ${CASES_SCHEMA_MIGRATION} i Supabase.`
          },
          { status: 503 }
        );
      }

      return NextResponse.json({ message: error?.message || "Kunne ikke hente case." }, { status: 404 });
    }

    return NextResponse.json({ item: toItem(data as Record<string, any>) }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Uventet fejl ved hentning af case." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { error: authError } = requireAdmin(request, ["owner", "admin"]);
    if (authError) {
      return authError;
    }

    const id = await resolveId(context);
    if (!id) {
      return NextResponse.json({ message: "Mangler case-id." }, { status: 400 });
    }

    const payload = (await request.json()) as Record<string, unknown>;
    const supabase = createSupabaseServiceClient();
    const updates: Record<string, unknown> = {};

    if (typeof payload.title === "string") {
      const title = asTrimmed(payload.title);
      if (!title) {
        return NextResponse.json({ message: "Titel må ikke være tom." }, { status: 400 });
      }
      updates.title = title;
    }

    if (typeof payload.category === "string") {
      const category = asTrimmed(payload.category) as CaseCategory;
      if (!CASE_CATEGORIES.includes(category)) {
        return NextResponse.json({ message: "Ugyldig kategori." }, { status: 400 });
      }
      updates.category = category;
    }

    if (typeof payload.location === "string") {
      updates.location = asTrimmed(payload.location) || null;
    }

    if (typeof payload.summary === "string") {
      updates.summary = asTrimmed(payload.summary) || null;
    }

    if (Object.prototype.hasOwnProperty.call(payload, "tags")) {
      updates.tags = parseTags(payload.tags);
    }

    if (typeof payload.clientId === "string") {
      updates.client_id = asTrimmed(payload.clientId) || null;
    }

    if (Object.prototype.hasOwnProperty.call(payload, "isFeatured")) {
      updates.is_featured = payload.isFeatured === true;
    }

    if (Object.prototype.hasOwnProperty.call(payload, "published")) {
      updates.published = payload.published === true;
    }

    if (typeof payload.slug === "string") {
      const slugInput = asTrimmed(payload.slug);
      updates.slug = await ensureUniqueSlug(supabase, slugInput || String(updates.title || ""), id);
    } else if (typeof payload.title === "string") {
      const slugInput = asTrimmed(payload.title);
      updates.slug = await ensureUniqueSlug(supabase, slugInput, id);
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ message: "Ingen felter at opdatere." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("cases")
      .update(updates)
      .eq("id", id)
      .select(
        "id, title, slug, category, location, summary, tags, client_id, is_featured, published, created_at"
      )
      .single();

    if (error || !data) {
      if (isMissingTable(error?.message, "cases")) {
        return NextResponse.json(
          {
            message: `Cases-tabellen mangler. Kør migrationen ${CASES_SCHEMA_MIGRATION} i Supabase.`
          },
          { status: 503 }
        );
      }

      return NextResponse.json({ message: error?.message || "Kunne ikke opdatere case." }, { status: 500 });
    }

    return NextResponse.json({ item: toItem(data as Record<string, any>) }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Uventet fejl ved opdatering af case." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { error: authError } = requireAdmin(request, ["owner", "admin"]);
    if (authError) {
      return authError;
    }

    const id = await resolveId(context);
    if (!id) {
      return NextResponse.json({ message: "Mangler case-id." }, { status: 400 });
    }

    const supabase = createSupabaseServiceClient();

    const { data: imageRows, error: imageError } = await supabase
      .from("case_images")
      .select("path, url")
      .eq("case_id", id);

    if (imageError && !isMissingTable(imageError.message, "case_images")) {
      return NextResponse.json(
        { message: imageError.message || "Kunne ikke hente case-billeder før sletning." },
        { status: 500 }
      );
    }

    const { data, error } = await supabase.from("cases").delete().eq("id", id).select("id").single();

    if (error || !data) {
      if (isMissingTable(error?.message, "cases")) {
        return NextResponse.json(
          {
            message: `Cases-tabellen mangler. Kør migrationen ${CASES_SCHEMA_MIGRATION} i Supabase.`
          },
          { status: 503 }
        );
      }

      return NextResponse.json({ message: error?.message || "Kunne ikke slette case." }, { status: 500 });
    }

    const storagePaths = Array.from(
      new Set(
        (imageRows || [])
          .map((row: Record<string, any>) => {
            const explicit = asTrimmed(row.path);
            if (explicit) {
              return explicit;
            }
            const rawUrl = asTrimmed(row.url);
            return rawUrl ? extractStoragePathFromPublicUrl(rawUrl) : "";
          })
          .filter(Boolean)
      )
    );

    if (storagePaths.length > 0) {
      const { error: removeError } = await supabase.storage.from(CASE_IMAGES_BUCKET).remove(storagePaths);
      if (removeError) {
        console.error("[cases-manager] Kunne ikke fjerne storage filer", removeError);
      }
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Uventet fejl ved sletning af case." }, { status: 500 });
  }
}
