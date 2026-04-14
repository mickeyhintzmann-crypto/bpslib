"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

type EstimatorInfo = {
  id: string;
  createdAt: string;
  customerName: string | null;
  service: string;
  boardCount: number | null;
  priceMin: number | null;
  priceMax: number | null;
  aiPriceMin: number | null;
  aiPriceMax: number | null;
  adminPriceMin: number | null;
  adminPriceMax: number | null;
  approvalStatus: "pending" | "approved" | "adjusted";
  adjustmentNote: string | null;
  approvedAt: string | null;
  images: Array<{ name: string; url: string | null }>;
};

type EstimatorResponse = {
  item?: EstimatorInfo;
  message?: string;
};

const SERVICE_LABELS: Record<string, string> = {
  bordplade: "Bordpladeslibning",
  gulvafslibning: "Gulvafslibning",
  gulvlaegning: "Gulvlægning",
};

const SERVICE_BOOKING_URL: Record<string, string> = {
  bordplade: "/bordpladeslibning/book",
  gulvafslibning: "/gulvafslibning/book",
  gulvlaegning: "/gulvlaegning/book",
};

const formatPrice = (min: number | null, max: number | null) => {
  if (typeof min !== "number" || typeof max !== "number") return "Beregnes...";
  if (min === max) return `${min.toLocaleString("da-DK")} kr`;
  return `${min.toLocaleString("da-DK")}–${max.toLocaleString("da-DK")} kr`;
};

const POLL_INTERVAL = 15_000;

export const ManageEstimatorClient = ({ token }: { token: string }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<EstimatorInfo | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadData = useCallback(async () => {
    try {
      const res = await fetch(`/api/estimator/manage/${token}`, { cache: "no-store" });
      const payload = (await res.json()) as EstimatorResponse;
      if (!res.ok || !payload.item) {
        setError(payload.message || "Kunne ikke indlæse prisberegning.");
        setLoading(false);
        return;
      }
      setData(payload.item);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Netværksfejl ved indlæsning.");
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!data) return;
    if (data.approvalStatus === "pending") {
      pollRef.current = setInterval(loadData, POLL_INTERVAL);
      return () => {
        if (pollRef.current) clearInterval(pollRef.current);
      };
    }
    if (pollRef.current) clearInterval(pollRef.current);
  }, [data, loadData]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <p className="text-muted-foreground">Indlæser din prisberegning...</p>
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="mx-auto max-w-3xl px-4 py-16">
          <h1 className="font-display text-3xl font-semibold text-foreground">Linket er ugyldigt</h1>
          <p className="mt-4 text-muted-foreground">{error || "Vi kunne ikke finde din prisberegning."}</p>
          <div className="mt-6">
            <Link href="/">
              <Button variant="outline">Tilbage til forsiden</Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const isPending = data.approvalStatus === "pending";
  const isApproved = data.approvalStatus === "approved";
  const isAdjusted = data.approvalStatus === "adjusted";
  const priceDisplay = formatPrice(data.priceMin, data.priceMax);
  const serviceLabel = SERVICE_LABELS[data.service] || "Slibning";
  const bookingUrl = SERVICE_BOOKING_URL[data.service] || "/booking";
  const bookingUrlWithPrice = `${bookingUrl}?priceToken=${token}`;

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="mx-auto max-w-3xl px-4 py-8 md:py-12">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Prisberegning</p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-foreground md:text-4xl">
            Hej {data.customerName || "kunde"}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {serviceLabel}
            {data.boardCount ? ` · ${data.boardCount} bordplade${data.boardCount > 1 ? "r" : ""}` : ""}
          </p>
        </div>

        {/* ─── STATUS BANNER ─── */}
        {isPending ? (
          <div className="mb-6 rounded-2xl border-2 border-amber-300 bg-amber-50 p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-200">
                <span className="text-xl">⏳</span>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-amber-900">Vi gennemgår din beregning</h2>
                <p className="mt-1 text-sm text-amber-900/80">
                  Din foreløbige pris er <strong>{priceDisplay}</strong>. Prisen er et estimat baseret på dine billeder og oplysninger.
                  Vi bekræfter eller justerer prisen hurtigst muligt — du får besked på SMS og email når det er klar.
                </p>
                <p className="mt-3 text-xs text-amber-800">
                  Denne side opdateres automatisk når vi har gennemgået din sag.
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {isApproved ? (
          <div className="mb-6 rounded-2xl border-2 border-emerald-400 bg-emerald-50 p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-200">
                <span className="text-xl">✓</span>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-emerald-900">Din pris er bekræftet</h2>
                <p className="mt-1 text-sm text-emerald-900/80">
                  Vi har gennemgået din sag og bekræftet den foreløbige pris. Du kan nu booke din tid med denne pris.
                </p>
                <p className="mt-2 text-2xl font-bold text-emerald-900">{priceDisplay}</p>
                <div className="mt-4">
                  <Link href={bookingUrlWithPrice}>
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                      Book din tid →
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {isAdjusted ? (
          <div className="mb-6 rounded-2xl border-2 border-orange-400 bg-orange-50 p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-200">
                <span className="text-xl">!</span>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-orange-900">Vi har justeret din pris</h2>
                <p className="mt-1 text-sm text-orange-900/80">
                  Efter gennemgang af din sag har vi justeret prisen.
                </p>
                {data.adjustmentNote ? (
                  <p className="mt-2 rounded-lg bg-orange-100 p-3 text-sm text-orange-900">
                    <span className="font-semibold">Begrundelse:</span> {data.adjustmentNote}
                  </p>
                ) : null}
                <p className="mt-3 text-2xl font-bold text-orange-900">{priceDisplay}</p>
                <div className="mt-4">
                  <Link href={bookingUrlWithPrice}>
                    <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                      Book din tid med den nye pris →
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* ─── Billeder ─── */}
        {data.images.length > 0 ? (
          <div className="mb-6 rounded-2xl border border-border bg-white p-6">
            <h3 className="text-lg font-semibold text-foreground">Dine billeder</h3>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {data.images.map((img, idx) => (
                <div key={idx} className="aspect-square overflow-hidden rounded-lg border border-border bg-muted">
                  {img.url ? (
                    <a href={img.url} target="_blank" rel="noreferrer">
                      <img src={img.url} alt={img.name} className="h-full w-full object-cover" />
                    </a>
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                      Ingen preview
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* ─── Kontakt ─── */}
        <div className="mb-6 rounded-2xl border border-border bg-white p-6">
          <h3 className="text-lg font-semibold text-foreground">Spørgsmål?</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Har du spørgsmål til din prisberegning, er du velkommen til at kontakte os.
          </p>
          <div className="mt-3 space-y-1 text-sm">
            <p>
              <span className="font-semibold">Telefon:</span>{" "}
              <a href="tel:+4570228830" className="text-blue-700 hover:underline">+45 70 22 88 30</a>
            </p>
            <p>
              <span className="font-semibold">Email:</span>{" "}
              <a href="mailto:info@bpslib.dk" className="text-blue-700 hover:underline">info@bpslib.dk</a>
            </p>
          </div>
        </div>

        <div className="text-center">
          <Link href="/">
            <Button variant="outline">Tilbage til forsiden</Button>
          </Link>
        </div>
      </div>
    </main>
  );
};
