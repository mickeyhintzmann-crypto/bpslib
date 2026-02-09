import { NextResponse, type NextRequest } from "next/server";

import { assertAdminToken } from "@/lib/admin-auth";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

const CASES_BUCKET = "case-images";
const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const asTrimmed = (value: unknown) => (typeof value === "string" ? value.trim() : "");

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-_.]/g, "")
    .replace(/-+/g, "-")
    .replace(/^[-_.]+|[-_.]+$/g, "");

export async function POST(request: NextRequest) {
  try {
    const authError = assertAdminToken(request);
    if (authError) {
      return authError;
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const caseId = asTrimmed(formData.get("caseId"));
    const kind = asTrimmed(formData.get("kind")) || "image";

    if (!(file instanceof File)) {
      return NextResponse.json({ message: "Ingen fil fundet." }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { message: "Kun JPG, PNG eller WebP er tilladt." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { message: "Filen er for stor. Maks 8MB." },
        { status: 400 }
      );
    }

    const safeName = slugify(file.name || "case-image");
    const baseFolder = caseId ? `cases/${caseId}` : "cases";
    const fileName = `${kind}-${Date.now()}-${safeName || "image"}`;
    const path = `${baseFolder}/${fileName}`;

    const supabase = createSupabaseServiceClient();
    const { error } = await supabase.storage.from(CASES_BUCKET).upload(path, file, {
      contentType: file.type,
      upsert: false,
      cacheControl: "3600"
    });

    if (error) {
      return NextResponse.json(
        { message: error.message || "Kunne ikke uploade billede." },
        { status: 500 }
      );
    }

    const { data } = supabase.storage.from(CASES_BUCKET).getPublicUrl(path);

    return NextResponse.json(
      {
        url: data.publicUrl,
        path
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Uventet fejl ved upload." }, { status: 500 });
  }
}
