import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { EmployeeCalendar } from "@/components/employee/EmployeeCalendar";
import {
  adminSessionCookieName,
  verifyAdminSessionToken,
  createAdminSessionToken,
  getSessionTtl
} from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: "Medarbejder Kalender | BPSLIB",
  description: "Medarbejdervisning af opgaver og kundedetaljer.",
  robots: {
    index: false,
    follow: false
  }
};

export default async function EmployeeCalendarPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(adminSessionCookieName)?.value;
  const session = verifyAdminSessionToken(sessionToken);

  if (!session || session.role !== "employee") {
    redirect("/medarbejder/login");
  }

  // Renew session cookie on each page load so active employees stay logged in.
  // Only renew if the session expires within 30 days (avoids unnecessary writes).
  const now = Math.floor(Date.now() / 1000);
  const thirtyDays = 60 * 60 * 24 * 30;
  if (session.exp - now < thirtyDays) {
    const newToken = createAdminSessionToken({
      id: session.id,
      email: session.email,
      name: session.name,
      role: session.role
    });
    const ttl = getSessionTtl(session.role);
    cookieStore.set(adminSessionCookieName, newToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: ttl,
      path: "/"
    });
  }

  return <EmployeeCalendar />;
}
