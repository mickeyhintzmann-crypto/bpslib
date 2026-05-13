import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { CasesManager } from "@/components/admin/CasesManager";
import { adminSessionCookieName, verifyAdminSessionToken } from "@/lib/admin-auth";

export default async function AdminCasesPage() {
  const sessionToken = (await cookies()).get(adminSessionCookieName)?.value;
  const session = verifyAdminSessionToken(sessionToken);

  if (!session || (session.role !== "owner" && session.role !== "admin")) {
    redirect("/admin");
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-10">
      <CasesManager />
    </main>
  );
}
