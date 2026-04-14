"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type PriceTokenData = {
  estimatorId: string;
  priceMin: number;
  priceMax: number;
  service: string;
  boardCount: number;
  customerName: string | null;
  customerPhone: string | null;
  approvalStatus: "approved" | "adjusted";
};

const formatPrice = (min: number, max: number) => {
  if (min === max) return `${min.toLocaleString("da-DK")} kr`;
  return `${min.toLocaleString("da-DK")}–${max.toLocaleString("da-DK")} kr`;
};

/**
 * Viser en banner øverst på booking-siden når kunden kommer fra en godkendt prisberegning.
 * Læser ?priceToken=XXX fra URL, henter den låste pris og viser den.
 */
export const PriceTokenBanner = () => {
  const searchParams = useSearchParams();
  const token = searchParams?.get("priceToken") || null;
  const [data, setData] = useState<PriceTokenData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    fetch(`/api/estimator/price-token/${token}`, { cache: "no-store" })
      .then(async (res) => {
        const payload = (await res.json()) as { item?: PriceTokenData; message?: string };
        if (!res.ok || !payload.item) {
          setError(payload.message || "Kunne ikke hente din pris.");
          return;
        }
        setData(payload.item);
      })
      .catch(() => setError("Netværksfejl."));
  }, [token]);

  if (!token) return null;

  if (error) {
    return (
      <div className="mb-6 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-800">
        <strong>Bemærk:</strong> {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
        Henter din pris...
      </div>
    );
  }

  const priceRange = formatPrice(data.priceMin, data.priceMax);
  const isAdjusted = data.approvalStatus === "adjusted";

  return (
    <div
      className={`mb-6 rounded-2xl border-2 p-5 shadow-sm ${
        isAdjusted ? "border-orange-400 bg-orange-50" : "border-emerald-400 bg-emerald-50"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
          isAdjusted ? "bg-orange-200" : "bg-emerald-200"
        }`}>
          <span className="text-xl">{isAdjusted ? "!" : "✓"}</span>
        </div>
        <div className="flex-1">
          <h2 className={`text-lg font-semibold ${isAdjusted ? "text-orange-900" : "text-emerald-900"}`}>
            {isAdjusted ? "Din justerede pris er klar" : "Din bekræftede pris er klar"}
          </h2>
          <p className={`mt-1 text-sm ${isAdjusted ? "text-orange-900/80" : "text-emerald-900/80"}`}>
            {data.customerName ? `Hej ${data.customerName}! ` : ""}
            Book nedenfor for at få udført opgaven til den aftalte pris:
          </p>
          <p className={`mt-2 text-2xl font-bold ${isAdjusted ? "text-orange-900" : "text-emerald-900"}`}>
            {priceRange}
          </p>
        </div>
      </div>
    </div>
  );
};
