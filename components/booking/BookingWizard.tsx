"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  SLOT_TIMES,
  applyDayOverrides,
  createBookingTemplates,
  slotKey,
  slotRange,
  validStartTimes,
  type DayOverrideInput,
  type DayTemplate,
  type SlotTime
} from "@/lib/booking-schedule";
import {
  EXTRA_OPTIONS,
  VANDFALD_PRICE_LABEL,
  defaultBordpladeExtras,
  formatExtrasSummary,
  type BordpladeExtras
} from "@/lib/bordplade/extras";
import { trackEvent } from "@/lib/tracking";

const PHONE_TEL = "tel:+45XXXXXXXX";

const DATE_KEY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseDateKey = (dateKey: string) => {
  if (!DATE_KEY_REGEX.test(dateKey)) {
    return null;
  }
  const date = new Date(`${dateKey}T12:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date;
};

const weekdayFormatter = new Intl.DateTimeFormat("da-DK", { weekday: "short" });
const monthFormatter = new Intl.DateTimeFormat("da-DK", { month: "short" });
const dayFormatter = new Intl.DateTimeFormat("da-DK", { day: "numeric" });
const monthYearFormatter = new Intl.DateTimeFormat("da-DK", { month: "long", year: "numeric" });

const formatWeekday = (date: Date) => weekdayFormatter.format(date).replace(".", "");
const formatMonth = (date: Date) => monthFormatter.format(date);
const formatDay = (date: Date) => dayFormatter.format(date);
const formatMonthYear = (date: Date) => monthYearFormatter.format(date);

const addUtcDays = (date: Date, days: number) => {
  const copy = new Date(date);
  copy.setUTCDate(copy.getUTCDate() + days);
  return copy;
};

const getWeekStartKey = (dateKey: string) => {
  const date = parseDateKey(dateKey);
  if (!date) {
    return null;
  }
  const weekday = date.getUTCDay();
  const offset = (weekday + 6) % 7;
  date.setUTCDate(date.getUTCDate() - offset);
  return toDateKey(date);
};

const trustBullets = ["Afdækning og støvkontrol", "15+ års erfaring", "Svar hurtigt"];
const stepLabels = ["Opgave", "Adresse", "Tid", "Kontakt"];

type TaskType = "renovering" | "tvivl";

type SelectedSlot = {
  dateKey: string;
  dateLabel: string;
  startTime: SlotTime;
};

type DayRow = DayTemplate & { startTimes: SlotTime[] };

type WeekDayItem = {
  dateKey: string;
  date: Date;
  dayLabel: string;
  dayNumber: string;
  monthLabel: string;
  info: DayRow | null;
  availableCount: number;
};

type WeekView = {
  id: string;
  label: string;
  days: WeekDayItem[];
};

export const BookingWizard = ({
  overrides = [],
  templatesOverride,
  estimatorId,
  estimateMin,
  estimateMax
}: {
  overrides?: DayOverrideInput[];
  templatesOverride?: DayTemplate[];
  estimatorId?: string;
  estimateMin?: number | null;
  estimateMax?: number | null;
}) => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(1);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [taskType, setTaskType] = useState<TaskType | null>(null);
  const [address, setAddress] = useState("");
  const [postnr, setPostnr] = useState("");

  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [extras, setExtras] = useState<BordpladeExtras>(defaultBordpladeExtras);
  const [bookingDone, setBookingDone] = useState(false);
  const [estimatorContact, setEstimatorContact] = useState<{
    estimatorId?: string;
    name?: string;
    phone?: string;
    priceMin?: number | null;
    priceMax?: number | null;
  } | null>(null);

  const templates = useMemo(() => {
    if (templatesOverride && templatesOverride.length > 0) {
      return templatesOverride;
    }
    return applyDayOverrides(createBookingTemplates(180), overrides);
  }, [overrides, templatesOverride]);

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

  const requiredSlots = 1;
  const extrasSummary = useMemo(() => formatExtrasSummary(extras), [extras]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    try {
      const raw = window.sessionStorage.getItem("estimator_contact");
      if (!raw) {
        return;
      }
      const parsed = JSON.parse(raw) as {
        estimatorId?: string;
        name?: string;
        phone?: string;
        priceMin?: number | null;
        priceMax?: number | null;
      };
      setEstimatorContact(parsed);
      if (!name && parsed.name) {
        setName(parsed.name);
      }
      if (!phone && parsed.phone) {
        setPhone(parsed.phone);
      }
    } catch {
      setEstimatorContact(null);
    }
  }, [name, phone]);

  const dayRows = useMemo<DayRow[]>(
    () =>
      templates.map((template) => ({
        ...template,
        startTimes: validStartTimes(template, blockedSlots, requiredSlots)
      })),
    [blockedSlots, requiredSlots, templates]
  );

  const dayMap = useMemo(() => {
    const map = new Map<string, DayRow>();
    dayRows.forEach((day) => map.set(day.dateKey, day));
    return map;
  }, [dayRows]);

  const weekStartKeys = useMemo(() => {
    const keys: string[] = [];
    const seen = new Set<string>();
    dayRows.forEach((day) => {
      const weekKey = getWeekStartKey(day.dateKey);
      if (!weekKey || seen.has(weekKey)) {
        return;
      }
      seen.add(weekKey);
      keys.push(weekKey);
    });
    return keys.sort();
  }, [dayRows]);

  const weeks = useMemo<WeekView[]>(() => {
    return weekStartKeys.map((weekKey) => {
      const startDate = parseDateKey(weekKey);
      if (!startDate) {
        return { id: weekKey, label: "", days: [] };
      }
      const endDate = addUtcDays(startDate, 6);
      const label = `${formatDay(startDate)} ${formatMonth(startDate)} – ${formatDay(endDate)} ${formatMonth(endDate)}`;
      const days = Array.from({ length: 7 }).map((_, index) => {
        const date = addUtcDays(startDate, index);
        const dateKey = toDateKey(date);
        const info = dayMap.get(dateKey) ?? null;
        return {
          dateKey,
          date,
          dayLabel: formatWeekday(date),
          dayNumber: formatDay(date),
          monthLabel: formatMonth(date),
          info,
          availableCount: info ? info.startTimes.length : 0
        };
      });
      return { id: weekKey, label, days };
    });
  }, [dayMap, weekStartKeys]);

  const [activeWeekIndex, setActiveWeekIndex] = useState(0);

  useEffect(() => {
    if (weeks.length > 0) {
      setActiveWeekIndex((prev) => Math.min(prev, weeks.length - 1));
    }
  }, [weeks.length]);

  useEffect(() => {
    if (!selectedDateKey) {
      return;
    }
    const weekKey = getWeekStartKey(selectedDateKey);
    if (!weekKey) {
      return;
    }
    const nextIndex = weekStartKeys.findIndex((key) => key === weekKey);
    if (nextIndex >= 0 && nextIndex !== activeWeekIndex) {
      setActiveWeekIndex(nextIndex);
    }
  }, [activeWeekIndex, selectedDateKey, weekStartKeys]);

  const activeWeek = weeks[activeWeekIndex] || null;

  const resolvedEstimatorId = estimatorId || estimatorContact?.estimatorId || "";
  const resolvedEstimateMin =
    typeof estimateMin === "number" ? estimateMin : estimatorContact?.priceMin ?? null;
  const resolvedEstimateMax =
    typeof estimateMax === "number" ? estimateMax : estimatorContact?.priceMax ?? null;
  const hasEstimate =
    typeof resolvedEstimateMin === "number" &&
    typeof resolvedEstimateMax === "number" &&
    resolvedEstimateMin <= resolvedEstimateMax;
  const isFixedEstimate = hasEstimate && resolvedEstimateMin === resolvedEstimateMax;

  const nextAvailableDay = useMemo(() => dayRows.find((day) => day.startTimes.length > 0) || null, [dayRows]);

  useEffect(() => {
    if (step === 3 && !selectedDateKey && nextAvailableDay) {
      setSelectedDateKey(nextAvailableDay.dateKey);
    }
  }, [nextAvailableDay, selectedDateKey, step]);

  useEffect(() => {
    if (step === 3) {
      trackEvent("booking_slot_view", {
        required_slots: requiredSlots,
        visible_days: dayRows.length
      });
    }
  }, [dayRows.length, requiredSlots, step]);

  const selectedDay = selectedDateKey ? dayMap.get(selectedDateKey) : null;
  const selectedDayAvailable = useMemo(() => {
    if (!selectedDay) {
      return new Set<SlotTime>();
    }
    return new Set(validStartTimes(selectedDay, blockedSlots, requiredSlots));
  }, [blockedSlots, requiredSlots, selectedDay]);

  const selectSlot = (dateKey: string, startTime: SlotTime) => {
    const day = dayMap.get(dateKey);
    if (!day) {
      return;
    }
    setSelectedDateKey(dateKey);
    setSelectedSlot({ dateKey, dateLabel: day.dateLabel, startTime });
    setErrorMessage("");
    trackEvent("booking_slot_select", {
      date: dateKey,
      time: startTime,
      required_slots: requiredSlots
    });
  };

  const slotLabel = (startTime: SlotTime) => slotRange(startTime, requiredSlots).join(" + ");

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

    if (step === 3 && !selectedSlot) {
      setErrorMessage("Vælg en tid for at fortsætte.");
      return false;
    }

    if (step === 4) {
      if (!name.trim() || !phone.trim()) {
        setErrorMessage("Indtast navn og telefonnummer.");
        return false;
      }
    }

    setErrorMessage("");
    return true;
  };

  const nextStep = () => {
    if (!validateStep()) {
      return;
    }

    setStep((prev) => Math.min(prev + 1, 4));
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

  const submitBooking = async () => {
    if (isSubmitting) {
      return;
    }

    if (!selectedSlot) {
      setErrorMessage("Vælg en tid før du sender forespørgslen.");
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

    const startSlotIndex = SLOT_TIMES.findIndex((slot) => slot === selectedSlot.startTime);
    if (startSlotIndex < 0) {
      setErrorMessage("Ugyldig starttid. Vælg en ny tid.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("date", selectedSlot.dateKey);
      formData.append("startSlot", selectedSlot.startTime);
      formData.append("start_slot_index", `${startSlotIndex}`);
      formData.append("name", name.trim());
      formData.append("phone", phone.trim());
      formData.append("email", email.trim() || "");
      formData.append("address", address.trim());
      formData.append("postalCode", postnr.trim());
      formData.append("note", note.trim() || "");
      formData.append("extras", JSON.stringify(extras));
      if (resolvedEstimatorId) {
        formData.append("estimatorRequestId", resolvedEstimatorId);
      }

      const response = await fetch("/api/bookings/submit", {
        method: "POST",
        body: formData
      });

      const payload = (await response.json()) as { bookingId?: string; message?: string };

      if (!response.ok || !payload.bookingId) {
        setErrorMessage(payload.message || "Kunne ikke gennemføre booking.");
        return;
      }

      const range = slotRange(selectedSlot.startTime, requiredSlots);
      const nextBlocked = new Set(blockedSlots);
      range.forEach((time) => nextBlocked.add(slotKey(selectedSlot.dateKey, time)));
      setBlockedSlots(nextBlocked);

      setBookingDone(true);

      trackEvent("booking_complete", {
        date: selectedSlot.dateKey,
        time: selectedSlot.startTime,
        required_slots: requiredSlots,
        has_email: Boolean(email.trim()),
        booking_id: payload.bookingId
      });

      router.push(`/bordpladeslibning/book/tak?id=${encodeURIComponent(payload.bookingId)}`);
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
        <p className="text-sm text-muted-foreground">Indlæser bookingflow...</p>
      </section>
    );
  }

  return (
    <section className="space-y-6 rounded-3xl border border-border/70 bg-white/90 p-6 shadow-sm md:p-8">
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span className="rounded-full border border-border px-3 py-1">Kun massiv træ</span>
        {trustBullets.map((bullet) => (
          <span key={bullet} className="rounded-full border border-border px-3 py-1">
            {bullet}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {stepLabels.map((label, index) => {
            const number = index + 1;
            const isActive = step === number;
            const isDone = step > number;
            return (
              <div key={label} className="flex items-center gap-2">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                    isActive
                      ? "bg-primary text-white"
                      : isDone
                        ? "bg-primary/15 text-primary"
                        : "bg-muted/60 text-muted-foreground"
                  }`}
                >
                  {number}
                </span>
                <span className="hidden text-xs font-semibold text-muted-foreground md:inline">{label}</span>
                {index < stepLabels.length - 1 ? <span className="h-px w-6 bg-border" /> : null}
              </div>
            );
          })}
        </div>
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
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-foreground">3) Vælg dato og tidspunkt</h2>
            {nextAvailableDay ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedDateKey(nextAvailableDay.dateKey);
                  setSelectedSlot(null);
                }}
              >
                Gå til næste ledige dag
              </Button>
            ) : null}
          </div>

          <div className="rounded-3xl border border-border bg-white/80 p-4 md:p-6">
            <div className="flex items-center justify-between gap-2">
              <Button
                variant="ghost"
                size="sm"
                disabled={activeWeekIndex <= 0}
                onClick={() => setActiveWeekIndex((prev) => Math.max(0, prev - 1))}
              >
                ←
              </Button>
              <div className="text-center">
                <p className="text-sm font-semibold text-foreground">
                  {activeWeek?.days?.[0] ? formatMonthYear(activeWeek.days[0].date) : ""}
                </p>
                <p className="text-xs text-muted-foreground">{activeWeek?.label || ""}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                disabled={activeWeekIndex >= weeks.length - 1}
                onClick={() => setActiveWeekIndex((prev) => Math.min(weeks.length - 1, prev + 1))}
              >
                →
              </Button>
            </div>

            <div className="mt-5 grid auto-cols-[minmax(120px,1fr)] grid-flow-col gap-3 overflow-x-auto pb-2 md:grid-flow-row md:grid-cols-4 md:overflow-visible lg:grid-cols-7">
              {(activeWeek?.days || []).map((day) => {
                const isSelected = selectedDateKey === day.dateKey;
                const isDisabled = !day.info || day.availableCount === 0;
                const availabilityLabel = isDisabled
                  ? "Ingen tider"
                  : `${day.availableCount} ledig${day.availableCount > 1 ? "e" : ""}`;

                return (
                  <button
                    key={day.dateKey}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => {
                      if (isDisabled) {
                        return;
                      }
                      setSelectedDateKey(day.dateKey);
                      setSelectedSlot(null);
                      setErrorMessage("");
                    }}
                    className={`flex min-h-[130px] flex-col items-center gap-1 rounded-2xl border px-3 py-4 text-center text-sm transition ${
                      isDisabled
                        ? "border-border/40 bg-muted/30 text-muted-foreground/60"
                        : isSelected
                          ? "border-primary bg-primary/10 text-primary shadow-sm"
                          : "border-border bg-white hover:border-primary/60"
                    }`}
                  >
                    <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      {day.dayLabel}
                    </span>
                    <span className="text-xl font-semibold">{day.dayNumber}</span>
                    <span className="text-[11px] text-muted-foreground">{day.monthLabel}</span>
                    <span
                      className={`mt-2 rounded-full px-2 py-1 text-[11px] font-semibold ${
                        isDisabled ? "bg-muted/60 text-muted-foreground" : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {availabilityLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-white/80 p-4">
            <p className="text-sm font-semibold text-foreground">Vælg tidspunkt</p>
            {selectedDay ? (
              <p className="text-xs text-muted-foreground">{selectedDay.dateLabel}</p>
            ) : (
              <p className="text-xs text-muted-foreground">Vælg en dato for at se tider.</p>
            )}
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {SLOT_TIMES.map((startTime) => {
                const isAvailable = selectedDayAvailable.has(startTime);
                return (
                  <button
                    key={`slot-${startTime}`}
                    type="button"
                    disabled={!selectedDay || !isAvailable}
                    onClick={() => {
                      if (!selectedDay || !isAvailable) {
                        return;
                      }
                      selectSlot(selectedDay.dateKey, startTime);
                    }}
                    className={`rounded-md border px-3 py-2 text-sm ${
                      !selectedDay || !isAvailable
                        ? "border-border/40 text-muted-foreground/50"
                        : selectedSlot?.dateKey === selectedDay.dateKey && selectedSlot?.startTime === startTime
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/60"
                    }`}
                  >
                    {startTime}
                  </button>
                );
              })}
            </div>
            {selectedDay && selectedDay.openSlotsCount === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">Lukket denne dag.</p>
            ) : null}
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

      {!bookingDone && step === 4 ? (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">4) Dine oplysninger</h2>
          {selectedSlot ? (
            <p className="text-sm text-muted-foreground">
              Valgt tid: {selectedSlot.dateLabel} kl. {slotLabel(selectedSlot.startTime)}
            </p>
          ) : null}
          {hasEstimate ? (
            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 text-sm">
              <p className="font-semibold text-foreground">Dit AI-prisestimat</p>
              <p className="mt-1 text-lg font-semibold text-primary">
                {isFixedEstimate
                  ? `${resolvedEstimateMin} kr.`
                  : `${resolvedEstimateMin}–${resolvedEstimateMax} kr.`}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Prisen gælder først efter bookingbekræftelse. Vi bekræfter altid tid og pris manuelt.
              </p>
            </div>
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
            <div className="md:col-span-2 space-y-3">
              <p className="text-sm font-semibold text-foreground">Tilvalg (valgfrit)</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {EXTRA_OPTIONS.map((option) => (
                  <label
                    key={option.key}
                    className="flex items-center justify-between gap-3 rounded-md border border-border bg-white/90 px-3 py-2 text-sm"
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
                    className="h-10 w-24 rounded-md border border-border bg-white/90 px-3"
                    inputMode="numeric"
                    placeholder="0"
                  />
                  <span className="text-xs text-muted-foreground">{VANDFALD_PRICE_LABEL}</span>
                </div>
              </label>
              <p className="text-xs text-muted-foreground">Valgte tilvalg: {extrasSummary}</p>
            </div>
            <label className="grid gap-2 text-sm text-foreground md:col-span-2">
              Note (valgfri)
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                className="min-h-24 rounded-md border border-border bg-white/90 px-3 py-2"
                placeholder="Særlige forhold, adgang eller spørgsmål"
              />
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

          <Button
            onClick={submitBooking}
            disabled={isSubmitting}
            className="w-full bg-primary text-white hover:bg-primary/90 sm:w-auto"
          >
            {isSubmitting ? "Sender..." : "Send bookingforespørgsel"}
          </Button>
        </div>
      ) : null}

      {bookingDone ? (
        <div className="space-y-4 rounded-xl border border-primary/30 bg-primary/5 p-5">
          <h2 className="text-xl font-semibold text-foreground">Tak - vi har modtaget din forespørgsel</h2>
          {selectedSlot ? (
            <p className="text-sm text-muted-foreground">
              Vi har reserveret {selectedSlot.dateLabel} kl. {slotLabel(selectedSlot.startTime)} midlertidigt.
            </p>
          ) : null}
          {hasEstimate ? (
            <p className="text-sm text-muted-foreground">
              AI-prisestimat:{" "}
              {isFixedEstimate
                ? `${resolvedEstimateMin} kr.`
                : `${resolvedEstimateMin}–${resolvedEstimateMax} kr.`}{" "}
              (gælder efter bekræftelse).
            </p>
          ) : null}
          {extrasSummary !== "Ingen" ? (
            <p className="text-sm text-muted-foreground">Tilvalg: {extrasSummary}.</p>
          ) : null}
          <p className="text-sm text-muted-foreground">
            Vi vender tilbage med pris og endelig bekræftelse hurtigst muligt. Afbud eller ombooking er gratis
            indtil 24 timer før. Brug
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
          {step < 4 ? <Button onClick={nextStep}>Fortsæt</Button> : null}
        </div>
      ) : null}
    </section>
  );
};
