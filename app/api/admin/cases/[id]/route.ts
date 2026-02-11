import { NextResponse, type NextRequest } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { auditLog } from "@/lib/audit";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

const CATEGORY_VALUES = ["bordplade", "gulv", "andet"] as const;
const FINISH_VALUES = ["olie", "lak", "saebe", "andet"] as const;
const STATUS_VALUES = ["published", "draft"] as const;

const isMissingCasesTable = (message: string | undefined) => {
  const normalized = (message || "").toLowerCase();
  return (
    normalized.includes("could not find the table 'public.cases'") ||
    normalized.includes('relation "cases" does not exist')
  );
};

const asTrimmed = (value: unknown) => (typeof value === "string" ? value.trim() : "");

const parsePayload = (payload: Record<string, unknown>) => {
  const category = asTrimmed(payload.category);
  const title = asTrimmed(payload.title);
  const location = asTrimmed(payload.location);
  const finish = asTrimmed(payload.finish);
  const problem = asTrimmed(payload.problem);
  const beforeImage = asTrimmed(payload.beforeImage);
  const afterImage = asTrimmed(payload.afterImage);
  const beforeAlt = asTrimmed(payload.beforeAlt);
  const afterAlt = asTrimmed(payload.afterAlt);
  const status = asTrimmed(payload.status);

  if (category && !CATEGORY_VALUES.includes(category as (typeof CATEGORY_VALUES)[number])) {
    return { error: "Ugyldig kategori." };
  }

  if (finish && !FINISH_VALUES.includes(finish as (typeof FINISH_VALUES)[number])) {
    return { error: "Ugyldig finish." };
  }

  if (status && !STATUS_VALUES.includes(status as (typeof STATUS_VALUES)[number])) {
    return { error: "Ugyldig status." };
  }

  return {
    data: {
      category: category || null,
      title: title || null,
      location: location || null,
      finish: finish || null,
      problem: problem || null,
      beforeImage: beforeImage || null,
      afterImage: afterImage || null,
      beforeAlt: beforeAlt || null,
      afterAlt: afterAlt || null,
      status: status || null
    }
  };
};

type RouteContext = {
  params: Promise<{ id: string }>;
};

const resolveId = async (context: RouteContext) => {
  const params = await context.params;
  return params?.id || "";
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
        "id, created_at, updated_at, title, category, location, finish, problem, before_image, after_image, before_alt, after_alt, status"
      )
      .eq("id", id)
      .single();

    if (error || !data) {
      if (isMissingCasesTable(error?.message)) {
        return NextResponse.json(
          {
            message:
              "Cases-tabellen mangler. Kør migrationen supabase/migrations/20260208_000014_cases.sql i Supabase."
          },
          { status: 503 }
        );
      }
      return NextResponse.json({ message: error?.message || "Kunne ikke hente case." }, { status: 404 });
    }

    return NextResponse.json(
      {
        item: {
          id: data.id,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          title: data.title,
          category: data.category,
          location: data.location,
          finish: data.finish,
          problem: data.problem,
          beforeImage: data.before_image,
          afterImage: data.after_image,
          beforeAlt: data.before_alt,
          afterAlt: data.after_alt,
          status: data.status
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Uventet fejl ved hentning af case." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { session, error: authError } = requireAdmin(request, ["owner", "admin"]);
    if (authError) {
      return authError;
    }

    const id = await resolveId(context);
    if (!id) {
      return NextResponse.json({ message: "Mangler case-id." }, { status: 400 });
    }

    const payload = (await request.json()) as Record<string, unknown>;
    const parsed = parsePayload(payload);
    if ("error" in parsed) {
      return NextResponse.json({ message: parsed.error }, { status: 400 });
    }

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    };

    if (parsed.data.category !== null) updates.category = parsed.data.category;
    if (parsed.data.title !== null) updates.title = parsed.data.title;
    if (parsed.data.location !== null) updates.location = parsed.data.location;
    if (parsed.data.finish !== null) updates.finish = parsed.data.finish;
    if (parsed.data.problem !== null) updates.problem = parsed.data.problem;
    if (parsed.data.beforeImage !== null) updates.before_image = parsed.data.beforeImage;
    if (parsed.data.afterImage !== null) updates.after_image = parsed.data.afterImage;
    if (parsed.data.beforeAlt !== null) updates.before_alt = parsed.data.beforeAlt;
    if (parsed.data.afterAlt !== null) updates.after_alt = parsed.data.afterAlt;
    if (parsed.data.status !== null) updates.status = parsed.data.status;

    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("cases")
      .update(updates)
      .eq("id", id)
      .select(
        "id, created_at, updated_at, title, category, location, finish, problem, before_image, after_image, before_alt, after_alt, status"
      )
      .single();

    if (error || !data) {
      if (isMissingCasesTable(error?.message)) {
        return NextResponse.json(
          {
            message:
              "Cases-tabellen mangler. Kør migrationen supabase/migrations/20260208_000014_cases.sql i Supabase."
          },
          { status: 503 }
        );
      }
      return NextResponse.json({ message: error?.message || "Kunne ikke opdatere case." }, { status: 500 });
    }

    await auditLog({
      action: "case.update",
      entityType: "case",
      entityId: data.id,
      meta: { after: updates },
      req: request,
      actor: session?.email,
      role: session?.role
    });

    return NextResponse.json(
      {
        item: {
          id: data.id,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          title: data.title,
          category: data.category,
          location: data.location,
          finish: data.finish,
          problem: data.problem,
          beforeImage: data.before_image,
          afterImage: data.after_image,
          beforeAlt: data.before_alt,
          afterAlt: data.after_alt,
          status: data.status
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Uventet fejl ved opdatering af case." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { session, error: authError } = requireAdmin(request, ["owner", "admin"]);
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
      .delete()
      .eq("id", id)
      .select("id")
      .single();

    if (error || !data) {
      if (isMissingCasesTable(error?.message)) {
        return NextResponse.json(
          {
            message:
              "Cases-tabellen mangler. Kør migrationen supabase/migrations/20260208_000014_cases.sql i Supabase."
          },
          { status: 503 }
        );
      }
      return NextResponse.json({ message: error?.message || "Kunne ikke slette case." }, { status: 500 });
    }

    await auditLog({
      action: "case.delete",
      entityType: "case",
      entityId: data.id,
      meta: { id: data.id },
      req: request,
      actor: session?.email,
      role: session?.role
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Uventet fejl ved sletning af case." }, { status: 500 });
  }
}
