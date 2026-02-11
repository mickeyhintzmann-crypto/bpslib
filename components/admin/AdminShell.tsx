"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import type { AdminRole, AdminSession } from "@/lib/admin-auth";
import { AdminSessionProvider, useAdminSession } from "@/components/admin/AdminSessionContext";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href: string;
  roles: AdminRole[];
};

const NAV_ITEMS: NavItem[] = [
  { label: "Oversigt", href: "/admin", roles: ["owner", "admin", "employee", "viewer"] },
  { label: "Bookinger", href: "/admin/bookings", roles: ["owner", "admin", "employee", "viewer"] },
  { label: "Kalender", href: "/admin/kalender", roles: ["owner", "admin"] },
  { label: "Kundehendvendelser", href: "/admin/leads", roles: ["owner", "admin", "viewer"] },
  { label: "Prisberegner", href: "/admin/estimator", roles: ["owner", "admin", "viewer"] },
  { label: "AI træning", href: "/admin/ai-traening", roles: ["owner", "admin"] },
  { label: "Medarbejdere", href: "/admin/medarbejdere", roles: ["owner"] },
  { label: "Cases", href: "/admin/cases", roles: ["owner", "admin"] },
  { label: "Økonomi", href: "/admin/okonomi", roles: ["owner", "viewer"] },
  { label: "Audit log", href: "/admin/audit", roles: ["owner", "admin"] },
  { label: "Indstillinger", href: "/admin/indstillinger", roles: ["owner"] }
];

const ShellContent = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const session = useAdminSession();
  const role: AdminRole = session?.role || "viewer";

  const activeHref = useMemo(() => {
    if (!pathname) {
      return "/admin";
    }
    const match = NAV_ITEMS.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
    return match?.href || "/admin";
  }, [pathname]);

  const visibleItems = useMemo(() => NAV_ITEMS.filter((item) => item.roles.includes(role)), [role]);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
    } finally {
      router.push("/admin/login");
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f2ee] text-foreground">
      <div className="mx-auto flex w-full max-w-[1400px] gap-6 px-4 py-6 md:px-6">
        <aside className="hidden w-60 shrink-0 md:block">
          <div className="rounded-2xl bg-[#191919] p-4 text-white shadow-md">
            <div className="flex items-center gap-2 border-b border-white/10 pb-4">
              <span className="text-lg font-semibold">BP Slib</span>
              <span className="text-xs text-white/60">Admin Panel</span>
            </div>
            <nav className="mt-4 space-y-1 text-sm">
              {visibleItems.map((item) => {
                const isActive = activeHref === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between rounded-lg px-3 py-2 text-white/80 transition hover:bg-white/10 hover:text-white",
                      isActive && "bg-primary text-white"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-6 border-t border-white/10 pt-4 text-xs text-white/60">
              <p>Logget ind som {session?.name || session?.email || "admin"}</p>
              <p className="mt-1 text-[11px] uppercase tracking-wide text-white/40">{role}</p>
              <button
                type="button"
                onClick={handleLogout}
                className="mt-3 w-full rounded-lg border border-white/20 px-3 py-2 text-sm text-white hover:bg-white/10"
              >
                Log ud
              </button>
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-white px-5 py-4 shadow-sm">
            <div>
              <p className="text-xs uppercase text-muted-foreground">Admin</p>
              <p className="text-lg font-semibold text-foreground">Driftsoverblik</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/" className="rounded-full border border-border px-4 py-2 text-sm text-foreground">
                Tilbage til hjemmeside
              </Link>
              {role !== "employee" && role !== "viewer" ? (
                <Link
                  href="/admin/bookings/new"
                  className="rounded-full bg-primary px-4 py-2 text-sm text-white"
                >
                  Opret booking
                </Link>
              ) : null}
            </div>
          </div>
          <div className="rounded-2xl border border-border/70 bg-white p-5 shadow-sm md:p-6">{children}</div>
        </div>
      </div>
    </div>
  );
};

export const AdminShell = ({
  children,
  session
}: {
  children: React.ReactNode;
  session: AdminSession | null;
}) => {
  return (
    <AdminSessionProvider session={session}>
      <ShellContent>{children}</ShellContent>
    </AdminSessionProvider>
  );
};
