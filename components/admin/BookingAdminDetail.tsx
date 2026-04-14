"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Phone, Mail, MapPin, Calendar, Clock, ArrowLeft, Copy, Check, User, Briefcase, Trash2 } from "lucide-react";

import { useAdminSession } from "@/components/admin/AdminSessionContext";
import { Button } from "@/components/ui/button";
import {
  EXTRA_OPTIONS,
  VANDFALD_PRICE_LABEL,
  defaultBordpladeExtras,
  formatExtrasSummary,
  sanitizeExtras,
  type BordpladeExtras
} from "@/lib/bordplade/extras";

const STATUS_FLOW = ["new", "confirmed", "done", "cancelled"] as const;
const STATUS_LABELS: Record<string, string> = {
  new: "Ny",
  confirmed: "Bekræftet",
  done: "Udført",
  cancelled: "Aflyst",
  pending_confirmation: "Ny",
  in_progress: "Bekræftet",
};
const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-800 border-blue-200",
  confirmed: "bg-amber-100 text-amber-800 border-amber-200",
  done: "bg-emerald-100 text-emerald-800 border-emerald-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
};
const SLOT_TIMES = ["08:00", "11:00", "13:30"] as const;

type BookingItem = {
  id: string;
  created_at: string;
  status: string;
  service_type: string;
  source: string | null;
  assigned_to: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  address: string | null;
  postal_code: string | null;
  city: string | null;
  slot_start: string;
  slot_end: string;
  slot_count?: number | null;
  notes: string | null;
  task_description: string | null;
  internal_note: string | null;
  estimator_request_id: string | null;
  extras: BordpladeExtras | null;
  price_total: number | null;
  price_net: number | null;
  price_vat: number | null;
};

type BookingResponse = {
  item?: BookingItem;
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

const formatDateTime = (iso: string | null) => {
  if (!iso) return "Ikke angivet";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Ukendt";
  return new Intl.DateTimeFormat("da-DK", { dateStyle: "long", timeStyle: "short" }).format(date);
};

const formatDate = (iso: string | null) => {
  if (!iso) return "Ikke angivet";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Ukendt";
  return new Intl.DateTimeFormat("da-DK", { dateStyle: "long" }).format(date);
};

const formatTime = (iso: string | null) => {
  if (!iso) return "-";
  const time = iso.slice(11, 16);
  return time || "-";
};

const dateKeyFromIso = (iso: string | null) => (iso ? iso.slice(0, 10) : "");

const normalizePriceInput = (value: string) => value.replace(/[^\d]/g, "");
const toNullableNumber = (value: string) => {
  const cleaned = normalizePriceInput(value);
  if (!cleaned) return null;
  const parsed = Number.parseInt(cleaned, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

/* Map old statuses to new simplified ones */
const normalizeStatus = (value: string): (typeof STATUS_FLOW)[number] => {
  if (value === "pending_confirmation" || value === "pending") return "new";
  if (value === "in_progress") return "confirmed";
  if (STATUS_FLOW.includes(value as (typeof STATUS_FLOW)[number])) return value as (typeof STATUS_FLOW)[number];
  return "new";
};

/* ---------- Section wrapper ---------- */
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="rounded-xl border border-border/60 bg-white p-5 space-y-4">
    <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{title}</h2>
    {children}
  </div>
);

/* ---------- Info row ---------- */
const InfoRow = ({ icon, label, value, href }: { icon?: React.ReactNode; label: string; value: string; href?: string }) => (
  <div className="flex items-start gap-3 py-1.5">
    {icon ? <span className="mt-0.5 text-muted-foreground">{icon}</span> : null}
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      {href ? (
        <a href={href} className="text-sm font-medium text-primary hover:underline">{value}</a>
      ) : (
        <p className="text-sm font-medium text-foreground">{value || "—"}</p>
      )}
    </div>
  </div>
);

export const BookingAdminDetail = ({ bookingId }: { bookingId: string }) => {
  const session = useAdminSession();
  const router = useRouter();
  const canEdit = session?.role === "owner" || session?.role === "admin";
  const [deleting, setDeleting] = useState(false);

  const [item, setItem] = useState<BookingItem | null>(null);
  const [status, setStatus] = useState<(typeof STATUS_FLOW)[number]>("new");
  const [note, setNote] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [city, setCity] = useState("");
  const [moveDate, setMoveDate] = useState("");
  const [moveStart, setMoveStart] = useState<(typeof SLOT_TIMES)[number]>(SLOT_TIMES[0]);
  const [moveSlotCount, setMoveSlotCount] = useState("1");
  const [extrasState, setExtrasState] = useState<BordpladeExtras>(defaultBordpladeExtras);
  const [assignedTo, setAssignedTo] = useState("");
  const [priceTotal, setPriceTotal] = useState("");
  const [priceNet, setPriceNet] = useState("");
  const [priceVat, setPriceVat] = useState("");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersError, setUsersError] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState("");

  const syncFieldsFromItem = (nextItem: BookingItem) => {
    const normalized = normalizeStatus(nextItem.status);
    setStatus(normalized);
    setNote(nextItem.notes || "");
    setTaskDescription(nextItem.task_description || "");
    setInternalNote(nextItem.internal_note || "");
    setCity(nextItem.city || "");
    setMoveDate(dateKeyFromIso(nextItem.slot_start));
    const slotStartTime = nextItem.slot_start?.slice(11, 16) || "";
    if (SLOT_TIMES.includes(slotStartTime as (typeof SLOT_TIMES)[number])) {
      setMoveStart(slotStartTime as (typeof SLOT_TIMES)[number]);
    }
    const slotCount = nextItem.slot_count && nextItem.slot_count > 0 ? String(nextItem.slot_count) : "1";
    setMoveSlotCount(slotCount);
    setExtrasState(sanitizeExtras(nextItem.extras));
    setAssignedTo(nextItem.assigned_to || "");
    setPriceTotal(nextItem.price_total ? String(nextItem.price_total) : "");
    setPriceNet(nextItem.price_net ? String(nextItem.price_net) : "");
    setPriceVat(nextItem.price_vat ? String(nextItem.price_vat) : "");
  };

  const toggleExtra = (key: (typeof EXTRA_OPTIONS)[number]["key"]) => {
    setExtrasState((prev) => ({ ...prev, [key]: !prev[key] }));
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
      const response = await fetch(`/api/admin/bookings/${bookingId}`, { cache: "no-store" });
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

  const loadUsers = async () => {
    if (!canEdit) return;
    setUsersError("");
    try {
      const response = await fetch("/api/admin/users?active=1", { cache: "no-store" });
      const payload = (await response.json()) as UsersResponse;
      if (!response.ok || !payload.items) {
        setUsers([]);
        setUsersError(payload.message || "Kunne ikke hente medarbejdere.");
        return;
      }
      setUsers(payload.items.filter((user) => user.is_active && user.role !== "viewer"));
    } catch (fetchError) {
      console.error(fetchError);
      setUsers([]);
      setUsersError("Netværksfejl ved hentning af medarbejdere.");
    }
  };

  const updateBooking = async (payload: Record<string, unknown>) => {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
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

  const copyToClipboard = async (value: string, label: string) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      setTimeout(() => setCopied(""), 2000);
    } catch (copyError) {
      console.error(copyError);
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
      city: city.trim() || null,
      taskDescription: taskDescription.trim() || null,
      note: note.trim() || null,
      internalNote: internalNote.trim() || null
    });
  };

  const handleSaveExtras = () => {
    updateBooking({ extras: extrasState });
  };

  const handleSaveAssignment = () => {
    updateBooking({ assigned_to: assignedTo.trim() || null });
  };

  const handleDeleteBooking = async () => {
    const confirmed = window.confirm(
      `Er du sikker på du vil slette denne booking for ${item?.customer_name}? Dette kan ikke fortrydes.`
    );
    if (!confirmed) return;

    setDeleting(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "DELETE",
      });
      const data = (await response.json()) as { ok?: boolean; message?: string };
      if (!response.ok || !data.ok) {
        setError(data.message || "Kunne ikke slette booking.");
        return;
      }
      router.push("/admin/bookings");
    } catch (deleteError) {
      console.error(deleteError);
      setError("Netværksfejl ved sletning af booking.");
    } finally {
      setDeleting(false);
    }
  };

  const handleSavePricing = () => {
    updateBooking({
      price_total: toNullableNumber(priceTotal),
      price_net: toNullableNumber(priceNet),
      price_vat: toNullableNumber(priceVat)
    });
  };

  const priceSummary = useMemo(() => {
    const total = toNullableNumber(priceTotal);
    const net = toNullableNumber(priceNet);
    const vat = toNullableNumber(priceVat);
    return { total, net, vat };
  }, [priceNet, priceTotal, priceVat]);

  const assignedLabel = useMemo(() => {
    if (!item?.assigned_to) return "Ikke tildelt";
    const match = users.find((user) => user.id === item.assigned_to);
    return match ? `${match.name} (${match.role})` : item.assigned_to;
  }, [item?.assigned_to, users]);

  useEffect(() => {
    loadBooking();
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]);

  const fullAddress = item
    ? [item.address, item.postal_code, item.city].filter(Boolean).join(", ") || "Ikke angivet"
    : "";

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <Button asChild variant="ghost" size="sm" className="gap-1.5">
          <Link href="/admin/bookings">
            <ArrowLeft className="h-4 w-4" />
            Bookinger
          </Link>
        </Button>
      </div>

      {error ? <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p> : null}
      {message ? <p className="mb-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{message}</p> : null}

      {loading && !item ? (
        <div className="py-20 text-center text-sm text-muted-foreground">Henter booking...</div>
      ) : null}

      {item ? (
        <div className="space-y-5">
          {/* Top: Kundeinfo + Status */}
          <div className="rounded-xl border border-border/60 bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-foreground">{item.customer_name}</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {item.service_type === "bordplade" ? "Bordpladeslibning" : item.service_type}
                  {item.source ? ` · ${item.source}` : ""}
                </p>
              </div>
              <span className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium ${STATUS_COLORS[status] || STATUS_COLORS.new}`}>
                {STATUS_LABELS[status] || status}
              </span>
            </div>

            {/* Quick actions */}
            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild size="sm" variant="outline" className="gap-1.5">
                <a href={`tel:${item.customer_phone}`}>
                  <Phone className="h-3.5 w-3.5" />
                  {item.customer_phone}
                </a>
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                onClick={() => copyToClipboard(item.customer_phone, "telefon")}
              >
                {copied === "telefon" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied === "telefon" ? "Kopieret" : "Kopiér tlf"}
              </Button>
              {item.customer_email ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  onClick={() => copyToClipboard(item.customer_email || "", "email")}
                >
                  <Mail className="h-3.5 w-3.5" />
                  {copied === "email" ? "Kopieret" : item.customer_email}
                </Button>
              ) : null}
            </div>

            {/* Contact details grid */}
            <div className="mt-4 grid gap-x-8 gap-y-1 sm:grid-cols-2">
              <InfoRow icon={<MapPin className="h-4 w-4" />} label="Adresse" value={fullAddress} />
              <InfoRow icon={<Calendar className="h-4 w-4" />} label="Dato" value={formatDate(item.slot_start)} />
              <InfoRow icon={<Clock className="h-4 w-4" />} label="Tidspunkt" value={formatTime(item.slot_start)} />
              <InfoRow icon={<Briefcase className="h-4 w-4" />} label="Slots" value={item.slot_count ? `${item.slot_count} slot${item.slot_count > 1 ? "s" : ""}` : "1 slot"} />
              <InfoRow icon={<User className="h-4 w-4" />} label="Tildelt" value={assignedLabel} />
              {item.estimator_request_id ? (
                <InfoRow label="Estimator sag" value={item.estimator_request_id} href="/admin/estimator" />
              ) : null}
            </div>
          </div>

          {/* Status */}
          <Section title="Status">
            <div className="flex flex-wrap gap-2">
              {(["new", "confirmed", "done"] as const).map((option) => (
                <Button
                  key={option}
                  size="sm"
                  variant={option === status ? "default" : "outline"}
                  onClick={() => handleStatusChange(option)}
                  disabled={saving}
                  className="min-w-[100px]"
                >
                  {STATUS_LABELS[option]}
                </Button>
              ))}
              <Button
                size="sm"
                variant="outline"
                className="min-w-[100px] border-red-200 text-red-700 hover:bg-red-50"
                onClick={() => handleStatusChange("cancelled")}
                disabled={saving}
              >
                Aflys
              </Button>
            </div>
          </Section>

          {/* Flyt booking */}
          <Section title="Flyt booking">
            <div className="flex flex-wrap items-end gap-3">
              <label className="space-y-1.5">
                <span className="text-xs text-muted-foreground">Dato</span>
                <input
                  type="date"
                  value={moveDate}
                  onChange={(e) => setMoveDate(e.target.value)}
                  className="block h-10 rounded-lg border border-border bg-white px-3 text-sm"
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs text-muted-foreground">Tidspunkt</span>
                <select
                  value={moveStart}
                  onChange={(e) => setMoveStart(e.target.value as (typeof SLOT_TIMES)[number])}
                  className="block h-10 rounded-lg border border-border bg-white px-3 text-sm"
                >
                  {SLOT_TIMES.map((slot) => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </label>
              <label className="space-y-1.5">
                <span className="text-xs text-muted-foreground">Antal slots</span>
                <select
                  value={moveSlotCount}
                  onChange={(e) => setMoveSlotCount(e.target.value)}
                  className="block h-10 rounded-lg border border-border bg-white px-3 text-sm"
                >
                  <option value="1">1 slot</option>
                  <option value="2">2 slots</option>
                  <option value="3">3 slots</option>
                </select>
              </label>
              <Button onClick={handleMoveBooking} disabled={saving} size="sm">
                Flyt
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">2 slots kan kun starte 08:00 eller 11:00. 3 slots kan kun starte 08:00.</p>
          </Section>

          {/* Medarbejder + Pris side by side */}
          {canEdit ? (
            <div className="grid gap-5 md:grid-cols-2">
              {/* Tildel medarbejder */}
              <Section title="Medarbejder">
                {usersError ? <p className="text-xs text-red-700">{usersError}</p> : null}
                <div className="flex items-end gap-3">
                  <select
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="h-10 flex-1 rounded-lg border border-border bg-white px-3 text-sm"
                  >
                    <option value="">Ikke tildelt</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                  </select>
                  <Button onClick={handleSaveAssignment} disabled={saving} size="sm">
                    Gem
                  </Button>
                </div>
              </Section>

              {/* Pris */}
              <Section title="Pris">
                <div className="grid grid-cols-3 gap-3">
                  <label className="space-y-1.5">
                    <span className="text-xs text-muted-foreground">Total</span>
                    <input
                      value={priceTotal}
                      onChange={(e) => {
                        const next = normalizePriceInput(e.target.value);
                        setPriceTotal(next);
                        if (!priceNet && !priceVat && next) {
                          const total = toNullableNumber(next);
                          if (total) {
                            const net = Math.round(total / 1.25);
                            const vat = total - net;
                            setPriceNet(String(net));
                            setPriceVat(String(vat));
                          }
                        }
                      }}
                      className="block h-10 w-full rounded-lg border border-border bg-white px-3 text-sm"
                      inputMode="numeric"
                      placeholder="3000"
                    />
                  </label>
                  <label className="space-y-1.5">
                    <span className="text-xs text-muted-foreground">Netto</span>
                    <input
                      value={priceNet}
                      onChange={(e) => setPriceNet(normalizePriceInput(e.target.value))}
                      className="block h-10 w-full rounded-lg border border-border bg-white px-3 text-sm"
                      inputMode="numeric"
                      placeholder="2400"
                    />
                  </label>
                  <label className="space-y-1.5">
                    <span className="text-xs text-muted-foreground">Moms</span>
                    <input
                      value={priceVat}
                      onChange={(e) => setPriceVat(normalizePriceInput(e.target.value))}
                      className="block h-10 w-full rounded-lg border border-border bg-white px-3 text-sm"
                      inputMode="numeric"
                      placeholder="600"
                    />
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {priceSummary.total ? `${priceSummary.total} kr. inkl. moms` : "Udfyld total for auto-beregning"}
                  </span>
                  <Button onClick={handleSavePricing} disabled={saving} size="sm">
                    Gem
                  </Button>
                </div>
              </Section>
            </div>
          ) : null}

          {/* Noter */}
          <Section title="Noter">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1.5">
                <span className="text-xs font-medium text-muted-foreground">By</span>
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="block h-10 w-full rounded-lg border border-border bg-white px-3 text-sm"
                  placeholder="F.eks. København"
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-medium text-muted-foreground">Opgavebeskrivelse (til faktura)</span>
                <textarea
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  className="block min-h-[80px] w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                  placeholder="Beskrivelse af opgaven..."
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-medium text-muted-foreground">Kundenote</span>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="block min-h-[80px] w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                  placeholder="Note til kunden..."
                />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-medium text-muted-foreground">Intern note</span>
                <textarea
                  value={internalNote}
                  onChange={(e) => setInternalNote(e.target.value)}
                  className="block min-h-[80px] w-full rounded-lg border border-border bg-white px-3 py-2 text-sm"
                  placeholder="Intern note (kun synlig for dig)..."
                />
              </label>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSaveNotes} disabled={saving} size="sm">
                Gem noter
              </Button>
            </div>
          </Section>

          {/* Tilvalg (bordplade only) */}
          {item.service_type === "bordplade" ? (
            <Section title="Tilvalg">
              <div className="grid gap-2 sm:grid-cols-2">
                {EXTRA_OPTIONS.map((option) => (
                  <label
                    key={option.key}
                    className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-border bg-white px-3 py-2.5 text-sm transition-colors hover:bg-muted/30"
                  >
                    <span className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={extrasState[option.key]}
                        onChange={() => toggleExtra(option.key)}
                        className="h-4 w-4 rounded border-border"
                      />
                      <span className="font-medium">{option.label}</span>
                    </span>
                    <span className="text-xs text-muted-foreground">{option.priceLabel}</span>
                  </label>
                ))}
              </div>
              <div className="flex items-end gap-3">
                <label className="space-y-1.5">
                  <span className="text-xs text-muted-foreground">Vandfald (antal)</span>
                  <input
                    value={extrasState.vandfaldCount ? String(extrasState.vandfaldCount) : ""}
                    onChange={(e) => updateVandfaldCount(e.target.value)}
                    className="block h-10 w-24 rounded-lg border border-border bg-white px-3 text-sm"
                    inputMode="numeric"
                    placeholder="0"
                  />
                </label>
                <span className="pb-2 text-xs text-muted-foreground">{VANDFALD_PRICE_LABEL}</span>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveExtras} disabled={saving} size="sm">
                  Gem tilvalg
                </Button>
              </div>
            </Section>
          ) : null}

          {/* Slet booking */}
          {canEdit ? (
            <div className="rounded-xl border border-red-200 bg-red-50/50 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-red-800">Slet booking</h2>
                  <p className="mt-1 text-xs text-red-600">Denne handling kan ikke fortrydes.</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 border-red-300 text-red-700 hover:bg-red-100"
                  onClick={handleDeleteBooking}
                  disabled={deleting || saving}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {deleting ? "Sletter..." : "Slet booking"}
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </main>
  );
};
