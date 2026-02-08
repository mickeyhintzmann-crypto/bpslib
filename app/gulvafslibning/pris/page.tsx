import Link from "next/link";

import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Pris på gulvafslibning",
  description: "Få en vurdering af prisen på gulvafslibning. Vi giver tilbud baseret på opgavens omfang.",
  path: "/gulvafslibning/pris"
});

export default function GulvPrisPage() {
  return (
    <PageShell title="Pris på gulvafslibning">
      <p>
        Prisen afhænger af gulvtype, areal og behandling. Send en kort beskrivelse, så vi kan
        lave en vurdering.
      </p>
      <p>Gulvafslibning håndteres som lead-gen i MVP.</p>
      <div className="flex flex-wrap gap-3 pt-2">
        <Button asChild>
          <Link href="/tilbudstid">Få tilbud</Link>
        </Button>
      </div>
    </PageShell>
  );
}
