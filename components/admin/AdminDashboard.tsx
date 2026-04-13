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
  AlertTriangle,
  CheckCircle2,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

type ActionItem = {
  id: string;
  type: "booking" | "lead" | "estimator";
  customer_name: string;
  phone?: string;
  created_at: string;
  status?: string;
};

type ActionResponse = {
  urgent_actions: ActionItem[];
  today_tasks: ActionItem[];
  kpis: {
    new_leads_this_week: number;
    new_leads_last_week: number;
    conversion_rate: number;
    avg_response_time_hours: number;
    revenue_this_week: number;
  };
};

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

const getActionLink = (type: string, id: string): string => {
  switch (type) {
    case "booking":
      return `/admin/bookings/${id}`;
    case "lead":
      return `/admin/leads?open=${id}`;
    case "estimator":
      return `/admin/estimator?open=${id}`;
    default:
      return "#";
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case "booking":
      return CalendarDays;
    case "lead":
      return MessageSquare;
    case "estimator":
      return Calculator;
    default:
      return Clock;
  }
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("da-DK", {
    style: "currency",
    currency: "DKK",
    maximumFractionDigits: 0,
  }).format(amount);
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

const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse rounded-lg bg-muted/40 ${className}`} />
);

export const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [loadingActions, setLoadingActions] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [actionData, setActionData] = useState<ActionResponse | null>(null);

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

  const loadActions = async () => {
    setLoadingActions(true);
    try {
      const response = await fetch("/api/admin/dashboard/actions", { cache: "no-store" });
      if (response.ok) {
        const payload = (await response.json()) as ActionResponse;
        setActionData(payload);
      }
    } catch (error) {
      console.error("Error loading actions:", error);
    } finally {
      setLoadingActions(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    loadActions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const counts = data?.counts || {
    leadsNew: 0,
    estimatorsNew: 0,
    bookingsToday: 0,
    bookingsNext7: 0,
  };

  const handleRefresh = async () => {
    await Promise.all([loadDashboard(), loadActions()]);
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
          onClick={() => handleRefresh()}
          disabled={loading || loadingActions}
          variant="outline"
          className="gap-2"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading || loadingActions ? "animate-spin" : ""}`} />
          {loading || loadingActions ? "Henter..." : "Opdater"}
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-semibold">{error}</p>
        </div>
      )}

      {/* Section 1: Urgent Actions (Red accent) */}
      <div className="rounded-2xl border-2 border-red-200 bg-white p-6">
        <div className="mb-4 flex items-center gap-2">
          <div className="rounded-lg bg-red-50 p-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Akutte handlinger</h2>
        </div>
        {loadingActions ? (
          <div className="space-y-2">
            {[...Array(2)].map((_, i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        ) : (actionData?.urgent_actions || []).length === 0 ? (
          <div className="flex items-center justify-center gap-2 py-8 text-emerald-700">
            <CheckCircle2 className="h-5 w-5" />
            <p className="font-medium">Ingen akutte handlinger</p>
          </div>
        ) : (
          <div className="space-y-2">
            {actionData?.urgent_actions.map((action) => {
              const Icon = getTypeIcon(action.type);
              const link = getActionLink(action.type, action.id);
              return (
                <Link
                  key={`${action.type}-${action.id}`}
                  href={link}
                  className="group flex items-center gap-3 rounded-xl border border-border/40 bg-white px-4 py-3 transition hover:border-red-200 hover:bg-red-50/20"
                >
                  <div className="rounded-lg bg-red-50 p-2">
                    <Icon className="h-4 w-4 text-red-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{action.customer_name}</p>
                    {action.phone && (
                      <p className="text-xs text-muted-foreground">{action.phone}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      {formatRelativeTime(action.created_at)}
                    </span>
                    {action.status && <StatusDot status={action.status} />}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 2: Today's Tasks (Yellow/Amber accent) */}
      <div className="rounded-2xl border-2 border-amber-200 bg-white p-6">
        <div className="mb-4 flex items-center gap-2">
          <div className="rounded-lg bg-amber-50 p-2">
            <Clock className="h-5 w-5 text-amber-600" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Dagens opgaver</h2>
        </div>
        {loadingActions ? (
          <div className="space-y-2">
            {[...Array(2)].map((_, i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        ) : (actionData?.today_tasks || []).length === 0 ? (
          <div className="flex items-center justify-center gap-2 py-8 text-emerald-700">
            <CheckCircle2 className="h-5 w-5" />
            <p className="font-medium">Alle opgaver er afsluttet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {actionData?.today_tasks.map((task) => {
              const Icon = getTypeIcon(task.type);
              const link = getActionLink(task.type, task.id);
              return (
                <Link
                  key={`${task.type}-${task.id}`}
                  href={link}
                  className="group flex items-center gap-3 rounded-xl border border-border/40 bg-white px-4 py-3 transition hover:border-amber-200 hover:bg-amber-50/20"
                >
                  <div className="rounded-lg bg-amber-50 p-2">
                    <Icon className="h-4 w-4 text-amber-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{task.customer_name}</p>
                    {task.phone && (
                      <p className="text-xs text-muted-foreground">{task.phone}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      {formatRelativeTime(task.created_at)}
                    </span>
                    {task.status && <StatusDot status={task.status} />}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 3: KPIs Grid (Blue accent) */}
      <div>
        <div className="mb-4 flex items-center gap-2">
          <div className="rounded-lg bg-blue-50 p-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Overblik</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {loadingActions ? (
            <>
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </>
          ) : actionData ? (
            <>
              {/* KPI 1: New Leads This Week */}
              <div className="rounded-2xl border-2 border-blue-200 bg-white p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Nye leads denne uge</p>
                    <p className="mt-2 text-3xl font-bold text-foreground">{actionData.kpis.new_leads_this_week}</p>
                    <div className="mt-2 flex items-center gap-1 text-xs font-medium">
                      {actionData.kpis.new_leads_this_week >= actionData.kpis.new_leads_last_week ? (
                        <>
                          <ArrowUp className="h-3 w-3 text-emerald-600" />
                          <span className="text-emerald-600">
                            {Math.round(
                              ((actionData.kpis.new_leads_this_week - actionData.kpis.new_leads_last_week) /
                                Math.max(actionData.kpis.new_leads_last_week, 1)) *
                                100
                            )}
                            %
                          </span>
                        </>
                      ) : (
                        <>
                          <ArrowDown className="h-3 w-3 text-red-600" />
                          <span className="text-red-600">
                            {Math.round(
                              ((actionData.kpis.new_leads_last_week - actionData.kpis.new_leads_this_week) /
                                Math.max(actionData.kpis.new_leads_last_week, 1)) *
                                100
                            )}
                            %
                          </span>
                        </>
                      )}
                      <span className="text-muted-foreground">vs. sidste uge</span>
                    </div>
                  </div>
                  <div className="rounded-xl bg-blue-50 p-3">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* KPI 2: Conversion Rate */}
              <div className="rounded-2xl border-2 border-blue-200 bg-white p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Konverteringsrate</p>
                    <p className="mt-2 text-3xl font-bold text-foreground">
                      {actionData.kpis.conversion_rate.toFixed(1)}%
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">Af leads til booking</p>
                  </div>
                  <div className="rounded-xl bg-blue-50 p-3">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* KPI 3: Average Response Time */}
              <div className="rounded-2xl border-2 border-blue-200 bg-white p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Gns. svartid</p>
                    <p className="mt-2 text-3xl font-bold text-foreground">
                      {actionData.kpis.avg_response_time_hours.toFixed(1)}h
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">Timer</p>
                  </div>
                  <div className="rounded-xl bg-blue-50 p-3">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* KPI 4: Revenue This Week */}
              <div className="rounded-2xl border-2 border-blue-200 bg-white p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Omsætning denne uge</p>
                    <p className="mt-2 text-3xl font-bold text-foreground">
                      {formatCurrency(actionData.kpis.revenue_this_week)}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">DKK</p>
                  </div>
                  <div className="rounded-xl bg-blue-50 p-3">
                    <Calculator className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>

      {/* Quick Action Buttons Section Header */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <Zap className="h-4 w-4 text-orange-500" />
          <h2 className="text-sm font-semibold text-foreground">Hurtige handlinger</h2>
        </div>
      </div>

      {/* Quick action buttons */}
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
  );
};
