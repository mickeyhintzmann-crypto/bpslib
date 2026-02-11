import Link from "next/link";

import { BpsImage } from "@/components/BpsImage";
import { Button } from "@/components/ui/button";
import { CheckIcon } from "@/components/home/icons";
import { homeAssets } from "@/lib/assets";

const steps = [
  {
    title: "Send billeder",
    text: "Tag 3–6 billeder af bordpladen/køkkenet."
  },
  {
    title: "AI-vurdering",
    text: "AI-prisberegneren laver et første overslag."
  },
  {
    title: "Vi følger op",
    text: "Du får et realistisk prisoverslag og næste skridt."
  }
];

const perks = [
  "Gratis og uforpligtende",
  "Gennemsigtigt overslag",
  "Mulighed for anbefalet tid",
  "Afklaring af finish (olie/lak)"
];

export const PriceEstimatorPromo = () => {
  return (
    <section className="py-10 md:py-16">
      <div className="grid gap-10 rounded-3xl border border-border/70 bg-white/80 p-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-5">
          <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            AI-prisberegner
          </span>
          <h2 className="text-3xl font-semibold text-foreground md:text-4xl">
            Få et AI-overslag via billeder
          </h2>
          <p className="text-sm text-muted-foreground md:text-base">
            Vi bruger dine billeder til at vurdere mål, tilstand og finish. Normalprisen for en
            køkkenbordplade starter typisk ved 3.500 kr., mens små køkkener kan ligge omkring 3.000
            kr. Vi går ikke over 5.000 kr. for selve køkkenbordpladen – højere total skyldes ekstra
            elementer som spisebord, sofabord, vandfald eller vindueskarme.
          </p>
          <div className="grid gap-4">
            {steps.map((step) => (
              <div key={step.title} className="flex items-start gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary text-primary">
                  <CheckIcon className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{step.title}</p>
                  <p className="text-sm text-muted-foreground">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-border/70 bg-white/90 p-4">
            <div className="grid gap-2 text-sm text-muted-foreground">
              {perks.map((perk) => (
                <div key={perk} className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  <span>{perk}</span>
                </div>
              ))}
            </div>
          </div>
          <Button asChild>
            <Link href="/bordpladeslibning/prisberegner">Få AI-overslag via billeder</Link>
          </Button>
        </div>
        <div className="relative">
          <BpsImage
            src={homeAssets.estimator}
            alt="AI-prisberegner eksempel"
            width={1600}
            height={900}
            className="h-full w-full rounded-3xl object-cover shadow-xl"
          />
          <div className="absolute right-4 top-4 rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-white">
            Fra 3.000 kr.
          </div>
          <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-white/90 p-4 shadow-sm">
            <p className="text-xs text-muted-foreground">Estimeret pris</p>
            <p className="text-2xl font-semibold text-foreground">3.500 kr.</p>
            <p className="text-xs text-muted-foreground">
              Små køkkener kan lande omkring 3.000 kr. Akutte tider er fast 3.000 kr.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
