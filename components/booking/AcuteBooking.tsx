"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  SLOT_TIMES,
  applyDayOverrides,
  createAcuteTemplates,
  slotKey,
  validStartTimes,
  type DayOverrideInput,
  type SlotTime
} from "@/lib/booking-schedule";
import { trackEvent } from "@/lib/tracking";

const PHONE_TEL = "tel:+45XXXXXXXX";

const formatPrice = (price: number) => `${price.toLocaleString("da-DK")} kr.`;

type SelectedSlot = {
  dateKey: string;
  dateLabel: string;
  time: SlotTime;
};

export const AcuteBooking = ({
  overrides = [],
  price = 3000,
  windowDays = 14
}: {
  overrides?: DayOverrideInput[];
  price?: number;
  windowDays?: number;
}) => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [showSticky, setShowSticky] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const templates = useMemo(
    () => applyDayOverrides(createAcuteTemplates(windowDays), overrides, { respectAcuteVisibility: true }),
    [overrides, windowDays]
  );

  const visibleTemplates = useMemo(
    () => templates.filter((template) => template.showOnAcutePage !== false),
    [templates]
  );

  const initialBlocked = useMemo(() => {
    const blocked = new Set<string>();
    visibleTemplates.forEach((template) => {
      template.initialBooked.forEach((time) => blocked.add(slotKey(template.dateKey, time)));
    });
    return blocked;
  }, [visibleTemplates]);

  const [blockedSlots, setBlockedSlots] = useState<Set<string>>(new Set());
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [postnr, setPostnr] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");

  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
    setBlockedSlots(initialBlocked);
  }, [initialBlocked]);

  useEffect(() => {
    const onScroll = () => {
      setShowSticky(window.scrollY > 140);
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const dayRows = useMemo(
    () =>
      visibleTemplates.map((template) => ({
        ...template,
        slots: validStartTimes(template, blockedSlots, 1)
      })),
    [blockedSlots, visibleTemplates]
  );

  const nextThree = useMemo(() => {
    const slots: SelectedSlot[] = [];

    dayRows.forEach((day) => {
      day.slots.forEach((slot) => {
        slots.push({
          dateKey: day.dateKey,
          dateLabel: day.dateLabel,
          time: slot
        });
      });
    });

    return slots.slice(0, 3);
  }, [dayRows]);

  const nextSlot = nextThree[0] || null;

  const totalRemaining = useMemo(
    () => dayRows.reduce((sum, day) => sum + day.slots.length, 0),
    [dayRows]
  );

  const openPanel = (slot: SelectedSlot) => {
    setSelectedSlot(slot);
    setErrorMessage("");

    trackEvent("acute_slot_select", {
      date: slot.dateKey,
      time: slot.time
    });

    panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const ensureAvailability = (slot: SelectedSlot) => {
    const day = visibleTemplates.find((template) => template.dateKey === slot.dateKey);
    if (!day) {
      return false;
    }

    return validStartTimes(day, blockedSlots, 1).includes(slot.time);
  };

  const submitAcuteBooking = async () => {
    if (isSubmitting) {
      return;
    }

    if (!selectedSlot) {
      setErrorMessage("Vælg en akut tid før du sender.");
      return;
    }

    if (!name.trim() || !phone.trim() || !address.trim() || !/^\d{4}$/.test(postnr.trim())) {
      setErrorMessage("Udfyld navn, telefon, adresse og gyldigt postnr. (4 cifre).");
      return;
    }

    if (!ensureAvailability(selectedSlot)) {
      const fallback = nextThree.find(
        (slot) => !(slot.dateKey === selectedSlot.dateKey && slot.time === selectedSlot.time)
      );

      if (fallback) {
        setSelectedSlot(fallback);
        setErrorMessage(
          `Tiden blev netop taget. Næste ledige forslag er ${fallback.dateLabel} kl. ${fallback.time}.`
        );
      } else {
        setErrorMessage("Den valgte tid blev taget, og der er ingen akutte tider tilbage lige nu.");
      }
      return;
    }

    const startSlotIndex = SLOT_TIMES.findIndex((slotTime) => slotTime === selectedSlot.time);
    if (startSlotIndex < 0) {
      setErrorMessage("Ugyldig starttid. Vælg en ny tid.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/bookings/acute/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          date: selectedSlot.dateKey,
          startSlot: selectedSlot.time,
          start_slot_index: startSlotIndex,
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          address: address.trim(),
          postalCode: postnr.trim(),
          note: message.trim() || undefined
        })
      });

      const payload = (await response.json()) as { bookingId?: string; message?: string };

      if (!response.ok || !payload.bookingId) {
        setErrorMessage(payload.message || "Kunne ikke gennemføre akut booking.");
        return;
      }

      const nextBlocked = new Set(blockedSlots);
      nextBlocked.add(slotKey(selectedSlot.dateKey, selectedSlot.time));
      setBlockedSlots(nextBlocked);

      trackEvent("acute_booking_complete", {
        date: selectedSlot.dateKey,
        time: selectedSlot.time,
        has_email: Boolean(email.trim()),
        booking_id: payload.bookingId
      });

      router.push(`/akutte-tider/tak?id=${encodeURIComponent(payload.bookingId)}`);
    } catch (submitError) {
      console.error(submitError);
      setErrorMessage("Der opstod en netværksfejl. Prøv igen.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) {
    return (
      <section className="rounded-3xl border border-border/70 bg-white/70 p-6">
        <p className="text-sm text-muted-foreground">Indlæser akutte tider...</p>
      </section>
    );
  }

  return (
    <section className="space-y-8">
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span className="rounded-full border border-border px-3 py-1">Kun massiv træ</span>
        <span className="rounded-full border border-border px-3 py-1">
          Fast pris {formatPrice(price)}
        </span>
        <span className="rounded-full border border-border px-3 py-1">Svar hurtigt</span>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">Næste 3 ledige tider</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {nextThree.map((slot) => (
            <button
              key={`${slot.dateKey}-${slot.time}`}
              type="button"
              onClick={() => openPanel(slot)}
              className="rounded-2xl border border-border bg-white/80 px-4 py-4 text-left hover:border-primary"
            >
              <p className="text-sm font-semibold text-foreground">{slot.dateLabel}</p>
              <p className="text-sm text-muted-foreground">Kl. {slot.time}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-foreground">
          Ledige tider de næste {windowDays} dage
        </h2>
        <div className="grid gap-3">
          {dayRows.map((day) => (
            <article key={day.dateKey} className="rounded-xl border border-border bg-white/70 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-foreground">{day.dateLabel}</p>
                <p className="text-xs text-muted-foreground">{day.slots.length} tider tilbage</p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {day.slots.length > 0 ? (
                  day.slots.map((slot) => (
                    <button
                      key={`${day.dateKey}-${slot}`}
                      type="button"
                      onClick={() => openPanel({ dateKey: day.dateKey, dateLabel: day.dateLabel, time: slot })}
                      className={`rounded-md border px-3 py-2 text-sm ${
                        selectedSlot?.dateKey === day.dateKey && selectedSlot?.time === slot
                          ? "border-primary bg-primary/5"
                          : "border-border"
                      }`}
                    >
                      {slot}
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Ingen ledige akutte tider denne dag.</p>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <p className="rounded-xl border border-border bg-white/70 px-4 py-3 text-sm text-muted-foreground">
        Der er {totalRemaining} akutte tider tilbage de næste {windowDays} dage.
      </p>

      <section ref={panelRef} className="rounded-3xl border border-border/70 bg-white/80 p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-foreground">Akut booking</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {selectedSlot
            ? `Valgt tid: ${selectedSlot.dateLabel} kl. ${selectedSlot.time} · Fast pris ${formatPrice(price)}`
            : "Vælg en tid ovenfor for at fortsætte."}
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm text-foreground">
            Navn *
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="h-10 rounded-md border border-border bg-white px-3"
              placeholder="Dit navn"
            />
          </label>
          <label className="grid gap-2 text-sm text-foreground">
            Telefon *
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="h-10 rounded-md border border-border bg-white px-3"
              placeholder="00 00 00 00"
            />
          </label>
          <label className="grid gap-2 text-sm text-foreground">
            Adresse *
            <input
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              className="h-10 rounded-md border border-border bg-white px-3"
              placeholder="Vej og nummer"
            />
          </label>
          <label className="grid gap-2 text-sm text-foreground">
            Postnr. *
            <input
              value={postnr}
              onChange={(event) => setPostnr(event.target.value.replace(/\D/g, "").slice(0, 4))}
              className="h-10 rounded-md border border-border bg-white px-3"
              inputMode="numeric"
              placeholder="4000"
            />
          </label>
          <label className="grid gap-2 text-sm text-foreground md:col-span-2">
            Kort besked (valgfri)
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              className="min-h-24 rounded-md border border-border bg-white px-3 py-2"
              placeholder="Kort info om opgaven"
            />
          </label>
          <label className="grid gap-2 text-sm text-foreground md:col-span-2">
            Email (valgfri)
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-10 rounded-md border border-border bg-white px-3"
              placeholder="din@mail.dk"
            />
          </label>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          Gratis afbud eller ombooking indtil 24 timer før. Se vilkår i
          <Link href="/handelsbetingelser" className="ml-1 font-semibold text-primary">
            handelsbetingelser
          </Link>
          .
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <Button onClick={submitAcuteBooking} disabled={isSubmitting}>
            {isSubmitting ? "Reserverer..." : "Bekræft akut booking"}
          </Button>
          <Button asChild variant="outline">
            <a
              href={PHONE_TEL}
              onClick={() => {
                trackEvent("call_click", { source: "acute_booking_panel" });
              }}
            >
              Ring i stedet
            </a>
          </Button>
        </div>

        {errorMessage ? <p className="mt-4 text-sm font-medium text-red-700">{errorMessage}</p> : null}
      </section>

      {showSticky && nextSlot ? (
        <div className="fixed bottom-20 left-0 right-0 z-40 px-4 md:hidden">
          <button
            type="button"
            onClick={() => openPanel(nextSlot)}
            className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 rounded-xl border border-border bg-white px-4 py-3 text-left shadow-lg"
          >
            <span className="text-xs text-muted-foreground">
              Fast pris {formatPrice(price)} · Næste tid: {nextSlot.dateLabel} kl. {nextSlot.time}
            </span>
            <span className="rounded-md bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
              Book
            </span>
          </button>
        </div>
      ) : null}
    </section>
  );
};
