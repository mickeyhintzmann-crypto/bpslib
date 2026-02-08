import { PageShell } from "@/components/PageShell";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Om os",
  description: "BPSLIB er specialister i bordpladeslibning i massiv træ med fokus på finish og holdbarhed.",
  path: "/om-os"
});

export default function OmOsPage() {
  return (
    <PageShell title="Om BPSLIB">
      <p>
        BPSLIB er specialister i bordpladeslibning i massiv træ på Sjælland. Vi arbejder med
        grundig slibning, skånsomme behandlinger og en klar proces.
      </p>
      <p>
        Vores mål er, at din bordplade ser ny ud igen og holder til hverdagen i mange år.
      </p>
    </PageShell>
  );
}
