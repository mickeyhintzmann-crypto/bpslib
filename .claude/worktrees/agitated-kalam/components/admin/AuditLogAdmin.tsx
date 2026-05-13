"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

const ENTITY_TYPES = ["booking", "lead", "estimator", "day_override", "setting"] as const;

type AuditRow = {
  id: string;
  created_at: string;
  action: string;
  entity_type: string;
  entity_id: string;
  meta: unknown;
  ip?: string | null;
};

type AuditResponse = {
  items?: AuditRow[];
  message?: string;
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

const prettyJson = (value: unknown) => {
  try {
    return JSON.stringify(value ?? {}, null, 2);
  } catch {
    return "{}";
  }
};

export const AuditLogAdmin = () => {
  const [entityType, setEntityType] = useState("alle");
  const [actionFilter, setActionFilter] = useState("");
  const [entityIdFilter, setEntityIdFilter] = useState("");
  const [items, setItems] = useState<AuditRow[]>([]);
  const [selected, setSelected] = useState<AuditRow | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadAudit = async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (entityType !== "alle") {
        params.set("entity_type", entityType);
      }
      if (actionFilter.trim()) {
        params.set("action", actionFilter.trim());
      }
      if (entityIdFilter.trim()) {
        params.set("entity_id", entityIdFilter.trim());
      }
      params.set("limit", "200");

      const response = await fetch(`/api/admin/audit?${params.toString()}`, { cache: "no-store" });

      const payload = (await response.json()) as AuditResponse;
      if (!response.ok || !payload.items) {
        setItems([]);
        setError(payload.message || "Kunne ikke hente audit log.");
        return;
      }

      setItems(payload.items);
      setSelected(null);
    } catch (fetchError) {
      console.error(fetchError);
      setError("Netværksfejl ved hentning af audit log.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAudit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="space-y-6 rounded-2xl border border-border/70 bg-white/70 p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">Audit log</h1>
          <p className="text-sm text-muted-foreground">Seneste ændringer i admin.</p>
        </div>
        <Button onClick={() => loadAudit()} disabled={loading}>
          {loading ? "Henter..." : "Opdater"}
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]">
        <select
          value={entityType}
          onChange={(event) => setEntityType(event.target.value)}
          className="h-10 rounded-md border border-border bg-white px-3 text-sm"
        >
          <option value="alle">Alle typer</option>
          {ENTITY_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <input
          value={actionFilter}
          onChange={(event) => setActionFilter(event.target.value)}
          placeholder="Action indeholder"
          className="h-10 rounded-md border border-border bg-white px-3 text-sm"
        />
        <input
          value={entityIdFilter}
          onChange={(event) => setEntityIdFilter(event.target.value)}
          placeholder="Entity ID"
          className="h-10 rounded-md border border-border bg-white px-3 text-sm"
        />
        <Button onClick={() => loadAudit()} disabled={loading}>
          Anvend
        </Button>
      </div>

      {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}

      <div className="overflow-hidden rounded-2xl border border-border">
        <div className="grid grid-cols-[1.4fr_1.2fr_1fr_1.2fr_1fr] gap-2 bg-muted/60 px-4 py-3 text-xs font-semibold uppercase text-muted-foreground">
          <span>Tidspunkt</span>
          <span>Action</span>
          <span>Type</span>
          <span>Entity ID</span>
          <span>IP</span>
        </div>
        <div className="divide-y divide-border/70 bg-white/70">
          {items.length === 0 ? (
            <div className="px-4 py-6 text-sm text-muted-foreground">
              {loading ? "Henter audit log..." : "Ingen log-poster fundet."}
            </div>
          ) : (
            items.map((row) => (
              <button
                key={row.id}
                type="button"
                onClick={() => setSelected(row)}
                className="grid w-full grid-cols-[1.4fr_1.2fr_1fr_1.2fr_1fr] gap-2 px-4 py-3 text-left text-sm hover:bg-muted/40"
              >
                <span>{formatDateTime(row.created_at)}</span>
                <span>{row.action}</span>
                <span>{row.entity_type}</span>
                <span className="truncate" title={row.entity_id}>
                  {row.entity_id}
                </span>
                <span>{row.ip || "-"}</span>
              </button>
            ))
          )}
        </div>
      </div>

      {selected ? (
        <div className="rounded-2xl border border-border bg-background/60 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Meta (JSON)</p>
            <Button size="sm" variant="outline" onClick={() => setSelected(null)}>
              Luk
            </Button>
          </div>
          <pre className="mt-3 max-h-96 overflow-auto rounded-lg bg-white p-3 text-xs text-muted-foreground">
            {prettyJson(selected.meta)}
          </pre>
        </div>
      ) : null}
    </section>
  );
};
