import { NextResponse, type NextRequest } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ id: string }>;
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

type LeadRow = {
  id: string;
  created_at: string;
  updated_at: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  status: string;
  source: string;
};

type EstimatorRequestRow = {
  id: string;
  created_at: string;
  updated_at: string;
  service: string;
  status: string | null;
};

type BookingRow = {
  id: string;
  created_at: string;
  updated_at: string;
  status: string | null;
  date: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
};

const asTrimmed = (value: unknown) => (typeof value === "string" ? value.trim() : "");

const asStringArrayOrNull = (value: unknown): string[] | null => {
  if (Array.isArray(value)) {
    return value.filter((item) => typeof item === "string").map((item) => (item as string).trim()).filter(Boolean);
  }
  return null;
};

const asStringOrNull = (value: unknown) => {
  const trimmed = asTrimmed(value);
  return trimmed ? trimmed : null;
};

const isMissingTable = (message: string | undefined, table: string) => {
  const normalized = (message || "").toLowerCase();
  return (
    normalized.includes(`could not find the table 'public.${table}'`) ||
    normalized.includes(`relation \"${table}\" does not exist`)
  );
};

const resolveId = async (context: RouteContext) => {
  const params = await context.params;
  return params?.id || "";
};

const toCustomerItem = (row: CustomerRow) => ({
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
  source: row.source
});

const toLeadItem = (row: LeadRow) => ({
  id: row.id,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  name: row.name,
  email: row.email,
  phone: row.phone,
  status: row.status,
  source: row.source
});

const toEstimatorRequestItem = (row: EstimatorRequestRow) => ({
  id: row.id,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  service: row.service,
  status: row.status
});

const toBookingItem = (row: BookingRow) => ({
  id: row.id,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  status: row.status,
  date: row.date,
  customerName: row.customer_name,
  customerPhone: row.customer_phone,
  customerEmail: row.customer_email
});

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { error: authError } = requireAdmin(request, ["owner", "admin", "viewer"]);
    if (authError) {
      return authError;
    }

    const id = await resolveId(context);
    if (!id) {
      return NextResponse.json({ message: "Mangler customer-id." }, { status: 400 });
    }

    const supabase = createSupabaseServiceClient();

    const [customerResult, leadsResult, estimatorRequestsResult, bookingsResult] = await Promise.all([
      supabase
        .from("customers")
        .select("id, created_at, updated_at, name, email, phone, postal_code, address, city, tags, notes, source")
        .eq("id", id)
        .single(),
      supabase
        .from("leads")
        .select("id, created_at, updated_at, name, email, phone, status, source")
        .eq("customer_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("estimator_requests")
        .select("id, created_at, updated_at, service, status")
        .eq("customer_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("bookings")
        .select("id, created_at, updated_at, status, date, customer_name, customer_phone, customer_email")
        .eq("customer_id", id)
        .order("created_at", { ascending: false })
    ]);

    if (customerResult.error || !customerResult.data) {
      if (isMissingTable(customerResult.error?.message, "customers")) {
        return NextResponse.json(
          {
            message: "Customers-tabellen mangler i databasen."
          },
          { status: 503 }
        );
      }
      return NextResponse.json({ message: customerResult.error?.message || "Customer blev ikke fundet." }, { status: 404 });
    }

    const customer = toCustomerItem(customerResult.data as CustomerRow);
    const leads = leadsResult.error ? [] : ((leadsResult.data || []) as LeadRow[]).map(toLeadItem);
    const estimatorRequests = estimatorRequestsResult.error ? [] : ((estimatorRequestsResult.data || []) as EstimatorRequestRow[]).map(toEstimatorRequestItem);
    const bookings = bookingsResult.error ? [] : ((bookingsResult.data || []) as BookingRow[]).map(toBookingItem);

    return NextResponse.json(
      {
        customer,
        leads,
        estimatorRequests,
        bookings
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Uventet fejl ved hentning af customer." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { error: authError } = requireAdmin(request, ["owner", "admin"]);
    if (authError) {
      return authError;
    }

    const id = await resolveId(context);
    if (!id) {
      return NextResponse.json({ message: "Mangler customer-id." }, { status: 400 });
    }

    const payload = (await request.json()) as Record<string, unknown>;

    const name = asStringOrNull(payload.name);
    const email = asStringOrNull(payload.email);
    const phone = asStringOrNull(payload.phone);
    const postalCode = asStringOrNull(payload.postal_code);
    const address = asStringOrNull(payload.address);
    const city = asStringOrNull(payload.city);
    const tags = asStringArrayOrNull(payload.tags);
    const notes = asStringOrNull(payload.notes);

    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    };

    if (payload.hasOwnProperty("name")) {
      updatePayload.name = name;
    }
    if (payload.hasOwnProperty("email")) {
      updatePayload.email = email;
    }
    if (payload.hasOwnProperty("phone")) {
      updatePayload.phone = phone;
    }
    if (payload.hasOwnProperty("postal_code")) {
      updatePayload.postal_code = postalCode;
    }
    if (payload.hasOwnProperty("address")) {
      updatePayload.address = address;
    }
    if (payload.hasOwnProperty("city")) {
      updatePayload.city = city;
    }
    if (payload.hasOwnProperty("tags")) {
      updatePayload.tags = tags;
    }
    if (payload.hasOwnProperty("notes")) {
      updatePayload.notes = notes;
    }

    const supabase = createSupabaseServiceClient();

    const { data, error } = await supabase
      .from("customers")
      .update(updatePayload)
      .eq("id", id)
      .select("id, created_at, updated_at, name, email, phone, postal_code, address, city, tags, notes, source")
      .single();

    if (error || !data) {
      if (isMissingTable(error?.message, "customers")) {
        return NextResponse.json(
          {
            message: "Customers-tabellen mangler i databasen."
          },
          { status: 503 }
        );
      }
      return NextResponse.json(
        { message: error?.message || "Kunne ikke opdatere customer." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        customer: toCustomerItem(data as CustomerRow)
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Uventet fejl ved opdatering af customer." }, { status: 500 });
  }
}
