"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ESTIMATOR_STATUS_FLOW, STATUS_VALUES, type EstimatorStatus } from "@/lib/estimator";

const TOKEN_STORAGE_KEY = "bpslib_admin_token";

type InboxItem = {
  id: string;
  createdAt: string;
  status: string;
  gatingAnswer: string;
  navn: string;
  telefon: string;
  postnr: string;
  priceMin: number | null;
  priceMax: number | null;
  slotCount: number | null;
  thumbnails: string[];
};

type DetailImage = {
  path: string;
  name: string;
  isEdge: boolean;
  url: string | null;
};

type DetailItem = {
  id: string;
  createdAt: string;
  status: string;
  gatingAnswer: string;
  fields: Record<string, unknown>;
  images: DetailImage[];
  edgeImage: DetailImage | null;
  retentionDeleteAt: string | null;
  internalNote: string | null;
  priceMin: number | null;
  priceMax: number | null;
  slotCount: number | null;
  bookingId: string | null;
};

type AvailabilityStartSlot = {
  startSlotIndex: number;
  startTime: string;
  label: string;
};

type AvailabilityDay = {
  date: string;
  dateLabel: string;
  availableStartSlots: AvailabilityStartSlot[];
  openSlotCount: number;
  blockedSlotCount: number;
  remainingSlotCount: number;
};

type AvailabilityResponse = {
  items?: AvailabilityDay[];
  message?: string;
};

type ConvertResponse = {
  bookingId?: string;
  adminBookingPath?: string;
  message?: string;
  nextOptions?: AvailabilityStartSlot[];
};

type ListResponse = {
  items?: InboxItem[];
  message?: string;
};

type DetailResponse = {
  item?: DetailItem;
  message?: string;
};

const damageLabelMap: Record<string, string> = {
  ridser: "Ridser",
  skjolder_vand: "Skjolder/vand",
  brændemærker: "Brændemærker",
  hakkede_kanter: "Hakkede kanter",
  misfarvning_vask: "Misfarvning ved vask"
};

const gatingLabelMap: Record<string, string> = {
  ja: "Ja, massiv træ",
  nej: "Nej",
  ved_ikke: "Ved ikke"
};

const formatDateTime = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "Ukendt tidspunkt";
  }
  return new Intl.DateTimeFormat("da-DK", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(date);
};

const asText = (value: unknown) => (typeof value === "string" && value.trim() ? value : "Ikke angivet");

const asListText = (value: unknown) => {
  if (!Array.isArray(value)) {
    return "Ikke angivet";
  }
  const labels = value
    .map((entry) => (typeof entry === "string" ? damageLabelMap[entry] || entry : null))
    .filter((entry): entry is string => Boolean(entry));
  return labels.length > 0 ? labels.join(", ") : "Ikke angivet";
};

const toNullableInt = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  if (!/^\d+$/.test(trimmed)) {
    return Number.NaN;
  }
  return Number.parseInt(trimmed, 10);
};

const statusOptions = ["alle", ...ESTIMATOR_STATUS_FLOW] as const;

const toDateKey = (date: Date) => {
  const year = date.getUTCFullYear();
  const month = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  const day = `${date.getUTCDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const EstimatorInboxAdmin = () => {
  const [adminToken, setAdminToken] = useState("");
  const [statusFilter, setStatusFilter] = useState<(typeof statusOptions)[number]>(STATUS_VALUES.new);
  const [searchQuery, setSearchQuery] = useState("");

  const [items, setItems] = useState<InboxItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<DetailItem | null>(null);

  const [listLoading, setListLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [listError, setListError] = useState("");
  const [detailError, setDetailError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  const [editStatus, setEditStatus] = useState<EstimatorStatus>(STATUS_VALUES.new);
  const [internalNote, setInternalNote] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [slotCount, setSlotCount] = useState("");

  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityDays, setAvailabilityDays] = useState<AvailabilityDay[]>([]);
  const [selectedConvertDate, setSelectedConvertDate] = useState("");
  const [selectedStartSlotIndex, setSelectedStartSlotIndex] = useState<number | null>(null);
  const [convertError, setConvertError] = useState("");
  const [convertInfo, setConvertInfo] = useState("");
  const [converting, setConverting] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(TOKEN_STORAGE_KEY);
    if (stored) {
      setAdminToken(stored);
    }
  }, []);

  const hasToken = useMemo(() => adminToken.trim().length > 0, [adminToken]);

  const selectedConvertDay = useMemo(
    () => availabilityDays.find((day) => day.date === selectedConvertDate) || null,
    [availabilityDays, selectedConvertDate]
  );

  const activeSlotCount = useMemo(() => {
    const parsed = toNullableInt(slotCount);
    if (typeof parsed === "number" && [1, 2, 3].includes(parsed)) {
      return parsed as 1 | 2 | 3;
    }
    if (detail?.slotCount && [1, 2, 3].includes(detail.slotCount)) {
      return detail.slotCount as 1 | 2 | 3;
    }
    return 1;
  }, [detail?.slotCount, slotCount]);

  const resetEditor = (item: DetailItem) => {
    setEditStatus(
      ESTIMATOR_STATUS_FLOW.includes(item.status as EstimatorStatus)
        ? (item.status as EstimatorStatus)
        : STATUS_VALUES.new
    );
    setInternalNote(item.internalNote || "");
    setPriceMin(item.priceMin !== null ? String(item.priceMin) : "");
    setPriceMax(item.priceMax !== null ? String(item.priceMax) : "");
    setSlotCount(item.slotCount !== null ? String(item.slotCount) : "");
  };

  const loadDetail = async (id: string, tokenOverride?: string) => {
    const tokenToUse = (tokenOverride || adminToken).trim();
    if (!tokenToUse) {
      setDetailError("Indtast admin-token for at se detaljer.");
      return;
    }

    setDetailLoading(true);
    setDetailError("");

    try {
      const response = await fetch(`/api/admin/estimator/${id}`, {
        headers: {
          "x-admin-token": tokenToUse
        },
        cache: "no-store"
      });

      const payload = (await response.json()) as DetailResponse;
      if (!response.ok || !payload.item) {
        setDetail(null);
        setDetailError(payload.message || "Kunne ikke hente detaljevisning.");
        return;
      }

      setDetail(payload.item);
      resetEditor(payload.item);
    } catch (error) {
      console.error(error);
      setDetail(null);
      setDetailError("Netværksfejl ved hentning af detalje.");
    } finally {
      setDetailLoading(false);
    }
  };

  const loadList = async (tokenOverride?: string) => {
    const tokenToUse = (tokenOverride || adminToken).trim();
    if (!tokenToUse) {
      setListError("Indtast admin-token først.");
      return;
    }

    setListLoading(true);
    setListError("");
    setSaveMessage("");

    try {
      const params = new URLSearchParams();
      params.set("status", statusFilter);
      if (searchQuery.trim()) {
        params.set("q", searchQuery.trim());
      }

      const response = await fetch(`/api/admin/estimator-inbox?${params.toString()}`, {
        headers: {
          "x-admin-token": tokenToUse
        },
        cache: "no-store"
      });

      const payload = (await response.json()) as ListResponse;
      if (!response.ok) {
        setItems([]);
        setSelectedId(null);
        setDetail(null);
        setListError(payload.message || "Kunne ikke hente indbakken.");
        return;
      }

      const nextItems = payload.items || [];
      setItems(nextItems);

      const selectedStillExists =
        selectedId !== null && nextItems.some((item) => item.id === selectedId);

      if (selectedStillExists && selectedId) {
        await loadDetail(selectedId, tokenToUse);
        return;
      }

      if (nextItems.length > 0) {
        const nextId = nextItems[0].id;
        setSelectedId(nextId);
        await loadDetail(nextId, tokenToUse);
      } else {
        setSelectedId(null);
        setDetail(null);
      }
    } catch (error) {
      console.error(error);
      setItems([]);
      setSelectedId(null);
      setDetail(null);
      setListError("Netværksfejl ved hentning af indbakken.");
    } finally {
      setListLoading(false);
    }
  };

  const loadAvailability = async (slotCountToUse: 1 | 2 | 3) => {
    const tokenToUse = adminToken.trim();
    if (!tokenToUse) {
      setConvertError("Indtast admin-token først.");
      return;
    }

    setAvailabilityLoading(true);
    setConvertError("");
    setConvertInfo("");

    try {
      const params = new URLSearchParams({
        from: toDateKey(new Date()),
        days: "30",
        slot_count: String(slotCountToUse)
      });

      const response = await fetch(`/api/admin/availability?${params.toString()}`, {
        headers: {
          "x-admin-token": tokenToUse
        },
        cache: "no-store"
      });

      const payload = (await response.json()) as AvailabilityResponse;
      if (!response.ok) {
        setAvailabilityDays([]);
        setSelectedConvertDate("");
        setSelectedStartSlotIndex(null);
        setConvertError(payload.message || "Kunne ikke hente ledige tider.");
        return;
      }

      const days = payload.items || [];
      setAvailabilityDays(days);

      const preferredDay = days.find((day) => day.date === selectedConvertDate);
      const nextDay = preferredDay || days.find((day) => day.availableStartSlots.length > 0) || days[0];

      if (!nextDay) {
        setSelectedConvertDate("");
        setSelectedStartSlotIndex(null);
        setConvertInfo("Ingen ledige tider i perioden.");
        return;
      }

      setSelectedConvertDate(nextDay.date);
      setSelectedStartSlotIndex(
        nextDay.availableStartSlots.length > 0 ? nextDay.availableStartSlots[0].startSlotIndex : null
      );
    } catch (error) {
      console.error(error);
      setAvailabilityDays([]);
      setSelectedConvertDate("");
      setSelectedStartSlotIndex(null);
      setConvertError("Netværksfejl ved hentning af ledige tider.");
    } finally {
      setAvailabilityLoading(false);
    }
  };

  const onSaveTokenAndLoad = async () => {
    const trimmed = adminToken.trim();
    if (!trimmed) {
      setListError("Admin-token mangler.");
      return;
    }
    window.localStorage.setItem(TOKEN_STORAGE_KEY, trimmed);
    await loadList(trimmed);
  };

  const onSelectItem = async (id: string) => {
    setSelectedId(id);
    setSaveMessage("");
    await loadDetail(id);
  };

  const onSaveDetail = async () => {
    if (!selectedId || !hasToken) {
      setDetailError("Vælg en sag og indtast token.");
      return;
    }

    const minValue = toNullableInt(priceMin);
    const maxValue = toNullableInt(priceMax);
    const slotValue = toNullableInt(slotCount);

    if (Number.isNaN(minValue)) {
      setDetailError("Prisinterval fra skal være et helt tal.");
      return;
    }
    if (Number.isNaN(maxValue)) {
      setDetailError("Prisinterval til skal være et helt tal.");
      return;
    }
    if (Number.isNaN(slotValue)) {
      setDetailError("Slot-count skal være et helt tal.");
      return;
    }
    if (minValue !== null && maxValue !== null && minValue > maxValue) {
      setDetailError("Prisinterval fra må ikke være større end prisinterval til.");
      return;
    }
    if (slotValue !== null && ![1, 2, 3].includes(slotValue)) {
      setDetailError("Slot-count skal være 1, 2 eller 3.");
      return;
    }

    setSaving(true);
    setDetailError("");
    setSaveMessage("");

    try {
      const response = await fetch(`/api/admin/estimator/${selectedId}`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-admin-token": adminToken.trim()
        },
        body: JSON.stringify({
          status: editStatus,
          internalNote: internalNote,
          priceMin: minValue,
          priceMax: maxValue,
          slotCount: slotValue
        })
      });

      const payload = (await response.json()) as DetailResponse;
      if (!response.ok || !payload.item) {
        setDetailError(payload.message || "Kunne ikke gemme ændringer.");
        return;
      }

      setDetail(payload.item);
      resetEditor(payload.item);
      setSaveMessage("Opdateret.");
      await loadList();
    } catch (error) {
      console.error(error);
      setDetailError("Netværksfejl ved gem.");
    } finally {
      setSaving(false);
    }
  };

  const openConvertModal = async () => {
    if (!detail || !selectedId) {
      setDetailError("Vælg først en estimator-sag.");
      return;
    }
    setIsConvertModalOpen(true);
    setConvertError("");
    setConvertInfo("");
    await loadAvailability(activeSlotCount);
  };

  const closeConvertModal = () => {
    setIsConvertModalOpen(false);
    setConvertError("");
    setConvertInfo("");
    setAvailabilityDays([]);
    setSelectedConvertDate("");
    setSelectedStartSlotIndex(null);
  };

  const onSelectConvertDate = (date: string) => {
    setSelectedConvertDate(date);
    const day = availabilityDays.find((entry) => entry.date === date);
    if (!day || day.availableStartSlots.length === 0) {
      setSelectedStartSlotIndex(null);
      return;
    }
    setSelectedStartSlotIndex(day.availableStartSlots[0].startSlotIndex);
  };

  const onConvertToBooking = async () => {
    if (!selectedId || !selectedConvertDate || selectedStartSlotIndex === null) {
      setConvertError("Vælg dato og starttid før konvertering.");
      return;
    }

    setConverting(true);
    setConvertError("");
    setConvertInfo("");

    try {
      const response = await fetch("/api/admin/convert-estimator-to-booking", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-admin-token": adminToken.trim()
        },
        body: JSON.stringify({
          estimator_id: selectedId,
          date: selectedConvertDate,
          start_slot_index: selectedStartSlotIndex,
          slot_count: activeSlotCount
        })
      });

      const payload = (await response.json()) as ConvertResponse;

      if (!response.ok || !payload.bookingId) {
        if (payload.nextOptions && payload.nextOptions.length > 0) {
          setSelectedStartSlotIndex(payload.nextOptions[0].startSlotIndex);
        }
        setConvertError(payload.message || "Kunne ikke konvertere til booking.");
        return;
      }

      setSaveMessage(`Booking oprettet: ${payload.bookingId}`);
      closeConvertModal();
      await loadList();
      await loadDetail(selectedId);
    } catch (error) {
      console.error(error);
      setConvertError("Netværksfejl ved konvertering.");
    } finally {
      setConverting(false);
    }
  };

  const renderStatusButton = (status: EstimatorStatus) => (
    <button
      key={status}
      type="button"
      onClick={() => setEditStatus(status)}
      className={`rounded-md border px-3 py-1.5 text-xs font-medium ${
        editStatus === status
          ? "border-primary bg-primary/10 text-primary"
          : "border-border text-muted-foreground"
      }`}
    >
      {status}
    </button>
  );

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border/70 bg-white/70 p-4 md:p-6">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
          Estimator indbakke
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Status-flow: Ny → Under review → Tilbud sendt → Booket → Lukket
        </p>

        <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <input
            type="password"
            value={adminToken}
            onChange={(event) => setAdminToken(event.target.value)}
            placeholder="Indtast ADMIN_TOKEN"
            className="h-10 rounded-md border border-border bg-white px-3 text-sm"
          />
          <Button variant="outline" onClick={onSaveTokenAndLoad}>
            Gem token lokalt
          </Button>
          <Button onClick={() => loadList()} disabled={!hasToken || listLoading}>
            {listLoading ? "Henter..." : "Opdater liste"}
          </Button>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-[220px_1fr_auto]">
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as (typeof statusOptions)[number])}
            className="h-10 rounded-md border border-border bg-white px-3 text-sm"
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status === "alle" ? "Alle statuser" : status}
              </option>
            ))}
          </select>
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Søg på telefon eller postnr"
            className="h-10 rounded-md border border-border bg-white px-3 text-sm"
          />
          <Button variant="secondary" onClick={() => loadList()} disabled={!hasToken || listLoading}>
            Filtrer
          </Button>
        </div>

        {listError ? <p className="mt-3 text-sm font-medium text-red-700">{listError}</p> : null}
      </section>

      <section className="grid gap-5 lg:grid-cols-[360px_1fr]">
        <aside className="rounded-2xl border border-border/70 bg-white/70 p-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Sager</h2>
          <div className="mt-3 grid gap-3">
            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground">Ingen sager matcher filteret.</p>
            ) : null}
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectItem(item.id)}
                className={`rounded-xl border px-3 py-3 text-left ${
                  selectedId === item.id ? "border-primary bg-primary/5" : "border-border bg-white/70"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground">{item.navn}</p>
                  <span className="rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                    {item.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(item.createdAt)}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Tlf: {item.telefon} · Postnr: {item.postnr}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Massiv træ: {gatingLabelMap[item.gatingAnswer] || item.gatingAnswer}
                </p>
              </button>
            ))}
          </div>
        </aside>

        <article className="rounded-2xl border border-border/70 bg-white/70 p-4 md:p-6">
          {detailLoading ? <p className="text-sm text-muted-foreground">Henter detalje...</p> : null}
          {detailError ? <p className="text-sm font-medium text-red-700">{detailError}</p> : null}
          {saveMessage ? <p className="text-sm font-medium text-green-700">{saveMessage}</p> : null}

          {!detail && !detailLoading ? (
            <p className="text-sm text-muted-foreground">Vælg en sag i listen for at se detaljer.</p>
          ) : null}

          {detail ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="font-display text-2xl font-semibold text-foreground">Sag #{detail.id.slice(0, 8)}</h2>
                <p className="text-sm text-muted-foreground">
                  Oprettet: {formatDateTime(detail.createdAt)} · Status: {detail.status}
                </p>
                {detail.bookingId ? (
                  <p className="text-sm text-muted-foreground">
                    Booking-ID:
                    <Link
                      href={`/admin/bookinger/${detail.bookingId}`}
                      className="ml-1 font-semibold text-primary"
                    >
                      {detail.bookingId}
                    </Link>
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">Booking-ID: Ikke oprettet endnu</p>
                )}
              </div>

              <div className="grid gap-3 rounded-xl border border-border bg-background/60 p-4 text-sm sm:grid-cols-2">
                <p>
                  <span className="font-semibold text-foreground">Navn:</span>{" "}
                  {asText(detail.fields.navn)}
                </p>
                <p>
                  <span className="font-semibold text-foreground">Telefon:</span>{" "}
                  {asText(detail.fields.telefon)}
                </p>
                <p>
                  <span className="font-semibold text-foreground">Email:</span>{" "}
                  {asText(detail.fields.email)}
                </p>
                <p>
                  <span className="font-semibold text-foreground">Postnr:</span>{" "}
                  {asText(detail.fields.postnr)}
                </p>
                <p>
                  <span className="font-semibold text-foreground">Bordplade-type:</span>{" "}
                  {asText(detail.fields.bordpladeType)}
                </p>
                <p>
                  <span className="font-semibold text-foreground">Træsort:</span>{" "}
                  {asText(detail.fields.traesort)}
                </p>
                <p>
                  <span className="font-semibold text-foreground">Overflade:</span>{" "}
                  {asText(detail.fields.overflade)}
                </p>
                <p>
                  <span className="font-semibold text-foreground">Antal:</span>{" "}
                  {asText(detail.fields.antal)}
                </p>
                <p>
                  <span className="font-semibold text-foreground">Længde (cm):</span>{" "}
                  {asText(detail.fields.laengdeCm)}
                </p>
                <p>
                  <span className="font-semibold text-foreground">Dybde (cm):</span>{" "}
                  {asText(detail.fields.dybdeCm)}
                </p>
                <p className="sm:col-span-2">
                  <span className="font-semibold text-foreground">Skader:</span>{" "}
                  {asListText(detail.fields.skader)}
                </p>
                <p className="sm:col-span-2">
                  <span className="font-semibold text-foreground">Kundens note:</span>{" "}
                  {asText(detail.fields.note)}
                </p>
                <p>
                  <span className="font-semibold text-foreground">Massiv træ svar:</span>{" "}
                  {gatingLabelMap[detail.gatingAnswer] || detail.gatingAnswer}
                </p>
                <p>
                  <span className="font-semibold text-foreground">Retention sletning:</span>{" "}
                  {detail.retentionDeleteAt ? formatDateTime(detail.retentionDeleteAt) : "Ikke sat"}
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground">Billeder</h3>
                <p className="text-sm text-muted-foreground">
                  Kant/ende-billede: {detail.edgeImage ? detail.edgeImage.name : "ikke angivet"}
                </p>
                {detail.images.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Ingen billeder fundet.</p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {detail.images.map((image) => (
                      <a
                        key={image.path}
                        href={image.url || "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-xl border border-border bg-white p-2"
                      >
                        <div className="aspect-square overflow-hidden rounded-md bg-muted">
                          {image.url ? (
                            <img src={image.url} alt={image.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                              Ingen preview
                            </div>
                          )}
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">{image.name}</p>
                        {image.isEdge ? (
                          <p className="mt-1 text-xs font-semibold text-primary">Kant/ende</p>
                        ) : null}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-4 rounded-xl border border-border bg-background/60 p-4">
                <h3 className="text-lg font-semibold text-foreground">Intern behandling</h3>

                <div className="flex flex-wrap gap-2">{ESTIMATOR_STATUS_FLOW.map(renderStatusButton)}</div>

                <label className="grid gap-2 text-sm text-foreground">
                  Intern note
                  <textarea
                    value={internalNote}
                    onChange={(event) => setInternalNote(event.target.value)}
                    rows={4}
                    className="rounded-md border border-border bg-white px-3 py-2"
                    placeholder="Skriv intern vurdering, aftaler eller næste skridt..."
                  />
                </label>

                <div className="grid gap-3 md:grid-cols-3">
                  <label className="grid gap-2 text-sm text-foreground">
                    Prisinterval fra (kr)
                    <input
                      value={priceMin}
                      onChange={(event) => setPriceMin(event.target.value)}
                      className="h-10 rounded-md border border-border bg-white px-3"
                      inputMode="numeric"
                    />
                  </label>
                  <label className="grid gap-2 text-sm text-foreground">
                    Prisinterval til (kr)
                    <input
                      value={priceMax}
                      onChange={(event) => setPriceMax(event.target.value)}
                      className="h-10 rounded-md border border-border bg-white px-3"
                      inputMode="numeric"
                    />
                  </label>
                  <label className="grid gap-2 text-sm text-foreground">
                    Slot-anbefaling
                    <select
                      value={slotCount}
                      onChange={(event) => setSlotCount(event.target.value)}
                      className="h-10 rounded-md border border-border bg-white px-3"
                    >
                      <option value="">Ikke sat</option>
                      <option value="1">1 slot</option>
                      <option value="2">2 slots</option>
                      <option value="3">3 slots</option>
                    </select>
                  </label>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button onClick={onSaveDetail} disabled={saving || !hasToken}>
                    {saving ? "Gemmer..." : "Gem ændringer"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={openConvertModal}
                    disabled={!hasToken || !selectedId || Boolean(detail.bookingId)}
                  >
                    Konvertér til booking
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </article>
      </section>

      {isConvertModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/35 px-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-2xl border border-border bg-background p-5 md:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-display text-2xl font-semibold text-foreground">Konvertér til booking</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Estimator: {selectedId?.slice(0, 8)} · Slot-count: {activeSlotCount}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={closeConvertModal}>
                Luk
              </Button>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="text-sm text-muted-foreground">Ledige start-slots vises med sammenhængende blokke.</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadAvailability(activeSlotCount)}
                disabled={availabilityLoading}
              >
                {availabilityLoading ? "Opdaterer..." : "Opdater ledige tider"}
              </Button>
            </div>

            {convertError ? <p className="mt-3 text-sm font-medium text-red-700">{convertError}</p> : null}
            {convertInfo ? <p className="mt-3 text-sm text-muted-foreground">{convertInfo}</p> : null}

            <div className="mt-5 grid gap-5 md:grid-cols-[1fr_1fr]">
              <div>
                <p className="text-sm font-semibold text-foreground">1) Vælg dato</p>
                <div className="mt-2 grid max-h-80 gap-2 overflow-auto pr-1">
                  {availabilityDays.map((day) => (
                    <button
                      key={day.date}
                      type="button"
                      onClick={() => onSelectConvertDate(day.date)}
                      className={`rounded-md border px-3 py-2 text-left text-sm ${
                        selectedConvertDate === day.date
                          ? "border-primary bg-primary/10"
                          : "border-border bg-white"
                      }`}
                    >
                      <p className="font-medium text-foreground">{day.dateLabel}</p>
                      <p className="text-xs text-muted-foreground">
                        {day.availableStartSlots.length} gyldige starttider
                      </p>
                    </button>
                  ))}
                  {availabilityDays.length === 0 && !availabilityLoading ? (
                    <p className="text-sm text-muted-foreground">Ingen datoer fundet.</p>
                  ) : null}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-foreground">2) Vælg starttid</p>
                <div className="mt-2 grid gap-2">
                  {selectedConvertDay?.availableStartSlots.map((slot) => (
                    <button
                      key={`${selectedConvertDay.date}-${slot.startSlotIndex}`}
                      type="button"
                      onClick={() => setSelectedStartSlotIndex(slot.startSlotIndex)}
                      className={`rounded-md border px-3 py-2 text-left text-sm ${
                        selectedStartSlotIndex === slot.startSlotIndex
                          ? "border-primary bg-primary/10"
                          : "border-border bg-white"
                      }`}
                    >
                      <p className="font-medium text-foreground">{slot.startTime}</p>
                      <p className="text-xs text-muted-foreground">{slot.label}</p>
                    </button>
                  ))}
                  {selectedConvertDay && selectedConvertDay.availableStartSlots.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Ingen gyldige starttider på den valgte dato.
                    </p>
                  ) : null}
                  {!selectedConvertDay ? (
                    <p className="text-sm text-muted-foreground">Vælg først en dato.</p>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={onConvertToBooking} disabled={converting || selectedStartSlotIndex === null}>
                {converting ? "Konverterer..." : "Bekræft konvertering"}
              </Button>
              <Button variant="outline" onClick={closeConvertModal}>
                Annullér
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
