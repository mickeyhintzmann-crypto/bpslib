import { CasesCategoryClient } from "@/components/cases/CasesCategoryClient";
import { buildMetadata } from "@/lib/seo";
import { casesManifest } from "@/lib/mediaManifest";

export const metadata = buildMetadata({
  title: "Gulvafslibning cases | Før/efter af trægulve",
  description:
    "Se alle vores gulvafslibning-cases med billedserier og før/efter af trægulve.",
  path: "/gulvafslibning/cases"
});

const gulvCases = casesManifest.filter((item) => item.category === "gulvafslibning");

export default function GulvafslibningCasesPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-16 pt-12">
      <CasesCategoryClient
        cases={gulvCases}
        category="gulvafslibning"
        title="Gulvafslibning cases"
        subtitle="Alle gulvafslibning-cases samlet ét sted. Klik på en case for at åbne hele billedserien."
      />
    </main>
  );
}
