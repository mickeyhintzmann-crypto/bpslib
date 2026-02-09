import type { Metadata } from "next";

import { LeadDetailAdmin } from "@/components/admin/LeadDetailAdmin";

export const metadata: Metadata = {
  title: "Admin lead | BPSLIB",
  description: "Detaljevisning af lead i admin.",
  robots: {
    index: false,
    follow: false
  }
};

type PageProps = {
  params: Promise<{ id: string }> | { id: string };
};

export default async function AdminLeadDetailPage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  return <LeadDetailAdmin leadId={resolvedParams.id} />;
}
