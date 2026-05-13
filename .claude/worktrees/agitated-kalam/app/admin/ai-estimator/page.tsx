import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { AIEstimatorDashboard } from "@/components/admin/AIEstimatorDashboard";
import { adminSessionCookieName, verifyAdminSessionToken } from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: "Admin AI Estimator | BPSLIB",
  description: "Control room for AI-prisberegner prompts, queue og historik.",
  robots: {
    index: false,
    follow: false
  }
};

export default async function AdminAiEstimatorPage() {
  const sessionToken = (await cookies()).get(adminSessionCookieName)?.value;
  const session = verifyAdminSessionToken(sessionToken);

  if (!session || (session.role !== "owner" && session.role !== "admin")) {
    redirect("/admin");
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-10">
      <AIEstimatorDashboard />
    </main>
  );
}
