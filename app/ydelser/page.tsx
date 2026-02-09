import Link from "next/link";

import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Ydelser | Gulv, tømrer, maler og murer | BPSLIB",
  description:
    "Se ydelser: gulvafslibning, tømrer, maler og murer. Book uforpligtende tilbudstid eller kontakt os.",
  path: "/ydelser"
});

export default function YdelserPage() {
  return (
    <PageShell title="Ydelser">
      <p>
        Vi har primært fokus på bordplader, men hjælper også med udvalgte fag gennem tilbudstid.
        Du får et uforpligtende tilbud og et hurtigt overblik over næste skridt. Se gerne vores{" "}
        <Link href="/cases" className="font-medium text-foreground hover:text-primary">
          cases
        </Link>
        , og kontakt os hvis du er i tvivl om opgavens omfang.
      </p>

      <section className="rounded-3xl border border-border/70 bg-white/70 p-6">
        <h2 className="text-2xl font-semibold text-foreground">Gulvafslibning</h2>
        <p className="mt-2 text-sm text-muted-foreground md:text-base">
          Vi dækker hele{" "}
          <Link
            href="/gulvafslibning-sjaelland"
            className="font-medium text-foreground hover:text-primary"
          >
            Sjælland
          </Link>
          , og du kan læse om pris og forløb på vores{" "}
          <Link
            href="/gulvafslibning/pris"
            className="font-medium text-foreground hover:text-primary"
          >
            pris-side
          </Link>
          .
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          <li>Gulvslibning og opfriskning af træ- og parketgulve</li>
          <li>Afhøvling ved dybe skader og ujævnheder</li>
          <li>Behandling med lak, olie eller sæbe</li>
          <li>Udbedring af ridser, mærker og pletter</li>
          <li>Let farvejustering og mat/glans-tilpasning</li>
          <li>Rådgivning om vedligehold efter behandlingen</li>
        </ul>
      </section>

      <section className="rounded-3xl border border-border/70 bg-white/70 p-6">
        <h2 className="text-2xl font-semibold text-foreground">Tømrer</h2>
        <p className="mt-2 text-sm text-muted-foreground md:text-base">
          Tømreropgaver håndteres som lead-gen. Læs mere om{" "}
          <Link
            href="/toemrer-sjaelland"
            className="font-medium text-foreground hover:text-primary"
          >
            tømrer på Sjælland
          </Link>
          .
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          <li>Mindre renoveringer og tilpasninger</li>
          <li>Opsætning af lister, karme og døre</li>
          <li>Reparation af træværk og inventar</li>
          <li>Montering og justering af køkkenelementer</li>
          <li>Terrasse- og trappeopgaver i mindre omfang</li>
          <li>Indvendige vægge og gipsarbejde</li>
        </ul>
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
        <h2 className="text-2xl font-semibold text-foreground">Maler</h2>
        <p className="mt-2 text-sm text-muted-foreground md:text-base">
          Vi hjælper med maleropgaver via tilbudstid. Læs mere om{" "}
          <Link
            href="/maler-sjaelland"
            className="font-medium text-foreground hover:text-primary"
          >
            maler på Sjælland
          </Link>
          .
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          <li>Indvendig maling af vægge og lofter</li>
          <li>Spartling og klargøring før maling</li>
          <li>Maling af træværk, døre og paneler</li>
          <li>Let facade- og udendørs opfriskning</li>
          <li>Farverådgivning til rum og overflader</li>
          <li>Reparation af mindre skader i overflader</li>
        </ul>
      </section>

      <section className="rounded-3xl border border-border/70 bg-white/70 p-6">
        <h2 className="text-2xl font-semibold text-foreground">Murer</h2>
        <p className="mt-2 text-sm text-muted-foreground md:text-base">
          Mureropgaver håndteres som lead-gen. Læs mere om{" "}
          <Link
            href="/murer-sjaelland"
            className="font-medium text-foreground hover:text-primary"
          >
            murer på Sjælland
          </Link>
          .
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          <li>Reparation af murværk og puds</li>
          <li>Fugning og mindre omfugninger</li>
          <li>Opsætning af fliser i mindre områder</li>
          <li>Reparation af revner og skader</li>
          <li>Små opgaver i køkken og bad</li>
          <li>Rådgivning om materialer og finish</li>
        </ul>
      </section>

      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/tilbudstid">Book uforpligtende tilbudstid</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/kontakt">Kontakt os</Link>
        </Button>
      </div>
    </PageShell>
  );
}
