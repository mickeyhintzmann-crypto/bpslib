import Link from "next/link";

import { Button } from "@/components/ui/button";
import { buildMetadata } from "@/lib/seo";

export const metadata = {
  ...buildMetadata({
    title: "Tak for din vurdering",
    description:
      "Tak for din prisforespørgsel. Vi har modtaget billederne og vender hurtigt tilbage med vurdering.",
    path: "/bordpladeslibning/prisberegner/tak"
  }),
  robots: {
    index: false,
    follow: false,
    nocache: true
  }
};

type TakPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
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

export default function PrisberegnerTakPage({ searchParams }: TakPageProps) {
  const params = searchParams ?? {};
  const id = getParam(params.id);
  const min = getParam(params.min);
  const max = getParam(params.max);
  const status = getParam(params.status);

  const minValue = min && /^\d+$/.test(min) ? Number.parseInt(min, 10) : null;
  const maxValue = max && /^\d+$/.test(max) ? Number.parseInt(max, 10) : null;
  const hasEstimate = minValue !== null && maxValue !== null && minValue <= maxValue;

  const bookingParams = new URLSearchParams();
  if (id) bookingParams.set("estimator_id", id);
  if (minValue !== null) bookingParams.set("min", String(minValue));
  if (maxValue !== null) bookingParams.set("max", String(maxValue));

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-16">
      <section className="space-y-5 rounded-3xl border border-border/70 bg-white/70 p-6 md:p-10">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          Tak - vi har modtaget dine billeder
        </h1>
        {hasEstimate ? (
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4">
            <p className="text-sm font-semibold text-foreground">Dit AI-prisestimat</p>
            <p className="mt-2 text-2xl font-semibold text-primary">
              {minValue}–{maxValue} kr.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Prisen gælder først efter bookingbekræftelse. Vi kontakter dig hurtigt, hvis der er
              spørgsmål til opgaven.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-border/70 bg-white/70 p-4 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">Kunne ikke beregnes</p>
            <p className="mt-2">
              Du modtager pris fra en medarbejder hurtigst muligt. Vi kontakter dig på telefonen.
            </p>
          </div>
        )}
        {status && status !== "estimated" ? (
          <p className="text-sm text-muted-foreground">
            Status: {status === "manual" ? "Manuel vurdering" : status}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href={`/bordpladeslibning/book?${bookingParams.toString()}`}>Book tid</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/bordpladeslibning/pris">Se prisguide</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/kontakt">Ring mig op</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
