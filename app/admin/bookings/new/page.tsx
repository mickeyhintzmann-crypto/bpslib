import type { Metadata } from "next";

import { BookingCreateAdmin } from "@/components/admin/BookingCreateAdmin";

export const metadata: Metadata = {
  title: "Ny booking | Admin | BPSLIB",
  description: "Opret manuel booking i admin.",
  robots: {
    index: false,
    follow: false
  }
};

export default function AdminBookingCreatePage() {
  return <BookingCreateAdmin />;
}
