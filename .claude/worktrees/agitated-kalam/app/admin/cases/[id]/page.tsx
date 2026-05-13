import { CaseDetailAdmin } from "@/components/admin/CaseDetailAdmin";

export default function AdminCaseDetailPage({ params }: { params: { id: string } }) {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <CaseDetailAdmin caseId={params.id} />
    </main>
  );
}
