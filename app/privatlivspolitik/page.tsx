import { PageShell } from "@/components/PageShell";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Privatlivspolitik",
  description: "Læs hvordan BPSLIB behandler dine personoplysninger og beskytter dit privatliv.",
  path: "/privatlivspolitik"
});

export default function PrivatlivspolitikPage() {
  return (
    <PageShell title="Privatlivspolitik">
      <p>
        Vi behandler kun de oplysninger, der er nødvendige for at besvare henvendelser og levere
        vores ydelser.
      </p>
      <p>
        Du kan altid kontakte os, hvis du vil have indsigt i eller slettet dine data.
      </p>
    </PageShell>
  );
}
