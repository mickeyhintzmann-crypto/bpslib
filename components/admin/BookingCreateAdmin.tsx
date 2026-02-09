"use client";

import { useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  EXTRA_OPTIONS,
  VANDFALD_PRICE_LABEL,
  defaultBordpladeExtras,
  type BordpladeExtras
} from "@/lib/bordplade/extras";

const SERVICE_VALUES = ["bordplade", "gulv", "toemrer", "maler", "murer", "andet"] as const;
const SLOT_TIMES = ["08:00", "11:00", "13:30"] as const;
const SLOT_COUNTS = ["1", "2", "3"] as const;

type CreateResponse = {
  item?: {
    id: string;
  };
  message?: string;
};

export const BookingCreateAdmin = () => {
  const [service, setService] = useState<(typeof SERVICE_VALUES)[number]>("bordplade");
  const [date, setDate] = useState("");
  const [startSlot, setStartSlot] = useState<(typeof SLOT_TIMES)[number]>(SLOT_TIMES[0]);
  const [slotCount, setSlotCount] = useState<(typeof SLOT_COUNTS)[number]>("1");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [note, setNote] = useState("");
  const [extras, setExtras] = useState<BordpladeExtras>(defaultBordpladeExtras);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [createdId, setCreatedId] = useState<string | null>(null);

  const toggleExtra = (key: (typeof EXTRA_OPTIONS)[number]["key"]) => {
    setExtras((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const updateVandfaldCount = (value: string) => {
    if (!value.trim()) {
      setExtras((prev) => ({ ...prev, vandfaldCount: 0 }));
      return;
    }
    const parsed = Number.parseInt(value.replace(/\D/g, ""), 10);
    const safeValue = Number.isNaN(parsed) ? 0 : Math.max(0, Math.min(20, parsed));
    setExtras((prev) => ({ ...prev, vandfaldCount: safeValue }));
  };

  const submitForm = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/admin/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          service,
          date,
          startSlot,
          slot_count: Number.parseInt(slotCount, 10),
          name,
          phone,
          email: email.trim() ? email.trim() : null,
          address: address.trim() ? address.trim() : null,
          postal_code: postalCode.trim() ? postalCode.trim() : null,
          note: note.trim() ? note.trim() : null,
          extras: service === "bordplade" ? extras : null
        })
      });

      const payload = (await response.json()) as CreateResponse;
      if (!response.ok || !payload.item) {
        setError(payload.message || "Kunne ikke oprette booking.");
        return;
      }

      setCreatedId(payload.item.id);
      setMessage("Booking oprettet.");
    } catch (submitError) {
      console.error(submitError);
      setError("Netværksfejl ved oprettelse.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-10">
      <section className="space-y-6 rounded-2xl border border-border/70 bg-white/70 p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-semibold text-foreground">Ny booking</h1>
            <p className="text-sm text-muted-foreground">Opret en manuel booking.</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/admin/bookings">Tilbage til liste</Link>
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={submitForm} disabled={loading}>
            {loading ? "Opretter..." : "Opret booking"}
          </Button>
        </div>

        {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}
        {message ? <p className="text-sm font-medium text-emerald-700">{message}</p> : null}

        {createdId ? (
          <div className="rounded-xl border border-border bg-background/60 p-4 text-sm">
            <p>
              Booking ID: <span className="font-semibold">{createdId}</span>
            </p>
            <Button asChild size="sm" className="mt-2">
              <Link href={`/admin/bookings/${createdId}`}>Åbn booking</Link>
            </Button>
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase text-muted-foreground">Service</label>
            <select
              value={service}
              onChange={(event) => setService(event.target.value as (typeof SERVICE_VALUES)[number])}
              className="h-10 rounded-md border border-border bg-white px-3 text-sm"
            >
              {SERVICE_VALUES.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase text-muted-foreground">Dato</label>
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="h-10 rounded-md border border-border bg-white px-3 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase text-muted-foreground">Starttid</label>
            <select
              value={startSlot}
              onChange={(event) => setStartSlot(event.target.value as (typeof SLOT_TIMES)[number])}
              className="h-10 rounded-md border border-border bg-white px-3 text-sm"
            >
              {SLOT_TIMES.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase text-muted-foreground">Slots</label>
            <select
              value={slotCount}
              onChange={(event) => setSlotCount(event.target.value as (typeof SLOT_COUNTS)[number])}
              className="h-10 rounded-md border border-border bg-white px-3 text-sm"
            >
              {SLOT_COUNTS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase text-muted-foreground">Navn</label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="h-10 rounded-md border border-border bg-white px-3 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase text-muted-foreground">Telefon</label>
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="h-10 rounded-md border border-border bg-white px-3 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase text-muted-foreground">Email (valgfri)</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-10 rounded-md border border-border bg-white px-3 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase text-muted-foreground">Adresse (valgfri)</label>
            <input
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              className="h-10 rounded-md border border-border bg-white px-3 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase text-muted-foreground">Postnr. (valgfri)</label>
            <input
              value={postalCode}
              onChange={(event) => setPostalCode(event.target.value)}
              className="h-10 rounded-md border border-border bg-white px-3 text-sm"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase text-muted-foreground">Note (valgfri)</label>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            className="min-h-[120px] rounded-md border border-border bg-white px-3 py-2 text-sm"
          />
        </div>

        {service === "bordplade" ? (
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase text-muted-foreground">Tilvalg</label>
            <div className="grid gap-2 sm:grid-cols-2">
              {EXTRA_OPTIONS.map((option) => (
                <label
                  key={option.key}
                  className="flex items-center justify-between gap-3 rounded-md border border-border bg-white px-3 py-2 text-sm"
                >
                  <span className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={extras[option.key]}
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
                  value={extras.vandfaldCount ? String(extras.vandfaldCount) : ""}
                  onChange={(event) => updateVandfaldCount(event.target.value)}
                  className="h-10 w-24 rounded-md border border-border bg-white px-3 text-sm"
                  inputMode="numeric"
                  placeholder="0"
                />
                <span className="text-xs text-muted-foreground">{VANDFALD_PRICE_LABEL}</span>
              </div>
            </label>
          </div>
        ) : null}
      </section>
    </main>
  );
};
