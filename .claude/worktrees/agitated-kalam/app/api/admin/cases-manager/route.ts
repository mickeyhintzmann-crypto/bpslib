import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/slugify";

const CASE_CATEGORIES = ["bordplade", "gulvafslibning", "gulvbelaegning"] as const;
const CASES_SCHEMA_MIGRATION = "supabase/migrations/20260302000021_admin_cases_schema.sql";

type CaseCategory = (typeof CASE_CATEGORIES)[number];

const asTrimmed = (value: unknown) => (typeof value === "string" ? value.trim() : "");

const isMissingTable = (message: string | undefined, table: string) => {
  const normalized = (message || "").toLowerCase();
  return (
    normalized.includes(`could not find the table 'public.${table}'`) ||
    normalized.includes(`relation \"${table}\" does not exist`)
  );
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

export async function GET(request: Request) {
  try {
    const { error: authError } = requireAdmin(request, ["owner", "admin", "viewer"]);
    if (authError) {
      return authError;
    }

    const url = new URL(request.url);
    const category = asTrimmed(url.searchParams.get("category"));
    const q = asTrimmed(url.searchParams.get("q"));
    const publishedFilter = asTrimmed(url.searchParams.get("published"));
    const page = parsePositiveInt(url.searchParams.get("page"), 1);
    const pageSize = Math.min(parsePositiveInt(url.searchParams.get("limit"), 100), 200);
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const supabase = createSupabaseServiceClient();

    let casesQuery = supabase
      .from("cases")
      .select(
        "id, title, slug, category, location, summary, tags, client_id, is_featured, published, created_at",
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(from, to);

    if (category && CASE_CATEGORIES.includes(category as CaseCategory)) {
      casesQuery = casesQuery.eq("category", category);
    }

    if (publishedFilter === "true") {
      casesQuery = casesQuery.eq("published", true);
    } else if (publishedFilter === "false") {
      casesQuery = casesQuery.eq("published", false);
    }

    if (q) {
      casesQuery = casesQuery.or(`title.ilike.%${q}%,slug.ilike.%${q}%,location.ilike.%${q}%`);
    }

    const [{ data: casesData, error: casesError, count }, { data: clientsData, error: clientsError }] =
      await Promise.all([
        casesQuery,
        supabase.from("clients").select("id, name").order("name", { ascending: true })
      ]);

    if (casesError) {
      if (isMissingTable(casesError.message, "cases")) {
        return NextResponse.json(
          {
            message: `Cases-tabellen mangler. Kør migrationen ${CASES_SCHEMA_MIGRATION} i Supabase.`
          },
          { status: 503 }
        );
      }

      return NextResponse.json({ message: casesError.message }, { status: 500 });
    }

    if (clientsError) {
      if (isMissingTable(clientsError.message, "clients")) {
        return NextResponse.json(
          {
            message: `Clients-tabellen mangler. Kør migrationen ${CASES_SCHEMA_MIGRATION} i Supabase.`
          },
          { status: 503 }
        );
      }

      return NextResponse.json({ message: clientsError.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        items: (casesData || []).map((row: Record<string, any>) => toItem(row)),
        clients: (clientsData || []).map((client: Record<string, any>) => ({
          id: client.id,
          name: client.name
        })),
        page,
        pageSize,
        total: count ?? null
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Uventet fejl ved hentning af cases." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { error: authError } = requireAdmin(request, ["owner", "admin"]);
    if (authError) {
      return authError;
    }

    const payload = (await request.json()) as Record<string, unknown>;
    const title = asTrimmed(payload.title);
    const category = asTrimmed(payload.category) as CaseCategory;

    if (title.length < 2) {
      return NextResponse.json({ message: "Titel er påkrævet." }, { status: 400 });
    }

    if (!CASE_CATEGORIES.includes(category)) {
      return NextResponse.json({ message: "Ugyldig kategori." }, { status: 400 });
    }

    const summary = asTrimmed(payload.summary) || null;
    const location = asTrimmed(payload.location) || null;
    const slugInput = asTrimmed(payload.slug);
    const tags = parseTags(payload.tags);
    const clientId = asTrimmed(payload.clientId) || null;
    const isFeatured = payload.isFeatured === true;
    const published = payload.published !== false;

    const supabase = createSupabaseServiceClient();
    const uniqueSlug = await ensureUniqueSlug(supabase, slugInput || title);

    const { data, error } = await supabase
      .from("cases")
      .insert({
        title,
        category,
        slug: uniqueSlug,
        summary,
        location,
        tags,
        client_id: clientId,
        is_featured: isFeatured,
        published
      })
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

      return NextResponse.json({ message: error?.message || "Kunne ikke oprette case." }, { status: 500 });
    }

    return NextResponse.json({ item: toItem(data as Record<string, any>) }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Uventet fejl ved oprettelse af case." }, { status: 500 });
  }
}
