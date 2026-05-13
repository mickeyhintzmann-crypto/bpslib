import type { Metadata } from "next";

import { AdminDashboard } from "@/components/admin/AdminDashboard";

export const metadata: Metadata = {
  title: "Admin | BPSLIB",
  description: "Dashboard for drift og overblik.",
  robots: {
    index: false,
    follow: false
  }
};

export default function AdminPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10">
      <AdminDashboard />
    </main>
  );
}
