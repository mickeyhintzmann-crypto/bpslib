import { NextResponse } from "next/server";

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

const normalizeFilter = (raw: string | null) => {
  if (!raw || raw === "alle") {
    return null;
  }
  return raw;
};

const parsePositiveInt = (value: string | null, fallback: number) => {
  if (!value) {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 1) {
    return fallback;
  }
  return parsed;
};

const asTrimmed = (value: unknown) => (typeof value === "string" ? value.trim() : "");

const parsePayload = (payload: Record<string, unknown>, requireAll: boolean) => {
  const category = asTrimmed(payload.category);
  const title = asTrimmed(payload.title);
  const location = asTrimmed(payload.location);
  const finish = asTrimmed(payload.finish);
  const problem = asTrimmed(payload.problem);
  const beforeImage = asTrimmed(payload.beforeImage);
  const afterImage = asTrimmed(payload.afterImage);
  const beforeAlt = asTrimmed(payload.beforeAlt);
  const afterAlt = asTrimmed(payload.afterAlt);
  const status = asTrimmed(payload.status) || "published";

  if (requireAll) {
    if (!title || title.length < 3) {
      return { error: "Titel skal være mindst 3 tegn." };
    }
    if (!location) {
      return { error: "Lokation mangler." };
    }
    if (!problem) {
      return { error: "Problem mangler." };
    }
    if (!beforeImage) {
      return { error: "Indsæt mindst ét billede (før/eksempel)." };
    }
  }

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
      category,
      title,
      location,
      finish,
      problem,
      beforeImage,
      afterImage: afterImage || null,
      beforeAlt,
      afterAlt: afterAlt || null,
      status
    }
  };
};

export async function GET(request: Request) {
  try {
    const { error: authError } = requireAdmin(request, ["owner", "admin", "viewer"]);
    if (authError) {
      return authError;
    }

    const url = new URL(request.url);
    const categoryFilter = normalizeFilter(url.searchParams.get("category"));
    const statusFilter = normalizeFilter(url.searchParams.get("status"));
    const queryFilter = asTrimmed(url.searchParams.get("q"));
    const page = parsePositiveInt(url.searchParams.get("page"), 1);
    const pageSize = Math.min(parsePositiveInt(url.searchParams.get("limit"), 50), 200);
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const supabase = createSupabaseServiceClient();

    let query = supabase
      .from("cases")
      .select("id, created_at, title, category, location, status", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (categoryFilter && CATEGORY_VALUES.includes(categoryFilter as (typeof CATEGORY_VALUES)[number])) {
      query = query.eq("category", categoryFilter);
    }

    if (statusFilter && STATUS_VALUES.includes(statusFilter as (typeof STATUS_VALUES)[number])) {
      query = query.eq("status", statusFilter);
    }

    if (queryFilter) {
      query = query.ilike("title", `%${queryFilter}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      if (isMissingCasesTable(error.message)) {
        return NextResponse.json(
          {
            message:
              "Cases-tabellen mangler. Kør migrationen supabase/migrations/20260208_000014_cases.sql i Supabase."
          },
          { status: 503 }
        );
      }
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    const items = (data || []).map((row: any) => ({
      id: row.id,
      createdAt: row.created_at,
      title: row.title,
      category: row.category,
      location: row.location,
      status: row.status
    }));

    return NextResponse.json(
      {
        items,
        page,
        pageSize,
        total: count ?? null
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Uventet fejl i cases-listen." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { session, error: authError } = requireAdmin(request, ["owner", "admin"]);
    if (authError) {
      return authError;
    }

    const payload = (await request.json()) as Record<string, unknown>;
    const parsed = parsePayload(payload, true);
    if ("error" in parsed) {
      return NextResponse.json({ message: parsed.error }, { status: 400 });
    }

    const supabase = createSupabaseServiceClient();
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("cases")
      .insert({
        category: parsed.data.category || "bordplade",
        title: parsed.data.title,
        location: parsed.data.location,
        finish: parsed.data.finish || "andet",
        problem: parsed.data.problem,
        before_image: parsed.data.beforeImage,
        after_image: parsed.data.afterImage,
        before_alt: parsed.data.beforeAlt || parsed.data.title,
        after_alt: parsed.data.afterAlt || parsed.data.title,
        status: parsed.data.status || "published",
        updated_at: now
      })
      .select("id, created_at, title, category, location, status")
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
      return NextResponse.json({ message: error?.message || "Kunne ikke oprette case." }, { status: 500 });
    }

    await auditLog({
      action: "case.create",
      entityType: "case",
      entityId: data.id,
      meta: { after: parsed.data },
      req: request,
      actor: session?.email,
      role: session?.role
    });

    return NextResponse.json(
      {
        item: {
          id: data.id,
          createdAt: data.created_at,
          title: data.title,
          category: data.category,
          location: data.location,
          status: data.status
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Uventet fejl ved oprettelse af case." }, { status: 500 });
  }
}
