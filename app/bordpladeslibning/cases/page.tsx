import { CasesCategoryClient } from "@/components/cases/CasesCategoryClient";
import { buildMetadata } from "@/lib/seo";
import { casesManifest } from "@/lib/mediaManifest";

export const metadata = buildMetadata({
  title: "Bordplade cases | Før/efter i massiv træ",
  description:
    "Se alle vores bordplade-cases med billedserier og før/efter-eksempler i massiv træ.",
  path: "/bordpladeslibning/cases"
});

const bordpladeCases = casesManifest.filter((item) => item.category === "bordplade");

export default function BordpladeCasesPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-16 pt-12">
      <CasesCategoryClient
        cases={bordpladeCases}
        category="bordplade"
        title="Bordplade cases"
        subtitle="Alle bordplade-cases samlet ét sted. Klik på en case for at åbne hele billedserien."
      />
    </main>
  );
}
