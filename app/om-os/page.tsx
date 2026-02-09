import Link from "next/link";

import { BpsImage } from "@/components/BpsImage";
import { FaqSection } from "@/components/bordplade/FaqSection";
import {
  StructuredData,
  buildFaqSchema,
  buildLocalBusinessSchema
} from "@/components/seo/StructuredData";
import { Button } from "@/components/ui/button";
import { assets, homeAssets } from "@/lib/assets";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site-config";
import { getSiteUrl } from "@/lib/site-url";

export const metadata = buildMetadata({
  title: "Om BP Slib | Bordpladeslibning (massiv træ) på Sjælland",
  description:
    "Lær BP Slib at kende: 15+ års erfaring, 2.200+ projekter på Sjælland og bordplader der kan få 5–10 år ekstra levetid. Få pris via billeder.",
  path: "/om-os"
});

const stats = [
  {
    value: "15+ år",
    label: "Håndværkserfaring",
    note: "Bordplader i massiv træ"
  },
  {
    value: "2.200+",
    label: "Projekter på Sjælland",
    note: "Dokumenteret gennemført"
  },
  {
    value: "5–10 år",
    label: "Ekstra levetid",
    note: "Ved professionel slibning"
  },
  {
    value: "20–40%",
    label: "Typisk af ny pris",
    note: "Ofte et bedre alternativ"
  }
];

const values = [
  {
    title: "Håndværk og finish",
    body:
      "Vi arbejder i flere slibetrin og vælger finish, der passer til brug og forventninger – uden at love mere end materialet kan holde."
  },
  {
    title: "Rådgivning der er til at forstå",
    body:
      "Du får et roligt overblik over pris, tid og finish, så du kan træffe en beslutning uden overraskelser."
  },
  {
    title: "Respekt for hjemmet",
    body:
      "Vi afdækker og arbejder støvbevidst, så din hverdag kan fungere. Detaljerne er vigtige, men vi lover ikke det umulige."
  }
];

const serviceLinks = [
  { href: "/bordpladeslibning-sjaelland", label: "Bordpladeslibning på Sjælland" },
  { href: "/bordpladeslibning/pris", label: "Prisguide" },
  { href: "/bordpladeslibning/skjolder", label: "Skjolder og pletter" },
  { href: "/bordpladeslibning/ridser", label: "Ridser og hakker" },
  { href: "/bordpladeslibning/olie-eller-lak", label: "Olie eller lak" },
  { href: "/akutte-tider", label: "Akutte tider" }
];

const areaLinks = [
  { href: "/bordpladeslibning-koebenhavn-omegn", label: "København & omegn" },
  { href: "/bordpladeslibning-frederiksberg", label: "Frederiksberg" },
  { href: "/bordpladeslibning-roskilde", label: "Roskilde" },
  { href: "/bordpladeslibning-koege", label: "Køge" },
  { href: "/bordpladeslibning-naestved", label: "Næstved" },
  { href: "/bordpladeslibning-slagelse", label: "Slagelse" },
  { href: "/bordpladeslibning-holbaek", label: "Holbæk" },
  { href: "/bordpladeslibning-hilleroed", label: "Hillerød" }
];

const faqItems = [
  {
    question: "Hvor kører I henne?",
    answer:
      "Vi dækker hele Sjælland. Du kan se alle områder og byer vi kører i på områdesiden for bordpladeslibning."
  },
  {
    question: "Sliber I alle bordplader?",
    answer:
      "Vi sliber kun massive træbordplader. Hvis du er i tvivl om materialet, kan du sende et billede af kanten/enden."
  },
  {
    question: "Olie eller lak – hvad anbefaler I?",
    answer:
      "Det afhænger af brug, udtryk og vedligehold. Vi hjælper dig med at vælge mellem olie og lak ud fra dine behov."
  },
  {
    question: "Hvor lang tid tager det?",
    answer:
      "Mindre opgaver kan ofte klares på et enkelt slot, mens større bordplader kan kræve 2–3 slots."
  },
  {
    question: "Hvordan får jeg en pris?",
    answer:
      "Upload 3–6 billeder via prisberegneren, så får du et prisestimat og en anbefalet plan."
  },
  {
    question: "Hvad betyder “afventer bekræftelse/pris”?",
    answer:
      "Ved almindelig booking bekræfter vi først, når vi har vurderet billeder og omfang. Akutte tider bekræftes med det samme."
  }
];

export default function OmOsPage() {
  const localBusinessSchema = buildLocalBusinessSchema({
    name: siteConfig.companyName,
    description:
      "BP Slib udfører bordpladeslibning i massiv træ på Sjælland med fokus på kvalitet, tydelig kommunikation og stabile resultater.",
    url: `${getSiteUrl()}/om-os`,
    telephone: siteConfig.phone,
    email: siteConfig.email,
    areaServed: siteConfig.serviceArea,
    openingHours: [`Mo-Fr ${siteConfig.openingHours.weekdays}`]
  });

  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-16 pt-12">
      <section className="rounded-3xl border border-border/70 bg-white/75 p-6 md:p-10">
        <div className="grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div className="space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Om BP Slib</p>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
              Om BP Slib
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
              Vi er specialister i bordpladeslibning af massiv træ og hjælper kunder over hele{" "}
              {siteConfig.serviceArea} med at give køkkenbordplader nyt liv. Vi tager os tid til at
              forklare processen, så du ved, hvad du kan forvente – fra første billede til sidste olie.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/bordpladeslibning/prisberegner">Få pris via billeder</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/bordpladeslibning/book">Book tid</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href="/cases">Se vores cases</Link>
              </Button>
            </div>
          </div>
          <div className="overflow-hidden rounded-3xl border border-border/70 bg-muted/40">
            <BpsImage
              src={homeAssets.about}
              alt="Bordpladeslibning udføres i køkkenmiljø"
              width={1200}
              height={800}
              className="h-full w-full object-cover"
              priority
            />
          </div>
        </div>
      </section>

      <section className="py-12">
        <h2 className="text-2xl font-semibold text-foreground">Tal der betyder noget</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Resultaterne afhænger altid af bordpladens stand, størrelse og ønsket finish.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-border/70 bg-white/70 p-5">
              <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
              <p className="mt-1 text-sm font-medium text-foreground">{stat.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">{stat.note}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-8 md:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4 rounded-3xl border border-border/70 bg-white/75 p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-foreground">Hvem vi er</h2>
          <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
            BP Slib er et håndværksdrevet team, der arbejder med træ som levende materiale. Vi
            brænder for at bevare massive bordplader i stedet for at udskifte dem, fordi den rette
            slibning og behandling kan give 5–10 år ekstra levetid. Vores tilgang er praktisk og
            jordnær: Vi vurderer det, du har, og fortæller ærligt, hvad der kan reddes – og hvad der
            ikke kan. Det giver dig tryghed, når du skal vælge mellem olie, lak eller en mere
            slidstærk løsning.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
            Vi dækker hele {siteConfig.serviceArea}, og{" "}
            {siteConfig.showSvarSammeDag ? "svar samme dag" : "svarer hurtigt"} på henvendelser,
            så du ikke står og venter. Det betyder også, at vi tager højde for din kalender og hjælper
            med at vælge det rette tidsforløb.
          </p>
        </div>
        <div className="grid gap-4">
          {values.map((value) => (
            <div key={value.title} className="rounded-2xl border border-border/70 bg-white/75 p-5">
              <h3 className="text-base font-semibold text-foreground">{value.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{value.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Hvad vi laver</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Bordpladeslibning er vores kerne. Her er de vigtigste indgange.
            </p>
          </div>
          <Link href="/bordpladeslibning/omraader" className="text-sm font-semibold text-primary">
            Se alle områder
          </Link>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {serviceLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-2xl border border-border/70 bg-white/70 p-5 text-sm font-semibold text-foreground transition hover:border-primary/60"
            >
              {item.label}
            </Link>
          ))}
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Vi hjælper også med gulv, tømrer, maler og mureropgaver via{" "}
          <Link href="/tilbudstid" className="font-semibold text-primary">
            uforpligtende tilbudstid
          </Link>
          .
        </p>
      </section>

      <section className="rounded-3xl border border-border/70 bg-white/75 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Sådan arbejder vi</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { title: "1. Upload billeder", body: "Send 3–6 billeder og en kort beskrivelse." },
            { title: "2. Vurdering + pris", body: "Vi giver et ærligt prisestimat og anbefaling." },
            { title: "3. Udførelse", body: "Vi kommer ud og sliber bordpladen i aftalt slot." },
            { title: "4. Pleje og råd", body: "Vi guider dig i vedligehold efter arbejdet." }
          ].map((step) => (
            <div key={step.title} className="rounded-2xl border border-border/70 bg-white/70 p-5">
              <h3 className="text-base font-semibold text-foreground">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-12">
        <h2 className="text-2xl font-semibold text-foreground">Serviceområde</h2>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Vi kører på hele {siteConfig.serviceArea} og planlægger opgaver ud fra omfang og
          tilgængelighed. De mest efterspurgte områder er:
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm text-muted-foreground">
          {areaLinks.map((area) => (
            <Link key={area.href} href={area.href} className="rounded-full border border-border px-3 py-1">
              {area.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-border/70 bg-primary/5 p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-foreground">Kun massiv træ</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Vi sliber kun massive træbordplader. Er du i tvivl om materialet, så send et billede af
              kanten/enden, så vurderer vi det hurtigt.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link href="/bordpladeslibning/kan-det-slibes">Kan det slibes?</Link>
            </Button>
            <Button asChild>
              <Link href="/bordpladeslibning/prisberegner">Få vurdering via billeder</Link>
            </Button>
          </div>
        </div>
      </section>

      <FaqSection items={faqItems} />

      <section className="rounded-3xl border border-border/70 bg-white/75 p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-foreground">Klar til et roligt næste skridt?</h2>
            <p className="text-sm text-muted-foreground">
              Få et overslag via billeder eller kontakt os direkte. Vi vender hurtigt tilbage.
            </p>
            <div className="text-sm text-muted-foreground">
              <p>
                Telefon:{" "}
                <a className="font-semibold text-foreground" href={`tel:${siteConfig.phone}`}>
                  {siteConfig.phoneDisplay}
                </a>
              </p>
              <p>
                Email:{" "}
                <a className="font-semibold text-foreground" href={`mailto:${siteConfig.email}`}>
                  {siteConfig.email}
                </a>
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/bordpladeslibning/prisberegner">Få et overslag via billeder</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/kontakt">Kontakt os</Link>
            </Button>
          </div>
        </div>
      </section>

      <StructuredData data={localBusinessSchema} />
      <StructuredData data={buildFaqSchema(faqItems)} />
    </main>
  );
}
