import type { Metadata } from "next";

import { BookingsInboxAdmin } from "@/components/admin/BookingsInboxAdmin";

export const metadata: Metadata = {
  title: "Admin bookinger | BPSLIB",
  description: "Admin overblik over bookinger.",
  robots: {
    index: false,
    follow: false
  }
};

export default function AdminBookingsPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10">
      <BookingsInboxAdmin />
    </main>
  );
}
