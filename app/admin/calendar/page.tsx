import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { CalendarBoard } from "@/components/admin/CalendarBoard";
import { adminSessionCookieName, verifyAdminSessionToken } from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: "Admin Calendar | BPSLIB",
  description: "Drag/drop job-kalender pr. medarbejder.",
  robots: {
    index: false,
    follow: false
  }
};

export default async function AdminCalendarBoardPage() {
  const sessionToken = (await cookies()).get(adminSessionCookieName)?.value;
  const session = verifyAdminSessionToken(sessionToken);

  if (!session || (session.role !== "owner" && session.role !== "admin")) {
    redirect("/admin");
  }

  return (
    <main className="mx-auto w-full max-w-[1400px] px-6 py-10">
      <CalendarBoard />
    </main>
  );
}
