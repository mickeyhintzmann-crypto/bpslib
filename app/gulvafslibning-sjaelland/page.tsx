import Link from "next/link";

import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Gulvafslibning på Sjælland",
  description: "Få tilbud på gulvafslibning på Sjælland. Vi hjælper med vurdering og planlægning.",
  path: "/gulvafslibning-sjaelland"
});

export default function GulvHubPage() {
  return (
    <PageShell title="Gulvafslibning på Sjælland">
      <p>
        Vi hjælper med gulvafslibning som lead-gen i MVP. Send en kort beskrivelse, så vender vi
        tilbage med et tilbud.
      </p>
      <p>Online booking er ikke aktiv for gulvopgaver i MVP.</p>
      <div className="flex flex-wrap gap-3 pt-2">
        <Button asChild>
          <Link href="/tilbudstid">Få tilbud</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/gulvafslibning/pris">Se pris</Link>
        </Button>
      </div>
    </PageShell>
  );
}
