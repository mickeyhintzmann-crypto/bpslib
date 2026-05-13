import type { Metadata } from "next";

import { BookingAdminDetail } from "@/components/admin/BookingAdminDetail";

export const metadata: Metadata = {
  title: "Admin booking | BPSLIB",
  description: "Detaljevisning af booking i admin.",
  robots: {
    index: false,
    follow: false
  }
};

type PageProps = {
  params: Promise<{ id: string }> | { id: string };
};

export default async function AdminBookingDetailPage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  return <BookingAdminDetail bookingId={resolvedParams.id} />;
}
