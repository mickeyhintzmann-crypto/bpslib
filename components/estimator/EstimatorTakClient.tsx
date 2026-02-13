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

    return { min, max, status, hasEstimate };
  }, [searchParams, initialMin, initialMax, initialStatus]);

  const bookingParams = new URLSearchParams();
  if (id) bookingParams.set("estimator_id", id);
  if (typeof resolved.min === "number") bookingParams.set("min", String(resolved.min));
  if (typeof resolved.max === "number") bookingParams.set("max", String(resolved.max));

  return (
    <>
      {resolved.hasEstimate ? (
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4">
          <p className="text-sm font-semibold text-foreground">Dit AI-prisestimat</p>
          <p className="mt-2 text-2xl font-semibold text-primary">
            {resolved.min}–{resolved.max} kr.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Prisen gælder først efter bookingbekræftelse. Vi kontakter dig hurtigt, hvis der er
            spørgsmål til opgaven.
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
          <Link href={`/bordpladeslibning/book?${bookingParams.toString()}`}>Book tid</Link>
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
