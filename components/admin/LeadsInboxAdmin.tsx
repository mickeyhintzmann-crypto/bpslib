"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  RefreshCw,
  Filter,
  Search,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Phone,
  MapPin,
  Clock,
} from "lucide-react";

const STATUS_FLOW = ["new", "contacted", "quote_sent", "won", "lost", "closed"] as const;
const SERVICE_VALUES = ["gulv", "toemrer", "maler", "murer", "andet"] as const;
const SOURCE_VALUES = ["tilbudstid", "kontakt"] as const;

const STATUS_LABELS: Record<string, string> = {
  new: "Ny",
  contacted: "Kontaktet",
  quote_sent: "Tilbud sendt",
  won: "Vundet",
  lost: "Tabt",
  closed: "Lukket",
};

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  new: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  contacted: { bg: "bg-sky-50", text: "text-sky-700", dot: "bg-sky-500" },
  quote_sent: { bg: "bg-violet-50", text: "text-violet-700", dot: "bg-violet-500" },
  won: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
  lost: { bg: "bg-red-50", text: "text-red-600", dot: "bg-red-400" },
  closed: { bg: "bg-neutral-100", text: "text-neutral-600", dot: "bg-neutral-400" },
};

const StatusBadge = ({ status }: { status: string }) => {
  const config = statusConfig[status] || { bg: "bg-neutral-50", text: "text-neutral-600", dot: "bg-neutral-400" };
  const label = STATUS_LABELS[status] || status;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${config.bg} ${config.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {label}
    </span>
  );
};

type ListItem = {
  id: string;
  createdAt: string;
  source: string;
  service: string;
  name: string;
  phone: string;
  postalCode: string | null;
  status: string;
};

type ListResponse = {
  items?: ListItem[];
  message?: string;
  page?: number;
  pageSize?: number;
  total?: number | null;
};

const formatDateTime = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Ukendt";
  return new Intl.DateTimeFormat("da-DK", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
};

const formatRelativeTime = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "lige nu";
  if (diffMins < 60) return `${diffMins} min siden`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}t siden`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d siden`;
};

export const LeadsInboxAdmin = () => {
  const [statusFilter, setStatusFilter] = useState<string>("alle");
  const [serviceFilter, setServiceFilter] = useState<string>("alle");
  const [sourceFilter, setSourceFilter] = useState<string>("alle");
  const [searchTerm, setSearchTerm] = useState("");
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
      params.set("service", serviceFilter);
      params.set("source", sourceFilter);
      params.set("page", String(page));
      params.set("limit", "50");

      const response = await fetch(`/api/admin/leads?${params.toString()}`, { cache: "no-store" });
      const payload = (await response.json()) as ListResponse;
      if (!response.ok || !payload.items) {
        setItems([]);
        setTotal(null);
        setError(payload.message || "Kunne ikke hente leads.");
        return;
      }

      setItems(payload.items);
      setTotal(payload.total ?? null);
    } catch (fetchError) {
      console.error(fetchError);
      setItems([]);
      setTotal(null);
      setError("Netværksfejl ved hentning af leads.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, serviceFilter, sourceFilter, page]);

  const hasNextPage = items.length === 50 && (total === null || page * 50 < total);
  const hasActiveFilters = statusFilter !== "alle" || serviceFilter !== "alle" || sourceFilter !== "alle" || searchTerm;

  const searchLower = searchTerm.trim().toLowerCase();
  const visibleItems = searchLower
    ? items.filter((item) =>
        [item.name, item.phone, item.postalCode, item.service, item.source, item.status]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(searchLower)
      )
    : items;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-blue-50 p-2.5">
            <MessageSquare className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Kundehenvendelser</h1>
            <p className="text-sm text-muted-foreground">
              {total !== null ? `${total} leads totalt` : "Tilbudstid og kontaktforespørgsler samlet ét sted."}
            </p>
          </div>
        </div>
        <Button onClick={() => loadList()} disabled={loading} variant="outline" className="gap-2">
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Opdater
        </Button>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-border/40 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <Filter className="h-3.5 w-3.5" />
          Filtre
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="h-10 rounded-xl border border-border/60 bg-muted/20 px-3 text-sm transition focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option value="alle">Alle statuser</option>
            {STATUS_FLOW.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s] || s}</option>
            ))}
          </select>
          <select
            value={serviceFilter}
            onChange={(e) => { setServiceFilter(e.target.value); setPage(1); }}
            className="h-10 rounded-xl border border-border/60 bg-muted/20 px-3 text-sm transition focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option value="alle">Alle ydelser</option>
            {SERVICE_VALUES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            value={sourceFilter}
            onChange={(e) => { setSourceFilter(e.target.value); setPage(1); }}
            className="h-10 rounded-xl border border-border/60 bg-muted/20 px-3 text-sm transition focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option value="alle">Alle kilder</option>
            {SOURCE_VALUES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="relative min-w-[240px] flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Søg navn, telefon, postnr..."
              className="h-10 w-full rounded-xl border border-border/60 bg-muted/20 pl-9 pr-3 text-sm transition focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </div>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                setStatusFilter("alle");
                setServiceFilter("alle");
                setSourceFilter("alle");
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

      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-semibold">{error}</p>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-border/40 bg-white shadow-sm">
        {/* Desktop header */}
        <div className="hidden grid-cols-[1.1fr_1fr_1fr_1.2fr_1.1fr_0.8fr_1fr] gap-2 border-b border-border/40 bg-muted/30 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground md:grid">
          <span>Oprettet</span>
          <span>Kilde</span>
          <span>Service</span>
          <span>Navn</span>
          <span>Telefon</span>
          <span>Postnr.</span>
          <span>Status</span>
        </div>
        <div className="divide-y divide-border/30">
          {visibleItems.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <MessageSquare className="mb-3 h-10 w-10 text-muted-foreground/20" />
              <p className="text-sm font-medium text-muted-foreground">
                {loading ? "Henter leads..." : "Ingen leads matcher dine filtre."}
              </p>
            </div>
          ) : (
            visibleItems.map((item) => (
              <Link
                key={item.id}
                href={`/admin/leads/${item.id}`}
                className="block transition hover:bg-blue-50/30"
              >
                {/* Desktop row */}
                <div className="hidden grid-cols-[1.1fr_1fr_1fr_1.2fr_1.1fr_0.8fr_1fr] items-center gap-2 px-5 py-3.5 text-sm md:grid">
                  <span className="text-muted-foreground">{formatDateTime(item.createdAt)}</span>
                  <span className="text-muted-foreground">{item.source}</span>
                  <span>
                    <span className="rounded-md bg-muted/50 px-2 py-0.5 text-xs font-medium text-muted-foreground">
                      {item.service}
                    </span>
                  </span>
                  <span className="font-medium text-foreground">{item.name}</span>
                  <span className="text-muted-foreground">{item.phone}</span>
                  <span className="text-muted-foreground">{item.postalCode || "-"}</span>
                  <StatusBadge status={item.status} />
                </div>

                {/* Mobile card */}
                <div className="space-y-2 px-4 py-4 md:hidden">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-foreground">{item.name}</p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatRelativeTime(item.createdAt)}
                      </div>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="rounded-md bg-muted/50 px-2 py-0.5 font-medium">{item.service}</span>
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" /> {item.phone}
                    </span>
                    {item.postalCode && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {item.postalCode}
                      </span>
                    )}
                    <span className="text-muted-foreground/70">{item.source}</span>
                  </div>
                </div>
              </Link>
            ))
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
