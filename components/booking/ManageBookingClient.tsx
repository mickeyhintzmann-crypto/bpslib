"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

type BookingInfo = {
  id: string;
  date: string | null;
  startTime: string | null;
  endTime: string | null;
  slotCount: number;
  status: string | null;
  customerName: string | null;
  address: string | null;
  postalCode: string | null;
  city: string | null;
  serviceType: string | null;
  source: string | null;
  priceTotal: number | null;
  notes: string | null;
};

type BookingResponse = {
  item?: BookingInfo;
  message?: string;
};

/* ─── Status helpers ─── */

const isPending = (s: string | null) => s === "new" || s === "pending_confirmation" || s === "pending";
const isConfirmed = (s: string | null) => s === "confirmed" || s === "in_progress";
const isCancelled = (s: string | null) => s === "cancelled";
const isDone = (s: string | null) => s === "done";

const SERVICE_LABELS: Record<string, string> = {
  bordplade: "Bordpladeslibning",
  gulvafslibning: "Gulvafslibning",
  gulvlaegning: "Gulvlægning",
  microcement: "Microcement",
  maler: "Malerarbejde",
  murer: "Murerarbejde",
  toemrer: "Tømrerarbejde",
};

const formatDateDK = (dateStr: string | null) => {
  if (!dateStr) return "Ikke fastlagt";
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  const [y, m, d] = parts;
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  const weekday = new Intl.DateTimeFormat("da-DK", { weekday: "long" }).format(date);
  const dayMonth = new Intl.DateTimeFormat("da-DK", { day: "numeric", month: "long", year: "numeric" }).format(date);
  return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)} d. ${dayMonth}`;
};

const OTHER_SERVICES = [
  { name: "Bordpladeslibning", href: "/bordpladeslibning", desc: "Giv din bordplade nyt liv" },
  { name: "Gulvafslibning", href: "/gulvafslibning", desc: "Nyt liv til dine trægulve" },
  { name: "Gulvlægning", href: "/gulvlaegning", desc: "Nyt gulv fra bund til top" },
  { name: "Microcement", href: "/microcement", desc: "Moderne og holdbart design" },
  { name: "Malerarbejde", href: "/maler", desc: "Professionel maling inde og ude" },
  { name: "Murerarbejde", href: "/murer", desc: "Fra reparation til nybyg" },
  { name: "Tømrerarbejde", href: "/toemrer", desc: "Kvalitetshåndværk i træ" },
];

/* ─── Poll interval: 15 seconds while pending ─── */
const POLL_INTERVAL = 15_000;

export const ManageBookingClient = ({ token }: { token: string }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [booking, setBooking] = useState<BookingInfo | null>(null);
  const [prevStatus, setPrevStatus] = useState<string | null>(null);
  const [cancelMessage, setCancelMessage] = useState("");
  const [rescheduleMessage, setRescheduleMessage] = useState("");
  const [rescheduleNote, setRescheduleNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchBooking = useCallback(async (isInitial = false) => {
    if (isInitial) {
      setLoading(true);
      setError("");
    }
    try {
      const response = await fetch(`/api/bookings/manage/${token}`, { cache: "no-store" });
      const payload = (await response.json()) as BookingResponse;
      if (!response.ok || !payload.item) {
        if (isInitial) {
          setError(payload.message || "Linket er ugyldigt.");
          setBooking(null);
        }
        return;
      }

      setBooking((prev) => {
        if (prev && prev.status !== payload.item!.status) {
          setPrevStatus(prev.status);
        }
        return payload.item!;
      });
    } catch (fetchError) {
      console.error(fetchError);
      if (isInitial) setError("Kunne ikke hente booking.");
    } finally {
      if (isInitial) setLoading(false);
    }
  }, [token]);

  /* Initial load */
  useEffect(() => {
    if (token) fetchBooking(true);
  }, [token, fetchBooking]);

  /* Auto-poll while status is pending */
  useEffect(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }

    if (booking && isPending(booking.status)) {
      pollRef.current = setInterval(() => fetchBooking(false), POLL_INTERVAL);
    }

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [booking?.status, fetchBooking]);

  const cancelBooking = async () => {
    if (!booking || submitting) return;
    const confirmed = window.confirm("Er du sikker på, at du vil aflyse din booking?");
    if (!confirmed) return;

    setSubmitting(true);
    setCancelMessage("");
    try {
      const response = await fetch(`/api/bookings/manage/${token}/cancel`, { method: "POST" });
      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        setCancelMessage(payload.message || "Kunne ikke aflyse booking.");
        return;
      }
      setCancelMessage(payload.message || "Bookingen er annulleret.");
      setPrevStatus(booking.status);
      setBooking((prev) => (prev ? { ...prev, status: "cancelled" } : prev));
    } catch (err) {
      console.error(err);
      setCancelMessage("Der opstod en fejl. Prøv igen.");
    } finally {
      setSubmitting(false);
    }
  };

  const requestReschedule = async () => {
    if (!booking || submitting) return;
    if (!rescheduleNote.trim()) {
      setRescheduleMessage("Skriv venligst en kort besked.");
      return;
    }

    setSubmitting(true);
    setRescheduleMessage("");
    try {
      const response = await fetch(`/api/bookings/manage/${token}/reschedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: rescheduleNote.trim() }),
      });
      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        setRescheduleMessage(payload.message || "Kunne ikke sende ombooking.");
        return;
      }
      setRescheduleMessage("Tak! Vi kontakter dig hurtigst muligt om ny tid.");
      setRescheduleNote("");
    } catch (err) {
      console.error(err);
      setRescheduleMessage("Der opstod en fejl. Prøv igen.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ─── Loading state ─── */
  if (loading) {
    return (
      <main className="mx-auto w-full max-w-3xl px-6 py-16">
        <div className="rounded-3xl border border-border/70 bg-white/70 p-8 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="mt-3 text-sm text-muted-foreground">Henter din booking...</p>
        </div>
      </main>
    );
  }

  /* ─── Error state ─── */
  if (!booking || error) {
    return (
      <main className="mx-auto w-full max-w-3xl px-6 py-16">
        <section className="space-y-4 rounded-3xl border border-border/70 bg-white/70 p-8 md:p-10">
          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
            Linket er ugyldigt
          </h1>
          <p className="text-muted-foreground">
            {error || "Vi kunne ikke finde din booking. Kontakt os, hvis du har brug for hjælp."}
          </p>
          <Button asChild>
            <Link href="/kontakt">Kontakt os</Link>
          </Button>
        </section>
      </main>
    );
  }

  const status = booking.status || "new";
  const serviceLabel = booking.serviceType ? (SERVICE_LABELS[booking.serviceType] || booking.serviceType) : "Håndværkerbesøg";
  const canModify = isPending(status) || isConfirmed(status);
  const serviceHref = booking.serviceType ? `/${booking.serviceType === "bordplade" ? "bordpladeslibning" : booking.serviceType}` : "/ydelser";

  const otherServices = OTHER_SERVICES.filter(
    (s) => s.name.toLowerCase() !== serviceLabel.toLowerCase()
  );

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12 md:py-16">
      <div className="space-y-6">

        {/* ─── STATUS BANNER ─── */}
        {isPending(status) ? (
          <section className="overflow-hidden rounded-3xl border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50">
            <div className="px-6 py-6 md:px-8">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-200 text-lg">⏳</span>
                <div>
                  <h2 className="text-lg font-bold text-amber-900">Afventer bekræftelse</h2>
                  <p className="text-sm text-amber-800/70">Vi gennemgår din booking og vender tilbage hurtigst muligt.</p>
                </div>
              </div>
              {booking.priceTotal ? (
                <div className="mt-4 rounded-xl border-2 border-amber-400 bg-white px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Din aftalte pris</p>
                  <p className="mt-1 text-2xl font-bold text-amber-900">
                    {booking.priceTotal.toLocaleString("da-DK")} kr.
                  </p>
                </div>
              ) : null}
              <div className="mt-4 rounded-xl bg-white/60 p-4 text-sm text-amber-900/80">
                <p className="font-medium">Imens du venter:</p>
                <ul className="mt-2 space-y-1.5">
                  <li className="flex gap-2">
                    <span>→</span>
                    <span>Læs mere om <Link href={serviceHref} className="font-semibold underline decoration-amber-400 underline-offset-2 hover:text-amber-700">{serviceLabel.toLowerCase()}</Link> og hvad processen indebærer</span>
                  </li>
                  <li className="flex gap-2">
                    <span>→</span>
                    <span>Se <Link href="/referencer" className="font-semibold underline decoration-amber-400 underline-offset-2 hover:text-amber-700">billeder fra tidligere opgaver</Link> for inspiration</span>
                  </li>
                  <li className="flex gap-2">
                    <span>→</span>
                    <span>Tjek vores <Link href="/anmeldelser" className="font-semibold underline decoration-amber-400 underline-offset-2 hover:text-amber-700">anmeldelser</Link> og se hvad andre kunder siger</span>
                  </li>
                </ul>
              </div>
              <p className="mt-3 text-xs text-amber-700/60">Denne side opdaterer automatisk når vi har behandlet din booking.</p>
            </div>
          </section>
        ) : null}

        {isConfirmed(status) ? (
          <section className="overflow-hidden rounded-3xl border-2 border-emerald-300 bg-gradient-to-r from-emerald-50 to-green-50">
            <div className="px-6 py-6 md:px-8">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-200 text-lg">✓</span>
                <div>
                  <h2 className="text-lg font-bold text-emerald-900">Booking bekræftet</h2>
                  <p className="text-sm text-emerald-800/70">Vi glæder os til at komme forbi!</p>
                </div>
              </div>
              <div className="mt-4 rounded-xl bg-white/60 p-4 text-sm text-emerald-900/80">
                <p className="font-medium">Forberedelse inden vi kommer:</p>
                <ul className="mt-2 space-y-1.5">
                  {booking.serviceType === "bordplade" ? (
                    <>
                      <li className="flex gap-2"><span>→</span><span>Ryd bordpladen helt — fjern alt der står på den (brødrister, knivblok, skærebrætter osv.)</span></li>
                      <li className="flex gap-2"><span>→</span><span>Sørg for fri adgang til køkkenet så vores folk kan komme til</span></li>
                      <li className="flex gap-2"><span>→</span><span><strong>Efter behandlingen:</strong> Bordpladen må ikke bruges i 24 timer mens olien hærder. Vi dækker den til, så den er beskyttet</span></li>
                      <li className="flex gap-2"><span>→</span><span>Undgå at lægge noget på bordpladen eller stille ting tilbage de første 24 timer</span></li>
                    </>
                  ) : (
                    <>
                      <li className="flex gap-2"><span>→</span><span>Sørg for at arbejdsområdet er ryddet og tilgængeligt</span></li>
                      <li className="flex gap-2"><span>→</span><span>Fjern løse genstande og møbler fra området hvis muligt</span></li>
                      <li className="flex gap-2"><span>→</span><span>Sørg for parkering tæt på indgangen til udstyr og materialer</span></li>
                    </>
                  )}
                </ul>
              </div>
              <p className="mt-3 text-xs text-emerald-700/60">Du betaler først når arbejdet er udført og du er tilfreds.</p>
            </div>
          </section>
        ) : null}

        {isCancelled(status) ? (
          <section className="overflow-hidden rounded-3xl border-2 border-red-300 bg-gradient-to-r from-red-50 to-rose-50">
            <div className="px-6 py-6 md:px-8">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-200 text-lg">✕</span>
                <div>
                  <h2 className="text-lg font-bold text-red-900">Booking blev ikke bekræftet</h2>
                  <p className="text-sm text-red-800/70">Den valgte tid kunne desværre ikke bekræftes.</p>
                </div>
              </div>
              <div className="mt-4 rounded-xl bg-white/60 p-4 text-sm text-red-900/80">
                <p className="font-medium">Hvad nu?</p>
                <ul className="mt-2 space-y-1.5">
                  <li className="flex gap-2"><span>→</span><span>Kontakt os på <a href="tel:+4526913737" className="font-semibold underline">+45 2691 3737</a> — vi finder en ny tid der passer dig</span></li>
                  <li className="flex gap-2"><span>→</span><span>Du kan også <Link href="/bordpladeslibning/book" className="font-semibold underline">booke en ny tid online</Link> med det samme</span></li>
                  <li className="flex gap-2"><span>→</span><span>Prisen er selvfølgelig den samme som aftalt{booking.priceTotal ? ` (${booking.priceTotal.toLocaleString("da-DK")} kr.)` : ""}</span></li>
                </ul>
              </div>
            </div>
          </section>
        ) : null}

        {isDone(status) ? (
          <section className="overflow-hidden rounded-3xl border-2 border-emerald-300 bg-gradient-to-r from-emerald-50 to-teal-50">
            <div className="px-6 py-6 md:px-8">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-200 text-lg">★</span>
                <div>
                  <h2 className="text-lg font-bold text-emerald-900">Tak for at du valgte BP Slib!</h2>
                  <p className="text-sm text-emerald-800/70">Vi håber du er glad for resultatet.</p>
                </div>
              </div>
              <div className="mt-4 rounded-xl bg-white/60 p-4 text-sm text-emerald-900/80">
                <p>Kender du nogen der også kunne bruge en håndværker? Vi sætter stor pris på anbefalinger — og vi lover at tage lige så godt hånd om deres hjem som dit.</p>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button asChild className="rounded-xl"><Link href="/anmeldelser">Skriv en anmeldelse</Link></Button>
                <Button asChild variant="outline" className="rounded-xl"><Link href="/referencer">Se vores arbejde</Link></Button>
              </div>
            </div>
          </section>
        ) : null}

        {/* ─── BOOKING DETAILS CARD ─── */}
        <section className="overflow-hidden rounded-3xl border border-border/70 bg-white/70">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-6 py-5 md:px-8">
            <p className="text-sm font-medium text-amber-800/70">Din booking hos BP Slib</p>
            <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              {serviceLabel}
            </h1>
          </div>

          <div className="divide-y divide-border/50 px-6 md:px-8">
            <div className="flex items-center justify-between py-4">
              <span className="text-sm text-muted-foreground">Dato</span>
              <span className="text-sm font-medium text-foreground">{formatDateDK(booking.date)}</span>
            </div>
            {booking.startTime ? (
              <div className="flex items-center justify-between py-4">
                <span className="text-sm text-muted-foreground">Tidspunkt</span>
                <span className="text-sm font-medium text-foreground">
                  kl. {booking.startTime}{booking.endTime ? ` – ${booking.endTime}` : ""}
                </span>
              </div>
            ) : null}
            {booking.address ? (
              <div className="flex items-center justify-between py-4">
                <span className="text-sm text-muted-foreground">Adresse</span>
                <span className="text-right text-sm font-medium text-foreground">
                  {[booking.address, booking.postalCode, booking.city].filter(Boolean).join(", ")}
                </span>
              </div>
            ) : null}
            {booking.priceTotal ? (
              <div className="flex items-center justify-between py-4">
                <span className="text-sm text-muted-foreground">Pris</span>
                <span className="text-sm font-semibold text-foreground">
                  {booking.priceTotal.toLocaleString("da-DK")} kr. inkl. moms
                </span>
              </div>
            ) : null}
          </div>

          {booking.notes ? (
            <div className="border-t border-border/50 px-6 py-4 md:px-8">
              <p className="text-xs text-muted-foreground">Din besked</p>
              <p className="mt-1 text-sm text-foreground">{booking.notes}</p>
            </div>
          ) : null}
        </section>

        {/* ─── MODIFY BOOKING ─── */}
        {canModify ? (
          <section className="rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
            <h2 className="font-display text-lg font-semibold text-foreground">Ændr din booking</h2>
            <p className="mt-1 text-sm text-muted-foreground">Kan du ikke alligevel? Ingen stress — du kan aflyse eller flytte din tid her.</p>

            <div className="mt-5 space-y-5">
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Anmod om ny tid</h3>
                <textarea
                  value={rescheduleNote}
                  onChange={(event) => setRescheduleNote(event.target.value)}
                  className="min-h-[100px] w-full rounded-xl border border-border bg-white px-4 py-3 text-sm placeholder:text-muted-foreground/60"
                  placeholder="Skriv kort om, hvornår du ønsker en ny tid — fx 'Kan det blive tirsdag i stedet?'"
                />
                <Button onClick={requestReschedule} disabled={submitting} className="rounded-xl">
                  {submitting ? "Sender..." : "Send anmodning"}
                </Button>
                {rescheduleMessage ? <p className="text-sm text-muted-foreground">{rescheduleMessage}</p> : null}
              </div>

              <div className="border-t border-border/50 pt-5">
                <Button
                  variant="outline"
                  onClick={cancelBooking}
                  disabled={submitting}
                  className="rounded-xl border-red-200 text-red-700 hover:bg-red-50"
                >
                  Aflys booking
                </Button>
                {cancelMessage ? <p className="mt-2 text-sm text-muted-foreground">{cancelMessage}</p> : null}
              </div>
            </div>
          </section>
        ) : null}

        {/* ─── OTHER SERVICES ─── */}
        <section className="rounded-3xl border border-border/70 bg-white/70 p-6 md:p-8">
          <h2 className="font-display text-lg font-semibold text-foreground">Vidste du at vi også tilbyder?</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            BP Slib er din lokale håndværker på Sjælland. Vi samler alt under ét tag, så du slipper for at ringe rundt.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {otherServices.map((service) => (
              <Link
                key={service.href}
                href={service.href}
                className="group flex items-center justify-between rounded-xl border border-border/60 bg-white px-4 py-3 transition hover:border-amber-300 hover:bg-amber-50/50"
              >
                <div>
                  <p className="text-sm font-semibold text-foreground group-hover:text-amber-900">{service.name}</p>
                  <p className="text-xs text-muted-foreground">{service.desc}</p>
                </div>
                <span className="text-muted-foreground/40 transition group-hover:text-amber-600">→</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ─── REFERRAL ─── */}
        <section className="rounded-3xl bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100/50 p-6 text-center md:p-8">
          <h2 className="font-display text-lg font-semibold text-foreground">Kender du nogen der også trænger?</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Fortæl dine venner og naboer om os. God håndværk fortjener at blive delt — og vi lover at tage lige så godt hånd om deres hjem som dit.
          </p>
          <div className="mt-4">
            <Button asChild variant="outline" className="rounded-xl">
              <Link href="/kontakt">Henvis en ven</Link>
            </Button>
          </div>
        </section>

        {/* ─── CONTACT FOOTER ─── */}
        <section className="rounded-3xl border border-border/70 bg-white/70 p-6 text-center md:p-8">
          <p className="text-sm text-muted-foreground">Har du spørgsmål? Vi er her for at hjælpe.</p>
          <div className="mt-3 flex flex-wrap justify-center gap-3">
            <Button asChild variant="outline" className="rounded-xl">
              <a href="tel:+4526913737">Ring til os</a>
            </Button>
            <Button asChild variant="outline" className="rounded-xl">
              <a href="sms:+4526913737">Send SMS</a>
            </Button>
            <Button asChild variant="outline" className="rounded-xl">
              <Link href="/kontakt">Kontakt</Link>
            </Button>
          </div>
          <div className="mt-4 flex justify-center gap-4 text-xs text-muted-foreground">
            <Link href="/handelsbetingelser" className="hover:underline">Handelsbetingelser</Link>
            <Link href="/privatlivspolitik" className="hover:underline">Privatlivspolitik</Link>
          </div>
        </section>

      </div>
    </main>
  );
};
