import type { Metadata } from "next";

import { CustomerProfileAdmin } from "@/components/admin/CustomerProfileAdmin";

export const metadata: Metadata = {
  title: "Admin kundeinfo | BPSLIB",
  description: "Detaljevisning af kundeprofil i admin.",
  robots: {
    index: false,
    follow: false
  }
};

type PageProps = {
  params: Promise<{ id: string }> | { id: string };
};

export default async function CustomerDetailPage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  return <CustomerProfileAdmin customerId={resolvedParams.id} />;
}
