import type { Metadata } from "next";

import { EstimatorInboxAdmin } from "@/components/admin/EstimatorInboxAdmin";

export const metadata: Metadata = {
  title: "Admin Estimator Inbox | BPSLIB",
  description: "Admin indbakke for estimator requests.",
  robots: {
    index: false,
    follow: false
  }
};

export default function AdminEstimatorPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-10">
      <EstimatorInboxAdmin />
    </main>
  );
}
