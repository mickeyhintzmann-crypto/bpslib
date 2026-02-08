import Link from "next/link";

import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Maler på Sjælland",
  description: "Maleropgaver håndteres som lead-gen i MVP. Send din opgave, så vender vi tilbage med tilbud.",
  path: "/maler-sjaelland"
});

export default function MalerPage() {
  return (
    <PageShell title="Maler på Sjælland">
      <p>
        Beskriv din maleropgave kort, så vender vi tilbage med et tilbud. Vi vurderer omfang og
        timing, inden vi sætter pris.
      </p>
      <p>Online booking er ikke aktiv for maleropgaver i MVP.</p>
      <div className="flex flex-wrap gap-3 pt-2">
        <Button asChild>
          <Link href="/tilbudstid">Få tilbud</Link>
        </Button>
      </div>
    </PageShell>
  );
}
