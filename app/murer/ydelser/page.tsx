import Link from "next/link";

import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Murer ydelser | Sjælland | BPSLIB",
  description: "Se murer ydelser på Sjælland. Book uforpligtende tilbudstid eller kontakt os.",
  path: "/murer/ydelser"
});

export default function MurerYdelserPage() {
  return (
    <PageShell title="Murer ydelser">
      <p>
        Her er et kort overblik over mureropgaver vi hjælper med på Sjælland. Vi arbejder som
        lead-gen i MVP og vender hurtigt tilbage med et uforpligtende tilbud. Læs også om{" "}
        <Link href="/murer-sjaelland" className="font-medium text-foreground hover:text-primary">
          murer på Sjælland
        </Link>
        .
      </p>

      <section className="rounded-3xl border border-border/70 bg-white/70 p-6">
        <h2 className="text-2xl font-semibold text-foreground">Omfugning og fugereparation</h2>
        <p className="mt-3 text-sm text-muted-foreground md:text-base">
          Slidte fuger kan give fugt og kuldebroer. Vi hjælper med udkradsning og omfugning, så
          murværket igen står stabilt og tæt. Vi vurderer omfanget og foreslår en løsning der passer
          til bygningens alder og udtryk. Resultatet er et pænere look og bedre holdbarhed.
        </p>
      </section>

      <section className="rounded-3xl border border-border/70 bg-white/70 p-6">
        <h2 className="text-2xl font-semibold text-foreground">Pudsning og reparation af murværk</h2>
        <p className="mt-3 text-sm text-muted-foreground md:text-base">
          Revner, afskalninger og ujævnheder i murværk kan ofte udbedres med korrekt pudsning og
          reparation. Vi klargør overfladen, reparerer skader og sikrer en jævn finish. Fokus er på
          holdbarhed og et udtryk der matcher resten af bygningen.
        </p>
      </section>

      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/tilbudstid">Book uforpligtende tilbudstid</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/kontakt">Kontakt os</Link>
        </Button>
      </div>

      <section className="rounded-3xl border border-border/70 bg-white/70 p-6">
        <h2 className="text-2xl font-semibold text-foreground">Fliser og klinker</h2>
        <p className="mt-3 text-sm text-muted-foreground md:text-base">
          Vi hjælper med mindre flise- og klinkearbejder, typisk i køkken, bryggers eller mindre
          badeområder. Vi rådgiver om mønster, fuge og materialevalg, så det passer til rummet. Fokus
          er på præcision og pæne afslutninger.
        </p>
      </section>

      <section className="rounded-3xl border border-border/70 bg-white/70 p-6">
        <h2 className="text-2xl font-semibold text-foreground">Sokkel og facadereparation</h2>
        <p className="mt-3 text-sm text-muted-foreground md:text-base">
          Skader i sokkel og facade kan forværres over tid. Vi udbedrer revner, småskader og
          afskalninger, så huset får en bedre beskyttelse mod vejr og fugt. Vi tilpasser materialer og
          farver, så reparationen matcher eksisterende udtryk.
        </p>
      </section>

      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/tilbudstid">Book uforpligtende tilbudstid</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/kontakt">Kontakt os</Link>
        </Button>
      </div>

      <section className="rounded-3xl border border-border/70 bg-white/70 p-6">
        <h2 className="text-2xl font-semibold text-foreground">Små mureropgaver</h2>
        <p className="mt-3 text-sm text-muted-foreground md:text-base">
          Vi hjælper med mindre reparationer og forbedringer, fx udskiftning af enkelte sten,
          udbedring af skader ved vinduer eller opfriskning af mindre murflader. Det er ofte små
          indgreb der kan gøre en stor forskel for helhedsindtrykket.
        </p>
      </section>

      <section className="rounded-3xl border border-border/70 bg-white/70 p-6">
        <h2 className="text-2xl font-semibold text-foreground">Klinker i køkken og bad</h2>
        <p className="mt-3 text-sm text-muted-foreground md:text-base">
          Vi lægger klinker i mindre områder, fx stænkzoner eller gulvfelter i køkken og bad. Vi
          fokuserer på korrekt fald, pæne afslutninger og en fuge der matcher resten af rummet.
          Arbejdet planlægges, så det forstyrrer hverdagen mindst muligt.
        </p>
      </section>

      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/tilbudstid">Book uforpligtende tilbudstid</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/kontakt">Kontakt os</Link>
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        Har du en opgave der kræver andre fag? Se alle{" "}
        <Link href="/ydelser" className="font-medium text-foreground hover:text-primary">
          ydelser
        </Link>
        , eller kig på vores{" "}
        <Link href="/cases" className="font-medium text-foreground hover:text-primary">
          cases
        </Link>
        .
      </p>
    </PageShell>
  );
}
