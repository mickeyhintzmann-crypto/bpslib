import type { Metadata } from "next";

import { ManageEstimatorClient } from "@/components/estimator/ManageEstimatorClient";

export const metadata: Metadata = {
  title: "Din prisberegning | BPSLIB",
  description: "Se status på din prisberegning og book din tid.",
  robots: {
    index: false,
    follow: false,
    nocache: true
  }
};

type PageProps = {
  params: Promise<{ token: string }> | { token: string };
};

export default async function ManageEstimatorPage({ params }: PageProps) {
  const resolvedParams = await Promise.resolve(params);
  return <ManageEstimatorClient token={resolvedParams.token} />;
}
