import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

const asTrimmed = (value: unknown) => (typeof value === "string" ? value.trim() : "");

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

const isMissingCustomersTable = (message: string | undefined) => {
  const normalized = (message || "").toLowerCase();
  return (
    normalized.includes("could not find the table 'public.customers'") ||
    normalized.includes('relation "customers" does not exist')
  );
};

type CustomerRow = {
  id: string;
  created_at: string;
  updated_at: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  postal_code: string | null;
  address: string | null;
  city: string | null;
  tags: string[] | null;
  notes: string | null;
  source: string | null;
};

const toItem = (row: CustomerRow, leadsCount: number, estimatorRequestsCount: number, bookingsCount: number) => ({
  id: row.id,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  name: row.name,
  email: row.email,
  phone: row.phone,
  postalCode: row.postal_code,
  address: row.address,
  city: row.city,
  tags: row.tags || [],
  notes: row.notes,
  source: row.source,
  leadsCount,
  estimatorRequestsCount,
  bookingsCount
});

export async function GET(request: Request) {
  try {
    const { error: authError } = requireAdmin(request, ["owner", "admin", "viewer"]);
    if (authError) {
      return authError;
    }

    const url = new URL(request.url);
    const q = asTrimmed(url.searchParams.get("q"));
    const page = parsePositiveInt(url.searchParams.get("page"), 1);
    const pageSize = Math.min(parsePositiveInt(url.searchParams.get("pageSize"), 50), 200);
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const supabase = createSupabaseServiceClient();

    let query = supabase
      .from("customers")
      .select(
        "id, created_at, updated_at, name, email, phone, postal_code, address, city, tags, notes, source",
        { count: "exact" }
      )
      .order("updated_at", { ascending: false })
      .range(from, to);

    if (q) {
      const safeSearch = q.replace(/[(),%]/g, " ").trim();
      if (safeSearch) {
        query = query.or(
          `name.ilike.%${safeSearch}%,email.ilike.%${safeSearch}%,phone.ilike.%${safeSearch}%`
        );
      }
    }

    const { data, error, count } = await query;

    if (error) {
      if (isMissingCustomersTable(error.message)) {
        return NextResponse.json(
          {
            message: "Customers-tabellen mangler i databasen."
          },
          { status: 503 }
        );
      }
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    // For each customer, fetch related counts
    const customers = data || ([] as CustomerRow[]);
    const itemsWithCounts = await Promise.all(
      customers.map(async (customer) => {
        const [leadsResult, estimatorResult, bookingsResult] = await Promise.all([
          supabase
            .from("leads")
            .select("id", { count: "exact", head: true })
            .eq("customer_id", customer.id),
          supabase
            .from("estimator_requests")
            .select("id", { count: "exact", head: true })
            .eq("customer_id", customer.id),
          supabase
            .from("bookings")
            .select("id", { count: "exact", head: true })
            .eq("customer_id", customer.id)
        ]);

        return toItem(
          customer,
          leadsResult.count ?? 0,
          estimatorResult.count ?? 0,
          bookingsResult.count ?? 0
        );
      })
    );

    return NextResponse.json(
      {
        items: itemsWithCounts,
        page,
        pageSize,
        total: count ?? null
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Uventet fejl ved hentning af customers." }, { status: 500 });
  }
}
