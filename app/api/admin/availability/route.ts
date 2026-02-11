import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { getAvailabilityRange } from "@/lib/admin-availability";

const toDateKey = (date: Date) => {
  const year = date.getUTCFullYear();
  const month = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  const day = `${date.getUTCDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseIntParam = (value: string | null, fallback: number) => {
  if (!value) {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed)) {
    return fallback;
  }
  return parsed;
};

export async function GET(request: Request) {
  try {
    const { error } = requireAdmin(request, ["owner", "admin"]);
    if (error) {
      return error;
    }

    const url = new URL(request.url);
    const from = url.searchParams.get("from") || toDateKey(new Date());
    const days = parseIntParam(url.searchParams.get("days"), 30);
    const slotCount = parseIntParam(url.searchParams.get("slot_count"), 1);

    const availability = await getAvailabilityRange({
      from,
      days,
      slotCount
    });

    if (!availability.data) {
      return NextResponse.json(
        { message: availability.error || "Kunne ikke hente availability." },
        { status: availability.status || 500 }
      );
    }

    return NextResponse.json(availability.data, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Uventet fejl ved hentning af availability." }, { status: 500 });
  }
}
