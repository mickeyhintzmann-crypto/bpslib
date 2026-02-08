import Link from "next/link";

import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Tømrer på Sjælland",
  description: "Tømreropgaver håndteres som lead-gen i MVP. Send din opgave, så vender vi tilbage med tilbud.",
  path: "/toemrer-sjaelland"
});

export default function ToemrerPage() {
  return (
    <PageShell title="Tømrer på Sjælland">
      <p>
        Har du en tømreropgave? Vi tager gerne imod din forespørgsel og vender tilbage med et
        konkret tilbud.
      </p>
      <p>Online booking er ikke aktiv for tømreropgaver i MVP.</p>
      <div className="flex flex-wrap gap-3 pt-2">
        <Button asChild>
          <Link href="/tilbudstid">Få tilbud</Link>
        </Button>
      </div>
    </PageShell>
  );
}
