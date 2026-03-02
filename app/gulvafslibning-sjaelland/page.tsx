import Link from "next/link";

import { ReferenceStrip } from "@/components/ReferenceStrip";
import { FaqSection } from "@/components/bordplade/FaqSection";
import { StructuredData, buildFaqSchema } from "@/components/seo/StructuredData";
import { ServicePageLayout } from "@/components/layouts/ServicePageLayout";
import { CaseGallery } from "@/components/media/CaseGallery";
import { MidPageCTA } from "@/components/marketing/MidPageCTA";
import { ProblemCards } from "@/components/marketing/ProblemCards";
import { buildMetadata } from "@/lib/seo";

const faqItems = [
  {
    question: "Hvad koster gulvafslibning?",
    answer:
      "Prisen afhænger af gulvtype, areal, tilstand og efterbehandling. Vi giver et uforpligtende tilbud ud fra opgaven."
  },
  {
    question: "Hvornår er slibning nok, og hvornår kræves afhøvling?",
    answer:
      "Slibning rækker langt i de fleste tilfælde. Ved meget ujævne gulve eller dybe skader kan afhøvling være nødvendig."
  },
  {
    question: "Lak, olie eller sæbe – hvad anbefaler I?",
    answer:
      "Lak er slidstærk, olie giver et naturligt udtryk, og sæbe giver et lyst og mat look. Vi rådgiver ud fra brug og ønsker."
  },
  {
    question: "Hvor lang tid tager opgaven?",
    answer:
      "Det afhænger af areal og behandling. Vi giver en realistisk tidsplan i forbindelse med tilbuddet."
  },
  {
    question: "Støver det meget?",
    answer:
      "Vi arbejder med støvkontrol og afdækning, men der vil altid være noget støv ved slibning."
  },
  {
    question: "Kører I på hele Sjælland?",
    answer:
      "Ja, vi dækker hele Sjælland og planlægger opgaverne, så du får en stabil tidsplan."
  },
  {
    question: "Skal hele boligen tømmes for møbler?",
    answer:
      "Ikke nødvendigvis. Vi kan ofte planlægge i etaper, så boligen stadig kan fungere. Vi aftaler det konkret før vi starter."
  },
  {
    question: "Kan I slibe et gulv der har dybe ridser?",
    answer:
      "Ofte kan ridser reduceres eller fjernes, men det afhænger af dybde, gulvtype og hvor meget der tidligere er slebet. Vi vurderer det ud fra stand og ønsker."
  },
  {
    question: "Hvilken finish er mest vedligeholdelsesnem?",
    answer:
      "Lak er ofte nemmest i drift. Olie og sæbe kan give flotte udtryk, men kræver mere løbende pleje. Vi rådgiver ud fra brug."
  },
  {
    question: "Hvor lang tid tager gulvafslibning typisk?",
    answer:
      "Det afhænger af m², antal rum og tørretider for behandlingen. Du får en realistisk plan, når vi kender omfanget."
  },
  {
    question: "Kan gulvet bruges med det samme efter behandling?",
    answer:
      "Nej, der er typisk tørretid afhængigt af valgt behandling. Vi fortæller dig præcist, hvornår du må gå på gulvet og flytte møbler tilbage."
  },
  {
    question: "Kan I tage flere rum i samme opgave?",
    answer:
      "Ja. Vi planlægger rækkefølge og eventuelle etaper, så det fungerer praktisk med adgang og tørretider."
  },
  {
    question: "Dækker I hele Sjælland?",
    answer:
      "Ja. Vi planlægger efter område og opgavens type, så du får stabile tider og en realistisk plan."
  },
  {
    question: "Hvad kan jeg gøre for at gulvet holder sig pænt længere?",
    answer:
      "Valg af finish og korrekt vedligehold er afgørende. Du får konkrete råd ved aflevering til rengøring og pleje."
  },
  {
    question: "Hvad er forskellen på gulvslibning og gulvafslibning?",
    answer:
      "Det bruges ofte om det samme. Begge dækker slibning af trægulv, hvor den slidte overflade fjernes og gulvet gøres klar til ny efterbehandling."
  },
  {
    question: "Kan man slibe et gulv der allerede er lakeret?",
    answer:
      "Ja, i mange tilfælde. Vi fjerner den gamle overflade som del af processen og rådgiver derefter om den bedste nye behandling ud fra rummets brug."
  },
  {
    question: "Hvornår vælger man gulvafhøvling fremfor slibning?",
    answer:
      "Typisk når slibning ikke er nok – fx ved store ujævnheder, meget dybe skader eller gamle belægninger. Vi vurderer gulvets stand før vi anbefaler afhøvling."
  },
  {
    question: "Hvilken efterbehandling er bedst til entré eller køkken?",
    answer:
      "Det afhænger af brug og vedligehold. Lak er ofte nem i drift, mens olie/sæbe kan give flotte udtryk men kræver mere løbende pleje. Vi rådgiver ud fra din hverdag."
  },
  {
    question: "Hvornår må man gå på gulvet og flytte møbler tilbage?",
    answer:
      "Det afhænger af den valgte behandling og tørretid. Du får altid en klar plan for hvornår gulvet kan bruges igen."
  },
  {
    question: "Kan I tage flere rum over flere dage (etaper)?",
    answer:
      "Ja. Vi planlægger rækkefølge og etaper, så det fungerer praktisk med adgang og tørretider."
  }
];

const problemCardsItems = [
  {
    title: "Slidte gangzoner og matte felter",
    description:
      "Når overfladen er slidt ned i ganglinjer, kan slibning og ny behandling give et mere ensartet udtryk."
  },
  {
    title: "Ridser og mærker i dagslys",
    description:
      "Ridser bliver ofte tydelige i lys. Vi vurderer gulvtype og stand og planlægger den rigtige proces."
  },
  {
    title: "Ujævn glans og ‘plettet’ look",
    description:
      "Ældre behandling kan give ujævn glans. Ny slibning + korrekt efterbehandling gør helhedsindtrykket roligere."
  },
  {
    title: "Behov for ny efterbehandling",
    description:
      "Lak, olie eller sæbe? Vi rådgiver ud fra rum og brug, så gulvet bliver nemt at holde pænt."
  }
];

const caseGalleryItems = [
  {
    title: "Trægulv – slidte gangzoner og ujævn glans",
    location: "Sjælland",
    summary:
      "Når overfladen er slidt i ganglinjer, kan en trinvis slibning og korrekt efterbehandling give et roligere udtryk."
  },
  {
    title: "Lejlighedsgulv – ridser og mat overflade i dagslys",
    location: "København",
    summary:
      "Vi planlægger forløb og tørretid, så det fungerer i en travl hverdag og med adgang/møbler."
  },
  {
    title: "Gulv med behov for ny efterbehandling",
    location: "Sjælland",
    summary:
      "Valg af lak/olie/sæbe handler om drift og vedligehold. Vi rådgiver ud fra rummets brug og forventninger."
  },
  {
    title: "Flere rum – planlagt i etaper",
    location: "Sjælland",
    summary:
      "Det er ofte muligt at tage flere rum i etaper, så boligen stadig kan fungere undervejs."
  }
];

export const metadata = buildMetadata({
  title: "Gulvafslibning på Sjælland | Slibning & efterbehandling af trægulve",
  description:
    "Gulvafslibning på Sjælland med lak, olie eller sæbe. Uforpligtende tilbud og realistisk tidsplan. Erfaring fra bl.a. Rigshospitalets Patienthotel, Brdr. Price Tivoli og Skatteministeriet. Book tilbudstid.",
  path: "/gulvafslibning-sjaelland"
});

export default function GulvHubPage() {
  return (
    <ServicePageLayout
      title="Gulvafslibning på Sjælland"
      subtitle="Vi hjælper med gulvafslibning på hele Sjælland. Du får et uforpligtende tilbud baseret på gulvtype, areal og ønsket finish. Vi planlægger realistisk og giver dig en klar forventning til både pris og proces."
      bullets={[
        "Gulvafslibning & gulvslibning på hele Sjælland",
        "Rådgivning om efterbehandling: lak, olie eller sæbe",
        "Plan og tørretid afklares før start"
      ]}
      primaryCta={{ label: "Book tilbudstid", href: "/tilbudstid" }}
      secondaryCta={{ label: "Kontakt os", href: "/kontakt" }}
    >
      <ProblemCards
        title="Typiske gulv-problemer vi løser"
        subtitle="Målet er et roligt, ensartet gulv og en efterbehandling der fungerer i din hverdag."
        items={problemCardsItems}
      />

      <CaseGallery
        title="Eksempler på typiske gulvopgaver"
        subtitle="Et hurtigt overblik over opgavetyper vi ofte planlægger, før vi aftaler proces, efterbehandling og tidsplan."
        items={caseGalleryItems}
        cta={{ label: "Book tilbudstid", href: "/tilbudstid" }}
      />

      <MidPageCTA
        title="Vil du have en plan og et konkret næste skridt?"
        subtitle="Fortæl kort om gulvet og rummene, så planlægger vi forløb og tørretid realistisk."
        primary={{ label: "Book tilbudstid", href: "/tilbudstid" }}
        secondary={{ label: "Se cases", href: "/cases" }}
      />

      <section className="mt-8 rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">
          Gulvafslibning og gulvslibning på Sjælland – samme behov, forskellige ord
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          Mange søger på “gulvafslibning Sjælland”, mens andre skriver “gulvslibning Sjælland”
          eller “slibning af trægulv”. Det dækker i praksis det samme: at fjerne den slidte
          overflade, udjævne udtrykket og gøre gulvet klar til ny behandling.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          Vi starter altid med at vurdere gulvtype, slid og forventninger, så afslibning af gulv
          bliver planlagt rigtigt fra første dag – både ift. finish og tørretid.
        </p>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          <li>Afslibning af gulv: fornyer overfladen og gør gulvet ensartet igen</li>
          <li>Slibning af trægulv: fjerner slidte zoner og reducerer ridser og ujævn glans</li>
          <li>Efterbehandling af gulv: afgør hvor nemt gulvet bliver at holde pænt i hverdagen</li>
        </ul>
      </section>

      <section className="mt-8 rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Afslibning eller gulvafhøvling? (kort teaser der afklarer)</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          Gulvafhøvling er typisk først relevant, når almindelig slibning ikke er nok – fx ved
          store niveauforskelle, meget dybe skader eller gamle belægninger der kræver en grovere
          proces. Derfor ser vi altid på gulvets stand før vi anbefaler afhøvling, så du ikke ender
          med en unødigt hård behandling.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          I mange tilfælde kan en korrekt, trinvis slibning give et flot resultat med mindre indgreb
          i træet.
        </p>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          <li>Afhøvling kan være relevant ved meget dybe skader eller store ujævnheder</li>
          <li>Slibning er ofte nok ved almindeligt slid, ridser og ujævn glans</li>
          <li>Vi anbefaler processen ud fra resultat + holdbarhed, ikke bare “mest muligt”</li>
        </ul>
      </section>

      <section className="mt-8 rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Efterbehandling af gulv – det der bestemmer drift og vedligehold</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          Efterbehandlingen er det, der afgør om gulvet bliver “nemt” eller “krævende” i daglig
          drift. Nogle ønsker et varmt, naturligt udtryk og accepterer mere løbende pleje, mens
          andre vil have en overflade der kræver mindst muligt i hverdagen.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          Vi rådgiver ud fra rummets brug (entré, køkken, stue, børn/kæledyr), så du vælger en
          løsning der giver mening på dag 30 – ikke kun på dag 1.
        </p>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          <li>Lak: ofte nem i drift og typisk mindre løbende pleje</li>
          <li>Olie: naturligt udtryk, men kræver mere vedligehold over tid</li>
          <li>Sæbe: klassisk, lyst look – kræver korrekt rutine for at holde sig pænt</li>
        </ul>
      </section>

      <section className="mt-8 rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Hvornår giver gulvafslibning mest værdi?</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          Gulvafslibning giver typisk mest værdi, når gulvet stadig er solidt, men overfladen er
          slidt. Målet er ikke “perfektion i laboratorielys”, men et gulv der ser roligt ud i
          hverdagen og er realistisk at vedligeholde.
        </p>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          <li>Når gangzoner er slidte og gulvet ser mat og ujævnt ud</li>
          <li>Når ridser og mærker gør overfladen urolig i dagslys</li>
          <li>Når du vil skifte finish for at få en mere praktisk hverdag</li>
          <li>Når du vil løfte helhedsindtrykket uden at udskifte gulvet</li>
        </ul>
      </section>

      <section className="mt-8 rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">
          Gulvafslibning på Sjælland – når gulvet skal være pænt og praktisk igen
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          Trægulve kan holde i mange år, men overfladen tager imod slid: ridser, matte felter,
          misfarvninger og et udtryk der bliver “uroligt” i lyset. Gulvafslibning handler om at
          genskabe en ensartet overflade og vælge en behandling, der passer til rummets brug.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          På Sjælland hjælper vi både lejligheder og huse — og vi planlægger forløbet, så det
          fungerer med adgang, møbler og tørretider.
        </p>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          <li>Ensartet udtryk: færre synlige ridser og roligere overflade i dagslys</li>
          <li>Rådgivning om finish ud fra drift og vedligehold (olie/lak/sæbe)</li>
          <li>Realistisk plan for tørretid og hvornår gulvet kan tages i brug</li>
        </ul>
      </section>

      <section className="mt-8 rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Typiske problemer vi løser</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          Mange kontakter os, når gulvet stadig er “godt” i træet, men overfladen ikke længere er
          pæn i hverdagen.
        </p>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          <li>Ridser og mærker fra daglig trafik, stole og legetøj</li>
          <li>Matte/slidte gangzoner hvor overfladen er slidt ned</li>
          <li>Misfarvninger og pletter (fx ved sol/brug)</li>
          <li>Ujævn glans og et “plettet” udtryk efter ældre behandling</li>
          <li>Gulve der er svære at holde pæne med almindelig rengøring</li>
        </ul>
      </section>

      <section className="mt-8 rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Sådan foregår gulvafslibning (kort og realistisk)</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          Vi arbejder trinvis og tilpasser processen til gulvtype, slitage og den finish du ønsker
          bagefter. Målet er et gulv der føles ens, ser ens ud og er til at leve med.
        </p>
        <ol className="mt-4 space-y-2 text-sm text-muted-foreground">
          <li>1. Kort afklaring af gulvtype, slitage og ønsker til finish</li>
          <li>2. Forberedelse: afdækning og praktisk plan (møbler/adgang)</li>
          <li>3. Trinvis slibning ud fra gulvets stand (uden at slibe mere end nødvendigt)</li>
          <li>4. Kant- og detaljearbejde, så helhedsindtrykket bliver pænt</li>
          <li>5. Behandling: olie/lak/sæbe afhængigt af brug og vedligehold</li>
          <li>6. Aflevering: gennemgang + råd til brug og pleje</li>
        </ol>
      </section>

      <section className="mt-8 rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Valg af finish: olie, lak eller sæbe?</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          Finishvalget betyder meget for både udtryk og hverdagsdrift. Nogle vil have et varmt,
          naturligt look, andre vil have en overflade der er nem at holde pæn med mindst muligt
          løbende arbejde. Vi rådgiver ud fra rummets belastning og dine forventninger.
        </p>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          <li>Lak: ofte nem i drift og kræver typisk mindre løbende pleje</li>
          <li>Olie: naturligt udtryk, men kræver mere vedligehold over tid</li>
          <li>Sæbe: klassisk look, men kræver korrekt pleje for at holde sig pænt</li>
          <li>Det rigtige valg afhænger af brug (børn, kæledyr, meget trafik, køkken/entré)</li>
        </ul>
      </section>

      <section className="mt-8 rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Pris: hvad påvirker den?</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          Prisen på gulvafslibning afhænger primært af gulvets stand, antal m² og hvilken behandling
          du vælger bagefter. Derudover betyder det noget, hvor mange rum der er, om der er mange
          kanter/overgange, og hvordan adgangen er.
        </p>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          <li>Gulvets stand (hvor meget der skal rettes op)</li>
          <li>Antal m² og antal rum/overgange</li>
          <li>Valg af behandling (olie/lak/sæbe)</li>
          <li>Praktiske forhold: adgang, møbler og planlægning</li>
        </ul>
        <p className="mt-3 text-sm text-muted-foreground">
          Se også vores lokale sider for{" "}
          <Link href="/gulvafslibning-koebenhavn" className="font-medium text-foreground hover:text-primary">
            København
          </Link>{" "}
          og{" "}
          <Link
            href="/gulvafslibning-koebenhavn-omegn"
            className="font-medium text-foreground hover:text-primary"
          >
            omegn
          </Link>
          , hvis du vil have en mere målrettet beskrivelse.
        </p>
      </section>

      <section className="mt-8 rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Lokale gulv-sider (hurtig vej til dit område)</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          Hvis du vil læse en side der matcher dit område, kan du starte her:
        </p>
        <div className="mt-4 grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
          <Link href="/gulvafslibning-koebenhavn" className="font-medium text-foreground hover:text-primary">
            /gulvafslibning-koebenhavn
          </Link>
          <Link
            href="/gulvafslibning-koebenhavn-omegn"
            className="font-medium text-foreground hover:text-primary"
          >
            /gulvafslibning-koebenhavn-omegn
          </Link>
          <Link href="/gulvafslibning-roskilde" className="font-medium text-foreground hover:text-primary">
            /gulvafslibning-roskilde
          </Link>
          <Link href="/gulvafslibning-gentofte" className="font-medium text-foreground hover:text-primary">
            /gulvafslibning-gentofte
          </Link>
          <Link href="/gulvafslibning-slagelse" className="font-medium text-foreground hover:text-primary">
            /gulvafslibning-slagelse
          </Link>
          <Link href="/gulvafslibning-holbaek" className="font-medium text-foreground hover:text-primary">
            /gulvafslibning-holbaek
          </Link>
        </div>
      </section>

      <section className="mt-8 rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Praktisk før vi går i gang (så det bliver nemt for dig)</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          Det vigtigste er, at vi afklarer adgang og plan. Nogle vælger at tage ét rum ad gangen,
          andre tager hele boligen. Vi tilpasser forløbet efter din hverdag og rummenes brug.
        </p>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          <li>Vi aftaler om møbler flyttes, eller om vi arbejder i etaper</li>
          <li>Du får besked om tørretid og hvornår gulvet kan bruges igen</li>
          <li>Vi afslutter med en tydelig gennemgang og råd til vedligehold</li>
        </ul>
      </section>

      <ReferenceStrip />

      <section className="mt-8 grid gap-6 md:grid-cols-2">
        <article className="rounded-3xl border border-border/70 bg-white/70 p-6">
          <h2 className="text-2xl font-semibold text-foreground">Hvad vi hjælper med</h2>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>Gulvslibning og opfriskning af slidte gulve</li>
            <li>Vurdering af om afhøvling er nødvendig</li>
            <li>Efterbehandling med lak, olie eller sæbe</li>
            <li>Udbedring af ridser, pletter og misfarvning</li>
            <li>Parket, plankegulve og sildeben</li>
          </ul>
        </article>
        <article className="rounded-3xl border border-border/70 bg-white/70 p-6">
          <h2 className="text-2xl font-semibold text-foreground">Sådan foregår det</h2>
          <ol className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>1. Du booker en tilbudstid og beskriver opgaven kort.</li>
            <li>2. Vi afklarer gulvtype, behandling og praktiske forhold.</li>
            <li>3. Du modtager et tilbud og en konkret tidsplan.</li>
          </ol>
        </article>
      </section>

      <section className="mt-8 rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Hvornår er slibning nok?</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          Slibning er ofte tilstrækkeligt ved almindeligt slid, matte overflader og overfladiske
          skader. Ved dybe hak, ujævnheder eller meget tykke behandlinger kan der være behov for
          ekstra forarbejde. Læs mere om processen på{" "}
          <Link href="/gulvafslibning/gulvslibning" className="font-medium text-foreground hover:text-primary">
            gulvslibning
          </Link>
          , eller få hjælp til skader som{" "}
          <Link href="/gulvafslibning/ridser" className="font-medium text-foreground hover:text-primary">
            ridser og pletter
          </Link>
          .
        </p>
      </section>

      <section className="mt-8 grid gap-6 md:grid-cols-3">
        <article className="rounded-3xl border border-border/70 bg-white/70 p-6">
          <h3 className="text-lg font-semibold text-foreground">Lak</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Slidstærk overflade der tåler hverdagens brug.
          </p>
          <Link href="/gulvafslibning/lak" className="mt-3 inline-flex text-sm font-medium text-foreground hover:text-primary">
            Læs om lak
          </Link>
        </article>
        <article className="rounded-3xl border border-border/70 bg-white/70 p-6">
          <h3 className="text-lg font-semibold text-foreground">Olie</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Naturligt udtryk med god mulighed for løbende vedligehold.
          </p>
          <Link href="/gulvafslibning/olie" className="mt-3 inline-flex text-sm font-medium text-foreground hover:text-primary">
            Læs om olie
          </Link>
        </article>
        <article className="rounded-3xl border border-border/70 bg-white/70 p-6">
          <h3 className="text-lg font-semibold text-foreground">Sæbe</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Lys, mat finish som kræver mere regelmæssig pleje.
          </p>
          <Link href="/gulvafslibning/saebe" className="mt-3 inline-flex text-sm font-medium text-foreground hover:text-primary">
            Læs om sæbe
          </Link>
        </article>
      </section>

      <section className="mt-8 rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Pris og tilbud</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
          Prisen påvirkes af gulvtype, mængden af slibning, antal rum og ønsket efterbehandling. Se
          prisfaktorer på{" "}
          <Link href="/gulvafslibning/pris" className="font-medium text-foreground hover:text-primary">
            gulvafslibning/pris
          </Link>
          , og book en tilbudstid hvis du ønsker en konkret vurdering.
        </p>
      </section>

      <section className="mt-8 rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Områder vi dækker</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Vi dækker hele Sjælland og planlægger opgaver efter område og tilgængelighed. Se alle
          områder på{" "}
          <Link href="/gulvafslibning/omraader" className="font-medium text-foreground hover:text-primary">
            gulvafslibning/omraader
          </Link>
          .
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          København, Frederiksberg, Roskilde, Køge, Næstved, Slagelse, Holbæk, Hillerød, Gentofte og
          omegn.
        </p>
      </section>

      <FaqSection
        items={faqItems}
        title="FAQ om gulvafslibning"
        intro="Kort overblik før du booker en uforpligtende tilbudstid."
      />

      <StructuredData data={buildFaqSchema(faqItems)} />
    </ServicePageLayout>
  );
}
