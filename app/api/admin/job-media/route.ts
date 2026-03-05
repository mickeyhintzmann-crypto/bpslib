import { NextResponse, type NextRequest } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { isMissingTable } from "@/lib/employee-session";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

const JOB_MEDIA_MIGRATION = "supabase/migrations/20260305_000110_employee_job_media_uploads.sql";
const ALLOWED_STATUS = new Set(["pending", "approved", "rejected"]);

type JobRelation = {
  id: string;
  title: string;
  service: string | null;
  start_at: string;
  address: string | null;
  location: string | null;
};

type EmployeeRelation = {
  id: string;
  name: string;
};

type JobMediaRow = {
  id: string;
  created_at: string;
  status: string;
  usage_target: string | null;
  review_note: string | null;
  reviewed_at: string | null;
  storage_bucket: string;
  storage_path: string;
  original_filename: string | null;
  mime_type: string | null;
  file_size_bytes: number | null;
  job: JobRelation | JobRelation[] | null;
  employee: EmployeeRelation | EmployeeRelation[] | null;
};

const asTrimmed = (value: unknown) => (typeof value === "string" ? value.trim() : "");

const asSingleRelation = <T>(value: T | T[] | null | undefined): T | null => {
  if (Array.isArray(value)) {
    return value[0] || null;
  }
  return value || null;
};

export async function GET(request: NextRequest) {
  try {
    const { error: authError } = requireAdmin(request, ["owner", "admin", "viewer"]);
    if (authError) {
      return authError;
    }

    const statusFilter = asTrimmed(new URL(request.url).searchParams.get("status")).toLowerCase();
    if (statusFilter && statusFilter !== "all" && !ALLOWED_STATUS.has(statusFilter)) {
      return NextResponse.json({ message: "Ugyldig status." }, { status: 400 });
    }

    const supabase = createSupabaseServiceClient();
    let query = supabase
      .from("job_media_uploads")
      .select(
        "id, created_at, status, usage_target, review_note, reviewed_at, storage_bucket, storage_path, original_filename, mime_type, file_size_bytes, job:job_id(id,title,service,start_at,address,location), employee:employee_id(id,name)"
      )
      .order("created_at", { ascending: false })
      .limit(400);

    if (statusFilter && statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    }

    const { data, error } = await query;
    if (error) {
      if (isMissingTable(error.message, "job_media_uploads")) {
        return NextResponse.json(
          { message: `Job-medie tabellen mangler. Kør migrationen ${JOB_MEDIA_MIGRATION}.` },
          { status: 503 }
        );
      }
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    const rows = (data || []) as JobMediaRow[];
    const buckets = new Map<string, string[]>();

    rows.forEach((row) => {
      const bucket = row.storage_bucket || "job-media";
      const current = buckets.get(bucket) || [];
      current.push(row.storage_path);
      buckets.set(bucket, current);
    });

    const signedByBucket = new Map<string, Map<string, string | null>>();
    for (const [bucket, paths] of buckets.entries()) {
      const signed = await supabase.storage.from(bucket).createSignedUrls(paths, 60 * 60);
      const map = new Map<string, string | null>();
      paths.forEach((path, index) => {
        map.set(path, signed.data?.[index]?.signedUrl || null);
      });
      signedByBucket.set(bucket, map);
    }

    return NextResponse.json(
      {
        items: rows.map((row) => {
          const bucket = row.storage_bucket || "job-media";
          const signedUrl = signedByBucket.get(bucket)?.get(row.storage_path) || null;
          const job = asSingleRelation(row.job);
          const employee = asSingleRelation(row.employee);
          return {
            id: row.id,
            createdAt: row.created_at,
            status: row.status,
            usageTarget: row.usage_target,
            reviewNote: row.review_note,
            reviewedAt: row.reviewed_at,
            originalFilename: row.original_filename,
            mimeType: row.mime_type,
            fileSizeBytes: row.file_size_bytes,
            url: signedUrl,
            job: job
              ? {
                  id: job.id,
                  title: job.title,
                  service: job.service,
                  startAt: job.start_at,
                  address: job.address,
                  location: job.location
                }
              : null,
            employee: employee
              ? {
                  id: employee.id,
                  name: employee.name
                }
              : null
          };
        })
      },
      { status: 200 }
    );
  } catch (routeError) {
    console.error(routeError);
    return NextResponse.json({ message: "Uventet fejl ved hentning af job-billeder." }, { status: 500 });
  }
}
