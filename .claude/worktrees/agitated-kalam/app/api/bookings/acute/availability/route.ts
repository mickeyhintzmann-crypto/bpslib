import { NextResponse } from "next/server";

import { getAvailabilityRange } from "@/lib/admin-availability";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

const COPENHAGEN_TIME_ZONE = "Europe/Copenhagen";
const DEFAULT_ACUTE_SETTINGS = {
  enabled: true,
  price: 3000,
  windowDays: 14
};

const copenhagenDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: COPENHAGEN_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit"
});

const parseWindowDays = (value: string | null, fallback: number) => {
  if (!value || !/^\d+$/.test(value)) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed)) {
    return fallback;
  }
  return parsed;
};

const loadAcuteSettings = async () => {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "acute")
    .maybeSingle();

  if (error) {
    const code = (error as { code?: string }).code;
    if (code !== "PGRST205") {
      console.error(error);
    }
    return DEFAULT_ACUTE_SETTINGS;
  }

  const value = (data?.value || {}) as Partial<typeof DEFAULT_ACUTE_SETTINGS>;
  return {
    enabled: typeof value.enabled === "boolean" ? value.enabled : DEFAULT_ACUTE_SETTINGS.enabled,
    price: typeof value.price === "number" ? value.price : DEFAULT_ACUTE_SETTINGS.price,
    windowDays: typeof value.windowDays === "number" ? value.windowDays : DEFAULT_ACUTE_SETTINGS.windowDays
  };
};

export async function GET(request: Request) {
  try {
    const settings = await loadAcuteSettings();
    const url = new URL(request.url);
    const requestedDays = parseWindowDays(url.searchParams.get("days"), settings.windowDays);
    const safeDays = Math.max(1, Math.min(settings.windowDays, Math.min(requestedDays, 30)));

    if (!settings.enabled) {
      return NextResponse.json(
        {
          enabled: false,
          windowDays: safeDays,
          price: settings.price,
          items: [],
          updatedAt: new Date().toISOString()
        },
        {
          status: 200,
          headers: { "Cache-Control": "no-store" }
        }
      );
    }

    const from = copenhagenDateFormatter.format(new Date());
    const availability = await getAvailabilityRange({
      from,
      days: safeDays,
      slotCount: 1,
      respectAcuteVisibility: true
    });

    if (!availability.data) {
      return NextResponse.json(
        { message: availability.error || "Kunne ikke hente akutte tider live." },
        { status: availability.status || 500, headers: { "Cache-Control": "no-store" } }
      );
    }

    return NextResponse.json(
      {
        enabled: true,
        windowDays: safeDays,
        price: settings.price,
        items: availability.data.items.map((day) => ({
          date: day.date,
          dateLabel: day.dateLabel,
          slots: day.availableStartSlots.map((slot) => slot.startTime)
        })),
        updatedAt: new Date().toISOString()
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" }
      }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Uventet fejl ved hentning af akutte tider." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
