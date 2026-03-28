import type { Metadata } from "next";
import { cookies } from "next/headers";

import { AdminShell } from "@/components/admin/AdminShell";
import { adminSessionCookieName, verifyAdminSessionToken } from "@/lib/admin-auth";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessionToken = (await cookies()).get(adminSessionCookieName)?.value;
  const session = verifyAdminSessionToken(sessionToken);

  // If no valid session, render children directly (login page)
  // Middleware handles the redirect for non-login routes
  if (!session) {
    return children;
  }

  return <AdminShell session={session}>{children}</AdminShell>;
}
