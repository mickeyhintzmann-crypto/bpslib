import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { EmployeesManager } from "@/components/admin/EmployeesManager";
import { adminSessionCookieName, verifyAdminSessionToken } from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: "Admin Employees | BPSLIB",
  description: "Administrer medarbejdere til planlægning og job-allokering.",
  robots: {
    index: false,
    follow: false
  }
};

export default async function AdminEmployeesPage() {
  const sessionToken = (await cookies()).get(adminSessionCookieName)?.value;
  const session = verifyAdminSessionToken(sessionToken);

  if (!session || (session.role !== "owner" && session.role !== "admin")) {
    redirect("/admin");
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-10">
      <EmployeesManager />
    </main>
  );
}
