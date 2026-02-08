import Link from "next/link";

import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Murer på Sjælland",
  description: "Mureropgaver håndteres som lead-gen i MVP. Send din opgave, så vender vi tilbage med tilbud.",
  path: "/murer-sjaelland"
});

export default function MurerPage() {
  return (
    <PageShell title="Murer på Sjælland">
      <p>
        Vi tager imod mureropgaver som lead-gen. Send en kort beskrivelse, så vender vi tilbage
        med et tilbud.
      </p>
      <p>Online booking er ikke aktiv for mureropgaver i MVP.</p>
      <div className="flex flex-wrap gap-3 pt-2">
        <Button asChild>
          <Link href="/tilbudstid">Få tilbud</Link>
        </Button>
      </div>
    </PageShell>
  );
}
