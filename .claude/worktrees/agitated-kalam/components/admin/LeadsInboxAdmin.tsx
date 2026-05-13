"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

const STATUS_FLOW = ["new", "contacted", "quote_sent", "won", "lost", "closed"] as const;
const SERVICE_VALUES = ["gulv", "toemrer", "maler", "murer", "andet"] as const;
const SOURCE_VALUES = ["tilbudstid", "kontakt"] as const;

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
  if (Number.isNaN(date.getTime())) {
    return "Ukendt";
  }
  return new Intl.DateTimeFormat("da-DK", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(date);
};

export const LeadsInboxAdmin = () => {
  const [statusFilter, setStatusFilter] = useState<string>("alle");
  const [serviceFilter, setServiceFilter] = useState<string>("alle");
  const [sourceFilter, setSourceFilter] = useState<string>("alle");
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

  return (
    <section className="space-y-6 rounded-2xl border border-border/70 bg-white/70 p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">Leads inbox</h1>
          <p className="text-sm text-muted-foreground">
            Tilbudstid og kontaktforespørgsler samlet ét sted.
          </p>
        </div>
        <Button onClick={() => loadList()} disabled={loading}>
          {loading ? "Henter..." : "Opdater"}
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_1fr_1fr]">
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
          value={serviceFilter}
          onChange={(event) => {
            setServiceFilter(event.target.value);
            setPage(1);
          }}
          className="h-10 rounded-md border border-border bg-white px-3 text-sm"
        >
          <option value="alle">Alle ydelser</option>
          {SERVICE_VALUES.map((service) => (
            <option key={service} value={service}>
              {service}
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
      </div>

      {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}

      <div className="overflow-hidden rounded-2xl border border-border">
        <div className="grid grid-cols-[1.1fr_1fr_1fr_1.1fr_1.1fr_1fr_1fr] gap-2 bg-muted/60 px-4 py-3 text-xs font-semibold uppercase text-muted-foreground">
          <span>Oprettet</span>
          <span>Kilde</span>
          <span>Service</span>
          <span>Navn</span>
          <span>Telefon</span>
          <span>Postnr.</span>
          <span>Status</span>
        </div>
        <div className="divide-y divide-border/70 bg-white/70">
          {items.length === 0 ? (
            <div className="px-4 py-6 text-sm text-muted-foreground">
              {loading ? "Henter leads..." : "Ingen leads matcher dine filtre."}
            </div>
          ) : (
            items.map((item) => (
              <Link
                key={item.id}
                href={`/admin/leads/${item.id}`}
                className="grid grid-cols-[1.1fr_1fr_1fr_1.1fr_1.1fr_1fr_1fr] gap-2 px-4 py-3 text-sm text-foreground hover:bg-muted/40"
              >
                <span>{formatDateTime(item.createdAt)}</span>
                <span>{item.source}</span>
                <span>{item.service}</span>
                <span>{item.name}</span>
                <span>{item.phone}</span>
                <span>{item.postalCode || "-"}</span>
                <span>{item.status}</span>
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
