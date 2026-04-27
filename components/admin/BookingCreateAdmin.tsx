"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  EXTRA_OPTIONS,
  VANDFALD_PRICE_LABEL,
  defaultBordpladeExtras,
  type BordpladeExtras
} from "@/lib/bordplade/extras";

const SERVICE_VALUES = ["bordplade", "gulv", "toemrer", "maler", "murer", "andet"] as const;
const SERVICE_LABELS: Record<string, string> = {
  bordplade: "Bordpladeslibning",
  gulv: "Gulvbehandling",
  toemrer: "Tømrer",
  maler: "Maler",
  murer: "Murer",
  andet: "Andet"
};
const SLOT_TIMES = ["08:00", "11:00", "13:30"] as const;
const SLOT_COUNTS = ["1", "2", "3"] as const;
const DATE_KEY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

type CreateResponse = {
  item?: { id: string };
  message?: string;
};

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
};

type UsersResponse = {
  items?: AdminUser[];
  message?: string;
};

const normalizePriceInput = (value: string) => value.replace(/[^\d]/g, "");
const toNullableNumber = (value: string) => {
  const cleaned = normalizePriceInput(value);
  if (!cleaned) return null;
  const parsed = Number.parseInt(cleaned, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

const inputCls =
  "h-10 w-full rounded-lg border border-border bg-white px-3 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring/40";
const selectCls =
  "h-10 w-full rounded-lg border border-border bg-white px-3 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring/40";
const textareaCls =
  "w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring/40 resize-none";

const SectionCard = ({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="rounded-xl border border-border/60 bg-white shadow-sm">
    <div className="border-b border-border/50 px-5 py-3">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h2>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

export const BookingCreateAdmin = () => {
  const searchParams = useSearchParams();

  // Tidspunkt
  const [date, setDate] = useState("");
  const [startSlot, setStartSlot] = useState<(typeof SLOT_TIMES)[number]>(SLOT_TIMES[0]);
  const [slotCount, setSlotCount] = useState<(typeof SLOT_COUNTS)[number]>("1");
  const [assignedTo, setAssignedTo] = useState("");

  // Kunde
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");

  // Service & opgave
  const [service, setService] = useState<(typeof SERVICE_VALUES)[number]>("bordplade");
  const [taskDescription, setTaskDescription] = useState("");

  // Pris
  const [priceTotal, setPriceTotal] = useState("");
  const [priceNet, setPriceNet] = useState("");
  const [priceVat, setPriceVat] = useState("");

  // Tilvalg (bordplade)
  const [extras, setExtras] = useState<BordpladeExtras>(defaultBordpladeExtras);

  // Notifikationer
  const [sendEmailNotification, setSendEmailNotification] = useState(false);
  const [sendSmsNotification, setSendSmsNotification] = useState(false);

  // Intern note
  const [note, setNote] = useState("");

  // UI state
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersError, setUsersError] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [createdId, setCreatedId] = useState<string | null>(null);

  // Auto-enable notifications when contact info is provided
  useEffect(() => {
    setSendEmailNotification(!!email.trim());
  }, [email]);

  useEffect(() => {
    setSendSmsNotification(!!phone.trim());
  }, [phone]);

  const toggleExtra = (key: (typeof EXTRA_OPTIONS)[number]["key"]) => {
    setExtras((prev) => ({ ...prev, [key]: !prev[key] }));
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service,
          date,
          startSlot,
          slot_count: Number.parseInt(slotCount, 10),
          name,
          phone,
          email: email.trim() || null,
          address: address.trim() || null,
          postal_code: postalCode.trim() || null,
          city: city.trim() || null,
          task_description: taskDescription.trim() || null,
          note: note.trim() || null,
          assigned_to: assignedTo.trim() || null,
          price_total: toNullableNumber(priceTotal),
          price_net: toNullableNumber(priceNet),
          price_vat: toNullableNumber(priceVat),
          extras: service === "bordplade" ? extras : null,
          send_notification: {
            email: sendEmailNotification,
            sms: sendSmsNotification
          }
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

  const loadUsers = async () => {
    setUsersError("");
    try {
      const response = await fetch("/api/admin/users?active=1", { cache: "no-store" });
      const payload = (await response.json()) as UsersResponse;
      if (!response.ok || !payload.items) {
        setUsers([]);
        setUsersError(payload.message || "Kunne ikke hente medarbejdere.");
        return;
      }
      setUsers(payload.items.filter((u) => u.is_active && u.role !== "viewer"));
    } catch {
      setUsers([]);
      setUsersError("Netværksfejl ved hentning af medarbejdere.");
    }
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const datePrefill = (searchParams.get("date") || "").trim();
    const startSlotPrefill = (searchParams.get("startSlot") || "").trim();
    const slotCountPrefill = (searchParams.get("slotCount") || "").trim();
    const servicePrefill = (searchParams.get("service") || "").trim();
    const assignedToPrefill = (searchParams.get("assignedTo") || "").trim();

    if (DATE_KEY_REGEX.test(datePrefill)) setDate(datePrefill);
    if ((SLOT_TIMES as readonly string[]).includes(startSlotPrefill))
      setStartSlot(startSlotPrefill as (typeof SLOT_TIMES)[number]);
    if ((SLOT_COUNTS as readonly string[]).includes(slotCountPrefill))
      setSlotCount(slotCountPrefill as (typeof SLOT_COUNTS)[number]);
    if ((SERVICE_VALUES as readonly string[]).includes(servicePrefill))
      setService(servicePrefill as (typeof SERVICE_VALUES)[number]);
    if (assignedToPrefill) setAssignedTo(assignedToPrefill);
  }, [searchParams]);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground">Ny booking</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Opret en manuel booking for en kunde.</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/bookings">← Tilbage</Link>
        </Button>
      </div>

      {/* Status messages */}
      {error ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      ) : null}

      {createdId ? (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-4">
          <p className="text-sm font-medium text-emerald-800">Booking oprettet.</p>
          <p className="mt-0.5 text-xs text-emerald-700">ID: {createdId}</p>
          <Button asChild size="sm" className="mt-3">
            <Link href={`/admin/bookings/${createdId}`}>Åbn booking →</Link>
          </Button>
        </div>
      ) : null}

      <div className="space-y-4">
        {/* Tidspunkt */}
        <SectionCard title="Tidspunkt">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground">Dato</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground">Starttid</label>
              <select
                value={startSlot}
                onChange={(e) => setStartSlot(e.target.value as (typeof SLOT_TIMES)[number])}
                className={selectCls}
              >
                {SLOT_TIMES.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground">Antal slots</label>
              <select
                value={slotCount}
                onChange={(e) => setSlotCount(e.target.value as (typeof SLOT_COUNTS)[number])}
                className={selectCls}
              >
                {SLOT_COUNTS.map((n) => (
                  <option key={n} value={n}>
                    {n} {n === "1" ? "slot" : "slots"}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 space-y-1.5">
            <label className="block text-sm font-medium text-foreground">
              Tildel medarbejder{" "}
              <span className="font-normal text-muted-foreground">(valgfri)</span>
            </label>
            {usersError ? <p className="text-xs text-red-600">{usersError}</p> : null}
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className={selectCls}
            >
              <option value="">Ikke tildelt</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.role})
                </option>
              ))}
            </select>
          </div>
        </SectionCard>

        {/* Kundeoplysninger */}
        <SectionCard title="Kundeoplysninger">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground">Navn</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Fulde navn"
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground">Telefon</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+45 xx xx xx xx"
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label className="block text-sm font-medium text-foreground">
                Email{" "}
                <span className="font-normal text-muted-foreground">(valgfri)</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="kunde@email.dk"
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label className="block text-sm font-medium text-foreground">
                Adresse{" "}
                <span className="font-normal text-muted-foreground">(valgfri)</span>
              </label>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Gadenavn 1"
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground">
                Postnr.{" "}
                <span className="font-normal text-muted-foreground">(valgfri)</span>
              </label>
              <input
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="8000"
                maxLength={4}
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground">
                By{" "}
                <span className="font-normal text-muted-foreground">(valgfri)</span>
              </label>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Aarhus"
                className={inputCls}
              />
            </div>
          </div>
        </SectionCard>

        {/* Service & opgave */}
        <SectionCard title="Service & opgave">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground">Service</label>
              <select
                value={service}
                onChange={(e) => setService(e.target.value as (typeof SERVICE_VALUES)[number])}
                className={selectCls}
              >
                {SERVICE_VALUES.map((value) => (
                  <option key={value} value={value}>
                    {SERVICE_LABELS[value] ?? value}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground">
                Opgavebeskrivelse{" "}
                <span className="font-normal text-muted-foreground">(bruges på faktura)</span>
              </label>
              <textarea
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                rows={3}
                placeholder="Beskriv opgaven kort..."
                className={textareaCls}
              />
            </div>
          </div>
        </SectionCard>

        {/* Pris */}
        <SectionCard title="Pris">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground">
                Total inkl. moms{" "}
                <span className="font-normal text-muted-foreground">(kr.)</span>
              </label>
              <input
                value={priceTotal}
                onChange={(e) => {
                  const next = normalizePriceInput(e.target.value);
                  setPriceTotal(next);
                  if (!priceNet && !priceVat && next) {
                    const total = toNullableNumber(next);
                    if (total) {
                      const net = Math.round(total / 1.25);
                      setPriceNet(String(net));
                      setPriceVat(String(total - net));
                    }
                  }
                }}
                inputMode="numeric"
                placeholder="3000"
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground">
                Netto{" "}
                <span className="font-normal text-muted-foreground">(kr.)</span>
              </label>
              <input
                value={priceNet}
                onChange={(e) => setPriceNet(normalizePriceInput(e.target.value))}
                inputMode="numeric"
                placeholder="2400"
                className={inputCls}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-foreground">
                Moms{" "}
                <span className="font-normal text-muted-foreground">(kr.)</span>
              </label>
              <input
                value={priceVat}
                onChange={(e) => setPriceVat(normalizePriceInput(e.target.value))}
                inputMode="numeric"
                placeholder="600"
                className={inputCls}
              />
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Skriv totalpris — netto og moms beregnes automatisk (25% moms).
          </p>
        </SectionCard>

        {/* Tilvalg – kun bordplade */}
        {service === "bordplade" ? (
          <SectionCard title="Tilvalg – bordplade">
            <div className="grid gap-2 sm:grid-cols-2">
              {EXTRA_OPTIONS.map((option) => (
                <label
                  key={option.key}
                  className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5 text-sm transition-colors hover:bg-muted/30"
                >
                  <span className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={extras[option.key]}
                      onChange={() => toggleExtra(option.key)}
                      className="h-4 w-4"
                    />
                    <span className="font-medium text-foreground">{option.label}</span>
                  </span>
                  <span className="text-xs text-muted-foreground">{option.priceLabel}</span>
                </label>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-3">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-foreground">
                  Vandfald (antal)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    value={extras.vandfaldCount ? String(extras.vandfaldCount) : ""}
                    onChange={(e) => updateVandfaldCount(e.target.value)}
                    inputMode="numeric"
                    placeholder="0"
                    className="h-10 w-24 rounded-lg border border-border bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
                  />
                  <span className="text-xs text-muted-foreground">{VANDFALD_PRICE_LABEL}</span>
                </div>
              </div>
            </div>
          </SectionCard>
        ) : null}

        {/* Notifikationer */}
        <SectionCard title="Bekræftelse til kunden">
          <p className="mb-3 text-sm text-muted-foreground">
            Send automatisk bekræftelse til kunden når bookingen oprettes.
          </p>
          <div className="space-y-2">
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border px-4 py-3 transition-colors hover:bg-muted/20">
              <input
                type="checkbox"
                checked={sendEmailNotification}
                onChange={(e) => setSendEmailNotification(e.target.checked)}
                className="h-4 w-4 shrink-0"
                disabled={!email.trim()}
              />
              <div className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-foreground">
                  Send email bekræftelse
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {email.trim() ? email.trim() : "Ingen email angivet"}
                </span>
              </div>
            </label>
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border px-4 py-3 transition-colors hover:bg-muted/20">
              <input
                type="checkbox"
                checked={sendSmsNotification}
                onChange={(e) => setSendSmsNotification(e.target.checked)}
                className="h-4 w-4 shrink-0"
                disabled={!phone.trim()}
              />
              <div className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-foreground">
                  Send SMS bekræftelse
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {phone.trim() ? phone.trim() : "Intet telefonnummer angivet"}
                </span>
              </div>
            </label>
          </div>
        </SectionCard>

        {/* Intern note */}
        <SectionCard title="Intern note">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">
              Note{" "}
              <span className="font-normal text-muted-foreground">
                (valgfri – sendes ikke til kunden)
              </span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Interne bemærkninger..."
              className={textareaCls}
            />
          </div>
        </SectionCard>

        {/* Submit */}
        <div className="flex items-center justify-between pt-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/bookings">Annuller</Link>
          </Button>
          <Button onClick={submitForm} disabled={loading} size="lg">
            {loading ? "Opretter..." : "Opret booking"}
          </Button>
        </div>
      </div>
    </main>
  );
};
