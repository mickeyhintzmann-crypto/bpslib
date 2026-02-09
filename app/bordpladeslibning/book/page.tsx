import Link from "next/link";

import { BpsImage } from "@/components/BpsImage";
import { BookingWizard } from "@/components/booking/BookingWizard";
import { Button } from "@/components/ui/button";
import { homeAssets } from "@/lib/assets";
import {
  SLOT_TIMES,
  type DayOverrideInput,
  type DayTemplate
} from "@/lib/booking-schedule";
import { getAvailabilityRange, type AvailabilityDay } from "@/lib/admin-availability";
import { buildMetadata } from "@/lib/seo";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export const metadata = buildMetadata({
  title: "Book bordpladeslibning",
  description:
    "Book tid til bordpladeslibning i massiv træ. Vælg dato og tidspunkt i en enkel kalender og få bekræftelse efter vurdering.",
  path: "/bordpladeslibning/book"
});

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const COPENHAGEN_TIME_ZONE = "Europe/Copenhagen";

const copenhagenDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: COPENHAGEN_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit"
});

const addDaysToDateKey = (dateKey: string, days: number) => {
  if (!dateRegex.test(dateKey)) {
    return null;
  }
  const [yearRaw, monthRaw, dayRaw] = dateKey.split("-");
  const year = Number.parseInt(yearRaw, 10);
  const month = Number.parseInt(monthRaw, 10);
  const day = Number.parseInt(dayRaw, 10);

  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return null;
  }

  const baseDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  if (Number.isNaN(baseDate.getTime())) {
    return null;
  }

  baseDate.setUTCDate(baseDate.getUTCDate() + days);
  return copenhagenDateFormatter.format(baseDate);
};

const loadOverrides = async (days: number): Promise<DayOverrideInput[]> => {
  const from = copenhagenDateFormatter.format(new Date());
  const to = addDaysToDateKey(from, Math.max(0, days - 1));
  if (!to) {
    return [];
  }

  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("day_overrides")
    .select("date, open_slots_count, show_on_acute_page, note")
    .gte("date", from)
    .lte("date", to);

  if (error) {
    const code = (error as { code?: string }).code;
    if (code !== "PGRST205") {
      console.error(error);
    }
    return [];
  }

  return (data || []) as DayOverrideInput[];
};

const buildTemplatesFromAvailability = (items: AvailabilityDay[]): DayTemplate[] => {
  return items.map((item) => {
    const openSlotsCount = Math.max(0, Math.min(3, Math.round(item.openSlotCount)));
    const openTimes = SLOT_TIMES.slice(0, openSlotsCount);
    const availableTimes = new Set(item.availableStartSlots.map((slot) => slot.startTime));
    const initialBooked = openTimes.filter((time) => !availableTimes.has(time));

    return {
      dateKey: item.date,
      dateLabel: item.dateLabel,
      openSlotsCount,
      initialBooked,
      showOnAcutePage: true
    };
  });
};

const loadAvailabilityTemplates = async (days: number): Promise<DayTemplate[] | null> => {
  const from = copenhagenDateFormatter.format(new Date());
  const availability = await getAvailabilityRange({
    from,
    days,
    slotCount: 1
  });

  if (!availability.data) {
    if (availability.error) {
      console.warn(availability.error);
    }
    return null;
  }

  return buildTemplatesFromAvailability(availability.data.items);
};

type BookingPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>;
};

const getParam = (value: string | string[] | undefined) => {
  if (typeof value === "string") {
    return value.trim();
  }
  if (Array.isArray(value) && value[0]) {
    return value[0].trim();
  }
  return "";
};

const parseNumberParam = (value: string | string[] | undefined) => {
  const raw = getParam(value);
  if (!raw || !/^\d+$/.test(raw)) {
    return null;
  }
  return Number.parseInt(raw, 10);
};

export default async function BookingPage({ searchParams }: BookingPageProps) {
  const templatesOverride = await loadAvailabilityTemplates(180);
  const overrides = templatesOverride ? [] : await loadOverrides(180);

  const params = await Promise.resolve(searchParams ?? {});
  const estimatorId = getParam(params.estimator_id);
  const estimateMin = parseNumberParam(params.min);
  const estimateMax = parseNumberParam(params.max);

  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-16">
      <section className="py-10 md:py-14">
        <div className="rounded-[32px] border border-border/70 bg-[#fff7ed] p-6 md:p-10">
          <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Booking
              </p>
              <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
                Book din service nemt og hurtigt
              </h1>
              <p className="max-w-2xl text-base text-muted-foreground md:text-lg">
                Vælg dato og tidspunkt i kalenderen, så vi kan bekræfte tid og pris efter en kort
                vurdering. Vi arbejder kun med massiv træ.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild className="bg-primary text-white shadow-md hover:bg-primary/90">
                  <a href="#booking-flow">Book nu</a>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/bordpladeslibning/prisberegner">AI-prisberegner</Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link href="/akutte-tider">Akutte tider</Link>
                </Button>
              </div>
              <div className="rounded-2xl border border-orange-200 bg-white/80 px-4 py-3 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Akutte tider:</span> fast pris 3.000
                kr. de næste 14 dage, når der er ledige slots.
              </div>
            </div>
            <div className="relative">
              <BpsImage
                src={homeAssets.booking}
                alt="Bordpladeslibning i køkken"
                width={1600}
                height={900}
                className="h-full w-full rounded-3xl object-cover shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      <section id="booking-flow">
        <BookingWizard
          overrides={overrides}
          templatesOverride={templatesOverride ?? undefined}
          estimatorId={estimatorId || undefined}
          estimateMin={estimateMin}
          estimateMax={estimateMax}
        />
      </section>

      <section className="mt-6 rounded-2xl border border-border/70 bg-white/70 p-5 text-sm text-muted-foreground">
        <p>
          Se også
          <Link href="/akutte-tider" className="ml-1 font-semibold text-primary">
            akutte tider
          </Link>
          hvis du skal have en tid inden for 14 dage til fast pris.
        </p>
      </section>
    </main>
  );
}
