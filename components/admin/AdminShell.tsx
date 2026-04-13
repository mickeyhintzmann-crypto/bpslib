"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import type { AdminRole, AdminSession } from "@/lib/admin-auth";
import { AdminSessionProvider, useAdminSession } from "@/components/admin/AdminSessionContext";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CalendarDays,
  Briefcase,
  Users,
  MessageSquare,
  Calculator,
  DollarSign,
  Settings,
  LogOut,
  Home,
  Plus,
  Search,
  ChevronLeft,
  Menu,
  X,
  Clock,
  Contact,
} from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  roles: AdminRole[];
  icon: React.ElementType;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    title: "Dagligt",
    items: [
      { label: "Overblik", href: "/admin", roles: ["owner", "admin", "employee", "viewer"], icon: LayoutDashboard },
      { label: "Bookinger", href: "/admin/bookings", roles: ["owner", "admin", "employee", "viewer"], icon: CalendarDays },
      { label: "Prisberegner", href: "/admin/estimator", roles: ["owner", "admin", "viewer"], icon: Calculator },
      { label: "Henvendelser", href: "/admin/leads", roles: ["owner", "admin", "viewer"], icon: MessageSquare },
    ],
  },
  {
    title: "Drift",
    items: [
      { label: "Kalender", href: "/admin/kalender", roles: ["owner", "admin"], icon: Clock },
      { label: "Jobs", href: "/admin/jobs", roles: ["owner", "admin", "viewer"], icon: Briefcase },
      { label: "Kunder", href: "/admin/customers", roles: ["owner", "admin", "viewer"], icon: Contact },
      { label: "Økonomi", href: "/admin/okonomi", roles: ["owner", "viewer"], icon: DollarSign },
    ],
  },
  {
    title: "System",
    items: [
      { label: "Medarbejdere", href: "/admin/employees", roles: ["owner", "admin"], icon: Users },
      { label: "Indstillinger", href: "/admin/indstillinger", roles: ["owner"], icon: Settings },
    ],
  },
];

const ALL_NAV_ITEMS = NAV_GROUPS.flatMap((g) => g.items);

const getInitials = (name?: string | null, email?: string | null) => {
  if (name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }
  if (email) return email.slice(0, 2).toUpperCase();
  return "AD";
};

const getRoleBadge = (role: AdminRole) => {
  const map: Record<AdminRole, { label: string; color: string }> = {
    owner: { label: "Ejer", color: "bg-violet-100 text-violet-700" },
    admin: { label: "Admin", color: "bg-blue-100 text-blue-700" },
    employee: { label: "Medarbejder", color: "bg-emerald-100 text-emerald-700" },
    viewer: { label: "Viewer", color: "bg-neutral-100 text-neutral-600" },
  };
  return map[role] || map.viewer;
};

const ShellContent = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const session = useAdminSession();
  const role: AdminRole = session?.role || "viewer";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const activeHref = useMemo(() => {
    if (!pathname) return "/admin";
    const match = ALL_NAV_ITEMS.find(
      (item) => pathname === item.href || (item.href !== "/admin" && pathname.startsWith(`${item.href}/`))
    );
    return match?.href || "/admin";
  }, [pathname]);

  const activeLabel = useMemo(() => {
    const item = ALL_NAV_ITEMS.find((i) => i.href === activeHref);
    return item?.label || "Dashboard";
  }, [activeHref]);

  const filteredGroups = useMemo(() => {
    return NAV_GROUPS.map((group) => ({
      ...group,
      items: group.items.filter((item) => item.roles.includes(role)),
    })).filter((group) => group.items.length > 0);
  }, [role]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return ALL_NAV_ITEMS.filter(
      (item) => item.roles.includes(role) && item.label.toLowerCase().includes(q)
    );
  }, [searchQuery, role]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Cmd+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
        setSearchQuery("");
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setSearchQuery("");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
    } finally {
      router.push("/admin/login");
    }
  };

  const navigateFromSearch = useCallback(
    (href: string) => {
      setSearchOpen(false);
      setSearchQuery("");
      router.push(href);
    },
    [router]
  );

  const badge = getRoleBadge(role);
  const initials = getInitials(session?.name, session?.email);

  const sidebarContent = (
    <>
      {/* Logo + collapse */}
      <div className="flex items-center justify-between px-4 py-5">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-sm font-bold text-white shadow-sm">
            BP
          </div>
          {!sidebarCollapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">BP Slib</span>
              <span className="text-[11px] text-muted-foreground">Admin Panel</span>
            </div>
          )}
        </Link>
        <button
          type="button"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="hidden rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground md:flex"
          title={sidebarCollapsed ? "Udvid sidebar" : "Minimer sidebar"}
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform", sidebarCollapsed && "rotate-180")} />
        </button>
      </div>

      {/* Search trigger */}
      {!sidebarCollapsed && (
        <div className="px-3 pb-2">
          <button
            type="button"
            onClick={() => {
              setSearchOpen(true);
              setSearchQuery("");
            }}
            className="flex w-full items-center gap-2 rounded-xl border border-border/60 bg-muted/40 px-3 py-2 text-sm text-muted-foreground transition hover:border-border hover:bg-muted/70"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="flex-1 text-left">Søg...</span>
            <kbd className="rounded bg-white px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground shadow-sm">
              ⌘K
            </kbd>
          </button>
        </div>
      )}

      {/* Navigation groups */}
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        {filteredGroups.map((group) => (
          <div key={group.title} className="mb-4">
            {!sidebarCollapsed && (
              <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                {group.title}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = activeHref === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={sidebarCollapsed ? item.label : undefined}
                    className={cn(
                      "group flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium transition-all",
                      isActive
                        ? "bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700 shadow-sm ring-1 ring-orange-200/60"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                      sidebarCollapsed && "justify-center px-2"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0 transition",
                        isActive ? "text-orange-600" : "text-muted-foreground/70 group-hover:text-foreground"
                      )}
                    />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User section */}
      <div className="border-t border-border/50 px-3 py-4">
        <div className={cn("flex items-center gap-3", sidebarCollapsed && "justify-center")}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-amber-100 text-xs font-bold text-orange-700">
            {initials}
          </div>
          {!sidebarCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {session?.name || session?.email || "Admin"}
              </p>
              <span className={cn("inline-flex rounded-md px-1.5 py-0.5 text-[10px] font-semibold", badge.color)}>
                {badge.label}
              </span>
            </div>
          )}
          {!sidebarCollapsed && (
            <button
              type="button"
              onClick={handleLogout}
              title="Log ud"
              className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30">
      <div className="flex">
        {/* Desktop sidebar */}
        <aside
          className={cn(
            "fixed left-0 top-0 z-30 hidden h-screen flex-col border-r border-border/40 bg-white/80 backdrop-blur-sm transition-all duration-300 md:flex",
            sidebarCollapsed ? "w-[68px]" : "w-[260px]"
          )}
        >
          {sidebarContent}
        </aside>

        {/* Main content */}
        <div className={cn("flex-1 transition-all duration-300", sidebarCollapsed ? "md:pl-[68px]" : "md:pl-[260px]")}>
          {/* Top bar */}
          <header className="sticky top-0 z-20 border-b border-border/40 bg-white/70 backdrop-blur-md">
            <div className="mx-auto flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(true)}
                  className="rounded-xl border border-border/60 p-2 text-muted-foreground transition hover:bg-muted md:hidden"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    BP Slib Admin
                  </p>
                  <h1 className="text-lg font-semibold text-foreground">{activeLabel}</h1>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSearchOpen(true);
                    setSearchQuery("");
                  }}
                  className="rounded-xl border border-border/60 p-2 text-muted-foreground transition hover:bg-muted md:hidden"
                >
                  <Search className="h-4 w-4" />
                </button>
                <Link
                  href="/"
                  className="hidden items-center gap-1.5 rounded-xl border border-border/60 px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground sm:flex"
                >
                  <Home className="h-3.5 w-3.5" />
                  Hjemmeside
                </Link>
                {(role === "owner" || role === "admin") && (
                  <Link
                    href="/admin/bookings/new"
                    className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:shadow-md hover:brightness-105"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Ny booking</span>
                  </Link>
                )}
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6">{children}</main>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            aria-label="Luk menu"
          />
          <aside className="absolute left-0 top-0 flex h-full w-[280px] max-w-[85vw] flex-col overflow-y-auto bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-border/40 px-4 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-sm font-bold text-white shadow-sm">
                  BP
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-foreground">BP Slib</span>
                  <span className="text-[11px] text-muted-foreground">Admin Panel</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-4">
              {filteredGroups.map((group) => (
                <div key={group.title} className="mb-4">
                  <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                    {group.title}
                  </p>
                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const isActive = activeHref === item.href;
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "group flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all",
                            isActive
                              ? "bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700 shadow-sm ring-1 ring-orange-200/60"
                              : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                          )}
                        >
                          <Icon
                            className={cn(
                              "h-4 w-4 shrink-0",
                              isActive ? "text-orange-600" : "text-muted-foreground/70"
                            )}
                          />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>

            <div className="border-t border-border/50 px-3 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-amber-100 text-xs font-bold text-orange-700">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {session?.name || session?.email || "Admin"}
                  </p>
                  <span className={cn("inline-flex rounded-md px-1.5 py-0.5 text-[10px] font-semibold", badge.color)}>
                    {badge.label}
                  </span>
                </div>
              </div>
              <div className="mt-3 grid gap-2">
                <Link
                  href="/"
                  className="flex items-center justify-center gap-2 rounded-xl border border-border/60 px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted"
                >
                  <Home className="h-3.5 w-3.5" />
                  Til hjemmeside
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Log ud
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Search overlay (Cmd+K) */}
      {searchOpen && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-[15vh]">
          <button
            type="button"
            onClick={() => {
              setSearchOpen(false);
              setSearchQuery("");
            }}
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            aria-label="Luk søgning"
          />
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border/60 bg-white shadow-2xl">
            <div className="flex items-center gap-3 border-b border-border/40 px-4 py-3">
              <Search className="h-5 w-5 text-muted-foreground" />
              <input
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchResults.length > 0) {
                    navigateFromSearch(searchResults[0].href);
                  }
                }}
                placeholder="Søg i admin panel..."
                className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
              <kbd className="rounded bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">ESC</kbd>
            </div>
            {searchQuery.trim() && (
              <div className="max-h-[300px] overflow-y-auto p-2">
                {searchResults.length === 0 ? (
                  <p className="px-3 py-4 text-center text-sm text-muted-foreground">
                    Ingen resultater for &ldquo;{searchQuery}&rdquo;
                  </p>
                ) : (
                  searchResults.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.href}
                        type="button"
                        onClick={() => navigateFromSearch(item.href)}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground transition hover:bg-orange-50"
                      >
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{item.label}</span>
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const AdminShell = ({
  children,
  session,
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
