import type { Metadata } from "next";

import { AuditLogAdmin } from "@/components/admin/AuditLogAdmin";

export const metadata: Metadata = {
  title: "Audit log | Admin | BPSLIB",
  description: "Audit log over admin-aendringer.",
  robots: {
    index: false,
    follow: false
  }
};

export default function AdminAuditPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10">
      <AuditLogAdmin />
    </main>
  );
}
