import { CasesCategoryClient } from "@/components/cases/CasesCategoryClient";
import { buildMetadata } from "@/lib/seo";
import { casesManifest } from "@/lib/mediaManifest";

export const metadata = buildMetadata({
  title: "Gulvbelægning cases | Sildeben, parket, vinyl",
  description:
    "Se alle vores gulvbelægning-cases med billedserier for sildeben, parket, vinyl og epoxy.",
  path: "/gulvlaegning/cases"
});

const gulvbelaegningCases = casesManifest.filter((item) => item.category === "gulvbelaegning");

export default function GulvlaegningCasesPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-16 pt-12">
      <CasesCategoryClient
        cases={gulvbelaegningCases}
        category="gulvbelaegning"
        title="Gulvbelægning cases"
        subtitle="Alle gulvbelægning-cases samlet ét sted. Klik på en case for at åbne hele billedserien."
      />
    </main>
  );
}
