"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

type StatusFilter = "all" | "pending" | "approved" | "rejected";
type UsageTarget = "social_ads" | "website" | "both" | "";

type JobMediaItem = {
  id: string;
  createdAt: string;
  status: string;
  usageTarget: string | null;
  reviewNote: string | null;
  reviewedAt: string | null;
  originalFilename: string | null;
  mimeType: string | null;
  fileSizeBytes: number | null;
  url: string | null;
  job: {
    id: string;
    title: string;
    service: string | null;
    startAt: string;
    address: string | null;
    location: string | null;
  } | null;
  employee: {
    id: string;
    name: string;
  } | null;
};

type JobMediaResponse = {
  items?: JobMediaItem[];
  message?: string;
};

const formatDateTime = (value: string | null) => {
  if (!value) {
    return "-";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return date.toLocaleString("da-DK", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
};

const formatFileSize = (bytes: number | null) => {
  if (!bytes || bytes <= 0) {
    return "Ukendt størrelse";
  }
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const usageLabel = (usageTarget: string | null) => {
  if (usageTarget === "social_ads") return "Social ads";
  if (usageTarget === "website") return "Website";
  if (usageTarget === "both") return "Social + website";
  return "Ikke valgt";
};

export const JobMediaManager = () => {
  const [items, setItems] = useState<JobMediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("pending");
  const [busyId, setBusyId] = useState("");
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      params.set("status", filter);
      const response = await fetch(`/api/admin/job-media?${params.toString()}`, { cache: "no-store" });
      const payload = (await response.json()) as JobMediaResponse;

      if (!response.ok || !payload.items) {
        setItems([]);
        setError(payload.message || "Kunne ikke hente job-billeder.");
        return;
      }

      setItems(payload.items);
      const nextNotes: Record<string, string> = {};
      payload.items.forEach((item) => {
        nextNotes[item.id] = item.reviewNote || "";
      });
      setReviewNotes(nextNotes);
    } catch (loadError) {
      console.error(loadError);
      setItems([]);
      setError("Netværksfejl ved hentning af job-billeder.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const patchItem = async (id: string, payload: { status?: string; usageTarget?: UsageTarget }) => {
    setBusyId(id);
    setError("");
    try {
      const response = await fetch(`/api/admin/job-media/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          reviewNote: reviewNotes[id] || ""
        })
      });
      const data = (await response.json()) as { message?: string };
      if (!response.ok) {
        setError(data.message || "Kunne ikke opdatere billedet.");
        return;
      }
      await load();
    } catch (requestError) {
      console.error(requestError);
      setError("Netværksfejl ved opdatering.");
    } finally {
      setBusyId("");
    }
  };

  const deleteItem = async (id: string) => {
    const confirmed = window.confirm("Slette billedet permanent?");
    if (!confirmed) {
      return;
    }

    setBusyId(id);
    setError("");
    try {
      const response = await fetch(`/api/admin/job-media/${encodeURIComponent(id)}`, {
        method: "DELETE"
      });
      const data = (await response.json()) as { message?: string };
      if (!response.ok) {
        setError(data.message || "Kunne ikke slette billedet.");
        return;
      }
      await load();
    } catch (requestError) {
      console.error(requestError);
      setError("Netværksfejl ved sletning.");
    } finally {
      setBusyId("");
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground">Job-billeder fra medarbejdere</h1>
          <p className="text-sm text-muted-foreground">
            Gennemgå uploads og vælg om de skal bruges til website eller sociale annoncer.
          </p>
        </div>
        <Button variant="outline" onClick={load} disabled={loading}>
          {loading ? "Opdaterer..." : "Opdater"}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant={filter === "pending" ? "default" : "outline"} onClick={() => setFilter("pending")}>
          Pending
        </Button>
        <Button variant={filter === "approved" ? "default" : "outline"} onClick={() => setFilter("approved")}>
          Approved
        </Button>
        <Button variant={filter === "rejected" ? "default" : "outline"} onClick={() => setFilter("rejected")}>
          Rejected
        </Button>
        <Button variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>
          Alle
        </Button>
      </div>

      {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}

      {loading ? <p className="text-sm text-muted-foreground">Henter billeder…</p> : null}
      {!loading && items.length === 0 ? <p className="text-sm text-muted-foreground">Ingen billeder i dette filter.</p> : null}

      <div className="grid gap-4 lg:grid-cols-2">
        {items.map((item) => (
          <article key={item.id} className="rounded-2xl border border-border bg-white p-4">
            <div className="grid gap-4 md:grid-cols-[180px_1fr]">
              <div className="overflow-hidden rounded-xl border border-border">
                {item.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.url} alt={item.originalFilename || "Job upload"} className="h-44 w-full object-cover" />
                ) : (
                  <div className="flex h-44 items-center justify-center text-xs text-muted-foreground">Ingen preview</div>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">{item.job?.title || "Ukendt opgave"}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDateTime(item.job?.startAt || null)} · {item.employee?.name || "Ukendt medarbejder"}
                </p>
                <p className="text-xs text-muted-foreground">{item.job?.address || item.job?.location || "-"}</p>
                <p className="text-xs text-muted-foreground">
                  Status: <span className="font-medium text-foreground">{item.status}</span> · Brug:{" "}
                  <span className="font-medium text-foreground">{usageLabel(item.usageTarget)}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {item.originalFilename || "Ukendt fil"} · {formatFileSize(item.fileSizeBytes)}
                </p>

                <label className="grid gap-1 text-xs">
                  <span className="text-muted-foreground">Review note</span>
                  <input
                    value={reviewNotes[item.id] || ""}
                    onChange={(event) =>
                      setReviewNotes((current) => ({
                        ...current,
                        [item.id]: event.target.value
                      }))
                    }
                    className="h-9 rounded-md border border-border bg-white px-2"
                    placeholder="Valgfri intern note"
                  />
                </label>

                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    onClick={() => patchItem(item.id, { status: "approved", usageTarget: "website" })}
                    disabled={busyId === item.id}
                  >
                    Godkend website
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => patchItem(item.id, { status: "approved", usageTarget: "social_ads" })}
                    disabled={busyId === item.id}
                  >
                    Godkend social
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => patchItem(item.id, { status: "approved", usageTarget: "both" })}
                    disabled={busyId === item.id}
                  >
                    Godkend begge
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => patchItem(item.id, { status: "rejected", usageTarget: "" })}
                    disabled={busyId === item.id}
                  >
                    Afvis
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => deleteItem(item.id)} disabled={busyId === item.id}>
                    Slet
                  </Button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
