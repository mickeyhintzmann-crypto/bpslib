"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

const TOKEN_STORAGE_KEY = "bpslib_admin_token";

type BookingItem = {
  id: string;
  created_at: string;
  status: string;
  service_type: string;
  source: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  slot_start: string;
  slot_end: string;
  notes: string | null;
  estimator_request_id: string | null;
};

type BookingResponse = {
  item?: BookingItem;
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

export const BookingAdminDetail = ({ bookingId }: { bookingId: string }) => {
  const [token, setToken] = useState("");
  const [item, setItem] = useState<BookingItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = window.localStorage.getItem(TOKEN_STORAGE_KEY);
    if (stored) {
      setToken(stored);
    }
  }, []);

  const loadBooking = async () => {
    const trimmed = token.trim();
    if (!trimmed) {
      setError("Indtast admin-token.");
      return;
    }

    setLoading(true);
    setError("");
    setItem(null);

    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        headers: {
          "x-admin-token": trimmed
        },
        cache: "no-store"
      });

      const payload = (await response.json()) as BookingResponse;
      if (!response.ok || !payload.item) {
        setError(payload.message || "Kunne ikke hente booking.");
        return;
      }

      window.localStorage.setItem(TOKEN_STORAGE_KEY, trimmed);
      setItem(payload.item);
    } catch (fetchError) {
      console.error(fetchError);
      setError("Netværksfejl ved hentning af booking.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-10">
      <div className="space-y-5 rounded-2xl border border-border/70 bg-white/70 p-5 md:p-6">
        <h1 className="font-display text-3xl font-semibold text-foreground">Booking detaljer</h1>
        <p className="text-sm text-muted-foreground">Booking ID: {bookingId}</p>

        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <input
            type="password"
            value={token}
            onChange={(event) => setToken(event.target.value)}
            placeholder="Indtast ADMIN_TOKEN"
            className="h-10 rounded-md border border-border bg-white px-3 text-sm"
          />
          <Button onClick={loadBooking} disabled={loading}>
            {loading ? "Henter..." : "Hent booking"}
          </Button>
        </div>

        {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}

        {item ? (
          <div className="grid gap-3 rounded-xl border border-border bg-background/60 p-4 text-sm sm:grid-cols-2">
            <p>
              <span className="font-semibold text-foreground">Status:</span> {item.status}
            </p>
            <p>
              <span className="font-semibold text-foreground">Source:</span> {item.source || "Ikke angivet"}
            </p>
            <p>
              <span className="font-semibold text-foreground">Kunde:</span> {item.customer_name}
            </p>
            <p>
              <span className="font-semibold text-foreground">Telefon:</span> {item.customer_phone}
            </p>
            <p>
              <span className="font-semibold text-foreground">Email:</span> {item.customer_email || "Ikke angivet"}
            </p>
            <p>
              <span className="font-semibold text-foreground">Service:</span> {item.service_type}
            </p>
            <p>
              <span className="font-semibold text-foreground">Start:</span> {formatDateTime(item.slot_start)}
            </p>
            <p>
              <span className="font-semibold text-foreground">Slut:</span> {formatDateTime(item.slot_end)}
            </p>
            <p className="sm:col-span-2">
              <span className="font-semibold text-foreground">Noter:</span> {item.notes || "Ingen noter"}
            </p>
            <p className="sm:col-span-2">
              <span className="font-semibold text-foreground">Estimator sag:</span>{" "}
              {item.estimator_request_id ? (
                <Link
                  href="/admin/estimator"
                  className="font-semibold text-primary"
                >
                  {item.estimator_request_id}
                </Link>
              ) : (
                "Ikke angivet"
              )}
            </p>
          </div>
        ) : null}
      </div>
    </main>
  );
};
