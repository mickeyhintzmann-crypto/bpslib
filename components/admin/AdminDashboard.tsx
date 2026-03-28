"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  MessageSquare,
  Calculator,
  TrendingUp,
  Clock,
  RefreshCw,
  ArrowRight,
  Plus,
  Briefcase,
  Users,
  FolderOpen,
  Zap,
  Phone,
  MapPin,
} from "lucide-react";

type DashboardResponse = {
  counts?: {
    leadsNew: number;
    estimatorsNew: number;
    bookingsToday: number;
    bookingsNext7: number;
  };
  upcomingBookings?: Array<{
    id: string;
    slot_start: string;
    customer_name: string;
    source: string | null;
    status: string | null;
  }>;
  latestLeads?: Array<{
    id: string;
    created_at: string;
    service: string;
    name: string;
    phone: string;
    status: string;
  }>;
  latestEstimators?: Array<{
    id: string;
    created_at: string;
    name: string;
    status: string;
  }>;
  message?: string;
};

const formatDateTime = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Ukendt";
  return new Intl.DateTimeFormat("da-DK", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
};

const formatDate = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Ukendt";
  return new Intl.DateTimeFormat("da-DK", { dateStyle: "short" }).format(date);
};

const formatRelativeTime = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "lige nu";
  if (diffMins < 60) return `${diffMins} min siden`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} timer siden`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} dage siden`;
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 6) return "God nat";
  if (hour < 12) return "God morgen";
  if (hour < 17) return "God eftermiddag";
  return "God aften";
};

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  new: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  pending: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  pending_confirmation: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  confirmed: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  in_progress: { bg: "bg-violet-50", text: "text-violet-700", dot: "bg-violet-500" },
  done: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
  contacted: { bg: "bg-sky-50", text: "text-sky-700", dot: "bg-sky-500" },
  cancelled: { bg: "bg-red-50", text: "text-red-600", dot: "bg-red-400" },
};

const StatusDot = ({ status }: { status: string | null }) => {
  const config = statusConfig[status || ""] || { bg: "bg-neutral-50", text: "text-neutral-600", dot: "bg-neutral-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${config.bg} ${config.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {status || "-"}
    </span>
  );
};

const KPI_CARDS = [
  {
    key: "leadsNew",
    label: "Nye leads",
    icon: MessageSquare,
    gradient: "from-blue-500 to-cyan-500",
    lightBg: "bg-blue-50",
    href: "/admin/leads",
  },
  {
    key: "estimatorsNew",
    label: "Nye estimatorer",
    icon: Calculator,
    gradient: "from-violet-500 to-purple-500",
    lightBg: "bg-violet-50",
    href: "/admin/estimator",
  },
  {
    key: "bookingsToday",
    label: "Bookinger i dag",
    icon: CalendarDays,
    gradient: "from-orange-500 to-amber-500",
    lightBg: "bg-orange-50",
    href: "/admin/bookings",
  },
  {
    key: "bookingsNext7",
    label: "Næste 7 dage",
    icon: TrendingUp,
    gradient: "from-emerald-500 to-teal-500",
    lightBg: "bg-emerald-50",
    href: "/admin/bookings",
  },
] as const;

const QUICK_ACTIONS = [
  { label: "Ny booking", href: "/admin/bookings/new", icon: Plus, color: "text-orange-600 bg-orange-50 hover:bg-orange-100" },
  { label: "Se jobs", href: "/admin/jobs", icon: Briefcase, color: "text-blue-600 bg-blue-50 hover:bg-blue-100" },
  { label: "Cases", href: "/admin/cases", icon: FolderOpen, color: "text-violet-600 bg-violet-50 hover:bg-violet-100" },
  { label: "Medarbejdere", href: "/admin/employees", icon: Users, color: "text-emerald-600 bg-emerald-50 hover:bg-emerald-100" },
];

export const AdminDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<DashboardResponse | null>(null);

  const loadDashboard = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/dashboard", { cache: "no-store" });
      const payload = (await response.json()) as DashboardResponse;
      if (!response.ok || !payload.counts) {
        setError(payload.message || "Kunne ikke hente dashboard.");
        setData(null);
        return;
      }
      setData(payload);
    } catch (fetchError) {
      console.error(fetchError);
      setError("Netværksfejl ved hentning af dashboard.");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const counts = data?.counts || {
    leadsNew: 0,
    estimatorsNew: 0,
    bookingsToday: 0,
    bookingsNext7: 0,
  };

  return (
    <div className="space-y-8">
      {/* Welcome + refresh */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
            {getGreeting()} <span className="text-orange-600">&#x1F44B;</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Her er dit overblik over driften lige nu.</p>
        </div>
        <Button
          onClick={() => loadDashboard()}
          disabled={loading}
          variant="outline"
          className="gap-2"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Henter..." : "Opdater"}
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-semibold">{error}</p>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {KPI_CARDS.map((card) => {
          const Icon = card.icon;
          const value = counts[card.key];
          return (
            <Link
              key={card.key}
              href={card.href}
              className="group relative overflow-hidden rounded-2xl border border-border/40 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
                  <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
                </div>
                <div className={`rounded-xl ${card.lightBg} p-2.5`}>
                  <Icon className={`h-5 w-5 bg-gradient-to-br ${card.gradient} bg-clip-text`} style={{ color: "transparent", backgroundClip: "text", WebkitBackgroundClip: "text" }} />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs font-medium text-muted-foreground transition group-hover:text-orange-600">
                <span>Se detaljer</span>
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </div>
              {/* Decorative gradient */}
              <div className={`absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-gradient-to-br ${card.gradient} opacity-[0.06] transition group-hover:opacity-[0.12]`} />
            </Link>
          );
        })}
      </div>

      {/* Quick actions */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <Zap className="h-4 w-4 text-orange-500" />
          <h2 className="text-sm font-semibold text-foreground">Hurtige handlinger</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition ${action.color}`}
              >
                <Icon className="h-4 w-4" />
                {action.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Content grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upcoming bookings */}
        <div className="rounded-2xl border border-border/40 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-orange-50 p-1.5">
                <CalendarDays className="h-4 w-4 text-orange-600" />
              </div>
              <h2 className="text-sm font-semibold text-foreground">Næste bookinger</h2>
            </div>
            <Link href="/admin/bookings" className="text-xs font-medium text-orange-600 hover:text-orange-700">
              Se alle
            </Link>
          </div>
          <div className="space-y-2">
            {(data?.upcomingBookings || []).length === 0 ? (
              <div className="flex flex-col items-center py-6 text-center">
                <CalendarDays className="mb-2 h-8 w-8 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">Ingen bookinger fundet.</p>
              </div>
            ) : (
              data?.upcomingBookings?.map((booking) => (
                <Link
                  key={booking.id}
                  href={`/admin/bookings/${booking.id}`}
                  className="group block rounded-xl border border-border/40 bg-white px-4 py-3 transition hover:border-orange-200 hover:bg-orange-50/30"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {booking.customer_name || "Ukendt kunde"}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDateTime(booking.slot_start)}
                      </div>
                    </div>
                    <StatusDot status={booking.status} />
                  </div>
                  {booking.source && (
                    <p className="mt-1.5 text-[11px] font-medium text-muted-foreground/70">
                      {booking.source}
                    </p>
                  )}
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Latest leads */}
        <div className="rounded-2xl border border-border/40 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-blue-50 p-1.5">
                <MessageSquare className="h-4 w-4 text-blue-600" />
              </div>
              <h2 className="text-sm font-semibold text-foreground">Nye leads</h2>
            </div>
            <Link href="/admin/leads" className="text-xs font-medium text-blue-600 hover:text-blue-700">
              Se alle
            </Link>
          </div>
          <div className="space-y-2">
            {(data?.latestLeads || []).length === 0 ? (
              <div className="flex flex-col items-center py-6 text-center">
                <MessageSquare className="mb-2 h-8 w-8 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">Ingen nye leads.</p>
              </div>
            ) : (
              data?.latestLeads?.map((lead) => (
                <Link
                  key={lead.id}
                  href={`/admin/leads/${lead.id}`}
                  className="group block rounded-xl border border-border/40 bg-white px-4 py-3 transition hover:border-blue-200 hover:bg-blue-50/30"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">{lead.name}</p>
                      <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {lead.phone}
                        </span>
                        <span className="rounded-md bg-muted/60 px-1.5 py-0.5 text-[10px] font-medium">
                          {lead.service}
                        </span>
                      </div>
                    </div>
                    <StatusDot status={lead.status} />
                  </div>
                  <p className="mt-1.5 text-[11px] text-muted-foreground/70">
                    {formatRelativeTime(lead.created_at)}
                  </p>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Latest estimators */}
        <div className="rounded-2xl border border-border/40 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-violet-50 p-1.5">
                <Calculator className="h-4 w-4 text-violet-600" />
              </div>
              <h2 className="text-sm font-semibold text-foreground">Nye estimatorer</h2>
            </div>
            <Link href="/admin/estimator" className="text-xs font-medium text-violet-600 hover:text-violet-700">
              Se alle
            </Link>
          </div>
          <div className="space-y-2">
            {(data?.latestEstimators || []).length === 0 ? (
              <div className="flex flex-col items-center py-6 text-center">
                <Calculator className="mb-2 h-8 w-8 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">Ingen nye estimatorer.</p>
              </div>
            ) : (
              data?.latestEstimators?.map((estimator) => (
                <Link
                  key={estimator.id}
                  href="/admin/estimator"
                  className="group block rounded-xl border border-border/40 bg-white px-4 py-3 transition hover:border-violet-200 hover:bg-violet-50/30"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">{estimator.name}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground/70">
                        {formatRelativeTime(estimator.created_at)}
                      </p>
                    </div>
                    <StatusDot status={estimator.status} />
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
