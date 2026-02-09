import Link from "next/link";

import { Button } from "@/components/ui/button";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Handelsbetingelser",
  description:
    "Læs vilkår for afbud, ombooking, akutte tider, forberedelse og betaling hos BP Slib.",
  path: "/handelsbetingelser"
});

export default function HandelsbetingelserPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 pb-16 pt-12">
      <section className="rounded-3xl border border-border/70 bg-white/75 p-6 md:p-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          Handelsbetingelser
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
          Nedenfor finder du en kort version først og en udvidet version efterfølgende.
          Formålet er, at vilkårene er lette at forstå før booking.
        </p>
      </section>

      <section className="mt-6 rounded-3xl border border-border/70 bg-white/80 p-6 md:p-8">
        <h2 className="text-xl font-semibold text-foreground">Kort version (one screen)</h2>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          <li>Gratis afbud eller ombooking indtil 24 timer før aftalt starttid.</li>
          <li>Ved afbud senere end 24 timer kan der opkræves gebyr efter konkret vurdering.</li>
          <li>Akutte tider har fast pris og følger samme 24-timers afbudsregel.</li>
          <li>Kunden skal rydde bordpladen og sikre adgang/parkering inden opstart.</li>
          <li>Betaling sker efter aftale i forbindelse med bekræftelse af opgaven.</li>
        </ul>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/bordpladeslibning/book">Book tid</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/akutte-tider">Akutte tider</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/kontakt">Kontakt</Link>
          </Button>
        </div>
      </section>

      <section className="space-y-6 py-10 text-sm leading-relaxed text-muted-foreground md:text-base">
        <article className="rounded-3xl border border-border/70 bg-white/75 p-6">
          <h2 className="text-xl font-semibold text-foreground">Afbuds- og ombookingspolitik</h2>
          <p className="mt-3">
            Politik gælder for bookinger via bpslib.dk for bordplade og øvrige ydelser, hvor der
            bookes tid. Du kan altid aflyse eller ombooke via linket i bekræftelsen (hvis du har
            modtaget det) eller ved at bruge
            {" "}
            <Link href="/kontakt" className="font-medium text-foreground hover:text-primary">
              Kontakt os
            </Link>
            .
          </p>
          <ul className="mt-4 space-y-2">
            <li>Aflys eller ombook senest 24 timer før den aftalte starttid.</li>
            <li>
              Ved senere aflysning eller ombooking kan det være svært at tilbyde tiden til andre.
            </li>
            <li>
              Ved forsinkelse: ring hurtigst muligt. Ved større forsinkelser kan tiden blive flyttet.
            </li>
            <li>Hvis vi flytter tiden, kontakter vi dig hurtigst muligt og tilbyder en ny tid.</li>
            <li>Akutte tider følger samme mulighed og regler. Giv besked så tidligt som muligt.</li>
          </ul>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button asChild variant="secondary">
              <Link href="/kontakt">Kontakt os</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/bordpladeslibning/book">Book tid</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/akutte-tider">Akutte tider</Link>
            </Button>
          </div>
        </article>

        <article className="rounded-3xl border border-border/70 bg-white/75 p-6">
          <h2 className="text-xl font-semibold text-foreground">Afbud og ombooking</h2>
          <p className="mt-3">
            Afbud eller ombooking er gratis indtil 24 timer før den aftalte tid. Ved afbud senere
            end 24 timer kan der opkræves gebyr, fordi tiden ofte ikke kan fyldes med kort varsel.
            Vi forsøger altid at finde en fair løsning i dialog med dig.
          </p>
        </article>

        <article className="rounded-3xl border border-border/70 bg-white/75 p-6">
          <h2 className="text-xl font-semibold text-foreground">Akutte tider</h2>
          <p className="mt-3">
            Akutte tider udbydes til fast pris og med hurtig planlægning. Samme regler for afbud
            og ombooking gælder: gratis indtil 24 timer før. Hvis en valgt akut tid bliver optaget
            før endelig bekræftelse, tilbyder vi den næste ledige mulighed.
          </p>
        </article>

        <article className="rounded-3xl border border-border/70 bg-white/75 p-6">
          <h2 className="text-xl font-semibold text-foreground">Forberedelse før vi kommer</h2>
          <p className="mt-3">
            For at sikre effektiv opstart skal bordpladen være ryddet, og der skal være fri adgang
            til arbejdsområdet. Hvis opgaven kræver parkering tæt på adressen, hjælper det med en
            praktisk løsning på forhånd.
          </p>
        </article>

        <article className="rounded-3xl border border-border/70 bg-white/75 p-6">
          <h2 className="text-xl font-semibold text-foreground">Betaling</h2>
          <p className="mt-3">
            Betaling sker efter aftale og fremgår af den konkrete bekræftelse. Har du spørgsmål til
            pris eller betalingsform, så kontakt os før udførelse, så alt er afklaret på forhånd.
          </p>
        </article>

        <article className="rounded-3xl border border-border/70 bg-white/75 p-6">
          <h2 className="text-xl font-semibold text-foreground">Kontakt</h2>
          <p className="mt-3">
            Hvis du har spørgsmål til vilkårene, kan du bruge
            {" "}
            <Link href="/kontakt" className="font-medium text-foreground hover:text-primary">
              kontakt-siden
            </Link>
            {" "}
            eller ringe direkte.
          </p>
        </article>
      </section>
    </main>
  );
}
