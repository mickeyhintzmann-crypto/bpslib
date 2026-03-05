import Link from "next/link";
import Image from "next/image";

import { ReferenceStrip } from "@/components/ReferenceStrip";
import { FaqSection } from "@/components/bordplade/FaqSection";
import { StructuredData, buildFaqSchema } from "@/components/seo/StructuredData";
import { ServicePageLayout } from "@/components/layouts/ServicePageLayout";
import { BeforeAfterGrid } from "@/components/media/BeforeAfterGrid";
import { CaseGallery } from "@/components/media/CaseGallery";
import { MidPageCTA } from "@/components/marketing/MidPageCTA";
import { ProblemCards } from "@/components/marketing/ProblemCards";
import { Button } from "@/components/ui/button";
import { beforeAfterGulv, galleryGulv } from "@/lib/mediaManifest";
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

const caseGalleryItemsWithImages = caseGalleryItems.map((item, index) => ({
  ...item,
  image: galleryGulv[index]
    ? {
        src: galleryGulv[index],
        alt: "Trægulv efter afslibning og efterbehandling"
      }
    : undefined
}));

const beforeAfterGulvPreview = beforeAfterGulv.slice(0, 4).map((item) => ({
  ...item,
  beforeAlt: "Trægulv før afslibning",
  afterAlt: "Trægulv efter afslibning og efterbehandling"
}));

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
      subtitle="Vi hjælper med gulvafslibning på hele Sjælland. Du får et uforpligtende tilbud, klar plan for forløb og rådgivning om den finish der passer til din hverdag."
      heroBackgroundImage="/media/featured%3Agulv/header.jpg"
      bullets={[
        "Gulvafslibning & gulvslibning i hele regionen",
        "Lak, olie eller sæbe valgt efter brug og vedligehold",
        "Realistisk tidsplan med klar tørretid",
        "Støvkontrol, afdækning og tydelig aflevering"
      ]}
      primaryCta={{ label: "Book tilbudstid", href: "/tilbudstid" }}
      secondaryCta={{ label: "Kontakt os", href: "/kontakt" }}
    >
      <section className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <article className="rounded-3xl border border-border/70 bg-white/80 p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Sjælland i fokus</p>
          <h2 className="mt-3 text-2xl font-semibold text-foreground md:text-[2rem]">
            Gulvafslibning der både er visuelt flot og praktisk i drift
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
            Vi arbejder på tværs af Sjælland med alt fra lejligheder i byen til større huse, hvor
            planlægning og finishvalg er afgørende for et stabilt resultat. Vores mål er ikke kun et
            flot gulv på dag 1, men et gulv der fungerer i daglig brug.
          </p>
          <ul className="mt-5 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
            <li className="rounded-2xl border border-border/70 bg-background/85 p-3">
              Tydelig afklaring af gulvtype, slidlag og forventet resultat
            </li>
            <li className="rounded-2xl border border-border/70 bg-background/85 p-3">
              Trinvis slibning uden at fjerne mere materiale end nødvendigt
            </li>
            <li className="rounded-2xl border border-border/70 bg-background/85 p-3">
              Finish anbefalet efter trafik, rengøring og vedligehold
            </li>
            <li className="rounded-2xl border border-border/70 bg-background/85 p-3">
              Klar plan for tørretid og hvornår rummene kan tages i brug
            </li>
          </ul>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button asChild size="sm" className="h-10 px-4">
              <Link href="/tilbudstid">Book tilbudstid</Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="h-10 px-4">
              <Link href="/gulvafslibning/pris">Se prisfaktorer</Link>
            </Button>
          </div>
        </article>

        <article className="grid gap-4">
          <div className="relative min-h-[250px] overflow-hidden rounded-3xl border border-border/70">
            <Image
              src="/media/featured:gulv/feature.2.jpeg"
              alt="Gulvafslibning på trægulv i stort rum"
              fill
              sizes="(max-width: 1023px) 100vw, 36vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/55 via-transparent to-transparent" />
            <p className="absolute bottom-4 left-4 right-4 text-sm font-semibold text-white">
              Samme varme stil som hovedsiden med større billedfokus
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="relative min-h-[150px] overflow-hidden rounded-2xl border border-border/70">
              <Image
                src="/media/featured:gulv/20221212_111845.jpg"
                alt="Nyligt slebet trægulv med naturlig finish"
                fill
                sizes="(max-width: 767px) 100vw, 18vw"
                className="object-cover"
              />
            </div>
            <div className="relative min-h-[150px] overflow-hidden rounded-2xl border border-border/70">
              <Image
                src="/media/featured:gulv/20230219_193820.jpg"
                alt="Gulvopgave med ensartet overflade efter behandling"
                fill
                sizes="(max-width: 767px) 100vw, 18vw"
                className="object-cover"
              />
            </div>
          </div>
        </article>
      </section>

      <ProblemCards
        title="Typiske gulv-problemer vi løser"
        subtitle="Målet er et roligt, ensartet gulv med en behandling der holder i hverdagen."
        items={problemCardsItems}
      />

      <section className="grid gap-6 md:grid-cols-2">
        <article className="rounded-3xl border border-sky-200/70 bg-gradient-to-br from-sky-100/80 via-white to-cyan-100/75 p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-foreground">
            Afslibning eller gulvafhøvling? Vi starter med det mindst indgribende
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
            De fleste gulve kan løses med en korrekt slibning, men meget dybe skader eller store
            ujævnheder kan kræve afhøvling. Vi vurderer altid gulvet først, så processen passer til
            stand og ikke bliver hårdere end nødvendigt.
          </p>
          <ul className="mt-4 grid gap-3 text-sm text-muted-foreground">
            <li>Almindeligt slid, ridser og mat overflade: typisk slibning</li>
            <li>Store niveauforskelle og dybe skader: vurdering for afhøvling</li>
            <li>Anbefaling baseret på holdbarhed og realistisk slutresultat</li>
          </ul>
        </article>

        <article className="rounded-3xl border border-amber-200/70 bg-gradient-to-br from-amber-100/80 via-white to-orange-100/75 p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-foreground">
            Finishvalg bestemmer hverdagen: lak, olie eller sæbe
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
            Valget af finish styrer både udtryk, rengøring og vedligehold. Derfor rådgiver vi ud fra
            hvor rummene bruges mest, så gulvet holder sig pænt i praksis og ikke kun lige efter
            aflevering.
          </p>
          <ul className="mt-4 grid gap-3 text-sm text-muted-foreground">
            <li>Lak: robust og ofte nemmest i drift</li>
            <li>Olie: naturligt look med mere løbende vedligehold</li>
            <li>Sæbe: klassisk mat udtryk med faste plejerutiner</li>
          </ul>
        </article>
      </section>

      <CaseGallery
        title="Feature-cases fra gulvopgaver"
        subtitle="Udvalgte opgaver der viser forskellen før og efter, og hvordan plan + behandling løfter helhedsindtrykket."
        items={caseGalleryItemsWithImages}
        cta={{ label: "Book tilbudstid", href: "/tilbudstid" }}
      />

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <article className="relative min-h-[320px] overflow-hidden rounded-3xl border border-border/70">
          <Image
            src="/media/featured:gulv/feature3.JPG"
            alt="Sildebensgulv efter professionel afslibning"
            fill
            sizes="(max-width: 1023px) 100vw, 40vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-foreground/10 to-transparent" />
          <div className="absolute bottom-0 p-5 text-white">
            <p className="text-xs uppercase tracking-[0.14em] text-white/80">Planlagt forløb</p>
            <p className="mt-2 text-base font-semibold">
              Et ensartet resultat starter med god plan før maskinerne tændes
            </p>
          </div>
        </article>

        <article className="rounded-3xl border border-border/70 bg-white/80 p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-foreground">Sådan foregår et typisk gulvforløb</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
            Vi tilpasser rækkefølgen efter gulvtype, adgang og antal rum. Du får en tydelig plan med
            realistisk tid, så du ved hvad der sker før, under og efter opgaven.
          </p>
          <ol className="mt-5 grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
            <li className="rounded-2xl border border-border/70 bg-background/85 p-3">
              1. Afdækning, adgang og praktisk afklaring
            </li>
            <li className="rounded-2xl border border-border/70 bg-background/85 p-3">
              2. Trinvis slibning tilpasset gulvets stand
            </li>
            <li className="rounded-2xl border border-border/70 bg-background/85 p-3">
              3. Kantarbejde og ensartning af helhedsudtryk
            </li>
            <li className="rounded-2xl border border-border/70 bg-background/85 p-3">
              4. Efterbehandling og klar tørretidsplan
            </li>
          </ol>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button asChild variant="outline" size="sm" className="h-10 px-4">
              <Link href="/gulvafslibning/gulvslibning">Læs om gulvslibning</Link>
            </Button>
            <Button asChild size="sm" className="h-10 px-4">
              <Link href="/tilbudstid">Få konkret tidsplan</Link>
            </Button>
          </div>
        </article>
      </section>

      <BeforeAfterGrid
        title="Før & efter: trægulve"
        items={beforeAfterGulvPreview}
      />

      <section className="grid gap-6 md:grid-cols-3">
        <article className="rounded-3xl border border-border/70 bg-white/80 p-6">
          <h3 className="text-xl font-semibold text-foreground">Lak</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Et robust valg til rum med høj trafik, hvor nem rengøring prioriteres.
          </p>
          <Button asChild variant="outline" size="sm" className="mt-4 h-10 px-4">
            <Link href="/gulvafslibning/lak">Læs om lak</Link>
          </Button>
        </article>
        <article className="rounded-3xl border border-border/70 bg-white/80 p-6">
          <h3 className="text-xl font-semibold text-foreground">Olie</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Naturligt udtryk og dybde i træet, med behov for løbende pleje.
          </p>
          <Button asChild variant="outline" size="sm" className="mt-4 h-10 px-4">
            <Link href="/gulvafslibning/olie">Læs om olie</Link>
          </Button>
        </article>
        <article className="rounded-3xl border border-border/70 bg-white/80 p-6">
          <h3 className="text-xl font-semibold text-foreground">Sæbe</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Lyst, mat look der kan være flot, men kræver konsekvent vedligehold.
          </p>
          <Button asChild variant="outline" size="sm" className="mt-4 h-10 px-4">
            <Link href="/gulvafslibning/saebe">Læs om sæbe</Link>
          </Button>
        </article>
      </section>

      <MidPageCTA
        title="Vil du have en konkret plan på dit gulv?"
        subtitle="Fortæl kort om m², gulvtype og ønsket finish, så vender vi tilbage med næste skridt."
        primary={{ label: "Book tilbudstid", href: "/tilbudstid" }}
        secondary={{ label: "Se cases", href: "/cases" }}
      />

      <ReferenceStrip />

      <section className="grid gap-6 md:grid-cols-2">
        <article className="rounded-3xl border border-border/70 bg-white/80 p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-foreground">Pris og plan uden gætteri</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
            Vi vurderer pris ud fra m², stand, antal rum og valgt behandling. Når vi kender
            forudsætningerne, får du en plan med tydelig rækkefølge og realistisk tørretid.
          </p>
          <ul className="mt-4 grid gap-3 text-sm text-muted-foreground">
            <li>Prisfaktorer gennemgås før opstart</li>
            <li>Etaper kan planlægges, så boligen stadig fungerer</li>
            <li>Tydelig forventning til brug af gulvet efter behandling</li>
          </ul>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button asChild variant="outline" size="sm" className="h-10 px-4">
              <Link href="/gulvafslibning/pris">Se pris-side</Link>
            </Button>
            <Button asChild size="sm" className="h-10 px-4">
              <Link href="/tilbudstid">Book tilbudstid</Link>
            </Button>
          </div>
        </article>

        <article className="rounded-3xl border border-border/70 bg-white/80 p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-foreground">Lokale sider og områder</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
            Vi dækker hele Sjælland og har lokale sider med by-specifikke forhold, så du hurtigt kan
            finde relevant info om dit område.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Button asChild variant="outline" size="sm" className="h-10 justify-start px-4">
              <Link href="/gulvafslibning-koebenhavn">København</Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="h-10 justify-start px-4">
              <Link href="/gulvafslibning-koebenhavn-omegn">København & omegn</Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="h-10 justify-start px-4">
              <Link href="/gulvafslibning-roskilde">Roskilde</Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="h-10 justify-start px-4">
              <Link href="/gulvafslibning-slagelse">Slagelse</Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="h-10 justify-start px-4">
              <Link href="/gulvafslibning-gentofte">Gentofte</Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="h-10 justify-start px-4">
              <Link href="/gulvafslibning-holbaek">Holbæk</Link>
            </Button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Se også samlet områdeoversigt på{" "}
            <Link href="/gulvafslibning/omraader" className="font-medium text-foreground hover:text-primary">
              gulvafslibning/omraader
            </Link>
            .
          </p>
        </article>
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
