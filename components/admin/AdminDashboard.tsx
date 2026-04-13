"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  MessageSquare,
  Calculator,
  RefreshCw,
  ArrowRight,
  Phone,
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

const formatRelativeTime = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "lige nu";
  if (diffMins < 60) return `${diffMins} min siden`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}t siden`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d siden`;
};

const formatBookingTime = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("da-DK", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 6) return "God nat";
  if (hour < 12) return "God morgen";
  if (hour < 17) return "God eftermiddag";
  return "God aften";
};

const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse rounded-lg bg-muted/40 ${className}`} />
);

const statusLabels: Record<string, string> = {
  new: "Ny",
  pending: "Afventer",
  pending_confirmation: "Afventer bekr.",
  confirmed: "Bekræftet",
  contacted: "Kontaktet",
  Ny: "Ny",
};

export const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
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
    } catch {
      setError("Netværksfejl ved hentning af dashboard.");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const counts = data?.counts || {
    leadsNew: 0,
    estimatorsNew: 0,
    bookingsToday: 0,
    bookingsNext7: 0,
  };

  return (
    <div className="space-y-8">
      {/* Velkomst */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{getGreeting()}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Her er hvad der venter på dig.
          </p>
        </div>
        <Button onClick={loadDashboard} disabled={loading} variant="outline" className="gap-2">
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Opdater
        </Button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* 3 store kategorikort */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Bookinger */}
        <Link
          href="/admin/bookings"
          className="group rounded-2xl border-2 border-orange-200 bg-white p-6 transition hover:border-orange-400 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-orange-50 p-3">
              <CalendarDays className="h-6 w-6 text-orange-600" />
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
          </div>
          <div className="mt-4">
            {loading ? (
              <Skeleton className="h-10 w-16" />
            ) : (
              <p className="text-3xl font-bold text-foreground">{counts.bookingsToday}</p>
            )}
            <p className="mt-1 text-sm font-medium text-muted-foreground">Bookinger i dag</p>
            {!loading && counts.bookingsNext7 > 0 && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {counts.bookingsNext7} de næste 7 dage
              </p>
            )}
          </div>
        </Link>

        {/* Prisberegner */}
        <Link
          href="/admin/estimator"
          className="group rounded-2xl border-2 border-violet-200 bg-white p-6 transition hover:border-violet-400 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-violet-50 p-3">
              <Calculator className="h-6 w-6 text-violet-600" />
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
          </div>
          <div className="mt-4">
            {loading ? (
              <Skeleton className="h-10 w-16" />
            ) : (
              <p className="text-3xl font-bold text-foreground">{counts.estimatorsNew}</p>
            )}
            <p className="mt-1 text-sm font-medium text-muted-foreground">
              Nye prisforespørgsler
            </p>
          </div>
        </Link>

        {/* Henvendelser */}
        <Link
          href="/admin/leads"
          className="group rounded-2xl border-2 border-blue-200 bg-white p-6 transition hover:border-blue-400 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-blue-50 p-3">
              <MessageSquare className="h-6 w-6 text-blue-600" />
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
          </div>
          <div className="mt-4">
            {loading ? (
              <Skeleton className="h-10 w-16" />
            ) : (
              <p className="text-3xl font-bold text-foreground">{counts.leadsNew}</p>
            )}
            <p className="mt-1 text-sm font-medium text-muted-foreground">
              Nye henvendelser
            </p>
          </div>
        </Link>
      </div>

      {/* Seneste bookinger */}
      {!loading && data?.upcomingBookings && data.upcomingBookings.length > 0 && (
        <div className="rounded-2xl border border-border/60 bg-white">
          <div className="flex items-center justify-between border-b border-border/40 px-5 py-4">
            <h2 className="text-sm font-semibold text-foreground">Kommende bookinger</h2>
            <Link
              href="/admin/bookings"
              className="text-xs font-medium text-orange-600 hover:underline"
            >
              Se alle
            </Link>
          </div>
          <div className="divide-y divide-border/30">
            {data.upcomingBookings.slice(0, 5).map((booking) => (
              <Link
                key={booking.id}
                href={`/admin/bookings/${booking.id}`}
                className="flex items-center gap-4 px-5 py-3.5 transition hover:bg-orange-50/30"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {booking.customer_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatBookingTime(booking.slot_start)}
                    {booking.source === "acute" && (
                      <span className="ml-2 rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-700">
                        AKUT
                      </span>
                    )}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-orange-50 px-2.5 py-1 text-[11px] font-semibold text-orange-700">
                  {statusLabels[booking.status || ""] || booking.status || "-"}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Seneste leads */}
      {!loading && data?.latestLeads && data.latestLeads.length > 0 && (
        <div className="rounded-2xl border border-border/60 bg-white">
          <div className="flex items-center justify-between border-b border-border/40 px-5 py-4">
            <h2 className="text-sm font-semibold text-foreground">Seneste henvendelser</h2>
            <Link
              href="/admin/leads"
              className="text-xs font-medium text-blue-600 hover:underline"
            >
              Se alle
            </Link>
          </div>
          <div className="divide-y divide-border/30">
            {data.latestLeads.slice(0, 5).map((lead) => (
              <div
                key={lead.id}
                className="flex items-center gap-4 px-5 py-3.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{lead.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {lead.service || "Generel"} &middot; {formatRelativeTime(lead.created_at)}
                  </p>
                </div>
                {lead.phone && (
                  <a
                    href={`tel:+45${lead.phone.replace(/\D/g, "")}`}
                    className="flex shrink-0 items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Phone className="h-3 w-3" />
                    Ring op
                  </a>
                )}
                <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
                  {statusLabels[lead.status] || lead.status || "-"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Seneste estimatorer */}
      {!loading && data?.latestEstimators && data.latestEstimators.length > 0 && (
        <div className="rounded-2xl border border-border/60 bg-white">
          <div className="flex items-center justify-between border-b border-border/40 px-5 py-4">
            <h2 className="text-sm font-semibold text-foreground">Seneste prisforespørgsler</h2>
            <Link
              href="/admin/estimator"
              className="text-xs font-medium text-violet-600 hover:underline"
            >
              Se alle
            </Link>
          </div>
          <div className="divide-y divide-border/30">
            {data.latestEstimators.slice(0, 5).map((est) => (
              <div
                key={est.id}
                className="flex items-center gap-4 px-5 py-3.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{est.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatRelativeTime(est.created_at)}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-semibold text-violet-700">
                  {statusLabels[est.status] || est.status || "-"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
