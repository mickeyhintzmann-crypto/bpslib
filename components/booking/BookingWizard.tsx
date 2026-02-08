"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  SLOT_TIMES,
  createBookingTemplates,
  slotKey,
  slotRange,
  validStartTimes,
  type SlotTime
} from "@/lib/booking-schedule";
import { trackEvent } from "@/lib/tracking";

const PHONE_TEL = "tel:+45XXXXXXXX";

type TaskType = "renovering" | "tvivl";
type SizeType = "standard" | "stor" | "usikker";

type SelectedSlot = {
  dateKey: string;
  dateLabel: string;
  startTime: SlotTime;
};

const trustBullets = ["Afdækning og støvkontrol", "15+ års erfaring", "Svar hurtigt"];

export const BookingWizard = () => {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(1);
  const [errorMessage, setErrorMessage] = useState("");

  const [taskType, setTaskType] = useState<TaskType | null>(null);
  const [address, setAddress] = useState("");
  const [postnr, setPostnr] = useState("");

  const [sizeType, setSizeType] = useState<SizeType>("standard");
  const [reserveExtraTime, setReserveExtraTime] = useState(false);
  const [extraSlots, setExtraSlots] = useState<2 | 3>(2);

  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [bookingDone, setBookingDone] = useState(false);

  const templates = useMemo(() => createBookingTemplates(30), []);

  const initialBlocked = useMemo(() => {
    const blocked = new Set<string>();
    templates.forEach((template) => {
      template.initialBooked.forEach((time) => blocked.add(slotKey(template.dateKey, time)));
    });
    return blocked;
  }, [templates]);

  const [blockedSlots, setBlockedSlots] = useState<Set<string>>(new Set());

  useEffect(() => {
    setMounted(true);
    setBlockedSlots(initialBlocked);
  }, [initialBlocked]);

  const requiredSlots = reserveExtraTime ? extraSlots : 1;

  const dayRows = useMemo(
    () =>
      templates.map((template) => ({
        ...template,
        startTimes: validStartTimes(template, blockedSlots, requiredSlots)
      })),
    [blockedSlots, requiredSlots, templates]
  );

  const nextThreeSlots = useMemo(() => {
    const flattened: SelectedSlot[] = [];

    dayRows.forEach((day) => {
      day.startTimes.forEach((startTime) => {
        flattened.push({
          dateKey: day.dateKey,
          dateLabel: day.dateLabel,
          startTime
        });
      });
    });

    return flattened.slice(0, 3);
  }, [dayRows]);

  useEffect(() => {
    if (step === 4) {
      trackEvent("booking_slot_view", {
        required_slots: requiredSlots,
        visible_days: dayRows.length
      });
    }
  }, [dayRows.length, requiredSlots, step]);

  const selectSlot = (slot: SelectedSlot) => {
    setSelectedSlot(slot);
    setErrorMessage("");
    trackEvent("booking_slot_select", {
      date: slot.dateKey,
      time: slot.startTime,
      required_slots: requiredSlots
    });
  };

  const slotLabel = (startTime: SlotTime) => {
    const range = slotRange(startTime, requiredSlots);
    return range.join(" + ");
  };

  const validateStep = () => {
    if (step === 1) {
      if (!taskType) {
        setErrorMessage("Vælg opgavetype for at fortsætte.");
        return false;
      }
      if (taskType === "tvivl") {
        setErrorMessage("Brug prisberegneren eller ring os op, så afklarer vi materialet hurtigt.");
        return false;
      }
    }

    if (step === 2) {
      if (!address.trim() || !/^\d{4}$/.test(postnr.trim())) {
        setErrorMessage("Indtast adresse og et gyldigt postnr. (4 cifre).");
        return false;
      }
    }

    if (step === 3 && sizeType !== "standard") {
      setErrorMessage("Større eller usikre opgaver skal vurderes via billeder i prisberegneren.");
      return false;
    }

    if (step === 4 && !selectedSlot) {
      setErrorMessage("Vælg en tid for at fortsætte.");
      return false;
    }

    setErrorMessage("");
    return true;
  };

  const nextStep = () => {
    if (!validateStep()) {
      return;
    }

    setStep((prev) => Math.min(prev + 1, 5));
  };

  const previousStep = () => {
    setErrorMessage("");
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const findNextBestSlot = () => {
    return dayRows
      .flatMap((day) =>
        day.startTimes.map((startTime) => ({ dateKey: day.dateKey, dateLabel: day.dateLabel, startTime }))
      )
      .find((candidate) => {
        if (!selectedSlot) {
          return true;
        }
        return !(candidate.dateKey === selectedSlot.dateKey && candidate.startTime === selectedSlot.startTime);
      });
  };

  const submitBooking = () => {
    if (!selectedSlot) {
      setErrorMessage("Vælg en tid før du sender booking.");
      return;
    }

    if (!name.trim() || !phone.trim()) {
      setErrorMessage("Indtast navn og telefonnummer.");
      return;
    }

    const currentDay = templates.find((template) => template.dateKey === selectedSlot.dateKey);

    if (!currentDay) {
      setErrorMessage("Kunne ikke finde den valgte dato. Prøv igen.");
      return;
    }

    const stillAvailable = validStartTimes(currentDay, blockedSlots, requiredSlots).includes(
      selectedSlot.startTime
    );

    if (!stillAvailable) {
      const nextBest = findNextBestSlot();
      if (nextBest) {
        setSelectedSlot(nextBest);
        setErrorMessage(
          `Den valgte tid blev taget. Næste forslag er ${nextBest.dateLabel} kl. ${nextBest.startTime}.`
        );
      } else {
        setErrorMessage("Tiden blev taget, og der er ingen ledige alternativer lige nu.");
      }
      return;
    }

    const range = slotRange(selectedSlot.startTime, requiredSlots);
    const nextBlocked = new Set(blockedSlots);
    range.forEach((time) => nextBlocked.add(slotKey(selectedSlot.dateKey, time)));
    setBlockedSlots(nextBlocked);

    setBookingDone(true);
    setErrorMessage("");

    trackEvent("booking_complete", {
      date: selectedSlot.dateKey,
      time: selectedSlot.startTime,
      required_slots: requiredSlots,
      has_email: Boolean(email.trim())
    });
  };

  if (!mounted) {
    return (
      <section className="rounded-3xl border border-border/70 bg-white/70 p-6">
        <p className="text-sm text-muted-foreground">Indlæser bookingflow...</p>
      </section>
    );
  }

  return (
    <section className="space-y-6 rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span className="rounded-full border border-border px-3 py-1">Kun massiv træ</span>
        {trustBullets.map((bullet) => (
          <span key={bullet} className="rounded-full border border-border px-3 py-1">
            {bullet}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-semibold text-foreground">Trin {step} af 5</p>
        {step > 1 && !bookingDone ? (
          <Button variant="ghost" size="sm" onClick={previousStep}>
            Tilbage
          </Button>
        ) : null}
      </div>

      {!bookingDone && step === 1 ? (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">1) Vælg opgave</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <button
              type="button"
              onClick={() => {
                setTaskType("renovering");
                setErrorMessage("");
              }}
              className={`rounded-xl border px-4 py-4 text-left text-sm ${
                taskType === "renovering" ? "border-primary bg-primary/5" : "border-border"
              }`}
            >
              <p className="font-semibold text-foreground">Bordplade-renovering</p>
              <p className="mt-1 text-muted-foreground">Jeg ved at bordpladen er massiv træ.</p>
            </button>
            <button
              type="button"
              onClick={() => {
                setTaskType("tvivl");
                setErrorMessage("");
              }}
              className={`rounded-xl border px-4 py-4 text-left text-sm ${
                taskType === "tvivl" ? "border-primary bg-primary/5" : "border-border"
              }`}
            >
              <p className="font-semibold text-foreground">Jeg er i tvivl</p>
              <p className="mt-1 text-muted-foreground">Vi afklarer hurtigt via billeder eller telefon.</p>
            </button>
          </div>

          {taskType === "tvivl" ? (
            <div className="rounded-xl border border-border bg-background/60 p-4 text-sm text-muted-foreground">
              <p>Start med prisberegneren eller ring os op, så afklarer vi materialet.</p>
              <div className="mt-3 flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/bordpladeslibning/prisberegner">Gå til prisberegner</Link>
                </Button>
                <Button asChild variant="outline">
                  <a
                    href={PHONE_TEL}
                    onClick={() => {
                      trackEvent("call_click", { source: "booking_step_1" });
                    }}
                  >
                    Ring mig op
                  </a>
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {!bookingDone && step === 2 ? (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">2) Adresse og postnr.</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm text-foreground">
              Adresse
              <input
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                className="h-10 rounded-md border border-border bg-white/90 px-3"
                placeholder="Vej og nummer"
              />
            </label>
            <label className="grid gap-2 text-sm text-foreground">
              Postnr.
              <input
                value={postnr}
                onChange={(event) => setPostnr(event.target.value.replace(/\D/g, "").slice(0, 4))}
                className="h-10 rounded-md border border-border bg-white/90 px-3"
                inputMode="numeric"
                placeholder="4000"
              />
            </label>
          </div>
        </div>
      ) : null}

      {!bookingDone && step === 3 ? (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">3) Opgavens størrelse</h2>
          <div className="grid gap-3 md:grid-cols-3">
            <button
              type="button"
              onClick={() => {
                setSizeType("standard");
                setErrorMessage("");
              }}
              className={`rounded-xl border px-4 py-4 text-left text-sm ${
                sizeType === "standard" ? "border-primary bg-primary/5" : "border-border"
              }`}
            >
              <p className="font-semibold text-foreground">Standard (1 slot)</p>
              <p className="mt-1 text-muted-foreground">Typisk bordplade med normal slitage.</p>
            </button>
            <button
              type="button"
              onClick={() => {
                setSizeType("stor");
                setErrorMessage("");
              }}
              className={`rounded-xl border px-4 py-4 text-left text-sm ${
                sizeType === "stor" ? "border-primary bg-primary/5" : "border-border"
              }`}
            >
              <p className="font-semibold text-foreground">Større opgave</p>
              <p className="mt-1 text-muted-foreground">Kræver billeder før endelig slot.</p>
            </button>
            <button
              type="button"
              onClick={() => {
                setSizeType("usikker");
                setErrorMessage("");
              }}
              className={`rounded-xl border px-4 py-4 text-left text-sm ${
                sizeType === "usikker" ? "border-primary bg-primary/5" : "border-border"
              }`}
            >
              <p className="font-semibold text-foreground">Ikke sikker</p>
              <p className="mt-1 text-muted-foreground">Vi afklarer via billeder først.</p>
            </button>
          </div>

          {sizeType === "standard" ? (
            <div className="rounded-xl border border-border bg-background/60 p-4 text-sm text-muted-foreground">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={reserveExtraTime}
                  onChange={(event) => setReserveExtraTime(event.target.checked)}
                  className="mt-1"
                />
                <span>
                  Avanceret: Reserver ekstra tid
                  <span className="block">Vælg 2 eller 3 sammenhængende slots hvis du vil have buffer.</span>
                </span>
              </label>
              {reserveExtraTime ? (
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setExtraSlots(2)}
                    className={`rounded-md border px-3 py-2 text-sm ${
                      extraSlots === 2 ? "border-primary bg-primary/5 text-foreground" : "border-border"
                    }`}
                  >
                    2 slots
                  </button>
                  <button
                    type="button"
                    onClick={() => setExtraSlots(3)}
                    className={`rounded-md border px-3 py-2 text-sm ${
                      extraSlots === 3 ? "border-primary bg-primary/5 text-foreground" : "border-border"
                    }`}
                  >
                    3 slots
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-background/60 p-4 text-sm text-muted-foreground">
              <p>
                For større eller usikre opgaver skal vi se billeder først. Det giver færre fejlbookinger og
                bedre tidsestimat.
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                <Button asChild>
                  <Link href="/bordpladeslibning/prisberegner">Upload billeder</Link>
                </Button>
                <Button asChild variant="outline">
                  <a
                    href={PHONE_TEL}
                    onClick={() => {
                      trackEvent("call_click", { source: "booking_step_3" });
                    }}
                  >
                    Ring mig op
                  </a>
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : null}

      {!bookingDone && step === 4 ? (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">4) Vælg tid</h2>
          <p className="text-sm text-muted-foreground">Næste 3 ledige tider:</p>
          <div className="grid gap-3 md:grid-cols-3">
            {nextThreeSlots.map((slot) => (
              <button
                key={`${slot.dateKey}-${slot.startTime}`}
                type="button"
                onClick={() => selectSlot(slot)}
                className={`rounded-xl border px-4 py-3 text-left text-sm ${
                  selectedSlot?.dateKey === slot.dateKey && selectedSlot?.startTime === slot.startTime
                    ? "border-primary bg-primary/5"
                    : "border-border"
                }`}
              >
                <p className="font-semibold text-foreground">{slot.dateLabel}</p>
                <p className="text-muted-foreground">{slotLabel(slot.startTime)}</p>
              </button>
            ))}
          </div>

          <div className="space-y-3 pt-2">
            {dayRows.map((day) => (
              <div key={day.dateKey} className="rounded-xl border border-border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground">{day.dateLabel}</p>
                  <p className="text-xs text-muted-foreground">{day.startTimes.length} tider tilbage</p>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {day.startTimes.length > 0 ? (
                    day.startTimes.map((startTime) => (
                      <button
                        key={`${day.dateKey}-${startTime}`}
                        type="button"
                        onClick={() =>
                          selectSlot({ dateKey: day.dateKey, dateLabel: day.dateLabel, startTime })
                        }
                        className={`rounded-md border px-3 py-2 text-sm ${
                          selectedSlot?.dateKey === day.dateKey && selectedSlot?.startTime === startTime
                            ? "border-primary bg-primary/5"
                            : "border-border"
                        }`}
                      >
                        {slotLabel(startTime)}
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">Ingen ledige starttider denne dag.</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-border bg-background/60 p-4 text-sm text-muted-foreground">
            <p>Kan du ikke finde en tid?</p>
            <div className="mt-2 flex flex-wrap gap-3">
              <a
                href={PHONE_TEL}
                className="font-semibold text-primary"
                onClick={() => {
                  trackEvent("call_click", { source: "booking_no_time" });
                }}
              >
                Ring os op
              </a>
              <Link href="/kontakt" className="font-semibold text-primary">
                Kontakt os
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      {!bookingDone && step === 5 ? (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">5) Dine oplysninger</h2>
          {selectedSlot ? (
            <p className="text-sm text-muted-foreground">
              Valgt tid: {selectedSlot.dateLabel} kl. {slotLabel(selectedSlot.startTime)}
            </p>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm text-foreground">
              Navn *
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="h-10 rounded-md border border-border bg-white/90 px-3"
                placeholder="Dit navn"
              />
            </label>
            <label className="grid gap-2 text-sm text-foreground">
              Telefon *
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="h-10 rounded-md border border-border bg-white/90 px-3"
                placeholder="00 00 00 00"
              />
            </label>
            <label className="grid gap-2 text-sm text-foreground">
              Email (valgfri)
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-10 rounded-md border border-border bg-white/90 px-3"
                placeholder="din@mail.dk"
              />
            </label>
            <label className="grid gap-2 text-sm text-foreground md:col-span-2">
              Note (valgfri)
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                className="min-h-24 rounded-md border border-border bg-white/90 px-3 py-2"
                placeholder="Særlige forhold, adgang eller spørgsmål"
              />
            </label>
            <label className="grid gap-2 text-sm text-foreground md:col-span-2">
              Upload billeder (valgfri)
              <input type="file" multiple className="rounded-md border border-border bg-white/90 px-3 py-2" />
            </label>
          </div>

          <div className="rounded-xl border border-border bg-background/60 p-4 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">Afbuds- og ombookingspolitik</p>
            <p className="mt-1">
              Gratis afbud eller ombooking indtil 24 timer før. Se fulde vilkår i
              <Link href="/handelsbetingelser" className="ml-1 font-semibold text-primary">
                handelsbetingelser
              </Link>
              .
            </p>
          </div>

          <Button onClick={submitBooking}>Bekræft booking</Button>
        </div>
      ) : null}

      {bookingDone ? (
        <div className="space-y-4 rounded-xl border border-primary/30 bg-primary/5 p-5">
          <h2 className="text-xl font-semibold text-foreground">Tak, din booking er modtaget</h2>
          {selectedSlot ? (
            <p className="text-sm text-muted-foreground">
              Vi har reserveret {selectedSlot.dateLabel} kl. {slotLabel(selectedSlot.startTime)}.
            </p>
          ) : null}
          <p className="text-sm text-muted-foreground">
            Afbud eller ombooking er gratis indtil 24 timer før. Brug
            <Link href="/kontakt" className="ml-1 font-semibold text-primary">
              kontakt
            </Link>
            , eller læs politikken i
            <Link href="/handelsbetingelser" className="ml-1 font-semibold text-primary">
              handelsbetingelser
            </Link>
            .
          </p>
        </div>
      ) : null}

      {errorMessage ? <p className="text-sm font-medium text-red-700">{errorMessage}</p> : null}

      {!bookingDone ? (
        <div className="flex flex-wrap items-center gap-3">
          {step < 5 ? (
            <Button onClick={nextStep}>
              {step === 4 ? "Fortsæt til oplysninger" : "Fortsæt"}
            </Button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
};
