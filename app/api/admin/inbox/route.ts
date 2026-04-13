import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

const isMissingRelation = (message: string | undefined, relationName: string) => {
  const normalized = (message || "").toLowerCase();
  return (
    normalized.includes(`relation \"${relationName}\" does not exist`) ||
    normalized.includes(`could not find the table 'public.${relationName}'`)
  );
};

const isMissingColumn = (message: string | undefined) => {
  const normalized = (message || "").toLowerCase();
  return normalized.includes("column") && normalized.includes("does not exist");
};

interface UnifiedItem {
  id: string;
  type: "lead" | "estimator" | "booking";
  created_at: string;
  status: string;
  name: string;
  phone: string | null;
  email: string | null;
  priority_score: number;
  source?: string | null;
  service?: string | null;
  location?: string | null;
  ai_status?: string | null;
  customer_id?: string | null;
  follow_up_at?: string | null;
}

const calculatePriorityScore = (item: any): number => {
  const now = new Date();
  const createdAt = new Date(item.created_at);
  const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

  if (item.type === "booking") {
    if (item.source === "acute" && item.status === "pending_confirmation") {
      return 100;
    }
    if (item.status === "pending_confirmation") {
      return 50;
    }
    if (item.status === "new") {
      return 45;
    }
  }

  if (item.type === "lead") {
    if (item.priority === "urgent") {
      return 90;
    }
    if (item.priority === "high") {
      return 80;
    }
    if (item.status === "new") {
      const ageBonus = Math.min(Math.floor(hoursDiff), 20);
      return 60 + ageBonus;
    }
  }

  if (item.type === "estimator") {
    if (item.ai_status === "Ny" || item.status === "Ny") {
      return 70;
    }
  }

  // Default: score based on recency (older items get lower scores)
  // Subtract 0.1 point per hour old
  return Math.max(10, 40 - hoursDiff * 0.1);
};

const matchesSearch = (item: UnifiedItem, query: string): boolean => {
  const q = query.toLowerCase();
  const searchText = [
    item.name,
    item.phone,
    item.email,
    item.id,
    item.source,
    item.service
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return searchText.includes(q);
};

export async function GET(request: Request) {
  try {
    const { error: authError } = requireAdmin(request, ["owner", "admin", "viewer"]);
    if (authError) {
      return authError;
    }

    const url = new URL(request.url);
    const typeFilter = url.searchParams.get("type") || "all";
    const searchQuery = url.searchParams.get("q") || "";
    const pageStr = url.searchParams.get("page") || "1";
    const pageSizeStr = url.searchParams.get("pageSize") || "20";

    const page = Math.max(1, parseInt(pageStr, 10) || 1);
    const pageSize = Math.max(1, Math.min(100, parseInt(pageSizeStr, 10) || 20));
    const offset = (page - 1) * pageSize;

    const supabase = createSupabaseServiceClient();

    // Fetch leads
    let leadsData: any[] = [];
    let leadsError: any = null;

    const leadsQuery = supabase
      .from("leads")
      .select(
        "id, created_at, status, source, service, name, phone, email, location, priority, follow_up_at, customer_id"
      );

    const leadsResult = await leadsQuery;
    leadsData = leadsResult.data || [];
    leadsError = leadsResult.error;

    // Handle missing priority/customer_id columns gracefully
    if (leadsError && isMissingColumn(leadsError.message)) {
      const leadsQueryFallback = supabase
        .from("leads")
        .select("id, created_at, status, source, service, name, phone, email, location");

      const leadsResultFallback = await leadsQueryFallback;
      leadsData = (leadsResultFallback.data || []).map((item) => ({
        ...item,
        priority: null,
        follow_up_at: null,
        customer_id: null
      }));
      leadsError = null;
    }

    if (leadsError && !isMissingRelation(leadsError.message, "leads")) {
      return NextResponse.json({ message: leadsError.message }, { status: 500 });
    }

    // Fetch estimator requests
    let estimatorData: any[] = [];
    let estimatorError: any = null;

    const estimatorQuery = supabase
      .from("estimator_requests")
      .select(
        "id, created_at, status, fields, ai_status, customer_id"
      );

    const estimatorResult = await estimatorQuery;
    estimatorData = (estimatorResult.data || []).map((item) => ({
      ...item,
      navn: item.fields?.navn || null,
      telefon: item.fields?.telefon || null
    }));
    estimatorError = estimatorResult.error;

    // Handle missing customer_id column gracefully
    if (estimatorError && isMissingColumn(estimatorError.message)) {
      const estimatorQueryFallback = supabase
        .from("estimator_requests")
        .select("id, created_at, status, fields, ai_status");

      const estimatorResultFallback = await estimatorQueryFallback;
      estimatorData = (estimatorResultFallback.data || []).map((item) => ({
        ...item,
        navn: item.fields?.navn || null,
        telefon: item.fields?.telefon || null,
        customer_id: null
      }));
      estimatorError = null;
    }

    if (estimatorError && !isMissingRelation(estimatorError.message, "estimator_requests")) {
      return NextResponse.json({ message: estimatorError.message }, { status: 500 });
    }

    // Fetch bookings
    let bookingsData: any[] = [];
    let bookingsError: any = null;

    const bookingsQuery = supabase
      .from("bookings")
      .select(
        "id, created_at, status, source, service_type, customer_name, customer_phone, customer_email, customer_id"
      )
      .in("status", ["pending_confirmation", "new"]);

    const bookingsResult = await bookingsQuery;
    bookingsData = bookingsResult.data || [];
    bookingsError = bookingsResult.error;

    // Handle missing customer_id column gracefully
    if (bookingsError && isMissingColumn(bookingsError.message)) {
      const bookingsQueryFallback = supabase
        .from("bookings")
        .select(
          "id, created_at, status, source, service_type, customer_name, customer_phone, customer_email"
        )
        .in("status", ["pending_confirmation", "new"]);

      const bookingsResultFallback = await bookingsQueryFallback;
      bookingsData = (bookingsResultFallback.data || []).map((item) => ({
        ...item,
        customer_id: null
      }));
      bookingsError = null;
    }

    if (bookingsError && !isMissingRelation(bookingsError.message, "bookings")) {
      return NextResponse.json({ message: bookingsError.message }, { status: 500 });
    }

    // Transform leads to unified format
    const unifiedLeads: UnifiedItem[] = (leadsData || [])
      .map((lead) => ({
        id: lead.id,
        type: "lead" as const,
        created_at: lead.created_at,
        status: lead.status || "",
        name: lead.name || "",
        phone: lead.phone || null,
        email: lead.email || null,
        source: lead.source || null,
        service: lead.service || null,
        location: lead.location || null,
        priority: lead.priority || null,
        follow_up_at: lead.follow_up_at || null,
        customer_id: lead.customer_id || null,
        priority_score: 0 // Will be calculated below
      }))
      .map((item) => ({
        ...item,
        priority_score: calculatePriorityScore(item)
      }));

    // Transform estimator requests to unified format
    const unifiedEstimators: UnifiedItem[] = (estimatorData || [])
      .map((est) => ({
        id: est.id,
        type: "estimator" as const,
        created_at: est.created_at,
        status: est.status || "",
        name: est.navn || "",
        phone: est.telefon || null,
        email: null,
        ai_status: est.ai_status || null,
        customer_id: est.customer_id || null,
        priority_score: 0 // Will be calculated below
      }))
      .map((item) => ({
        ...item,
        priority_score: calculatePriorityScore(item)
      }));

    // Transform bookings to unified format
    const unifiedBookings: UnifiedItem[] = (bookingsData || [])
      .map((booking) => ({
        id: booking.id,
        type: "booking" as const,
        created_at: booking.created_at,
        status: booking.status || "",
        name: booking.customer_name || "",
        phone: booking.customer_phone || null,
        email: booking.customer_email || null,
        source: booking.source || null,
        service: booking.service_type || null,
        customer_id: booking.customer_id || null,
        priority_score: 0 // Will be calculated below
      }))
      .map((item) => ({
        ...item,
        priority_score: calculatePriorityScore(item)
      }));

    // Combine all items
    let allItems: UnifiedItem[] = [...unifiedLeads, ...unifiedEstimators, ...unifiedBookings];

    // Apply type filter
    if (typeFilter !== "all") {
      allItems = allItems.filter((item) => item.type === typeFilter);
    }

    // Apply search filter
    if (searchQuery) {
      allItems = allItems.filter((item) => matchesSearch(item, searchQuery));
    }

    // Sort by priority_score (desc) then created_at (desc)
    allItems.sort((a, b) => {
      if (a.priority_score !== b.priority_score) {
        return b.priority_score - a.priority_score;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    // Paginate
    const total = allItems.length;
    const items = allItems.slice(offset, offset + pageSize);

    return NextResponse.json(
      {
        items,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize)
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Uventet fejl ved hentning af indbakke." },
      { status: 500 }
    );
  }
}
