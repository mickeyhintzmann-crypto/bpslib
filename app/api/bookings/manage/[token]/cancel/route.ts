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

export async function POST(request: Request, context: RouteContext) {
  try {
    const params = await Promise.resolve(context.params);
    const token = params.token?.trim();

    if (!token || token.length < 20) {
      return NextResponse.json({ message: "Linket er ugyldigt." }, { status: 404 });
    }

    const supabase = createSupabaseServiceClient();
    const { data: booking, error } = await supabase
      .from("bookings")
      .select("id, date, start_slot_index, slot_count, status")
      .eq("manage_token", token)
      .single();

    if (error || !booking) {
      if (isMissingRelation(error?.message, "bookings")) {
        return NextResponse.json({ message: "Tabellen bookings mangler i databasen." }, { status: 503 });
      }
      return NextResponse.json({ message: "Linket er ugyldigt." }, { status: 404 });
    }

    const slotRange =
      booking.date && Number.isInteger(booking.start_slot_index) && Number.isInteger(booking.slot_count)
        ? getSlotRangeForBooking(booking.date, booking.start_slot_index, booking.slot_count)
        : null;
    const slotStart = slotRange?.slotStartIso ? new Date(slotRange.slotStartIso) : new Date("invalid");
    const now = new Date();
    const hoursUntil = Number.isNaN(slotStart.getTime())
      ? null
      : (slotStart.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (booking.status && booking.status.toLowerCase() === "cancelled") {
      return NextResponse.json({ ok: true, message: "Bookingen er allerede annulleret." }, { status: 200 });
    }

    const { error: updateError } = await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", booking.id);

    if (updateError) {
      return NextResponse.json({ message: updateError.message || "Kunne ikke annullere." }, { status: 500 });
    }

    const message =
      hoursUntil !== null && hoursUntil < 24
        ? "Bookingen er annulleret. Bemærk: under 24 timer før start kan det være svært at tilbyde tiden til andre."
        : "Bookingen er annulleret.";

    return NextResponse.json({ ok: true, message }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Uventet fejl ved annullering." }, { status: 500 });
  }
}
