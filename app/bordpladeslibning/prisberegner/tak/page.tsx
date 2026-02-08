import Link from "next/link";

import { Button } from "@/components/ui/button";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Tak for din vurdering",
  description:
    "Tak for din prisforespørgsel. Vi har modtaget billederne og vender hurtigt tilbage med vurdering.",
  path: "/bordpladeslibning/prisberegner/tak"
});

export default function PrisberegnerTakPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-16">
      <section className="space-y-5 rounded-3xl border border-border/70 bg-white/70 p-6 md:p-10">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          Tak - vi har modtaget dine billeder
        </h1>
        <p className="text-sm text-muted-foreground md:text-base">
          Vi vender tilbage hurtigst muligt med vurdering af opgaven og forslag til næste skridt.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/bordpladeslibning/book">Book tid</Link>
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
