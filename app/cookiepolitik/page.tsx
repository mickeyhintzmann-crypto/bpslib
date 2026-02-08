import { PageShell } from "@/components/PageShell";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Cookiepolitik",
  description: "Få overblik over vores brug af cookies og hvordan du styrer dit samtykke.",
  path: "/cookiepolitik"
});

export default function CookiepolitikPage() {
  return (
    <PageShell title="Cookiepolitik">
      <p>
        Vi bruger kun de cookies, der er nødvendige for drift og en god brugeroplevelse. Eventuel
        statistik aktiveres først efter samtykke.
      </p>
      <p>
        Du kan til enhver tid ændre eller trække dit samtykke tilbage via cookie-banneret.
      </p>
    </PageShell>
  );
}
