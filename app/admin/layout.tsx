import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { adminSessionCookieName, verifyAdminSessionToken } from "@/lib/admin-auth";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true
  }
};

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const headerList = await headers();
  const pathHint =
    headerList.get("x-pathname") ||
    headerList.get("x-nextjs-route") ||
    headerList.get("x-invoke-path") ||
    headerList.get("x-matched-path") ||
    headerList.get("x-next-url") ||
    headerList.get("next-url") ||
    "";
  const isLoginRoute = pathHint.includes("/admin/login");

  if (!isLoginRoute) {
    const sessionToken = (await cookies()).get(adminSessionCookieName)?.value;
    if (!verifyAdminSessionToken(sessionToken)) {
      redirect("/admin/login");
    }
  }

  return children;
}
