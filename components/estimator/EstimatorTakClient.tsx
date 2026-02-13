"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";

type EstimatorTakClientProps = {
  id?: string;
  initialMin?: number | null;
  initialMax?: number | null;
  initialStatus?: string;
};

const parseNumber = (value: string | null) => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  return Number.parseInt(trimmed, 10);
};

export const EstimatorTakClient = ({
  id,
  initialMin = null,
  initialMax = null,
  initialStatus
}: EstimatorTakClientProps) => {
  const searchParams = useSearchParams();

  const resolved = useMemo(() => {
    const minFromUrl = parseNumber(searchParams.get("min"));
    const maxFromUrl = parseNumber(searchParams.get("max"));
    const statusFromUrl = searchParams.get("status") || "";

    const min = minFromUrl ?? initialMin;
    const max = maxFromUrl ?? initialMax;
    const status = statusFromUrl || initialStatus || "";

    const hasEstimate =
      typeof min === "number" &&
      typeof max === "number" &&
      Number.isFinite(min) &&
      Number.isFinite(max) &&
      min <= max;

    const isFixed = hasEstimate && min === max;
    return { min, max, status, hasEstimate, isFixed };
  }, [searchParams, initialMin, initialMax, initialStatus]);

  const bookingUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (id) params.set("estimator_id", id);
    if (typeof resolved.min === "number") params.set("min", String(resolved.min));
    if (typeof resolved.max === "number") params.set("max", String(resolved.max));
    return `/bordpladeslibning/book?${params.toString()}`;
  }, [id, resolved.max, resolved.min]);

  return (
    <>
      {resolved.hasEstimate ? (
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
            <span className="rounded-full bg-primary/10 px-2.5 py-1">AI-pris estimeret</span>
            {resolved.isFixed ? <span className="text-muted-foreground">Fast pris</span> : null}
          </div>
          <p className="mt-3 text-2xl font-semibold text-primary">
            {resolved.isFixed ? `${resolved.min} kr.` : `${resolved.min}–${resolved.max} kr.`}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Dette er et prisestimat. Prisen gælder først, når en medarbejder har bekræftet din booking.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border/70 bg-white/70 p-4 text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">Kunne ikke beregnes</p>
          <p className="mt-2">
            Du modtager pris fra en medarbejder hurtigst muligt. Vi kontakter dig på telefonen.
          </p>
        </div>
      )}

      {resolved.status && resolved.status !== "estimated" ? (
        <p className="text-sm text-muted-foreground">
          Status: {resolved.status === "manual" ? "Manuel vurdering" : resolved.status}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href={bookingUrl}>Book nu</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/bordpladeslibning/pris">Se prisguide</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/kontakt">Ring mig op</Link>
        </Button>
      </div>
    </>
  );
};
