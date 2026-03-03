"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

type JobLead = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  message: string | null;
};

type JobItem = {
  id: string;
  title: string;
  service: string | null;
  status: string;
  startAt: string;
  endAt: string;
  location: string | null;
  address: string | null;
  notes: string | null;
  lead: JobLead | null;
  priceMin: number | null;
  priceMax: number | null;
  priceLabel: string;
  mapsUrl: string | null;
};

type JobsResponse = {
  items?: JobItem[];
  message?: string;
  employee?: { name: string; email: string | null };
};

const toIso = (date: Date) => date.toISOString();

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString("da-DK", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });

const formatDateKey = (value: string) =>
  new Date(value).toLocaleDateString("da-DK", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit"
  });

export const EmployeeCalendar = () => {
  const router = useRouter();
  const [items, setItems] = useState<JobItem[]>([]);
  const [employeeName, setEmployeeName] = useState("Medarbejder");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const load = async () => {
    setBusy(true);
    setError("");
    try {
      const from = new Date();
      const to = new Date();
      to.setDate(to.getDate() + 30);
      const params = new URLSearchParams({
        from: toIso(from),
        to: toIso(to)
      });
      const response = await fetch(`/api/employee/jobs?${params.toString()}`, { cache: "no-store" });
      const payload = (await response.json()) as JobsResponse;
      if (!response.ok || !payload.items) {
        setItems([]);
        setError(payload.message || "Kunne ikke hente opgaver.");
        return;
      }
      setItems(payload.items);
      setEmployeeName(payload.employee?.name || "Medarbejder");
      setSelectedId((current) => current || payload.items?.[0]?.id || null);
    } catch (fetchError) {
      console.error(fetchError);
      setError("Netværksfejl ved hentning af opgaver.");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const selected = useMemo(() => items.find((item) => item.id === selectedId) || null, [items, selectedId]);

  const grouped = useMemo(() => {
    const map = new Map<string, JobItem[]>();
    items.forEach((item) => {
      const key = formatDateKey(item.startAt);
      const current = map.get(key) || [];
      current.push(item);
      map.set(key, current);
    });
    return [...map.entries()];
  }, [items]);

  const logout = async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
    } finally {
      router.push("/medarbejder/login");
      router.refresh();
    }
  };

  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 py-8 md:px-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-white p-4">
        <div>
          <p className="text-xs uppercase text-muted-foreground">Medarbejder</p>
          <h1 className="font-display text-2xl font-semibold text-foreground">Kalender · {employeeName}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={load} disabled={busy}>
            {busy ? "Opdaterer..." : "Opdater"}
          </Button>
          <Button variant="outline" onClick={logout}>
            Log ud
          </Button>
        </div>
      </div>

      {error ? <p className="mb-4 text-sm font-medium text-red-700">{error}</p> : null}

      <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
        <section className="rounded-2xl border border-border bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Mine opgaver</h2>
          {grouped.length === 0 ? (
            <p className="text-sm text-muted-foreground">{busy ? "Henter..." : "Ingen opgaver i perioden."}</p>
          ) : (
            <div className="space-y-4">
              {grouped.map(([day, dayItems]) => (
                <div key={day}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{day}</p>
                  <div className="space-y-2">
                    {dayItems.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedId(item.id)}
                        className={`w-full rounded-xl border px-3 py-3 text-left ${
                          selectedId === item.id ? "border-primary bg-primary/5" : "border-border"
                        }`}
                      >
                        <p className="text-sm font-semibold text-foreground">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{formatDateTime(item.startAt)}</p>
                        <p className="text-xs text-muted-foreground">{item.address || item.location || "-"}</p>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-white p-5">
          {!selected ? (
            <p className="text-sm text-muted-foreground">Vælg en opgave for at se detaljer.</p>
          ) : (
            <div className="space-y-4">
              <div>
                <h2 className="font-display text-2xl font-semibold text-foreground">{selected.title}</h2>
                <p className="text-sm text-muted-foreground">
                  {formatDateTime(selected.startAt)} - {formatDateTime(selected.endAt)}
                </p>
              </div>

              <div className="grid gap-3 rounded-xl border border-border/70 bg-muted/20 p-4 md:grid-cols-2">
                <p>
                  <strong>Status:</strong> {selected.status}
                </p>
                <p>
                  <strong>Service:</strong> {selected.service || "-"}
                </p>
                <p>
                  <strong>Pris:</strong> {selected.priceLabel}
                </p>
                <p>
                  <strong>Adresse:</strong> {selected.address || selected.location || "-"}
                </p>
              </div>

              <div className="grid gap-3 rounded-xl border border-border/70 p-4 md:grid-cols-2">
                <p>
                  <strong>Kunde navn:</strong> {selected.lead?.name || "-"}
                </p>
                <p>
                  <strong>Telefon:</strong> {selected.lead?.phone || "-"}
                </p>
                <p>
                  <strong>Email:</strong> {selected.lead?.email || "-"}
                </p>
                <p>
                  <strong>Lokation:</strong> {selected.lead?.location || selected.location || "-"}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {selected.mapsUrl ? (
                  <a
                    href={selected.mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-white"
                  >
                    Naviger til adresse
                  </a>
                ) : null}
                {selected.lead?.phone ? (
                  <a
                    href={`tel:${selected.lead.phone}`}
                    className="inline-flex h-10 items-center rounded-md border border-border px-4 text-sm"
                  >
                    Ring kunde
                  </a>
                ) : null}
                {selected.lead?.email ? (
                  <a
                    href={`mailto:${selected.lead.email}`}
                    className="inline-flex h-10 items-center rounded-md border border-border px-4 text-sm"
                  >
                    Send email
                  </a>
                ) : null}
              </div>

              <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Job note</p>
                <p className="mt-2 text-sm text-foreground whitespace-pre-wrap">{selected.notes || "-"}</p>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
};
