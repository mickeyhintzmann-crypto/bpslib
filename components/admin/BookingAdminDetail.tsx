"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  EXTRA_OPTIONS,
  VANDFALD_PRICE_LABEL,
  defaultBordpladeExtras,
  formatExtrasSummary,
  sanitizeExtras,
  type BordpladeExtras
} from "@/lib/bordplade/extras";

const STATUS_FLOW = [
  "pending_confirmation",
  "new",
  "confirmed",
  "in_progress",
  "done",
  "cancelled"
] as const;
const SLOT_TIMES = ["08:00", "11:00", "13:30"] as const;

type BookingItem = {
  id: string;
  created_at: string;
  status: string;
  service_type: string;
  source: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  address: string | null;
  postal_code: string | null;
  slot_start: string;
  slot_end: string;
  slot_count?: number | null;
  notes: string | null;
  internal_note: string | null;
  estimator_request_id: string | null;
  extras: BordpladeExtras | null;
};

type BookingResponse = {
  item?: BookingItem;
  message?: string;
};

const formatDateTime = (iso: string | null) => {
  if (!iso) {
    return "Ikke angivet";
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "Ukendt";
  }
  return new Intl.DateTimeFormat("da-DK", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(date);
};

const formatDate = (iso: string | null) => {
  if (!iso) {
    return "Ikke angivet";
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "Ukendt";
  }
  return new Intl.DateTimeFormat("da-DK", {
    dateStyle: "short"
  }).format(date);
};

const dateKeyFromIso = (iso: string | null) => (iso ? iso.slice(0, 10) : "");
const timeFromIso = (iso: string | null) => (iso ? iso.slice(11, 16) : "");

export const BookingAdminDetail = ({ bookingId }: { bookingId: string }) => {
  const [item, setItem] = useState<BookingItem | null>(null);
  const [status, setStatus] = useState<(typeof STATUS_FLOW)[number]>("new");
  const [note, setNote] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [moveDate, setMoveDate] = useState("");
  const [moveStart, setMoveStart] = useState<(typeof SLOT_TIMES)[number]>(SLOT_TIMES[0]);
  const [moveSlotCount, setMoveSlotCount] = useState("1");
  const [extrasState, setExtrasState] = useState<BordpladeExtras>(defaultBordpladeExtras);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const normalizeStatus = (value: string) =>
    value === "pending" ? "pending_confirmation" : value;

  const syncFieldsFromItem = (nextItem: BookingItem) => {
    const normalized = normalizeStatus(nextItem.status);
    setStatus(
      STATUS_FLOW.includes(normalized as (typeof STATUS_FLOW)[number])
        ? (normalized as (typeof STATUS_FLOW)[number])
        : "new"
    );
    setNote(nextItem.notes || "");
    setInternalNote(nextItem.internal_note || "");
    setMoveDate(dateKeyFromIso(nextItem.slot_start));
    const slotStartTime = timeFromIso(nextItem.slot_start);
    if (SLOT_TIMES.includes(slotStartTime as (typeof SLOT_TIMES)[number])) {
      setMoveStart(slotStartTime as (typeof SLOT_TIMES)[number]);
    }
    const slotCount = nextItem.slot_count && nextItem.slot_count > 0 ? String(nextItem.slot_count) : "1";
    setMoveSlotCount(slotCount);
    setExtrasState(sanitizeExtras(nextItem.extras));
  };

  const toggleExtra = (key: (typeof EXTRA_OPTIONS)[number]["key"]) => {
    setExtrasState((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const updateVandfaldCount = (value: string) => {
    if (!value.trim()) {
      setExtrasState((prev) => ({ ...prev, vandfaldCount: 0 }));
      return;
    }
    const parsed = Number.parseInt(value.replace(/\D/g, ""), 10);
    const safeValue = Number.isNaN(parsed) ? 0 : Math.max(0, Math.min(20, parsed));
    setExtrasState((prev) => ({ ...prev, vandfaldCount: safeValue }));
  };

  const loadBooking = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        cache: "no-store"
      });

      const payload = (await response.json()) as BookingResponse;
      if (!response.ok || !payload.item) {
        setItem(null);
        setError(payload.message || "Kunne ikke hente booking.");
        return;
      }

      setItem(payload.item);
      syncFieldsFromItem(payload.item);
    } catch (fetchError) {
      console.error(fetchError);
      setItem(null);
      setError("Netværksfejl ved hentning af booking.");
    } finally {
      setLoading(false);
    }
  };

  const updateBooking = async (payload: Record<string, unknown>) => {
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = (await response.json()) as BookingResponse;
      if (!response.ok || !data.item) {
        setError(data.message || "Kunne ikke opdatere booking.");
        return;
      }

      setItem(data.item);
      syncFieldsFromItem(data.item);
      setMessage("Booking opdateret.");
    } catch (updateError) {
      console.error(updateError);
      setError("Netværksfejl ved opdatering af booking.");
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = async (value: string) => {
    if (!value) {
      return;
    }
    try {
      await navigator.clipboard.writeText(value);
      setMessage("Kopieret til udklipsholder.");
    } catch (copyError) {
      console.error(copyError);
      setMessage("Kunne ikke kopiere.");
    }
  };

  const handleStatusChange = (nextStatus: (typeof STATUS_FLOW)[number]) => {
    setStatus(nextStatus);
    updateBooking({ status: nextStatus });
  };

  const handleMoveBooking = () => {
    updateBooking({
      date: moveDate,
      startSlot: moveStart,
      slot_count: Number.parseInt(moveSlotCount, 10)
    });
  };

  const handleSaveNotes = () => {
    updateBooking({
      note: note.trim() ? note.trim() : null,
      internalNote: internalNote.trim() ? internalNote.trim() : null
    });
  };

  const handleSaveExtras = () => {
    updateBooking({
      extras: extrasState
    });
  };

  useEffect(() => {
    loadBooking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]);

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <section className="space-y-6 rounded-2xl border border-border/70 bg-white/70 p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-semibold text-foreground">Booking detaljer</h1>
            <p className="text-sm text-muted-foreground">Booking ID: {bookingId}</p>
          </div>
          <Button onClick={() => loadBooking()} disabled={loading}>
            {loading ? "Henter..." : "Hent booking"}
          </Button>
        </div>

        {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}
        {message ? <p className="text-sm font-medium text-emerald-700">{message}</p> : null}

        {item ? (
          <div className="space-y-6">
            <div className="grid gap-3 rounded-xl border border-border bg-background/60 p-4 text-sm sm:grid-cols-2">
              <p>
                <span className="font-semibold text-foreground">Oprettet:</span> {formatDateTime(item.created_at)}
              </p>
              <p>
                <span className="font-semibold text-foreground">Status:</span> {item.status}
              </p>
              <p>
                <span className="font-semibold text-foreground">Service:</span> {item.service_type}
              </p>
              <p>
                <span className="font-semibold text-foreground">Kilde:</span> {item.source || "Ikke angivet"}
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
                <span className="font-semibold text-foreground">Adresse:</span> {item.address || "Ikke angivet"}
              </p>
              <p>
                <span className="font-semibold text-foreground">Postnr.:</span> {item.postal_code || "Ikke angivet"}
              </p>
              <p>
                <span className="font-semibold text-foreground">Dato:</span> {formatDate(item.slot_start)}
              </p>
              <p>
                <span className="font-semibold text-foreground">Start:</span> {formatDateTime(item.slot_start)}
              </p>
              <p>
                <span className="font-semibold text-foreground">Slut:</span> {formatDateTime(item.slot_end)}
              </p>
              <p>
                <span className="font-semibold text-foreground">Slots:</span>{" "}
                {item.slot_count ? item.slot_count : "-"}
              </p>
              <p className="sm:col-span-2">
                <span className="font-semibold text-foreground">Note:</span> {item.notes || "Ingen note"}
              </p>
              <p className="sm:col-span-2">
                <span className="font-semibold text-foreground">Intern note:</span>{" "}
                {item.internal_note || "Ikke angivet"}
              </p>
              {item.service_type === "bordplade" ? (
                <p className="sm:col-span-2">
                  <span className="font-semibold text-foreground">Tilvalg:</span>{" "}
                  {formatExtrasSummary(extrasState)}
                </p>
              ) : null}
              <p className="sm:col-span-2">
                <span className="font-semibold text-foreground">Estimator sag:</span>{" "}
                {item.estimator_request_id ? (
                  <Link href="/admin/estimator" className="font-semibold text-primary">
                    {item.estimator_request_id}
                  </Link>
                ) : (
                  "Ikke angivet"
                )}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline">
                <a href={`tel:${item.customer_phone}`}>Ring</a>
              </Button>
              <Button variant="outline" onClick={() => copyToClipboard(item.customer_phone)}>
                Kopiér telefon
              </Button>
              <Button
                variant="outline"
                onClick={() => copyToClipboard(item.customer_email || "")}
                disabled={!item.customer_email}
              >
                Kopiér email
              </Button>
              <Button asChild variant="outline">
                <Link href="/admin/bookings">Tilbage til liste</Link>
              </Button>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">Skift status</p>
              <div className="flex flex-wrap gap-2">
                {STATUS_FLOW.map((option) => (
                  <Button
                    key={option}
                    size="sm"
                    variant={option === status ? "default" : "outline"}
                    onClick={() => handleStatusChange(option)}
                    disabled={saving}
                  >
                    {option}
                  </Button>
                ))}
                <Button
                  size="sm"
                  variant="outline"
                  className="border-red-200 text-red-700 hover:bg-red-50"
                  onClick={() => handleStatusChange("cancelled")}
                  disabled={saving}
                >
                  Annuller
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">Flyt booking</p>
              <div className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]">
                <input
                  type="date"
                  value={moveDate}
                  onChange={(event) => setMoveDate(event.target.value)}
                  className="h-10 rounded-md border border-border bg-white px-3 text-sm"
                />
                <select
                  value={moveStart}
                  onChange={(event) => setMoveStart(event.target.value as (typeof SLOT_TIMES)[number])}
                  className="h-10 rounded-md border border-border bg-white px-3 text-sm"
                >
                  {SLOT_TIMES.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
                <select
                  value={moveSlotCount}
                  onChange={(event) => setMoveSlotCount(event.target.value)}
                  className="h-10 rounded-md border border-border bg-white px-3 text-sm"
                >
                  <option value="1">1 slot</option>
                  <option value="2">2 slots</option>
                  <option value="3">3 slots</option>
                </select>
                <Button onClick={handleMoveBooking} disabled={saving}>
                  {saving ? "Gemmer..." : "Flyt"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                2 slots kan kun starte 08:00 eller 11:00. 3 slots kan kun starte 08:00.
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">Noter</p>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase text-muted-foreground">Kundenote</label>
                  <textarea
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    className="min-h-[120px] rounded-md border border-border bg-white px-3 py-2 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase text-muted-foreground">Intern note</label>
                  <textarea
                    value={internalNote}
                    onChange={(event) => setInternalNote(event.target.value)}
                    className="min-h-[120px] rounded-md border border-border bg-white px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <Button onClick={handleSaveNotes} disabled={saving}>
                {saving ? "Gemmer..." : "Gem noter"}
              </Button>
            </div>

            {item.service_type === "bordplade" ? (
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground">Tilvalg</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {EXTRA_OPTIONS.map((option) => (
                    <label
                      key={option.key}
                      className="flex items-center justify-between gap-3 rounded-md border border-border bg-white px-3 py-2 text-sm"
                    >
                      <span className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={extrasState[option.key]}
                          onChange={() => toggleExtra(option.key)}
                        />
                        <span className="font-medium text-foreground">{option.label}</span>
                      </span>
                      <span className="text-xs text-muted-foreground">{option.priceLabel}</span>
                    </label>
                  ))}
                </div>
                <label className="grid gap-2 text-sm text-foreground">
                  Vandfald (antal)
                  <div className="flex items-center gap-3">
                    <input
                      value={extrasState.vandfaldCount ? String(extrasState.vandfaldCount) : ""}
                      onChange={(event) => updateVandfaldCount(event.target.value)}
                      className="h-10 w-24 rounded-md border border-border bg-white px-3 text-sm"
                      inputMode="numeric"
                      placeholder="0"
                    />
                    <span className="text-xs text-muted-foreground">{VANDFALD_PRICE_LABEL}</span>
                  </div>
                </label>
                <Button onClick={handleSaveExtras} disabled={saving}>
                  {saving ? "Gemmer..." : "Gem tilvalg"}
                </Button>
              </div>
            ) : null}
          </div>
        ) : null}
      </section>
    </main>
  );
};
