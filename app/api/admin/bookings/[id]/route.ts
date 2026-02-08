import { NextResponse } from "next/server";

import { assertAdminToken } from "@/lib/admin-auth";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ id: string }> | { id: string };
};

const isMissingRelation = (message: string | undefined, relationName: string) => {
  const normalized = (message || "").toLowerCase();
  return (
    normalized.includes(`relation \"${relationName}\" does not exist`) ||
    normalized.includes(`could not find the table 'public.${relationName}'`)
  );
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const params = await Promise.resolve(context.params);
    const authError = assertAdminToken(request);
    if (authError) {
      return authError;
    }

    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("bookings")
      .select(
        "id, created_at, status, service_type, source, customer_name, customer_phone, customer_email, slot_start, slot_end, notes, estimator_request_id"
      )
      .eq("id", params.id)
      .single();

    if (error || !data) {
      if (isMissingRelation(error?.message, "bookings")) {
        return NextResponse.json({ message: "Tabellen bookings mangler i databasen." }, { status: 503 });
      }
      return NextResponse.json({ message: error?.message || "Booking blev ikke fundet." }, { status: 404 });
    }

    return NextResponse.json({ item: data }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Uventet fejl ved hentning af booking." }, { status: 500 });
  }
}
