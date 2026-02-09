import { NextResponse } from "next/server";

import { SLOT_TIMES } from "@/lib/booking-schedule";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ token: string }> | { token: string };
};

const SLOT_END_TIMES = ["11:00", "13:30", "16:00"] as const;

const timeFromIso = (iso: string | null | undefined) => (iso ? iso.slice(11, 16) : "");

const slotCountFromRange = (slotStart: string | null | undefined, slotEnd: string | null | undefined) => {
  const startTime = timeFromIso(slotStart);
  const endTime = timeFromIso(slotEnd);
  const startIndex = SLOT_TIMES.indexOf(startTime as (typeof SLOT_TIMES)[number]);
  const endIndex = SLOT_END_TIMES.indexOf(endTime as (typeof SLOT_END_TIMES)[number]);
  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
    return null;
  }
  return endIndex - startIndex + 1;
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
      .select("id, slot_start, slot_end, status")
      .eq("manage_token", token)
      .single();

    if (error || !data) {
      if (isMissingRelation(error?.message, "bookings")) {
        return NextResponse.json({ message: "Tabellen bookings mangler i databasen." }, { status: 503 });
      }
      return NextResponse.json({ message: "Linket er ugyldigt." }, { status: 404 });
    }

    const slotCount = slotCountFromRange(data.slot_start, data.slot_end) || 1;

    return NextResponse.json(
      {
        item: {
          id: data.id,
          slotStart: data.slot_start,
          slotEnd: data.slot_end,
          slotCount,
          status: data.status
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Uventet fejl." }, { status: 500 });
  }
}
