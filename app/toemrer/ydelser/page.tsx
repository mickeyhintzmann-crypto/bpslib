import Link from "next/link";

import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Tømrer ydelser | Sjælland | BPSLIB",
  description: "Se tømrer ydelser på Sjælland. Book uforpligtende tilbudstid eller kontakt os.",
  path: "/toemrer/ydelser"
});

export default function ToemrerYdelserPage() {
  return (
    <PageShell title="Tømrer ydelser">
      <p>
        Her får du et hurtigt overblik over de tømreropgaver vi hjælper med på Sjælland. Vi arbejder
        som lead-gen i MVP og vender hurtigt tilbage med et uforpligtende tilbud. Læs også om{" "}
        <Link href="/toemrer-sjaelland" className="font-medium text-foreground hover:text-primary">
          tømrer på Sjælland
        </Link>
        .
      </p>

      <section className="rounded-3xl border border-border/70 bg-white/70 p-6">
        <h2 className="text-2xl font-semibold text-foreground">Terrasse og udendørs træarbejde</h2>
        <p className="mt-3 text-sm text-muted-foreground md:text-base">
          Vi hjælper med mindre terrasseprojekter, udskiftning af brædder og reparationer af
          udendørs træværk. Fokus er holdbarhed, korrekt afstand mellem brædder og en finish der
          passer til huset. Vi rådgiver om behandling, så træet holder længere og ser ensartet ud.
        </p>
      </section>

      <section className="rounded-3xl border border-border/70 bg-white/70 p-6">
        <h2 className="text-2xl font-semibold text-foreground">Tag og tagreparation</h2>
        <p className="mt-3 text-sm text-muted-foreground md:text-base">
          Små tagreparationer, udskiftning af enkelte elementer og forbedring af detaljer omkring
          inddækninger kan ofte løses uden en total udskiftning. Vi vurderer omfanget og giver et
          ærligt bud på, hvad der kan betale sig i den konkrete opgave.
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
        <h2 className="text-2xl font-semibold text-foreground">Døre og vinduer</h2>
        <p className="mt-3 text-sm text-muted-foreground md:text-base">
          Vi hjælper med justering, udskiftning eller reparation af døre og vinduer, så de lukker tæt
          og fungerer optimalt. Det kan være udskiftning af hængsler, nye karme eller tætning mod
          træk. Vi anbefaler løsninger der passer til boligen og energiforbruget.
        </p>
      </section>

      <section className="rounded-3xl border border-border/70 bg-white/70 p-6">
        <h2 className="text-2xl font-semibold text-foreground">Gulve og lister</h2>
        <p className="mt-3 text-sm text-muted-foreground md:text-base">
          Vi lægger mindre gulvarealer, udfører reparationer og monterer lister og afslutninger.
          Det giver en pæn overgang mellem væg og gulv og et roligt helhedsudtryk. Vi hjælper med
          opmåling og materialevalg, så resultatet bliver ensartet.
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
        <h2 className="text-2xl font-semibold text-foreground">Vægge og lofter (gips)</h2>
        <p className="mt-3 text-sm text-muted-foreground md:text-base">
          Opsætning af gipsvægge og lofter kan give nye rum og bedre akustik. Vi hjælper med mindre
          ombygninger, nedhængte lofter og klargøring til efterfølgende malerarbejde. Vi sørger for
          en pæn finish og stabile konstruktioner.
        </p>
      </section>

      <section className="rounded-3xl border border-border/70 bg-white/70 p-6">
        <h2 className="text-2xl font-semibold text-foreground">Køkkenmontage</h2>
        <p className="mt-3 text-sm text-muted-foreground md:text-base">
          Vi hjælper med montering og justering af køkkenelementer, tilpasning af fronter og
          opretning, så linjerne står skarpt. Det inkluderer opmåling og dialog om eventuelle
          tilpasninger ved vægge og gulv, så helheden ser professionel ud.
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
        Har du en kombineret opgave med flere fag? Se alle{" "}
        <Link href="/ydelser" className="font-medium text-foreground hover:text-primary">
          ydelser
        </Link>
        , eller kontakt os direkte, så hjælper vi dig videre.
      </p>
    </PageShell>
  );
}
