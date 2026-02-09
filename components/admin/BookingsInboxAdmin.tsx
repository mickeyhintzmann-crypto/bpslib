"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

const STATUS_FLOW = [
  "pending_confirmation",
  "new",
  "confirmed",
  "in_progress",
  "done",
  "cancelled"
] as const;
const SOURCE_VALUES = ["normal", "acute", "manual", "estimator"] as const;
const SERVICE_VALUES = ["bordplade", "gulv", "toemrer", "maler", "murer", "andet"] as const;
const SLOT_TIMES = ["08:00", "11:00", "13:30"] as const;
const SLOT_END_TIMES = ["11:00", "13:30", "16:00"] as const;

type ListItem = {
  id: string;
  createdAt: string;
  status: string | null;
  service: string | null;
  source: string | null;
  name: string | null;
  phone: string | null;
  postalCode: string | null;
  slotStart: string | null;
  slotEnd: string | null;
  slotCount: number | null;
};

type ListResponse = {
  items?: ListItem[];
  message?: string;
  page?: number;
  pageSize?: number;
  total?: number | null;
};

const formatDate = (iso: string | null) => {
  if (!iso) {
    return "-";
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return new Intl.DateTimeFormat("da-DK", { dateStyle: "short" }).format(date);
};

const formatTime = (iso: string | null) => {
  if (!iso) {
    return "-";
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return new Intl.DateTimeFormat("da-DK", { timeStyle: "short" }).format(date);
};

const slotCountFromRange = (slotStart: string | null, slotEnd: string | null) => {
  if (!slotStart || !slotEnd) {
    return null;
  }
  const startTime = slotStart.slice(11, 16);
  const endTime = slotEnd.slice(11, 16);
  const startIndex = SLOT_TIMES.indexOf(startTime as (typeof SLOT_TIMES)[number]);
  const endIndex = SLOT_END_TIMES.indexOf(endTime as (typeof SLOT_END_TIMES)[number]);
  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
    return null;
  }
  return endIndex - startIndex + 1;
};

export const BookingsInboxAdmin = () => {
  const [statusFilter, setStatusFilter] = useState("alle");
  const [sourceFilter, setSourceFilter] = useState("alle");
  const [serviceFilter, setServiceFilter] = useState("alle");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);

  const [items, setItems] = useState<ListItem[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadList = async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      params.set("status", statusFilter);
      params.set("source", sourceFilter);
      params.set("service", serviceFilter);
      if (dateFrom) {
        params.set("from", dateFrom);
      }
      if (dateTo) {
        params.set("to", dateTo);
      }
      params.set("page", String(page));
      params.set("limit", "50");

      const response = await fetch(`/api/admin/bookings?${params.toString()}`, { cache: "no-store" });

      const payload = (await response.json()) as ListResponse;
      if (!response.ok || !payload.items) {
        setItems([]);
        setTotal(null);
        setError(payload.message || "Kunne ikke hente bookinger.");
        return;
      }

      setItems(payload.items);
      setTotal(payload.total ?? null);
    } catch (fetchError) {
      console.error(fetchError);
      setItems([]);
      setTotal(null);
      setError("Netværksfejl ved hentning af bookinger.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, sourceFilter, serviceFilter, dateFrom, dateTo, page]);

  const hasNextPage = items.length === 50 && (total === null || page * 50 < total);

  return (
    <section className="space-y-6 rounded-2xl border border-border/70 bg-white/70 p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">Bookinger</h1>
          <p className="text-sm text-muted-foreground">Overblik over alle bookinger.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/bookings/new">Ny booking</Link>
          </Button>
          <Button onClick={() => loadList()} disabled={loading}>
            {loading ? "Henter..." : "Opdater"}
          </Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_1fr]">
        <select
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value);
            setPage(1);
          }}
          className="h-10 rounded-md border border-border bg-white px-3 text-sm"
        >
          <option value="alle">Alle statuser</option>
          {STATUS_FLOW.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <select
          value={sourceFilter}
          onChange={(event) => {
            setSourceFilter(event.target.value);
            setPage(1);
          }}
          className="h-10 rounded-md border border-border bg-white px-3 text-sm"
        >
          <option value="alle">Alle kilder</option>
          {SOURCE_VALUES.map((source) => (
            <option key={source} value={source}>
              {source}
            </option>
          ))}
        </select>
        <select
          value={serviceFilter}
          onChange={(event) => {
            setServiceFilter(event.target.value);
            setPage(1);
          }}
          className="h-10 rounded-md border border-border bg-white px-3 text-sm"
        >
          <option value="alle">Alle services</option>
          {SERVICE_VALUES.map((service) => (
            <option key={service} value={service}>
              {service}
            </option>
          ))}
        </select>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="date"
            value={dateFrom}
            onChange={(event) => {
              setDateFrom(event.target.value);
              setPage(1);
            }}
            className="h-10 rounded-md border border-border bg-white px-3 text-sm"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(event) => {
              setDateTo(event.target.value);
              setPage(1);
            }}
            className="h-10 rounded-md border border-border bg-white px-3 text-sm"
          />
        </div>
      </div>

      {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}

      <div className="overflow-hidden rounded-2xl border border-border">
        <div className="grid grid-cols-[1fr_0.9fr_0.7fr_1fr_1fr_1.1fr_1.1fr_0.9fr_1.2fr] gap-2 bg-muted/60 px-4 py-3 text-xs font-semibold uppercase text-muted-foreground">
          <span>Dato</span>
          <span>Start</span>
          <span>Slots</span>
          <span>Service</span>
          <span>Kilde</span>
          <span>Navn</span>
          <span>Telefon</span>
          <span>Postnr.</span>
          <span>Status / Oprettet</span>
        </div>
        <div className="divide-y divide-border/70 bg-white/70">
          {items.length === 0 ? (
            <div className="px-4 py-6 text-sm text-muted-foreground">
              {loading ? "Henter bookinger..." : "Ingen bookinger matcher dine filtre."}
            </div>
          ) : (
            items.map((item) => (
              <Link
                key={item.id}
                href={`/admin/bookings/${item.id}`}
                className="grid grid-cols-[1fr_0.9fr_0.7fr_1fr_1fr_1.1fr_1.1fr_0.9fr_1.2fr] gap-2 px-4 py-3 text-sm text-foreground hover:bg-muted/40"
              >
                <span>{formatDate(item.slotStart)}</span>
                <span>{formatTime(item.slotStart)}</span>
                <span>{item.slotCount ?? slotCountFromRange(item.slotStart, item.slotEnd) ?? "-"}</span>
                <span>{item.service || "-"}</span>
                <span>{item.source || "-"}</span>
                <span>{item.name || "-"}</span>
                <span>{item.phone || "-"}</span>
                <span>{item.postalCode || "-"}</span>
                <span>
                  {item.status || "-"}
                  <span className="block text-xs text-muted-foreground">
                    {formatDate(item.createdAt)}
                  </span>
                </span>
              </Link>
            ))
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Side {page}
          {total !== null ? ` af ${Math.max(1, Math.ceil(total / 50))}` : ""}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page === 1}
          >
            Forrige
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => prev + 1)}
            disabled={!hasNextPage}
          >
            Næste
          </Button>
        </div>
      </div>
    </section>
  );
};
