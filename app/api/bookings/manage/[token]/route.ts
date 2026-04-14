import { NextResponse } from "next/server";

import { getSlotRangeForBooking } from "@/lib/admin-availability";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ token: string }> | { token: string };
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
    const token = params.token?.trim();

    if (!token || token.length < 20) {
      return NextResponse.json({ message: "Ugyldigt token." }, { status: 404 });
    }

    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("bookings")
      .select("id, date, start_slot_index, slot_count, status, customer_name, address, postal_code, city, service_type, source, price_total, notes")
      .eq("manage_token", token)
      .single();

    if (error || !data) {
      if (isMissingRelation(error?.message, "bookings")) {
        return NextResponse.json({ message: "Tabellen bookings mangler i databasen." }, { status: 503 });
      }
      return NextResponse.json({ message: "Linket er ugyldigt." }, { status: 404 });
    }

    const slotRange =
      data.date && Number.isInteger(data.start_slot_index) && Number.isInteger(data.slot_count)
        ? getSlotRangeForBooking(data.date, data.start_slot_index, data.slot_count)
        : null;
    const slotCount = data.slot_count || 1;

    /* Return date + startTime separately so the client can display
       Copenhagen time without UTC-offset confusion. */
    return NextResponse.json(
      {
        item: {
          id: data.id,
          date: data.date,
          startTime: slotRange?.startTime ?? null,
          endTime: slotRange?.endTime ?? null,
          slotCount,
          status: data.status,
          customerName: data.customer_name,
          address: data.address,
          postalCode: data.postal_code,
          city: data.city,
          serviceType: data.service_type,
          source: data.source,
          priceTotal: data.price_total,
          notes: data.notes,
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Uventet fejl." }, { status: 500 });
  }
}
