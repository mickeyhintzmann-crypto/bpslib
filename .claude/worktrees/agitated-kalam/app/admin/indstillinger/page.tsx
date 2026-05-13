import type { Metadata } from "next";

import { SettingsAdmin } from "@/components/admin/SettingsAdmin";

export const metadata: Metadata = {
  title: "Indstillinger | Admin | BPSLIB",
  description: "Indstillinger for akutte tider.",
  robots: {
    index: false,
    follow: false
  }
};

export default function AdminSettingsPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-10">
      <SettingsAdmin />
    </main>
  );
}
