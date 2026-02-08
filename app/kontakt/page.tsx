import Link from "next/link";

import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Kontakt",
  description: "Kontakt BPSLIB for bordpladeslibning i massiv træ eller spørgsmål om priser og booking.",
  path: "/kontakt"
});

export default function KontaktPage() {
  return (
    <PageShell title="Kontakt BPSLIB">
      <p>
        Vi svarer hurtigt på spørgsmål om bordpladeslibning, pris og booking. Ring eller skriv,
        så finder vi den bedste løsning.
      </p>
      <p>
        Telefon: 00 00 00 00 · Email: kontakt@bpslib.dk · Adresse: [indsættes]
      </p>
      <div className="flex flex-wrap gap-3 pt-2">
        <Button asChild>
          <a href="tel:+4500000000">Ring nu</a>
        </Button>
        <Button asChild variant="outline">
          <Link href="/bordpladeslibning/prisberegner">Få pris</Link>
        </Button>
      </div>
    </PageShell>
  );
}
