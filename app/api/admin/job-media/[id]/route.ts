import { NextResponse, type NextRequest } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { isMissingTable } from "@/lib/employee-session";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

const JOB_MEDIA_MIGRATION = "supabase/migrations/20260305_000110_employee_job_media_uploads.sql";
const ALLOWED_STATUS = new Set(["pending", "approved", "rejected"]);
const ALLOWED_USAGE = new Set(["social_ads", "website", "both"]);

type RouteContext = {
  params: Promise<{ id: string }>;
};

const asTrimmed = (value: unknown) => (typeof value === "string" ? value.trim() : "");

const resolveId = async (context: RouteContext) => {
  const params = await context.params;
  return decodeURIComponent(params?.id || "");
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { session, error: authError } = requireAdmin(request, ["owner", "admin"]);
    if (authError) {
      return authError;
    }

    const id = await resolveId(context);
    if (!id) {
      return NextResponse.json({ message: "Mangler billed-id." }, { status: 400 });
    }

    const payload = (await request.json()) as Record<string, unknown>;
    const nextStatus = asTrimmed(payload.status).toLowerCase();
    const usageRaw = asTrimmed(payload.usageTarget).toLowerCase();
    const reviewNoteRaw = asTrimmed(payload.reviewNote);

    if (nextStatus && !ALLOWED_STATUS.has(nextStatus)) {
      return NextResponse.json({ message: "Ugyldig status." }, { status: 400 });
    }

    if (usageRaw && !ALLOWED_USAGE.has(usageRaw)) {
      return NextResponse.json({ message: "Ugyldigt usage-target." }, { status: 400 });
    }

    const updates: Record<string, unknown> = {
      reviewed_by_user_id: session?.id || null,
      reviewed_at: new Date().toISOString()
    };

    if (nextStatus) {
      updates.status = nextStatus;
    }

    if (Object.prototype.hasOwnProperty.call(payload, "usageTarget")) {
      updates.usage_target = usageRaw || null;
    }

    if (Object.prototype.hasOwnProperty.call(payload, "reviewNote")) {
      updates.review_note = reviewNoteRaw || null;
    }

    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("job_media_uploads")
      .update(updates)
      .eq("id", id)
      .select(
        "id, created_at, status, usage_target, review_note, reviewed_at, storage_bucket, storage_path, original_filename, mime_type, file_size_bytes"
      )
      .single();

    if (error || !data) {
      if (isMissingTable(error?.message, "job_media_uploads")) {
        return NextResponse.json(
          { message: `Job-medie tabellen mangler. Kør migrationen ${JOB_MEDIA_MIGRATION}.` },
          { status: 503 }
        );
      }
      return NextResponse.json({ message: error?.message || "Kunne ikke opdatere billedet." }, { status: 500 });
    }

    const signedResult = await supabase.storage
      .from(data.storage_bucket || "job-media")
      .createSignedUrl(data.storage_path, 60 * 60);

    return NextResponse.json(
      {
        item: {
          id: data.id,
          createdAt: data.created_at,
          status: data.status,
          usageTarget: data.usage_target,
          reviewNote: data.review_note,
          reviewedAt: data.reviewed_at,
          originalFilename: data.original_filename,
          mimeType: data.mime_type,
          fileSizeBytes: data.file_size_bytes,
          url: signedResult.data?.signedUrl || null
        }
      },
      { status: 200 }
    );
  } catch (routeError) {
    console.error(routeError);
    return NextResponse.json({ message: "Uventet fejl ved opdatering." }, { status: 500 });
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
      return NextResponse.json({ message: "Mangler billed-id." }, { status: 400 });
    }

    const supabase = createSupabaseServiceClient();
    const { data: row, error: fetchError } = await supabase
      .from("job_media_uploads")
      .select("id, storage_bucket, storage_path")
      .eq("id", id)
      .single();

    if (fetchError || !row) {
      if (isMissingTable(fetchError?.message, "job_media_uploads")) {
        return NextResponse.json(
          { message: `Job-medie tabellen mangler. Kør migrationen ${JOB_MEDIA_MIGRATION}.` },
          { status: 503 }
        );
      }
      return NextResponse.json({ message: fetchError?.message || "Billede blev ikke fundet." }, { status: 404 });
    }

    const { error: deleteError } = await supabase.from("job_media_uploads").delete().eq("id", id);
    if (deleteError) {
      return NextResponse.json({ message: deleteError.message || "Kunne ikke slette billedet." }, { status: 500 });
    }

    if (row.storage_path) {
      const { error: removeError } = await supabase.storage
        .from(row.storage_bucket || "job-media")
        .remove([row.storage_path]);
      if (removeError) {
        console.error("[job-media] kunne ikke slette storage-fil", removeError);
      }
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (routeError) {
    console.error(routeError);
    return NextResponse.json({ message: "Uventet fejl ved sletning." }, { status: 500 });
  }
}
