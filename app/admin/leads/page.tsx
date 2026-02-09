import type { Metadata } from "next";

import { LeadsInboxAdmin } from "@/components/admin/LeadsInboxAdmin";

export const metadata: Metadata = {
  title: "Admin Leads Inbox | BPSLIB",
  description: "Admin indbakke for leads fra tilbudstid og kontakt.",
  robots: {
    index: false,
    follow: false
  }
};

export default function AdminLeadsPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-10">
      <LeadsInboxAdmin />
    </main>
  );
}
