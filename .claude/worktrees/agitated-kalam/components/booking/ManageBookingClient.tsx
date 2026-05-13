"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

type BookingInfo = {
  id: string;
  slotStart: string;
  slotEnd: string;
  slotCount: number;
  status: string | null;
};

type BookingResponse = {
  item?: BookingInfo;
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

export const ManageBookingClient = ({ token }: { token: string }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [booking, setBooking] = useState<BookingInfo | null>(null);
  const [cancelMessage, setCancelMessage] = useState("");
  const [rescheduleMessage, setRescheduleMessage] = useState("");
  const [rescheduleNote, setRescheduleNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadBooking = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`/api/bookings/manage/${token}`, { cache: "no-store" });
        const payload = (await response.json()) as BookingResponse;
        if (!response.ok || !payload.item) {
          setError(payload.message || "Linket er ugyldigt.");
          setBooking(null);
          return;
        }
        setBooking(payload.item);
      } catch (fetchError) {
        console.error(fetchError);
        setError("Kunne ikke hente booking.");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      loadBooking();
    }
  }, [token]);

  const cancelBooking = async () => {
    if (!booking || submitting) {
      return;
    }

    const confirmed = window.confirm("Er du sikker på, at du vil aflyse din booking?");
    if (!confirmed) {
      return;
    }

    setSubmitting(true);
    setCancelMessage("");
    try {
      const response = await fetch(`/api/bookings/manage/${token}/cancel`, {
        method: "POST"
      });
      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        setCancelMessage(payload.message || "Kunne ikke aflyse booking.");
        return;
      }
      setCancelMessage(payload.message || "Bookingen er annulleret.");
      setBooking((prev) => (prev ? { ...prev, status: "cancelled" } : prev));
    } catch (error) {
      console.error(error);
      setCancelMessage("Der opstod en fejl. Prøv igen.");
    } finally {
      setSubmitting(false);
    }
  };

  const requestReschedule = async () => {
    if (!booking || submitting) {
      return;
    }

    if (!rescheduleNote.trim()) {
      setRescheduleMessage("Skriv venligst en kort besked.");
      return;
    }

    setSubmitting(true);
    setRescheduleMessage("");
    try {
      const response = await fetch(`/api/bookings/manage/${token}/reschedule`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: rescheduleNote.trim() })
      });
      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        setRescheduleMessage(payload.message || "Kunne ikke sende ombooking.");
        return;
      }
      setRescheduleMessage("Tak. Vi kontakter dig hurtigst muligt om ny tid.");
      setRescheduleNote("");
    } catch (error) {
      console.error(error);
      setRescheduleMessage("Der opstod en fejl. Prøv igen.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-4xl px-6 py-16">
        <section className="rounded-3xl border border-border/70 bg-white/70 p-6 md:p-10">
          <p className="text-sm text-muted-foreground">Indlæser booking...</p>
        </section>
      </main>
    );
  }

  if (!booking || error) {
    return (
      <main className="mx-auto w-full max-w-4xl px-6 py-16">
        <section className="space-y-4 rounded-3xl border border-border/70 bg-white/70 p-6 md:p-10">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Linket er ugyldigt
          </h1>
          <p className="text-sm text-muted-foreground md:text-base">
            {error || "Vi kunne ikke finde din booking. Kontakt os, hvis du har brug for hjælp."}
          </p>
          <Button asChild>
            <Link href="/kontakt">Kontakt</Link>
          </Button>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-16">
      <section className="space-y-6 rounded-3xl border border-border/70 bg-white/70 p-6 md:p-10">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          Administrer booking
        </h1>
        <div className="rounded-xl border border-border bg-background/60 p-4 text-sm">
          <p>
            <span className="font-semibold text-foreground">Tidspunkt:</span>{" "}
            {formatDateTime(booking.slotStart)}
          </p>
          <p>
            <span className="font-semibold text-foreground">Slots:</span> {booking.slotCount}
          </p>
          <p>
            <span className="font-semibold text-foreground">Status:</span>{" "}
            {booking.status || "Ukendt"}
          </p>
        </div>

        <div className="space-y-3">
          <Button onClick={cancelBooking} disabled={submitting}>
            Aflys booking
          </Button>
          {cancelMessage ? <p className="text-sm text-muted-foreground">{cancelMessage}</p> : null}
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Anmod om ombooking</h2>
          <textarea
            value={rescheduleNote}
            onChange={(event) => setRescheduleNote(event.target.value)}
            className="min-h-[120px] w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
            placeholder="Skriv kort om, hvornår du ønsker en ny tid."
          />
          <Button onClick={requestReschedule} disabled={submitting}>
            Send anmodning
          </Button>
          {rescheduleMessage ? (
            <p className="text-sm text-muted-foreground">{rescheduleMessage}</p>
          ) : null}
        </div>
      </section>
    </main>
  );
};
