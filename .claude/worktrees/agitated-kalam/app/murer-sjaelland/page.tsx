import Link from "next/link";

import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Murer på Sjælland | BPSLIB",
  description:
    "Murerarbejde på Sjælland med fokus på holdbarhed, underlag og pæne afslutninger. Send billeder og opgavebeskrivelse — få et konkret forslag.",
  path: "/murer-sjaelland"
});

export default function MurerPage() {
  return (
    <PageShell title="Murer på Sjælland">
      <p>
        Vi tager imod mureropgaver via tilbudstid. Send en kort beskrivelse, så vender vi tilbage
        med et tilbud.
      </p>
      <p>
        Du kan stadig starte processen med det samme: send en kort beskrivelse af opgaven (gerne
        med 3–6 billeder), så vurderer vi omfang, materialer og det praktiske. Derefter får du et
        konkret forslag til løsning og næste skridt.
      </p>

      <section className="space-y-3 pt-4">
        <h2 className="text-2xl font-semibold text-foreground">
          Murer på Sjælland – når det skal være solidt og pænt afsluttet
        </h2>
        <p>
          Murerarbejde ses med det samme, når det er udført ordentligt – og endnu tydeligere, når
          det ikke er. Vi løser opgaver, hvor du vil have en holdbar løsning med rene linjer,
          skarpe kanter og en finish, der passer ind i boligen. Vi starter altid med at afklare
          underlag og detaljer, så arbejdet ikke “kun ser fint ud på afstand”.
        </p>
      </section>

      <section className="space-y-3 pt-4">
        <h2 className="text-2xl font-semibold text-foreground">Typiske mureropgaver vi hjælper med</h2>
        <p>
          Mange opgaver handler om udbedring, finish og at få helheden til at se rigtig ud igen. Her
          er nogle af de ting, vi ofte bliver kontaktet om:
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Mindre reparationer og udbedringer af vægge og overflader</li>
          <li>Puds og spartling af mindre områder, hvor overfladen skal rettes op</li>
          <li>
            Fliser i mindre zoner (fx bag køkkenbord, mindre gulvarealer, niche/løsninger)
          </li>
          <li>
            Fuger og afslutninger, hvor det gamle er slidt, revnet eller misfarvet
          </li>
          <li>
            Klargøring af underlag før anden overfladebehandling (hvor det giver mening)
          </li>
        </ul>
      </section>

      <section className="space-y-3 pt-4">
        <h2 className="text-2xl font-semibold text-foreground">Underlaget bestemmer resultatet</h2>
        <p>
          To opgaver kan ligne hinanden, men underlaget afgør, hvor meget arbejde der reelt ligger
          bag. Små revner, løse lag, fugt eller bevægelse i konstruktionen kan påvirke både
          holdbarhed og finish. Derfor vurderer vi altid, hvad der skal til for at få en løsning,
          der ikke bare “holder indtil næste gang”.
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            Vi vurderer om der er løse lag, revner eller gamle reparationer der skal sikres
          </li>
          <li>
            Vi prioriterer en løsning der passer til belastning og brug (ikke kun kosmetik)
          </li>
          <li>Vi afklarer tørretid/forløb, så du kan planlægge hverdagen</li>
        </ul>
      </section>

      <section className="space-y-3 pt-4">
        <h2 className="text-2xl font-semibold text-foreground">
          Fliser og fuger – de små ting der gør den store forskel
        </h2>
        <p>
          Fliser kan løfte et rum, når linjer og fuger står skarpt. Hvis fuger er porøse, misfarvede
          eller revnede, kan helhedsindtrykket hurtigt blive “træt” – selv i et ellers pænt rum. Vi
          kan hjælpe med at få afslutninger og detaljer på plads, så det ser rent og ordentligt ud.
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Fokus på lige linjer, hjørner og afslutninger</li>
          <li>Rådgivning om hvad der kan udbedres vs. hvad der bør laves om</li>
          <li>Praktisk plan ift. adgang og tørretider</li>
        </ul>
      </section>

      <section className="space-y-3 pt-4">
        <h2 className="text-2xl font-semibold text-foreground">Hvad påvirker prisen på murerarbejde?</h2>
        <p>
          Pris afhænger især af forberedelse og detaljer. Det kan gå hurtigt at lægge noget op, men
          det tager tid at gøre det rigtigt – især når underlaget kræver ekstra arbejde, eller når
          finish skal være helt skarp. Derfor priser vi altid ud fra opgavens reelle omfang.
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Underlagets stand (forarbejde er ofte den største faktor)</li>
          <li>Omfang og detaljeniveau (hjørner, kanter, afslutninger)</li>
          <li>Materialer og opbygning (hvad der skal bruges for at løse det korrekt)</li>
          <li>
            Adgang/parkering og om opgaven skal løses inden for et stramt tidsvindue
          </li>
        </ul>
      </section>

      <section className="space-y-3 pt-4">
        <h2 className="text-2xl font-semibold text-foreground">Sådan får du et præcist tilbud</h2>
        <p>
          For at give dig et konkret forslag, har vi typisk brug for få, men gode oplysninger. Det
          gør det muligt at vurdere løsningen hurtigt og undgå misforståelser.
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>3–6 billeder (tæt på + et helhedsbillede)</li>
          <li>Kort beskrivelse af hvad du ønsker ændret/udbedret</li>
          <li>Adresse/by og evt. ønsket tidsperiode</li>
        </ul>
      </section>

      <section className="space-y-3 pt-4">
        <h2 className="text-2xl font-semibold text-foreground">Ofte stillede spørgsmål</h2>
        <div className="space-y-3">
          <p>
            <span className="font-semibold text-foreground">Tager I små opgaver?</span> Ja. Mange
            mureropgaver er netop mindre udbedringer, hvor finish og holdbarhed betyder mest.
          </p>
          <p>
            <span className="font-semibold text-foreground">
              Kan I vurdere opgaven ud fra billeder?
            </span>{" "}
            Ofte ja. Billeder gør det muligt at vurdere omfang og næste skridt. Hvis vi mangler
            noget, siger vi til hurtigt.
          </p>
          <p>
            <span className="font-semibold text-foreground">Hvad gør en opgave dyrere?</span>
            Typisk underlag og forarbejde – fx løse lag, revner eller områder der kræver ekstra
            opbygning for at blive holdbare.
          </p>
          <p>
            <span className="font-semibold text-foreground">Hvor dækker I?</span> Vi dækker
            Sjælland og planlægger efter område og opgavens omfang.
          </p>
          <p>
            <span className="font-semibold text-foreground">
              Hvordan undgår vi overraskelser i processen?
            </span>{" "}
            Vi afklarer underlag, detaljer og praktiske forhold tidligt, så plan og forventninger
            stemmer før vi går i gang.
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
