import { NextResponse, type NextRequest } from "next/server";

import { getSessionEmployee, isMissingTable } from "@/lib/employee-session";
import { slugify } from "@/lib/slugify";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

const JOB_MEDIA_MIGRATION = "supabase/migrations/20260305000110_employee_job_media_uploads.sql";
const JOB_MEDIA_BUCKET = "job-media";
const MAX_FILE_SIZE = 15 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);

type RouteContext = {
  params: Promise<{ id: string }>;
};

const resolveId = async (context: RouteContext) => {
  const params = await context.params;
  return decodeURIComponent(params?.id || "");
};

const extensionFromFile = (file: File) => {
  const fromName = file.name.includes(".") ? file.name.split(".").pop() : "";
  if (fromName && /^[a-zA-Z0-9]+$/.test(fromName)) {
    return fromName.toLowerCase();
  }
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  if (file.type === "image/heic") return "heic";
  if (file.type === "image/heif") return "heif";
  return "jpg";
};

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { error, employee } = await getSessionEmployee(request);
    if (error || !employee) {
      return error;
    }

    const id = await resolveId(context);
    if (!id || id.startsWith("booking:")) {
      return NextResponse.json({ message: "Ugyldigt job-id." }, { status: 400 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ message: "Ingen fil modtaget." }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ message: "Kun JPG, PNG, WebP og HEIC/HEIF understøttes." }, { status: 400 });
    }

    if (file.size <= 0 || file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ message: "Filen er tom eller for stor (maks 15MB)." }, { status: 400 });
    }

    const supabase = createSupabaseServiceClient();

    const { data: jobData, error: jobError } = await supabase
      .from("jobs")
      .select("id")
      .eq("id", id)
      .eq("assigned_employee_id", employee.id)
      .single();

    if (jobError || !jobData) {
      if (isMissingTable(jobError?.message, "jobs")) {
        return NextResponse.json({ message: "Jobs-tabellen mangler i databasen." }, { status: 503 });
      }
      return NextResponse.json({ message: jobError?.message || "Job blev ikke fundet." }, { status: 404 });
    }

    const baseName = slugify((file.name || "upload").replace(/\.[^.]+$/, "")) || "upload";
    const extension = extensionFromFile(file);
    const storagePath = `${id}/${Date.now()}-${baseName}.${extension}`;

    const { error: uploadError } = await supabase.storage.from(JOB_MEDIA_BUCKET).upload(storagePath, file, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false
    });

    if (uploadError) {
      return NextResponse.json({ message: uploadError.message || "Kunne ikke uploade billede." }, { status: 500 });
    }

    const { data: row, error: insertError } = await supabase
      .from("job_media_uploads")
      .insert({
        job_id: id,
        employee_id: employee.id,
        storage_bucket: JOB_MEDIA_BUCKET,
        storage_path: storagePath,
        original_filename: file.name || null,
        mime_type: file.type || null,
        file_size_bytes: file.size,
        status: "pending"
      })
      .select(
        "id, created_at, storage_path, original_filename, mime_type, file_size_bytes, status, usage_target, review_note"
      )
      .single();

    if (insertError || !row) {
      await supabase.storage.from(JOB_MEDIA_BUCKET).remove([storagePath]);
      if (isMissingTable(insertError?.message, "job_media_uploads")) {
        return NextResponse.json(
          { message: `Job-medie tabellen mangler. Kør migrationen ${JOB_MEDIA_MIGRATION}.` },
          { status: 503 }
        );
      }
      return NextResponse.json(
        { message: insertError?.message || "Kunne ikke gemme billedreference." },
        { status: 500 }
      );
    }

    const signedResult = await supabase.storage.from(JOB_MEDIA_BUCKET).createSignedUrl(storagePath, 60 * 60);

    return NextResponse.json(
      {
        item: {
          id: row.id,
          createdAt: row.created_at,
          originalFilename: row.original_filename,
          mimeType: row.mime_type,
          fileSizeBytes: row.file_size_bytes,
          status: row.status,
          usageTarget: row.usage_target,
          reviewNote: row.review_note,
          url: signedResult.data?.signedUrl || null
        }
      },
      { status: 201 }
    );
  } catch (routeError) {
    console.error(routeError);
    return NextResponse.json({ message: "Uventet fejl ved upload." }, { status: 500 });
  }
}
