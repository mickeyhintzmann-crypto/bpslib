import Link from "next/link";

import { BpsImage } from "@/components/BpsImage";
import { Button } from "@/components/ui/button";
import { CheckIcon } from "@/components/home/icons";
import { CONTACT_PHONE_DISPLAY, CONTACT_TEL_HREF } from "@/lib/contact";

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

const estimatorPreviewImages = [
  {
    src: "/media/featured%3Abordplade/case-001-egetrae-natur-olie-1-v3.jpg",
    alt: "Køkkenbordplade i massiv træ, vinkel 1"
  },
  {
    src: "/media/featured%3Abordplade/case-001-egetrae-natur-olie-2-v3.jpg",
    alt: "Køkkenbordplade i massiv træ, vinkel 2"
  }
] as const;

export const PriceEstimatorPromo = () => {
  return (
    <section className="py-9 md:py-12">
      <div className="surface-panel grid gap-10 rounded-[30px] p-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-5">
          <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            AI-prisberegner · kun bordplader
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
              <div key={step.title} className="surface-subtle flex items-start gap-4 rounded-2xl p-3.5">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-border/70 bg-white text-primary">
                  <CheckIcon className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{step.title}</p>
                  <p className="text-sm text-muted-foreground">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="surface-subtle rounded-2xl p-4">
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
          <div className="rounded-2xl border border-border/80 bg-white/75 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Kommer snart</p>
            <p className="mt-1 text-base font-semibold text-foreground">
              AI-prisberegning til gulvafslibning er på vej
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Indtil den er live, hjælper vi med manuel prisvurdering ud fra m², billeder og opgavens
              detaljer.
            </p>
            <a
              href={CONTACT_TEL_HREF}
              className="mt-3 inline-flex text-sm font-semibold text-primary underline-offset-4 hover:underline"
            >
              Ring for pris: {CONTACT_PHONE_DISPLAY}
            </a>
          </div>
        </div>
        <div className="overflow-hidden rounded-3xl bg-neutral-950/5 p-2 shadow-xl">
          <div className="relative">
            <div className="grid gap-3">
              {estimatorPreviewImages.map((image) => (
                <BpsImage
                  key={image.src}
                  src={image.src}
                  alt={image.alt}
                  width={1200}
                  height={760}
                  className="h-[220px] w-full rounded-2xl object-cover sm:h-[250px] lg:h-[295px]"
                />
              ))}
            </div>
            <div className="absolute right-4 top-4 rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-white">
              Fra 3.000 kr.
            </div>
          </div>
          <div className="mt-3 rounded-2xl bg-white/90 p-4 shadow-sm">
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
