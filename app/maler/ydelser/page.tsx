import Link from "next/link";

import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Maler ydelser | Sjælland | BPSLIB",
  description: "Se maler ydelser på Sjælland. Book uforpligtende tilbudstid eller kontakt os.",
  path: "/maler/ydelser"
});

export default function MalerYdelserPage() {
  return (
    <PageShell title="Maler ydelser">
      <p>
        Her finder du et kort overblik over maleropgaver vi hjælper med på Sjælland. Vi arbejder som
        lead-gen i MVP og vender hurtigt tilbage med et uforpligtende tilbud. Læs også om{" "}
        <Link href="/maler-sjaelland" className="font-medium text-foreground hover:text-primary">
          maler på Sjælland
        </Link>
        .
      </p>

      <section className="rounded-3xl border border-border/70 bg-white/70 p-6">
        <h2 className="text-2xl font-semibold text-foreground">Indvendig maling</h2>
        <p className="mt-3 text-sm text-muted-foreground md:text-base">
          Vi maler vægge og lofter med fokus på ensartet dækning og et roligt finish. Det gælder både
          enkeltværelser og større boligforløb. Vi hjælper med farverådgivning og vurderer underlaget
          før opstart, så resultatet holder længere. Typisk indgår afdækning, reparation af mindre
          ujævnheder og præcis finish omkring kanter og overgange.
        </p>
      </section>

      <section className="rounded-3xl border border-border/70 bg-white/70 p-6">
        <h2 className="text-2xl font-semibold text-foreground">Udvendig maling</h2>
        <p className="mt-3 text-sm text-muted-foreground md:text-base">
          Udvendig maling handler om beskyttelse mod vejr og vind. Vi arbejder med træværk, facader og
          detaljer hvor det giver mening, og vurderer altid tilstanden før vi går i gang. Vi hjælper
          med klargøring, rengøring og de rette produkter, så overfladen holder sig pæn længere og
          kræver mindre vedligehold.
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
        <h2 className="text-2xl font-semibold text-foreground">Spartling og forarbejde</h2>
        <p className="mt-3 text-sm text-muted-foreground md:text-base">
          Et godt resultat starter med forarbejdet. Vi spartler huller, ujævnheder og revner, sliber
          overflader og sørger for korrekt grunding. Det gør malingens dækkeevne bedre og sikrer en
          jævn finish. Vi rådgiver om, hvad der kan klares med let forarbejde, og hvornår der kræves
          mere grundig opretning.
        </p>
      </section>

      <section className="rounded-3xl border border-border/70 bg-white/70 p-6">
        <h2 className="text-2xl font-semibold text-foreground">Flyttelejlighed og klargøring</h2>
        <p className="mt-3 text-sm text-muted-foreground md:text-base">
          Når en bolig skal klargøres til ind- eller udflytning, hjælper vi med hurtige og pæne
          overflader. Fokus er effektivt flow, rene kanter og en ensartet farve, så boligen fremstår
          præsentabel. Vi tilpasser omfanget til tiden og budgettet og sørger for, at de vigtigste rum
          prioriteres.
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
        <h2 className="text-2xl font-semibold text-foreground">Træværk, døre og lister</h2>
        <p className="mt-3 text-sm text-muted-foreground md:text-base">
          Maling af træværk kræver præcision for at få et ensartet resultat. Vi hjælper med døre,
          karme, lister og paneler, herunder let slibning og grunding. Det giver en pæn kontrast og
          et gennemført udtryk i rummet. Vi rådgiver om glans og slidstyrke, så overfladen passer til
          hverdagens brug.
        </p>
      </section>

      <section className="rounded-3xl border border-border/70 bg-white/70 p-6">
        <h2 className="text-2xl font-semibold text-foreground">Facade og udendørs flader</h2>
        <p className="mt-3 text-sm text-muted-foreground md:text-base">
          Facader og udendørs flader kræver korrekt behandling for at holde sig pæne. Vi vurderer
          underlaget, renser om nødvendigt og vælger produkter, der passer til materialet. Fokus er
          på holdbarhed og et ensartet udtryk. Ved større opgaver hjælper vi også med planlægning og
          prioritering, så arbejdet passer til sæsonen.
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
        Har du en opgave der også kræver andre fag? Se vores samlede{" "}
        <Link href="/ydelser" className="font-medium text-foreground hover:text-primary">
          ydelser
        </Link>
        , og kig gerne på vores{" "}
        <Link href="/cases" className="font-medium text-foreground hover:text-primary">
          cases
        </Link>
        .
      </p>
    </PageShell>
  );
}
