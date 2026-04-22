import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { EmployeeJobDetail } from "@/components/employee/EmployeeJobDetail";
import { adminSessionCookieName, verifyAdminSessionToken } from "@/lib/admin-auth";

export const metadata: Metadata = {
  title: "Medarbejder Opgave | BPSLIB",
  description: "Detaljeside for medarbejder-opgave med fakturering og billedupload.",
  robots: {
    index: false,
    follow: false
  }
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EmployeeJobPage({ params }: PageProps) {
  const sessionToken = (await cookies()).get(adminSessionCookieName)?.value;
  const session = verifyAdminSessionToken(sessionToken);

  if (!session || session.role !== "employee") {
    redirect("/login");
  }

  const { id } = await params;
  return <EmployeeJobDetail jobId={decodeURIComponent(id || "")} />;
}
