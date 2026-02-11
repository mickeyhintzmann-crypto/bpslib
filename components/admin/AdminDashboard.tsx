"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

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
  if (Number.isNaN(date.getTime())) {
    return "Ukendt";
  }
  return new Intl.DateTimeFormat("da-DK", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(date);
};

const formatDate = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "Ukendt";
  }
  return new Intl.DateTimeFormat("da-DK", {
    dateStyle: "short"
  }).format(date);
};

export const AdminDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<DashboardResponse | null>(null);

  const loadDashboard = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/dashboard", {
        cache: "no-store"
      });

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
    bookingsNext7: 0
  };

  return (
    <section className="space-y-6 rounded-2xl border border-border/70 bg-white/70 p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">Admin dashboard</h1>
          <p className="text-sm text-muted-foreground">Overblik over drift lige nu.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/ai-traening">AI træning</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/cases">Cases</Link>
          </Button>
          <Button onClick={() => loadDashboard()} disabled={loading}>
            {loading ? "Henter..." : "Opdater"}
          </Button>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-semibold">{error}</p>
          {error.toLowerCase().includes("bookings") ? (
            <p className="mt-2 text-xs text-red-600">
              Kør migrationerne:{" "}
              <code>supabase/migrations/20260207_000000_bookings_base.sql</code> og{" "}
              <code>supabase/migrations/20260208_000007_bookings_admin_columns.sql</code>
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-border bg-background/70 p-4">
          <p className="text-xs uppercase text-muted-foreground">Nye leads</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{counts.leadsNew}</p>
        </div>
        <div className="rounded-xl border border-border bg-background/70 p-4">
          <p className="text-xs uppercase text-muted-foreground">Nye estimatorer</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{counts.estimatorsNew}</p>
        </div>
        <div className="rounded-xl border border-border bg-background/70 p-4">
          <p className="text-xs uppercase text-muted-foreground">Bookinger i dag</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{counts.bookingsToday}</p>
        </div>
        <div className="rounded-xl border border-border bg-background/70 p-4">
          <p className="text-xs uppercase text-muted-foreground">Næste 7 dage</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{counts.bookingsNext7}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-background/70 p-4">
          <h2 className="text-lg font-semibold text-foreground">Næste bookinger</h2>
          <div className="mt-3 space-y-3 text-sm">
            {(data?.upcomingBookings || []).length === 0 ? (
              <p className="text-muted-foreground">Ingen bookinger fundet.</p>
            ) : (
              data?.upcomingBookings?.map((booking) => (
                <Link
                  key={booking.id}
                  href={`/admin/bookings/${booking.id}`}
                  className="block rounded-lg border border-border/60 bg-white/80 px-3 py-2 hover:border-primary"
                >
                  <p className="font-semibold text-foreground">
                    {formatDateTime(booking.slot_start)} · {booking.customer_name || "Ukendt"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {booking.source || "-"} · {booking.status || "-"}
                  </p>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-background/70 p-4">
          <h2 className="text-lg font-semibold text-foreground">Nye leads</h2>
          <div className="mt-3 space-y-3 text-sm">
            {(data?.latestLeads || []).length === 0 ? (
              <p className="text-muted-foreground">Ingen nye leads.</p>
            ) : (
              data?.latestLeads?.map((lead) => (
                <Link
                  key={lead.id}
                  href={`/admin/leads/${lead.id}`}
                  className="block rounded-lg border border-border/60 bg-white/80 px-3 py-2 hover:border-primary"
                >
                  <p className="font-semibold text-foreground">
                    {formatDate(lead.created_at)} · {lead.service} · {lead.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {lead.phone} · {lead.status}
                  </p>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-background/70 p-4">
          <h2 className="text-lg font-semibold text-foreground">Nye estimatorer</h2>
          <div className="mt-3 space-y-3 text-sm">
            {(data?.latestEstimators || []).length === 0 ? (
              <p className="text-muted-foreground">Ingen nye estimatorer.</p>
            ) : (
              data?.latestEstimators?.map((estimator) => (
                <Link
                  key={estimator.id}
                  href="/admin/estimator"
                  className="block rounded-lg border border-border/60 bg-white/80 px-3 py-2 hover:border-primary"
                >
                  <p className="font-semibold text-foreground">
                    {formatDate(estimator.created_at)} · {estimator.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{estimator.status}</p>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
