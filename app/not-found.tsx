import Link from "next/link";

import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <PageShell title="Siden blev ikke fundet">
      <p>
        Den side, du leder efter, findes ikke længere. Prøv forsiden eller kontakt os, hvis du
        har brug for hjælp.
      </p>
      <div className="flex flex-wrap gap-3 pt-2">
        <Button asChild>
          <Link href="/">Gå til forsiden</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/kontakt">Kontakt</Link>
        </Button>
      </div>
    </PageShell>
  );
}
