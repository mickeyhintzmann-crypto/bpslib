import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { JobsManager } from "@/components/admin/JobsManager";
import { adminSessionCookieName, verifyAdminSessionToken } from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: "Admin Jobs | BPSLIB",
  description: "Planlægning af jobs og tildeling af medarbejdere.",
  robots: {
    index: false,
    follow: false
  }
};

export default async function AdminJobsPage() {
  const sessionToken = (await cookies()).get(adminSessionCookieName)?.value;
  const session = verifyAdminSessionToken(sessionToken);

  if (!session || (session.role !== "owner" && session.role !== "admin" && session.role !== "viewer")) {
    redirect("/admin");
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-10">
      <JobsManager />
    </main>
  );
}
