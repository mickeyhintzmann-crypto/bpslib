import Link from "next/link";

import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Maler på Sjælland | BPSLIB",
  description:
    "Indvendigt malerarbejde på Sjælland med fokus på forarbejde, finish og holdbarhed. Send billeder og opgavebeskrivelse via tilbudstid.",
  path: "/maler-sjaelland"
});

export default function MalerPage() {
  return (
    <PageShell title="Maler på Sjælland">
      <p>
        Beskriv din maleropgave kort, så vender vi tilbage med et tilbud. Vi vurderer omfang og
        timing, inden vi sætter pris.
      </p>
      <p>
        Du kan stadig komme i gang i dag: udfyld tilbudstiden med opgavens type og et par billeder,
        så kan vi vurdere omfang, forarbejde og give dig en tydelig plan for næste skridt. Vi
        hjælper også gerne med at afklare finish, glans og hvad der passer bedst til rummets brug.
      </p>

      <section className="space-y-3 pt-4">
        <h2 className="text-2xl font-semibold text-foreground">
          Malerarbejde på Sjælland – et resultat der holder i hverdagen
        </h2>
        <p>
          Et flot malerresultat handler ikke kun om farven. Det handler om underlaget, de rigtige
          lag og en afslutning der ser skarp ud i dagslys – også tæt på. Vi arbejder med fokus på
          helhedsindtryk og slidstyrke, så du får et resultat, der stadig ser ordentligt ud efter
          almindelig brug.
        </p>
      </section>

      <section className="space-y-3 pt-4">
        <h2 className="text-2xl font-semibold text-foreground">Opgaver vi typisk hjælper med</h2>
        <p>
          Du kan bruge listen her som pejlemærke. Hvis din opgave er en kombination, så beskriver
          du den bare samlet – så vurderer vi den som én opgave og planlægger den smart.
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Maling af vægge og lofter (indvendigt)</li>
          <li>Træværk: døre, karme, paneler og lister</li>
          <li>Udbedring af små skader, huller og ujævnheder før maling</li>
          <li>Opfriskning ved indflytning/fraflytning eller efter renovering</li>
          <li>Flere rum i etaper, så boligen stadig kan fungere imens</li>
        </ul>
      </section>

      <section className="space-y-3 pt-4">
        <h2 className="text-2xl font-semibold text-foreground">
          Forarbejde: det der afgør, om det bliver pænt
        </h2>
        <p>
          Mange malerprojekter bliver “okay” på afstand – men ujævnheder, samlinger og gamle
          reparationer ses tydeligt, når lyset rammer væggen. Derfor starter vi med at vurdere
          underlaget og anbefale den rigtige forberedelse. Det giver et roligt, ensartet udtryk og
          minimerer risikoen for at fejl træder frem bagefter.
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Spartling og slibning hvor det er nødvendigt</li>
          <li>Grunding når underlaget kræver det</li>
          <li>Afdækning og beskyttelse af gulve/kanter før vi går i gang</li>
        </ul>
      </section>

      <section className="space-y-3 pt-4">
        <h2 className="text-2xl font-semibold text-foreground">
          Farve, glans og finish – vi hjælper dig med at vælge rigtigt
        </h2>
        <p>
          Den samme farve kan opleves forskelligt alt efter glans og lys i rummet. Vi hjælper med
          at afklare, om du skal gå efter et mat, klassisk look eller en mere robust overflade i
          rum med mere slid. Målet er at ramme både udtryk og funktion – ikke bare en farvekode.
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Mat vs. mere vaskbar overflade (afhænger af rum og brug)</li>
          <li>Lysindfald og hvor “ro” du ønsker på fladerne</li>
          <li>Hvad der er praktisk i entré, køkken og børneværelser</li>
        </ul>
      </section>

      <section className="space-y-3 pt-4">
        <h2 className="text-2xl font-semibold text-foreground">
          Hvad påvirker prisen på en maleropgave?
        </h2>
        <p>
          Pris bestemmes primært af forarbejde og antal flader – ikke kun antal kvadratmeter. En
          væg kan være hurtig at male, men tidskrævende at gøre klar, hvis den er ujævn, har mange
          reparationer eller kræver ekstra behandling. Derfor giver vi altid pris baseret på
          opgavens reelle omfang.
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Underlagets stand (forarbejde kan være den største faktor)</li>
          <li>Antal rum, kanter og detaljer (lister, karme, radiatorer, nicher)</li>
          <li>Antal lag og krav til dækevne/farveskift</li>
          <li>Adgang og hvor hurtigt det skal udføres</li>
        </ul>
      </section>

      <section className="space-y-3 pt-4">
        <h2 className="text-2xl font-semibold text-foreground">
          Praktisk før vi kommer – så forløbet bliver glat
        </h2>
        <p>
          For at arbejde effektivt og levere et pænt resultat, aftaler vi på forhånd hvad der skal
          være fri adgang til, og om der er ting der bør flyttes. Hvis du vil, kan vi også planlægge
          i etaper, så du stadig kan bruge dele af boligen undervejs.
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Fri adgang til vægge/områder der skal males</li>
          <li>Aftale om møbler skal flyttes, eller om vi arbejder omkring dem</li>
          <li>Tydelig aftale om rækkefølge og tidsvinduer</li>
        </ul>
      </section>

      <section className="space-y-3 pt-4">
        <h2 className="text-2xl font-semibold text-foreground">Ofte stillede spørgsmål</h2>
        <div className="space-y-3">
          <p>
            <span className="font-semibold text-foreground">Kan I male flere rum over flere dage?</span>{" "}
            Ja. Vi kan planlægge som etaper, så det passer til adgang og hverdagen i boligen.
          </p>
          <p>
            <span className="font-semibold text-foreground">Skal jeg vælge farver på forhånd?</span>{" "}
            Du må gerne – men det er ikke et krav. Vi kan også hjælpe med at afklare farve og
            finish ud fra lys og brug.
          </p>
          <p>
            <span className="font-semibold text-foreground">Hvad er typisk den største prisdriver?</span>{" "}
            Forarbejde. Underlagets stand og hvor meget der skal udbedres før maling, betyder ofte
            mere end selve malingen.
          </p>
          <p>
            <span className="font-semibold text-foreground">Skal alt ryddes helt?</span> Ikke
            nødvendigvis. Vi aftaler det konkret. Nogle opgaver kræver fri adgang, andre kan løses
            med afdækning og planlægning.
          </p>
          <p>
            <span className="font-semibold text-foreground">Dækker I hele Sjælland?</span> Ja. Vi
            planlægger efter opgavens omfang og område, så du får en realistisk plan.
          </p>
        </div>
      </section>
      <div className="flex flex-wrap gap-3 pt-2">
        <Button asChild>
          <Link href="/tilbudstid">Få tilbud</Link>
        </Button>
      </div>
    </PageShell>
  );
}
