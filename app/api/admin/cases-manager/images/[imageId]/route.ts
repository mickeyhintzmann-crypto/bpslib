import { NextResponse, type NextRequest } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

const CASE_IMAGES_BUCKET = "case-images";
const CASES_SCHEMA_MIGRATION = "supabase/migrations/20260302_000021_admin_cases_schema.sql";

type RouteContext = {
  params: Promise<{ imageId: string }>;
};

const asTrimmed = (value: unknown) => (typeof value === "string" ? value.trim() : "");

const isMissingTable = (message: string | undefined, table: string) => {
  const normalized = (message || "").toLowerCase();
  return (
    normalized.includes(`could not find the table 'public.${table}'`) ||
    normalized.includes(`relation \"${table}\" does not exist`)
  );
};

const extractStoragePathFromPublicUrl = (url: string) => {
  const marker = "/storage/v1/object/public/case-images/";
  const index = url.indexOf(marker);
  if (index === -1) {
    return "";
  }
  return decodeURIComponent(url.slice(index + marker.length).split("?")[0] || "");
};

const resolveImageId = async (context: RouteContext) => {
  const params = await context.params;
  return params?.imageId || "";
};

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { error: authError } = requireAdmin(request, ["owner", "admin"]);
    if (authError) {
      return authError;
    }

    const imageId = await resolveImageId(context);
    if (!imageId) {
      return NextResponse.json({ message: "Mangler imageId." }, { status: 400 });
    }

    const supabase = createSupabaseServiceClient();

    const { data: row, error: fetchError } = await supabase
      .from("case_images")
      .select("id, path, url")
      .eq("id", imageId)
      .single();

    if (fetchError || !row) {
      if (isMissingTable(fetchError?.message, "case_images")) {
        return NextResponse.json(
          {
            message: `Case_images-tabellen mangler. Kør migrationen ${CASES_SCHEMA_MIGRATION} i Supabase.`
          },
          { status: 503 }
        );
      }

      return NextResponse.json({ message: fetchError?.message || "Billede blev ikke fundet." }, { status: 404 });
    }

    const storagePath = asTrimmed(row.path) || extractStoragePathFromPublicUrl(asTrimmed(row.url));

    const { error: deleteError } = await supabase.from("case_images").delete().eq("id", imageId);

    if (deleteError) {
      return NextResponse.json(
        { message: deleteError.message || "Kunne ikke slette billedreference." },
        { status: 500 }
      );
    }

    if (storagePath) {
      const { error: removeError } = await supabase.storage.from(CASE_IMAGES_BUCKET).remove([storagePath]);
      if (removeError) {
        console.error("[cases-manager] Kunne ikke fjerne storage-fil", removeError);
      }
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Uventet fejl ved sletning af billede." }, { status: 500 });
  }
}
