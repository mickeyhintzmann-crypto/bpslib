import { NextResponse, type NextRequest } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/slugify";

const IMAGE_KINDS = ["before", "after", "wide", "detail"] as const;
const CASE_IMAGES_BUCKET = "case-images";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const CASES_SCHEMA_MIGRATION = "supabase/migrations/20260302_000021_admin_cases_schema.sql";

type ImageKind = (typeof IMAGE_KINDS)[number];

const asTrimmed = (value: unknown) => (typeof value === "string" ? value.trim() : "");

const isMissingTable = (message: string | undefined, table: string) => {
  const normalized = (message || "").toLowerCase();
  return (
    normalized.includes(`could not find the table 'public.${table}'`) ||
    normalized.includes(`relation \"${table}\" does not exist`)
  );
};

const inferKindFromFilename = (filename: string): ImageKind => {
  const lower = filename.toLowerCase();
  if (lower.includes("before") || lower.includes("foer")) {
    return "before";
  }
  if (lower.includes("after") || lower.includes("efter")) {
    return "after";
  }
  if (lower.includes("detail")) {
    return "detail";
  }
  return "wide";
};

const extensionFromFile = (file: File) => {
  const name = file.name || "";
  const extension = name.includes(".") ? name.split(".").pop() : "";
  if (extension) {
    return extension.toLowerCase();
  }

  if (file.type === "image/png") {
    return "png";
  }
  if (file.type === "image/webp") {
    return "webp";
  }
  return "jpg";
};

const toImageItem = (row: Record<string, any>) => ({
  id: row.id,
  caseId: row.case_id,
  kind: row.kind,
  url: row.url,
  path: row.path || "",
  sortOrder: row.sort_order || 0,
  createdAt: row.created_at
});

export async function GET(request: NextRequest) {
  try {
    const { error: authError } = requireAdmin(request, ["owner", "admin", "viewer"]);
    if (authError) {
      return authError;
    }

    const caseId = asTrimmed(new URL(request.url).searchParams.get("caseId"));
    if (!caseId) {
      return NextResponse.json({ message: "Mangler caseId." }, { status: 400 });
    }

    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("case_images")
      .select("id, case_id, kind, url, path, sort_order, created_at")
      .eq("case_id", caseId)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      if (isMissingTable(error.message, "case_images")) {
        return NextResponse.json(
          {
            message: `Case_images-tabellen mangler. Kør migrationen ${CASES_SCHEMA_MIGRATION} i Supabase.`
          },
          { status: 503 }
        );
      }

      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({ items: (data || []).map((row: Record<string, any>) => toImageItem(row)) });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Uventet fejl ved hentning af billeder." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error: authError } = requireAdmin(request, ["owner", "admin"]);
    if (authError) {
      return authError;
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const caseId = asTrimmed(formData.get("caseId"));
    const requestedKind = asTrimmed(formData.get("kind"));

    if (!caseId) {
      return NextResponse.json({ message: "Mangler caseId." }, { status: 400 });
    }

    if (!(file instanceof File)) {
      return NextResponse.json({ message: "Ingen fil modtaget." }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ message: "Kun JPG, PNG og WebP understøttes." }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ message: "Filen er for stor. Maks 10MB." }, { status: 400 });
    }

    const kind = (IMAGE_KINDS.includes(requestedKind as ImageKind)
      ? requestedKind
      : inferKindFromFilename(file.name)) as ImageKind;

    const supabase = createSupabaseServiceClient();

    const fileBaseName = slugify((file.name || "image").replace(/\.[^.]+$/, "")) || "image";
    const extension = extensionFromFile(file);
    const path = `${caseId}/${Date.now()}-${fileBaseName}.${extension}`;

    const { error: uploadError } = await supabase.storage.from(CASE_IMAGES_BUCKET).upload(path, file, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false
    });

    if (uploadError) {
      return NextResponse.json({ message: uploadError.message || "Kunne ikke uploade billede." }, { status: 500 });
    }

    const { data: publicUrlData } = supabase.storage.from(CASE_IMAGES_BUCKET).getPublicUrl(path);

    const { data: existingRows, error: sortError } = await supabase
      .from("case_images")
      .select("sort_order")
      .eq("case_id", caseId)
      .order("sort_order", { ascending: false })
      .limit(1);

    if (sortError && !isMissingTable(sortError.message, "case_images")) {
      return NextResponse.json({ message: sortError.message }, { status: 500 });
    }

    const nextSortOrder = (existingRows?.[0]?.sort_order ?? -1) + 1;

    const { data: imageRow, error: insertError } = await supabase
      .from("case_images")
      .insert({
        case_id: caseId,
        kind,
        url: publicUrlData.publicUrl,
        path,
        sort_order: nextSortOrder
      })
      .select("id, case_id, kind, url, path, sort_order, created_at")
      .single();

    if (insertError || !imageRow) {
      await supabase.storage.from(CASE_IMAGES_BUCKET).remove([path]);
      if (isMissingTable(insertError?.message, "case_images")) {
        return NextResponse.json(
          {
            message: `Case_images-tabellen mangler. Kør migrationen ${CASES_SCHEMA_MIGRATION} i Supabase.`
          },
          { status: 503 }
        );
      }

      return NextResponse.json(
        { message: insertError?.message || "Kunne ikke gemme billedreference." },
        { status: 500 }
      );
    }

    return NextResponse.json({ item: toImageItem(imageRow as Record<string, any>) }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Uventet fejl ved upload af billede." }, { status: 500 });
  }
}
