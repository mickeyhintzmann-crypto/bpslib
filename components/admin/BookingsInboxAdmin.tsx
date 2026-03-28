"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useAdminSession } from "@/components/admin/AdminSessionContext";
import {
  CalendarDays,
  RefreshCw,
  Plus,
  Search,
  Filter,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Phone,
  MapPin,
} from "lucide-react";

const STATUS_FLOW = [
  "pending_confirmation",
  "new",
  "confirmed",
  "in_progress",
  "done",
  "cancelled",
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
  assignedTo?: string | null;
  name: string | null;
  phone: string | null;
  postalCode: string | null;
  slotStart: string | null;
  slotEnd: string | null;
  slotCount: number | null;
  priceTotal?: number | null;
  priceNet?: number | null;
  priceVat?: number | null;
};

type ListResponse = {
  items?: ListItem[];
  message?: string;
  page?: number;
  pageSize?: number;
  total?: number | null;
};

const formatDate = (iso: string | null) => {
  if (!iso) return "-";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("da-DK", { dateStyle: "short" }).format(date);
};

const formatTime = (iso: string | null) => {
  if (!iso) return "-";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("da-DK", { timeStyle: "short" }).format(date);
};

const slotCountFromRange = (slotStart: string | null, slotEnd: string | null) => {
  if (!slotStart || !slotEnd) return null;
  const startTime = slotStart.slice(11, 16);
  const endTime = slotEnd.slice(11, 16);
  const startIndex = SLOT_TIMES.indexOf(startTime as (typeof SLOT_TIMES)[number]);
  const endIndex = SLOT_END_TIMES.indexOf(endTime as (typeof SLOT_END_TIMES)[number]);
  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) return null;
  return endIndex - startIndex + 1;
};

const STATUS_LABELS: Record<string, string> = {
  pending_confirmation: "Afventer",
  pending: "Afventer",
  new: "Ny",
  confirmed: "Bekræftet",
  in_progress: "I gang",
  done: "Udført",
  cancelled: "Annulleret",
};

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  done: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
  confirmed: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  in_progress: { bg: "bg-violet-50", text: "text-violet-700", dot: "bg-violet-500" },
  cancelled: { bg: "bg-red-50", text: "text-red-600", dot: "bg-red-400" },
  new: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  pending_confirmation: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  pending: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
};

const StatusBadge = ({ status }: { status: string | null }) => {
  const config = statusConfig[status || ""] || { bg: "bg-neutral-50", text: "text-neutral-600", dot: "bg-neutral-400" };
  const label = STATUS_LABELS[status || ""] || status || "-";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${config.bg} ${config.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {label}
    </span>
  );
};

const formatPrice = (value?: number | null) => {
  if (typeof value !== "number") return "-";
  return new Intl.NumberFormat("da-DK", {
    style: "currency",
    currency: "DKK",
    maximumFractionDigits: 0,
  }).format(value);
};

export const BookingsInboxAdmin = () => {
  const session = useAdminSession();
  const canLoadUsers = session?.role === "owner" || session?.role === "admin";
  const [statusFilter, setStatusFilter] = useState("alle");
  const [sourceFilter, setSourceFilter] = useState("alle");
  const [serviceFilter, setServiceFilter] = useState("alle");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const [items, setItems] = useState<ListItem[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [usersMap, setUsersMap] = useState<Record<string, string>>({});
  const [usersError, setUsersError] = useState("");

  const loadList = async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      params.set("status", statusFilter);
      params.set("source", sourceFilter);
      params.set("service", serviceFilter);
      if (dateFrom) params.set("from", dateFrom);
      if (dateTo) params.set("to", dateTo);
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

  const loadUsers = async () => {
    if (!canLoadUsers) {
      setUsersMap({});
      return;
    }
    setUsersError("");
    try {
      const response = await fetch("/api/admin/users?active=1", { cache: "no-store" });
      const payload = (await response.json()) as { items?: Array<{ id: string; name: string; email: string }> };
      if (!response.ok || !payload.items) {
        setUsersMap({});
        setUsersError("Kunne ikke hente medarbejdere.");
        return;
      }
      const next: Record<string, string> = {};
      payload.items.forEach((user) => {
        next[user.id] = user.name || user.email;
      });
      setUsersMap(next);
    } catch (fetchError) {
      console.error(fetchError);
      setUsersMap({});
      setUsersError("Netværksfejl ved hentning af medarbejdere.");
    }
  };

  useEffect(() => {
    loadList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, sourceFilter, serviceFilter, dateFrom, dateTo, page]);

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canLoadUsers]);

  const hasNextPage = items.length === 50 && (total === null || page * 50 < total);
  const searchLower = searchTerm.trim().toLowerCase();
  const visibleItems = searchLower
    ? items.filter((item) => {
        const haystack = [item.name, item.phone, item.postalCode, item.service, item.source, item.status]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(searchLower);
      })
    : items;

  const hasActiveFilters =
    statusFilter !== "alle" || sourceFilter !== "alle" || serviceFilter !== "alle" || dateFrom || dateTo || searchTerm;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-orange-50 p-2.5">
            <CalendarDays className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Bookinger</h1>
            <p className="text-sm text-muted-foreground">
              {total !== null ? `${total} bookinger totalt` : "Overblik over alle bookinger"}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" className="gap-2">
            <Link href="/admin/bookings/new">
              <Plus className="h-3.5 w-3.5" />
              Ny booking
            </Link>
          </Button>
          <Button onClick={() => loadList()} disabled={loading} variant="outline" className="gap-2">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Opdater
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-border/40 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <Filter className="h-3.5 w-3.5" />
          Filtre
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="h-10 rounded-xl border border-border/60 bg-muted/20 px-3 text-sm transition focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
          >
            <option value="alle">Alle statuser</option>
            {STATUS_FLOW.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s] || s}</option>
            ))}
          </select>
          <select
            value={sourceFilter}
            onChange={(e) => { setSourceFilter(e.target.value); setPage(1); }}
            className="h-10 rounded-xl border border-border/60 bg-muted/20 px-3 text-sm transition focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
          >
            <option value="alle">Alle kilder</option>
            {SOURCE_VALUES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            value={serviceFilter}
            onChange={(e) => { setServiceFilter(e.target.value); setPage(1); }}
            className="h-10 rounded-xl border border-border/60 bg-muted/20 px-3 text-sm transition focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
          >
            <option value="alle">Alle services</option>
            {SERVICE_VALUES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
              className="h-10 rounded-xl border border-border/60 bg-muted/20 px-3 text-sm transition focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
              className="h-10 rounded-xl border border-border/60 bg-muted/20 px-3 text-sm transition focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
            />
          </div>
        </div>

        {/* Search + quick filters */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="relative min-w-[240px] flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Søg navn, telefon, postnr..."
              className="h-10 w-full rounded-xl border border-border/60 bg-muted/20 pl-9 pr-3 text-sm transition focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                const dateKey = today.toISOString().slice(0, 10);
                setDateFrom(dateKey);
                setDateTo(dateKey);
                setPage(1);
              }}
              className="rounded-lg bg-muted/50 px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-orange-50 hover:text-orange-700"
            >
              I dag
            </button>
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                const future = new Date(today);
                future.setDate(today.getDate() + 7);
                setDateFrom(today.toISOString().slice(0, 10));
                setDateTo(future.toISOString().slice(0, 10));
                setPage(1);
              }}
              className="rounded-lg bg-muted/50 px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-orange-50 hover:text-orange-700"
            >
              Næste 7 dage
            </button>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => {
                  setDateFrom("");
                  setDateTo("");
                  setStatusFilter("alle");
                  setSourceFilter("alle");
                  setServiceFilter("alle");
                  setSearchTerm("");
                  setPage(1);
                }}
                className="flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100"
              >
                <RotateCcw className="h-3 w-3" />
                Nulstil
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Errors */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-semibold">{error}</p>
        </div>
      )}
      {usersError && <p className="text-xs text-amber-700">{usersError}</p>}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-border/40 bg-white shadow-sm">
        {/* Desktop header */}
        <div className="hidden grid-cols-[1fr_0.8fr_0.6fr_0.9fr_0.9fr_1.1fr_1fr_0.8fr_0.9fr_1fr] gap-2 border-b border-border/40 bg-muted/30 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground md:grid">
          <span>Dato</span>
          <span>Start</span>
          <span>Slots</span>
          <span>Service</span>
          <span>Kilde</span>
          <span>Navn</span>
          <span>Telefon</span>
          <span>Postnr.</span>
          <span>Pris</span>
          <span>Status</span>
        </div>
        <div className="divide-y divide-border/30">
          {visibleItems.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <CalendarDays className="mb-3 h-10 w-10 text-muted-foreground/20" />
              <p className="text-sm font-medium text-muted-foreground">
                {loading ? "Henter bookinger..." : "Ingen bookinger matcher dine filtre."}
              </p>
            </div>
          ) : (
            visibleItems.map((item) => {
              const statusText = STATUS_LABELS[item.status || ""] || item.status || "-";
              const assignedName = item.assignedTo ? usersMap[item.assignedTo] : null;
              return (
                <Link
                  key={item.id}
                  href={`/admin/bookings/${item.id}`}
                  className="block transition hover:bg-orange-50/30"
                >
                  {/* Desktop row */}
                  <div className="hidden grid-cols-[1fr_0.8fr_0.6fr_0.9fr_0.9fr_1.1fr_1fr_0.8fr_0.9fr_1fr] items-center gap-2 px-5 py-3.5 text-sm md:grid">
                    <span className="font-medium text-foreground">{formatDate(item.slotStart)}</span>
                    <span className="text-muted-foreground">{formatTime(item.slotStart)}</span>
                    <span className="text-muted-foreground">{item.slotCount ?? slotCountFromRange(item.slotStart, item.slotEnd) ?? "-"}</span>
                    <span className="text-muted-foreground">{item.service || "-"}</span>
                    <span className="text-muted-foreground">{item.source || "-"}</span>
                    <span className="font-medium text-foreground">{item.name || "-"}</span>
                    <span className="text-muted-foreground">{item.phone || "-"}</span>
                    <span className="text-muted-foreground">{item.postalCode || "-"}</span>
                    <span className="font-medium text-foreground">{formatPrice(item.priceTotal)}</span>
                    <StatusBadge status={item.status} />
                  </div>

                  {/* Mobile card */}
                  <div className="space-y-2 px-4 py-4 md:hidden">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-foreground">{item.name || "Ukendt"}</p>
                        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatDate(item.slotStart)} · {formatTime(item.slotStart)}
                        </div>
                      </div>
                      <StatusBadge status={item.status} />
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      {item.service && (
                        <span className="rounded-md bg-muted/50 px-2 py-0.5 font-medium">{item.service}</span>
                      )}
                      {item.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {item.phone}
                        </span>
                      )}
                      {item.postalCode && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {item.postalCode}
                        </span>
                      )}
                      {assignedName && (
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" /> {assignedName}
                        </span>
                      )}
                      {item.priceTotal ? <span className="font-medium text-foreground">{formatPrice(item.priceTotal)}</span> : null}
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between rounded-2xl border border-border/40 bg-white px-5 py-3 shadow-sm">
        <span className="text-sm text-muted-foreground">
          Side {page}
          {total !== null ? ` af ${Math.max(1, Math.ceil(total / 50))}` : ""}
          {total !== null ? ` · ${total} resultater` : ""}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="gap-1"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Forrige
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={!hasNextPage}
            className="gap-1"
          >
            Næste
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
