import Link from "next/link";

import { BpsImage } from "@/components/BpsImage";
import { Button } from "@/components/ui/button";
import { homeAssets } from "@/lib/assets";
import { siteConfig } from "@/lib/site-config";

const bullets = [
  "Professionel slibning der fjerner ridser og pletter",
  "Miljøvenlige olier der beskytter og fremhæver træet",
  "Afdækning og støvkontrol under arbejdet",
  "Fast pris uden skjulte omkostninger",
  "Alle typer massiv træ – eg, bøg, ask, valnød",
  "Grundig oprydning efter arbejdet"
];

const stats = [
  "Specialister siden 2009",
  "Miljøvenlige produkter",
  "2-4 timers arbejde",
  "2 års garanti"
];

export const SpecialistSection = () => {
  return (
    <section className="py-10 md:py-16">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="relative">
          <BpsImage
            src={homeAssets.specialist}
            alt="Bordpladeslibning i køkken"
            width={1600}
            height={900}
            className="h-full w-full rounded-3xl object-cover shadow-lg"
          />
          <div className="absolute left-4 top-4 rounded-2xl bg-white/90 px-4 py-3 text-sm font-semibold text-primary shadow-sm">
            15+ års erfaring
          </div>
        </div>
        <div className="space-y-5">
          <span className="inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Vores speciale
          </span>
          <h2 className="text-3xl font-semibold text-foreground md:text-4xl">
            Slibning og oliebehandling af træbordplader
          </h2>
          <p className="text-sm text-muted-foreground md:text-base">
            Vi giver køkken- og spiseborde nyt liv med professionel slibning og behandling. Vores
            arbejde handler om at bevare træets karakter og skabe en overflade, der kan holde til
            daglig brug – uden at du skal skifte hele bordpladen ud.
          </p>
          <p className="text-sm text-muted-foreground md:text-base">
            Før vi går i gang, vurderer vi trætype, tilstand og ønsket udtryk. Vi anbefaler typisk
            olie eller lak, fordi det giver den mest holdbare finish i køkkenet. Vi kan også lave
            sæbebehandling, men den er som regel bedst til bordplader med lavere belastning.
          </p>
          {siteConfig.showSvarSammeDag ? (
            <p className="text-sm text-muted-foreground md:text-base">
              Vi svarer typisk samme dag på billeder og spørgsmål, så du hurtigt kan tage næste skridt.
            </p>
          ) : null}
          <div className="grid gap-3 text-sm text-muted-foreground">
            {bullets.map((item) => (
              <div key={item} className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-primary" />
                <span>{item}</span>
              </div>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {stats.map((item) => (
              <div key={item} className="rounded-2xl border border-border/70 bg-white/80 px-4 py-3 text-xs font-semibold text-foreground">
                {item}
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/bordpladeslibning-sjaelland">Læs om bordpladeslibning</Link>
            </Button>
            <Link href="/bordpladeslibning/book" className="text-sm font-semibold text-primary">
              Book tid når det passer dig
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
