"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

const STATUS_FLOW = ["new", "contacted", "quote_sent", "won", "lost", "closed"] as const;

type LeadItem = {
  id: string;
  createdAt: string;
  source: string;
  service: string;
  name: string;
  phone: string;
  email?: string | null;
  postalCode: string | null;
  note: string | null;
  status: string;
  internalNote: string | null;
};

type DetailResponse = {
  item?: LeadItem;
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

export const LeadDetailAdmin = ({ leadId }: { leadId: string }) => {
  const [item, setItem] = useState<LeadItem | null>(null);
  const [status, setStatus] = useState<(typeof STATUS_FLOW)[number]>("new");
  const [internalNote, setInternalNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    loadLead();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leadId]);

  const loadLead = async () => {
    setLoading(true);
    setError("");
    setSaveMessage("");

    try {
      const response = await fetch(`/api/admin/leads/${leadId}`, {
        cache: "no-store"
      });

      const payload = (await response.json()) as DetailResponse;
      if (!response.ok || !payload.item) {
        setItem(null);
        setError(payload.message || "Kunne ikke hente lead.");
        return;
      }

      setItem(payload.item);
      setStatus(
        STATUS_FLOW.includes(payload.item.status as (typeof STATUS_FLOW)[number])
          ? (payload.item.status as (typeof STATUS_FLOW)[number])
          : "new"
      );
      setInternalNote(payload.item.internalNote || "");
    } catch (fetchError) {
      console.error(fetchError);
      setItem(null);
      setError("Netværksfejl ved hentning af lead.");
    } finally {
      setLoading(false);
    }
  };

  const updateLead = async (nextStatus?: (typeof STATUS_FLOW)[number]) => {
    setSaving(true);
    setError("");
    setSaveMessage("");

    try {
      const payload: Record<string, string | null> = {};
      payload.status = nextStatus || status;
      payload.internalNote = internalNote.trim() ? internalNote.trim() : null;

      const response = await fetch(`/api/admin/leads/${leadId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = (await response.json()) as DetailResponse;
      if (!response.ok || !data.item) {
        setError(data.message || "Kunne ikke opdatere lead.");
        return;
      }

      setItem(data.item);
      setStatus(
        STATUS_FLOW.includes(data.item.status as (typeof STATUS_FLOW)[number])
          ? (data.item.status as (typeof STATUS_FLOW)[number])
          : "new"
      );
      setInternalNote(data.item.internalNote || "");
      setSaveMessage("Lead opdateret.");
    } catch (updateError) {
      console.error(updateError);
      setError("Netværksfejl ved opdatering af lead.");
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = async (value: string) => {
    if (!value) {
      return;
    }
    try {
      await navigator.clipboard.writeText(value);
      setSaveMessage("Kopieret til udklipsholder.");
    } catch (copyError) {
      console.error(copyError);
      setSaveMessage("Kunne ikke kopiere.");
    }
  };

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <section className="space-y-6 rounded-2xl border border-border/70 bg-white/70 p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-semibold text-foreground">Lead detaljer</h1>
            <p className="text-sm text-muted-foreground">Lead ID: {leadId}</p>
          </div>
          <Button onClick={() => loadLead()} disabled={loading}>
            {loading ? "Henter..." : "Hent lead"}
          </Button>
        </div>

        {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}
        {saveMessage ? <p className="text-sm font-medium text-emerald-700">{saveMessage}</p> : null}

        {item ? (
          <div className="space-y-6">
            <div className="grid gap-3 rounded-xl border border-border bg-background/60 p-4 text-sm sm:grid-cols-2">
              <p>
                <span className="font-semibold text-foreground">Oprettet:</span> {formatDateTime(item.createdAt)}
              </p>
              <p>
                <span className="font-semibold text-foreground">Kilde:</span> {item.source}
              </p>
              <p>
                <span className="font-semibold text-foreground">Service:</span> {item.service}
              </p>
              <p>
                <span className="font-semibold text-foreground">Status:</span> {item.status}
              </p>
              <p>
                <span className="font-semibold text-foreground">Navn:</span> {item.name}
              </p>
              <p>
                <span className="font-semibold text-foreground">Telefon:</span> {item.phone}
              </p>
              <p>
                <span className="font-semibold text-foreground">Email:</span> {item.email || "Ikke angivet"}
              </p>
              <p>
                <span className="font-semibold text-foreground">Postnr.:</span> {item.postalCode || "Ikke angivet"}
              </p>
              <p className="sm:col-span-2">
                <span className="font-semibold text-foreground">Note:</span> {item.note || "Ingen note"}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline">
                <a href={`tel:${item.phone}`}>Ring</a>
              </Button>
              <Button
                variant="outline"
                onClick={() => copyToClipboard(item.phone)}
              >
                Kopiér telefon
              </Button>
              <Button
                variant="outline"
                onClick={() => copyToClipboard(item.email || "")}
                disabled={!item.email}
              >
                Kopiér email
              </Button>
              <Button asChild variant="outline">
                <Link href="/admin/leads">Tilbage til liste</Link>
              </Button>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">Skift status</p>
              <div className="flex flex-wrap gap-2">
                {STATUS_FLOW.map((option) => (
                  <Button
                    key={option}
                    size="sm"
                    variant={option === status ? "default" : "outline"}
                    onClick={() => {
                      setStatus(option);
                      updateLead(option);
                    }}
                    disabled={saving}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-muted-foreground" htmlFor="internalNote">
                Intern note
              </label>
              <textarea
                id="internalNote"
                value={internalNote}
                onChange={(event) => setInternalNote(event.target.value)}
                rows={4}
                className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
              />
              <Button onClick={() => updateLead()} disabled={saving}>
                {saving ? "Gemmer..." : "Gem note"}
              </Button>
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
};
