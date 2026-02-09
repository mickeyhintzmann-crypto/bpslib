import type { Metadata } from "next";

import { CalendarAdmin } from "@/components/admin/CalendarAdmin";

export const metadata: Metadata = {
  title: "Admin kalender | BPSLIB",
  description: "Styr aabne tider og akutte visninger.",
  robots: {
    index: false,
    follow: false
  }
};

export default function AdminCalendarPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10">
      <CalendarAdmin />
    </main>
  );
}
