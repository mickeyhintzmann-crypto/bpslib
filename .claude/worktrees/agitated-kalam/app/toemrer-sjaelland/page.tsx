import Link from "next/link";

import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Tømrer på Sjælland | BPSLIB",
  description:
    "Tømrerarbejde på Sjælland med fokus på pasform og pæne afslutninger. Send billeder og beskrivelse — få et konkret forslag og næste skridt.",
  path: "/toemrer-sjaelland"
});

export default function ToemrerPage() {
  return (
    <PageShell title="Tømrer på Sjælland">
      <p>
        Har du en tømreropgave? Vi tager gerne imod din forespørgsel og vender tilbage med et
        konkret tilbud.
      </p>
      <p>
        Du kan stadig booke tid: send en kort beskrivelse af opgaven (gerne med billeder og mål),
        så vender vi tilbage med et konkret forslag og næste skridt. Vi planlægger efter adgang,
        omfang og tidsvinduer, så du får en realistisk plan fra start.
      </p>

      <section className="space-y-3 pt-4">
        <h2 className="text-2xl font-semibold text-foreground">
          Tømrerarbejde på Sjælland – når detaljerne skal sidde rigtigt
        </h2>
        <p>
          Tømrerarbejde handler ofte om de detaljer, man ser hver dag: afslutninger, pasform og
          helhedsindtryk. Vi hjælper med opgaver, hvor du vil have en løsning, der ser ordentlig ud
          — og som fungerer i hverdagen. Uanset om det er én enkelt reparation eller flere ting i
          samme bolig, starter vi med at afklare opgavens omfang, så tilbud og plan hænger sammen.
        </p>
      </section>

      <section className="space-y-3 pt-4">
        <h2 className="text-2xl font-semibold text-foreground">Typiske opgaver vi løser</h2>
        <p>
          Her er eksempler på opgaver, vi ofte bliver kontaktet om. Hvis din opgave ikke står på
          listen, kan du stadig sende den — så vurderer vi den hurtigt.
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Montering eller udskiftning af døre, karme og greb (hvor det giver mening)</li>
          <li>Lister, fodpaneler og pæne afslutninger ved væg/gulv</li>
          <li>Små reparationer: løse samlinger, skæv pasform, slidte kanter</li>
          <li>
            Tilpasninger og finjustering efter renovering (så alt “falder på plads”)
          </li>
          <li>
            Klargøring og mindre opbygninger i forbindelse med andre overflader i boligen
          </li>
        </ul>
      </section>

      <section className="space-y-3 pt-4">
        <h2 className="text-2xl font-semibold text-foreground">Sådan får du et præcist tilbud</h2>
        <p>
          Det hurtigste og mest præcise tilbud får du ved at sende en kort beskrivelse og 3–6
          billeder. Hvis du kan, så tilføj også mål eller en hurtig skitse — især ved døre, lister
          og tilpasninger. Vi bruger informationen til at afklare materialer, tidsforbrug og
          eventuelle udfordringer, så vi rammer rigtigt første gang.
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Billeder af området + helhedsbillede af rummet</li>
          <li>Mål (cirka er fint) eller hvad du ønsker ændret</li>
          <li>Adresse/by + ønsket tidsvindue</li>
        </ul>
      </section>

      <section className="space-y-3 pt-4">
        <h2 className="text-2xl font-semibold text-foreground">Hvad påvirker prisen på tømrerarbejde?</h2>
        <p>
          Prisen afhænger især af opgavens kompleksitet og hvor meget tilpasning der kræves på
          stedet. To opgaver kan se ens ud på billeder, men blive meget forskellige, når man tager
          højde for skæve vægge, gamle installationer eller finishkrav. Derfor vurderer vi altid
          opgaven ud fra de praktiske forhold, før vi låser en endelig pris.
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Antal tilpasninger og finishkrav (synlige kanter, afslutninger, samlinger)</li>
          <li>Materialer og eventuelle specialmål</li>
          <li>Adgang/parkering og hvor hurtigt opgaven skal løses</li>
          <li>Omfang (én ting vs. flere opgaver i samme besøg)</li>
        </ul>
      </section>

      <section className="space-y-3 pt-4">
        <h2 className="text-2xl font-semibold text-foreground">Plan, adgang og forventninger</h2>
        <p>
          Vi planlægger opgaven, så det fungerer i en normal hverdag. Det betyder, at vi aftaler
          adgang, forventet varighed og hvad der skal være ryddet, før vi går i gang. På den måde
          undgår du “halve løsninger”, og vi kan levere pænt og effektivt.
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>Vi aftaler rækkefølge og praktiske forhold på forhånd</li>
          <li>Du får besked om forberedelse (fx fri adgang til området)</li>
          <li>Vi afslutter med oprydning og en tydelig gennemgang af resultatet</li>
        </ul>
      </section>

      <section className="space-y-3 pt-4">
        <h2 className="text-2xl font-semibold text-foreground">Ofte stillede spørgsmål</h2>
        <div className="space-y-3">
          <p>
            <span className="font-semibold text-foreground">Kan I tage små opgaver?</span> Ja.
            Mange kontakter os netop for mindre opgaver, hvor man vil have det gjort ordentligt
            uden bøvl.
          </p>
          <p>
            <span className="font-semibold text-foreground">
              Hvad skal jeg sende for at få et tilbud?
            </span>{" "}
            En kort beskrivelse + billeder. Mål hjælper, men er ikke et krav — vi siger til, hvis
            vi mangler noget.
          </p>
          <p>
            <span className="font-semibold text-foreground">Hvor dækker I?</span> Vi dækker
            Sjælland og planlægger efter område, adgang og tidsvinduer.
          </p>
          <p>
            <span className="font-semibold text-foreground">
              Kan I samle flere ting i samme besøg?
            </span>{" "}
            Ja. Det er ofte den mest effektive løsning. Skriv alt på én gang, så planlægger vi
            rækkefølge.
          </p>
          <p>
            <span className="font-semibold text-foreground">Hvor hurtigt kan I vende tilbage?</span>{" "}
            Vi svarer hurtigst muligt og melder typisk tilbage med næste skridt, når vi har billeder
            og en kort beskrivelse.
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
