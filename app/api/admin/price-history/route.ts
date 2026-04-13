import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

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

type SimilarJob = {
  id: string;
  service_type: string;
  postal_code: string | null;
  price_total: number;
  date: string;
};

type AIAccuracy = {
  estimator_id: string;
  ai_price_min: number | null;
  ai_price_max: number | null;
  actual_price: number;
};

export async function GET(request: Request) {
  try {
    const { error: authError } = requireAdmin(request, ["owner", "admin"]);
    if (authError) {
      return authError;
    }

    const url = new URL(request.url);
    const service = url.searchParams.get("service") || "";
    const postalCode = url.searchParams.get("postal_code") || "";
    const limit = parsePositiveInt(url.searchParams.get("limit"), 5);

    if (!service) {
      return NextResponse.json(
        { message: "service parameter er påkrævet" },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServiceClient();

    // Query completed bookings with price data
    let query = supabase
      .from("bookings")
      .select("id, service_type, postal_code, price_total, created_at")
      .eq("status", "done")
      .not("price_total", "is", null)
      .ilike("service_type", `%${service}%`)
      .order("created_at", { ascending: false })
      .limit(limit);

    // Filter by postal code prefix (first 2 digits) if provided
    if (postalCode) {
      const postalPrefix = postalCode.slice(0, 2);
      // Note: Supabase doesn't have a direct startsWith filter, so we fetch and filter
      const { data: allBookings, error } = await query;

      if (error && error.code !== "PGRST116") {
        return NextResponse.json({ message: error.message }, { status: 500 });
      }

      const filtered = (allBookings || []).filter((booking: any) => {
        return booking.postal_code?.startsWith(postalPrefix);
      });

      // Calculate similar_jobs
      const similarJobs: SimilarJob[] = filtered.map((booking: any) => ({
        id: booking.id,
        service_type: booking.service_type,
        postal_code: booking.postal_code,
        price_total: booking.price_total,
        date: booking.created_at
      }));

      // Calculate price statistics
      const prices = filtered.map((b: any) => b.price_total).filter(Boolean);
      const avgPrice = prices.length > 0 ? prices.reduce((a: number, b: number) => a + b, 0) / prices.length : 0;
      const sortedPrices = [...prices].sort((a: number, b: number) => a - b);
      const medianPrice = sortedPrices.length > 0
        ? sortedPrices.length % 2 === 0
          ? (sortedPrices[sortedPrices.length / 2 - 1] + sortedPrices[sortedPrices.length / 2]) / 2
          : sortedPrices[Math.floor(sortedPrices.length / 2)]
        : 0;

      // Fetch AI accuracy data
      const { data: estimators, error: estimatorError } = await supabase
        .from("estimator_requests")
        .select(
          `id,
           ai_price_min,
           ai_price_max,
           bookings(price_total)`
        )
        .ilike("service_type", `%${service}%`)
        .not("ai_price_min", "is", null)
        .not("ai_price_max", "is", null);

      const aiAccuracy: AIAccuracy[] = [];
      if (!estimatorError && estimators) {
        for (const est of estimators) {
          const booking = (est.bookings as any)?.[0];
          if (booking?.price_total) {
            aiAccuracy.push({
              estimator_id: est.id,
              ai_price_min: est.ai_price_min,
              ai_price_max: est.ai_price_max,
              actual_price: booking.price_total
            });
          }
        }
      }

      return NextResponse.json(
        {
          similar_jobs: similarJobs,
          avg_price: Math.round(avgPrice * 100) / 100,
          median_price: Math.round(medianPrice * 100) / 100,
          ai_accuracy: aiAccuracy
        },
        { status: 200 }
      );
    }

    // Without postal code filter
    const { data: allBookings, error } = await query;

    if (error && error.code !== "PGRST116") {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    const similarJobs: SimilarJob[] = (allBookings || []).map((booking: any) => ({
      id: booking.id,
      service_type: booking.service_type,
      postal_code: booking.postal_code,
      price_total: booking.price_total,
      date: booking.created_at
    }));

    // Calculate price statistics
    const prices = (allBookings || [])
      .map((b: any) => b.price_total)
      .filter((p: any) => p !== null && p !== undefined);

    const avgPrice = prices.length > 0 ? prices.reduce((a: number, b: number) => a + b, 0) / prices.length : 0;
    const sortedPrices = [...prices].sort((a: number, b: number) => a - b);
    const medianPrice = sortedPrices.length > 0
      ? sortedPrices.length % 2 === 0
        ? (sortedPrices[sortedPrices.length / 2 - 1] + sortedPrices[sortedPrices.length / 2]) / 2
        : sortedPrices[Math.floor(sortedPrices.length / 2)]
      : 0;

    // Fetch AI accuracy data
    const { data: estimators, error: estimatorError } = await supabase
      .from("estimator_requests")
      .select(
        `id,
         ai_price_min,
         ai_price_max,
         bookings(price_total)`
      )
      .ilike("service_type", `%${service}%`)
      .not("ai_price_min", "is", null)
      .not("ai_price_max", "is", null);

    const aiAccuracy: AIAccuracy[] = [];
    if (!estimatorError && estimators) {
      for (const est of estimators) {
        const booking = (est.bookings as any)?.[0];
        if (booking?.price_total) {
          aiAccuracy.push({
            estimator_id: est.id,
            ai_price_min: est.ai_price_min,
            ai_price_max: est.ai_price_max,
            actual_price: booking.price_total
          });
        }
      }
    }

    return NextResponse.json(
      {
        similar_jobs: similarJobs,
        avg_price: Math.round(avgPrice * 100) / 100,
        median_price: Math.round(medianPrice * 100) / 100,
        ai_accuracy: aiAccuracy
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Price history error:", error);
    return NextResponse.json(
      { message: "Uventet fejl ved hentning af prishistorik." },
      { status: 500 }
    );
  }
}
