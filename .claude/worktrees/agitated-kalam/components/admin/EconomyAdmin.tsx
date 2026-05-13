"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

type EconomySummary = {
  revenueWeek: number;
  revenueMonth: number;
  revenueQuarter: number;
  bookingsTotal: number;
  bookingsMonth: number;
  aov: number;
  median: number;
  conversionRate: number;
  occupancyPercent: number;
  acuteCount: number;
};

type EconomyResponse = {
  summary?: EconomySummary;
  message?: string;
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("da-DK", {
    style: "currency",
    currency: "DKK",
    maximumFractionDigits: 0
  }).format(value || 0);

export const EconomyAdmin = () => {
  const [data, setData] = useState<EconomySummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadEconomy = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/okonomi", { cache: "no-store" });
      const payload = (await response.json()) as EconomyResponse;
      if (!response.ok || !payload.summary) {
        setError(payload.message || "Kunne ikke hente økonomi.");
        return;
      }
      setData(payload.summary);
    } catch (fetchError) {
      console.error(fetchError);
      setError("Netværksfejl ved hentning af økonomi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEconomy();
  }, []);

  return (
    <section className="space-y-6 rounded-2xl border border-border/70 bg-white/70 p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">Økonomi & statistik</h1>
          <p className="text-sm text-muted-foreground">Oversigt over omsætning og belægning.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={loadEconomy} disabled={loading}>
            {loading ? "Henter..." : "Opdater"}
          </Button>
          <Button asChild>
            <a href="/api/admin/okonomi?format=csv">Download CSV</a>
          </Button>
        </div>
      </div>

      {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}

      {!data ? (
        <p className="text-sm text-muted-foreground">Indlæser statistik...</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-background/70 p-4">
            <p className="text-xs uppercase text-muted-foreground">Omsætning (uge)</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{formatCurrency(data.revenueWeek)}</p>
          </div>
          <div className="rounded-xl border border-border bg-background/70 p-4">
            <p className="text-xs uppercase text-muted-foreground">Omsætning (måned)</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{formatCurrency(data.revenueMonth)}</p>
          </div>
          <div className="rounded-xl border border-border bg-background/70 p-4">
            <p className="text-xs uppercase text-muted-foreground">Omsætning (kvartal)</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{formatCurrency(data.revenueQuarter)}</p>
          </div>

          <div className="rounded-xl border border-border bg-background/70 p-4">
            <p className="text-xs uppercase text-muted-foreground">Bookinger (total)</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{data.bookingsTotal}</p>
            <p className="text-xs text-muted-foreground">Sidste 30 dage: {data.bookingsMonth}</p>
          </div>
          <div className="rounded-xl border border-border bg-background/70 p-4">
            <p className="text-xs uppercase text-muted-foreground">AOV / median</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {formatCurrency(data.aov)} · {formatCurrency(data.median)}
            </p>
          </div>
          <div className="rounded-xl border border-border bg-background/70 p-4">
            <p className="text-xs uppercase text-muted-foreground">Belægningsgrad (7 dage)</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{data.occupancyPercent}%</p>
          </div>

          <div className="rounded-xl border border-border bg-background/70 p-4">
            <p className="text-xs uppercase text-muted-foreground">Konvertering estimator → booking</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{data.conversionRate}%</p>
          </div>
          <div className="rounded-xl border border-border bg-background/70 p-4">
            <p className="text-xs uppercase text-muted-foreground">Akutte bookinger (30 dage)</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{data.acuteCount}</p>
          </div>
        </div>
      )}
    </section>
  );
};
