import Link from "next/link";

import { AcuteBooking } from "@/components/booking/AcuteBooking";
import { Button } from "@/components/ui/button";
import type { DayOverrideInput } from "@/lib/booking-schedule";
import { buildMetadata } from "@/lib/seo";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export const metadata = buildMetadata({
  title: "Akutte tider til bordpladeslibning",
  description:
    "Ledige akutte tider de næste 14 dage til fast pris 3.000 kr. Book hurtigt og se opdaterede slots i listevisning.",
  path: "/akutte-tider"
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

const DEFAULT_SETTINGS = {
  enabled: true,
  price: 3000,
  windowDays: 14
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
    return DEFAULT_SETTINGS;
  }

  const value = (data?.value || {}) as Partial<typeof DEFAULT_SETTINGS>;
  return {
    enabled: typeof value.enabled === "boolean" ? value.enabled : DEFAULT_SETTINGS.enabled,
    price: typeof value.price === "number" ? value.price : DEFAULT_SETTINGS.price,
    windowDays: typeof value.windowDays === "number" ? value.windowDays : DEFAULT_SETTINGS.windowDays
  };
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

export default async function AkutteTiderPage() {
  const settings = await loadAcuteSettings();
  const overrides = await loadOverrides(settings.windowDays);

  if (!settings.enabled) {
    return (
      <main className="mx-auto w-full max-w-5xl px-6 py-16">
        <section className="rounded-3xl border border-border/70 bg-white/70 p-6 md:p-10">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Akutte tider er ikke aktive lige nu
          </h1>
          <p className="mt-4 text-sm text-muted-foreground md:text-base">
            Kontakt os, hvis du har brug for en hurtig tid, så ser vi hvad der er muligt.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/kontakt">Kontakt</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/bordpladeslibning/book">Book almindelig tid</Link>
            </Button>
          </div>
        </section>
      </main>
    );
  }
  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-16">
      <section className="py-10 md:py-14">
        <div className="space-y-5 rounded-3xl border border-border/70 bg-white/70 p-6 md:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Akutte tider
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
            Akutte tider til bordpladeslibning (fast pris)
          </h1>
          <p className="max-w-3xl text-base text-muted-foreground md:text-lg">
            Ledige tider de næste {settings.windowDays} dage. Fast pris{" "}
            {settings.price.toLocaleString("da-DK")} kr. Hurtig booking under 1 minut.
          </p>
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="rounded-full border border-border px-3 py-1">Kun massiv træ</span>
            <span className="rounded-full border border-border px-3 py-1">
              Fast pris {settings.price.toLocaleString("da-DK")} kr.
            </span>
            <span className="rounded-full border border-border px-3 py-1">Svar hurtigt</span>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/bordpladeslibning/book">Book almindelig tid</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/bordpladeslibning/prisberegner">Få pris via billeder</Link>
            </Button>
          </div>
        </div>
      </section>

      <AcuteBooking
        overrides={overrides}
        price={settings.price}
        windowDays={settings.windowDays}
      />
    </main>
  );
}
