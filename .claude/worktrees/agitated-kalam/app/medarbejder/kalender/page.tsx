import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { EmployeeCalendar } from "@/components/employee/EmployeeCalendar";
import { adminSessionCookieName, verifyAdminSessionToken } from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: "Medarbejder Kalender | BPSLIB",
  description: "Medarbejdervisning af opgaver og kundedetaljer.",
  robots: {
    index: false,
    follow: false
  }
};

export default async function EmployeeCalendarPage() {
  const sessionToken = (await cookies()).get(adminSessionCookieName)?.value;
  const session = verifyAdminSessionToken(sessionToken);

  if (!session || session.role !== "employee") {
    redirect("/medarbejder/login");
  }

  return <EmployeeCalendar />;
}
