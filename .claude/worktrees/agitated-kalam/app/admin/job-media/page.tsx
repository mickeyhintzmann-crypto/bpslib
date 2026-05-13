import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { JobMediaManager } from "@/components/admin/JobMediaManager";
import { adminSessionCookieName, verifyAdminSessionToken } from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: "Admin Job Media | BPSLIB",
  description: "Moderation af medarbejder-uploadede billeder fra opgaver.",
  robots: {
    index: false,
    follow: false
  }
};

export default async function AdminJobMediaPage() {
  const sessionToken = (await cookies()).get(adminSessionCookieName)?.value;
  const session = verifyAdminSessionToken(sessionToken);

  if (!session || (session.role !== "owner" && session.role !== "admin")) {
    redirect("/admin");
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-10">
      <JobMediaManager />
    </main>
  );
}
