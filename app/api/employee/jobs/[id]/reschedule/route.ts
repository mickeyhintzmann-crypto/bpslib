import { NextResponse, type NextRequest } from "next/server";

import { checkBookingAvailability, getSlotRangeForBooking } from "@/lib/admin-availability";
import { getSessionEmployee } from "@/lib/employee-session";
import { SLOT_TIMES } from "@/lib/booking-schedule";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

type RouteContext = {
  params: Promise<{ id: string }>;
};

const resolveId = async (context: RouteContext) => {
  const params = await context.params;
  return decodeURIComponent(params?.id || "");
};

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { error, employee, session } = await getSessionEmployee(request);
    if (error || !employee || !session) {
      return error;
    }

    const id = await resolveId(context);
    if (!id || !id.startsWith("booking:")) {
      return NextResponse.json({ message: "Kun bookinger kan flyttes via denne rute." }, { status: 400 });
    }

    const bookingId = id.slice("booking:".length);
    const payload = (await request.json()) as Record<string, unknown>;

    const date = typeof payload.date === "string" ? payload.date.trim() : "";
    const startSlot = typeof payload.startSlot === "string" ? payload.startSlot.trim() : "";
    const rawSlotCount = payload.slotCount;
    const slotCount =
      typeof rawSlotCount === "number"
        ? rawSlotCount
        : typeof rawSlotCount === "string"
          ? Number.parseInt(rawSlotCount, 10)
          : Number.NaN;

    if (!dateRegex.test(date)) {
      return NextResponse.json({ message: "Ugyldig dato. Brug format YYYY-MM-DD." }, { status: 400 });
    }

    const startSlotIndex = (SLOT_TIMES as readonly string[]).indexOf(startSlot);
    if (startSlotIndex === -1) {
      return NextResponse.json(
        { message: "Ugyldig starttid. Vælg 08:00, 11:00 eller 13:30." },
        { status: 400 }
      );
    }

    if (!Number.isInteger(slotCount) || ![1, 2, 3].includes(slotCount)) {
      return NextResponse.json({ message: "Antal slots skal være 1, 2 eller 3." }, { status: 400 });
    }

    const supabase = createSupabaseServiceClient();

    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("id, date, start_slot_index, slot_count, status")
      .eq("id", bookingId)
      .eq("assigned_to", session.id)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ message: "Booking ikke fundet." }, { status: 404 });
    }

    const bk = booking as {
      id: string;
      date: string | null;
      start_slot_index: number | null;
      slot_count: number | null;
      status: string | null;
    };

    if (bk.status === "cancelled" || bk.status === "invoiced") {
      return NextResponse.json(
        { message: "Booking kan ikke flyttes i denne status." },
        { status: 409 }
      );
    }

    const availability = await checkBookingAvailability({
      date,
      startSlotIndex,
      slotCount,
      excludeBookingId: bookingId
    });

    if (!availability.ok) {
      return NextResponse.json(
        { message: availability.message || "Tiden er allerede optaget. Vælg en ny tid." },
        { status: availability.status || 409 }
      );
    }

    const slotRange = getSlotRangeForBooking(date, startSlotIndex, slotCount);
    if (!slotRange) {
      return NextResponse.json({ message: "Kunne ikke beregne slot-interval." }, { status: 400 });
    }

    const { error: updateError } = await supabase
      .from("bookings")
      .update({
        date,
        start_slot_index: startSlotIndex,
        slot_count: slotCount,
        slot_start: slotRange.slotStartIso,
        slot_end: slotRange.slotEndIso
      })
      .eq("id", bookingId)
      .eq("assigned_to", session.id);

    if (updateError) {
      return NextResponse.json(
        { message: updateError.message || "Kunne ikke flytte booking." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, date, startSlot, slotCount }, { status: 200 });
  } catch (routeError) {
    console.error(routeError);
    return NextResponse.json({ message: "Uventet fejl ved flytning af opgave." }, { status: 500 });
  }
}
