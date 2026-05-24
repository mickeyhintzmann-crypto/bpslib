import type { Metadata } from "next";

import { ManageBookingClient } from "@/components/booking/ManageBookingClient";

export const metadata: Metadata = {
  title: "Administrer booking | BPSLIB",
  description: "Se detaljer om din booking og anmod om ny tid.",
  robots: {
    index: false,
    follow: false,
    nocache: true
  }
};

type PageProps = {
  params: Promise<{ token: string }> | { token: string };
};

export default async function ManageBookingPage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  return <ManageBookingClient token={resolvedParams.token} />;
}
