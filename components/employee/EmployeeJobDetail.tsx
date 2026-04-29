"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

type JobImage = {
  id?: string;
  name?: string;
  url: string | null;
  path?: string;
  status?: string;
  usageTarget?: string | null;
  reviewNote?: string | null;
  createdAt?: string;
  originalFilename?: string | null;
  mimeType?: string | null;
  fileSizeBytes?: number | null;
};

type JobItem = {
  id: string;
  title: string;
  service: string | null;
  status: string;
  startAt: string;
  endAt: string;
  city?: string | null;
  location: string | null;
  address: string | null;
  notes: string | null;
  taskDescription?: string | null;
  lead: JobLead | null;
  priceLabel: string;
  mapsUrl: string | null;
  invoiceStatus: string | null;
  invoicedAt: string | null;
  sourceImages: JobImage[];
  uploadedImages: JobImage[];
};

type JobDetailResponse = {
  item?: JobItem;
  employee?: {
    id: string;
    name: string;
    email: string | null;
    dineroConnected: boolean;
    dineroOrganizationId: string | null;
  };
  invoiceDefaults?: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    customerAddress: string;
    description: string;
    amountExVat: number | null;
    vatPercent: number;
  };
  message?: string;
};

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString("da-DK", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });

const formatFileSize = (bytes: number | null | undefined) => {
  if (!bytes || bytes <= 0) {
    return "Ukendt størrelse";
  }
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const EmployeeJobDetail = ({ jobId }: { jobId: string }) => {
  const router = useRouter();
  const initializedDefaultsRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [item, setItem] = useState<JobItem | null>(null);
  const [dineroConnected, setDineroConnected] = useState(false);

  const [invoiceCustomerName, setInvoiceCustomerName] = useState("");
  const [invoiceCustomerEmail, setInvoiceCustomerEmail] = useState("");
  const [invoiceCustomerPhone, setInvoiceCustomerPhone] = useState("");
  const [invoiceCustomerAddress, setInvoiceCustomerAddress] = useState("");
  const [invoiceDescription, setInvoiceDescription] = useState("");
  const [invoiceAmountExVat, setInvoiceAmountExVat] = useState("");
  const [invoiceVatPercent, setInvoiceVatPercent] = useState("25");
  const [completeBusy, setCompleteBusy] = useState(false);
  const [completeError, setCompleteError] = useState("");
  const [completeMessage, setCompleteMessage] = useState("");
  const [completionConfirm, setCompletionConfirm] = useState(false);

  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");

  const load = async () => {
    setBusy(true);
    setError("");

    try {
      const response = await fetch(`/api/employee/jobs/${encodeURIComponent(jobId)}`, { cache: "no-store" });
      const payload = (await response.json()) as JobDetailResponse;

      if (response.status === 401) {
        router.push("/medarbejder/login");
        return;
      }

      if (!response.ok || !payload.item) {
        setItem(null);
        setError(payload.message || "Kunne ikke hente opgaven.");
        return;
      }

      setItem(payload.item);
      setDineroConnected(Boolean(payload.employee?.dineroConnected));

      if (!initializedDefaultsRef.current && payload.invoiceDefaults) {
        setInvoiceCustomerName(payload.invoiceDefaults.customerName || "");
        setInvoiceCustomerEmail(payload.invoiceDefaults.customerEmail || "");
        setInvoiceCustomerPhone(payload.invoiceDefaults.customerPhone || "");
        setInvoiceCustomerAddress(payload.invoiceDefaults.customerAddress || "");
        setInvoiceDescription(payload.invoiceDefaults.description || "");
        setInvoiceAmountExVat(
          typeof payload.invoiceDefaults.amountExVat === "number" && payload.invoiceDefaults.amountExVat > 0
            ? String(payload.invoiceDefaults.amountExVat)
            : ""
        );
        setInvoiceVatPercent(String(payload.invoiceDefaults.vatPercent || 25));
        initializedDefaultsRef.current = true;
      }
    } catch (loadError) {
      console.error(loadError);
      setItem(null);
      setError("Netværksfejl ved hentning af opgave.");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  const canComplete = useMemo(() => {
    if (!item) {
      return false;
    }
    return item.status !== "cancelled";
  }, [item]);

  const submitCompleteJob = async () => {
    if (!item) {
      return;
    }

    if (!dineroConnected) {
      setCompleteError("Dinero er ikke forbundet. Gå til kalenderen og tilslut Dinero under indstillinger.");
      return;
    }

    if (!completionConfirm) {
      setCompleteError("Bekræft at opgaven er gennemgået før faktura sendes.");
      return;
    }

    const shouldContinue = window.confirm("Er du sikker på at opgaven skal afsluttes og faktura sendes nu?");
    if (!shouldContinue) {
      return;
    }

    setCompleteBusy(true);
    setCompleteError("");
    setCompleteMessage("");

    try {
      const response = await fetch(`/api/employee/jobs/${encodeURIComponent(item.id)}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: invoiceCustomerName,
          customerEmail: invoiceCustomerEmail,
          customerPhone: invoiceCustomerPhone,
          customerAddress: invoiceCustomerAddress,
          description: invoiceDescription,
          amountExVat: invoiceAmountExVat,
          vatPercent: invoiceVatPercent
        })
      });

      const payload = (await response.json()) as { message?: string; alreadySent?: boolean };
      if (!response.ok) {
        setCompleteError(payload.message || "Kunne ikke afslutte opgaven.");
        return;
      }

      setCompleteMessage(payload.alreadySent ? "Faktura var allerede sendt." : "Opgave afsluttet og faktura sendt.");
      setCompletionConfirm(false);
      await load();
    } catch (requestError) {
      console.error(requestError);
      setCompleteError("Netværksfejl ved afslutning.");
    } finally {
      setCompleteBusy(false);
    }
  };

  const submitUpload = async () => {
    if (!item) {
      return;
    }
    if (uploadFiles.length === 0) {
      setUploadError("Vælg mindst ét billede.");
      return;
    }

    setUploadBusy(true);
    setUploadError("");
    setUploadMessage("");

    try {
      for (const file of uploadFiles) {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(`/api/employee/jobs/${encodeURIComponent(item.id)}/images`, {
          method: "POST",
          body: formData
        });
        const payload = (await response.json()) as { item?: JobImage; message?: string };
        if (!response.ok || !payload.item) {
          throw new Error(payload.message || "Upload fejlede.");
        }
      }

      setUploadFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setUploadMessage("Billeder uploadet. De ligger nu til godkendelse i admin.");
      await load();
    } catch (uploadRequestError) {
      console.error(uploadRequestError);
      setUploadError(uploadRequestError instanceof Error ? uploadRequestError.message : "Upload fejlede.");
    } finally {
      setUploadBusy(false);
    }
  };

  if (busy) {
    return (
      <main className="mx-auto w-full max-w-[1180px] px-4 py-8 md:px-6">
        <p className="text-sm text-muted-foreground">Henter opgave…</p>
      </main>
    );
  }

  if (!item) {
    return (
      <main className="mx-auto w-full max-w-[1180px] px-4 py-8 md:px-6">
        <div className="rounded-2xl border border-border bg-white p-5">
          <p className="text-sm font-medium text-red-700">{error || "Opgaven blev ikke fundet."}</p>
          <div className="mt-3">
            <Button variant="outline" onClick={() => router.push("/medarbejder/kalender")}>
              Tilbage til kalender
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[1180px] space-y-4 px-4 py-8 md:px-6">
      <section className="rounded-2xl border border-border bg-white p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Opgave</p>
            <h1 className="font-display text-2xl font-semibold text-foreground">{item.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatDateTime(item.startAt)} - {formatDateTime(item.endAt)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => router.push("/medarbejder/kalender")}>
              Til kalender
            </Button>
            <Button variant="outline" onClick={load} disabled={busy || completeBusy || uploadBusy}>
              Opdater
            </Button>
          </div>
        </div>
      </section>

      {error ? (
        <section className="rounded-2xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-700">{error}</p>
        </section>
      ) : null}

      <section className="rounded-2xl border border-border bg-white p-5">
        <div className="grid gap-3 md:grid-cols-2">
          <p>
            <strong>Status:</strong> {item.status}
          </p>
          <p>
            <strong>Faktura:</strong>{" "}
            {item.invoiceStatus === "sent"
              ? `Sendt${item.invoicedAt ? ` (${formatDateTime(item.invoicedAt)})` : ""}`
              : item.invoiceStatus === "failed"
                ? "Fejlede"
                : "Ikke sendt"}
          </p>
          <p>
            <strong>Service:</strong> {item.service || "-"}
          </p>
          <p>
            <strong>Prisinterval:</strong> {item.priceLabel}
          </p>
          <p>
            <strong>Adresse:</strong> {item.address || item.city || item.location || "-"}
          </p>
          <p>
            <strong>Kunde:</strong> {item.lead?.name || "-"}
          </p>
          <p>
            <strong>Email:</strong> {item.lead?.email || "-"}
          </p>
          <p>
            <strong>Telefon:</strong> {item.lead?.phone || "-"}
          </p>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {item.mapsUrl ? (
            <a
              href={item.mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-white"
            >
              Åbn i Google Maps
            </a>
          ) : null}
          {item.lead?.phone ? (
            <a href={`tel:${item.lead.phone}`} className="inline-flex h-10 items-center rounded-md border border-border px-4 text-sm">
              Ring kunde
            </a>
          ) : null}
          {item.lead?.email ? (
            <a href={`mailto:${item.lead.email}`} className="inline-flex h-10 items-center rounded-md border border-border px-4 text-sm">
              Send email
            </a>
          ) : null}
        </div>

        <div className="mt-4 rounded-xl border border-border/70 bg-muted/20 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Opgavebeskrivelse</p>
          <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">
            {item.taskDescription || item.notes || item.lead?.message || "-"}
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-foreground">Billeder på opgaven</h2>
          <p className="text-xs text-muted-foreground">Uploadede billeder lander i admin til godkendelse.</p>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-border p-4">
            <p className="text-sm font-semibold text-foreground">Eksisterende billeder</p>
            {item.sourceImages.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">Ingen eksisterende billeder på denne opgave.</p>
            ) : (
              <div className="mt-3 grid grid-cols-2 gap-2">
                {item.sourceImages.map((image, index) => (
                  <a
                    key={`${image.path || index}`}
                    href={image.url || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="overflow-hidden rounded-lg border border-border"
                  >
                    {image.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={image.url} alt={image.name || `Billede ${index + 1}`} className="h-28 w-full object-cover" />
                    ) : (
                      <div className="flex h-28 items-center justify-center text-xs text-muted-foreground">Ingen preview</div>
                    )}
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-border p-4">
            <p className="text-sm font-semibold text-foreground">Upload fra medarbejder</p>
            <div className="mt-2 space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                multiple
                onChange={(event) => setUploadFiles(Array.from(event.target.files || []))}
                className="block w-full text-sm"
              />
              {uploadFiles.length > 0 ? (
                <p className="text-xs text-muted-foreground">
                  Klar til upload: {uploadFiles.map((file) => file.name).join(", ")}
                </p>
              ) : null}
              <Button onClick={submitUpload} disabled={uploadBusy}>
                {uploadBusy ? "Uploader..." : "Upload billeder"}
              </Button>
              {uploadError ? <p className="text-xs font-medium text-red-700">{uploadError}</p> : null}
              {uploadMessage ? <p className="text-xs font-medium text-emerald-700">{uploadMessage}</p> : null}
            </div>

            {item.uploadedImages.length > 0 ? (
              <div className="mt-4 space-y-2">
                {item.uploadedImages.map((image) => (
                  <div key={image.id} className="rounded-lg border border-border/70 p-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="font-medium">{image.originalFilename || "Uploadet billede"}</span>
                      <span className="text-muted-foreground">
                        {image.status}
                        {image.usageTarget ? ` · ${image.usageTarget}` : ""}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {image.createdAt ? formatDateTime(image.createdAt) : "Ukendt tidspunkt"} · {formatFileSize(image.fileSizeBytes)}
                    </p>
                    {image.url ? (
                      <a href={image.url} target="_blank" rel="noreferrer" className="mt-2 block overflow-hidden rounded border border-border">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={image.url} alt={image.originalFilename || "Upload"} className="h-24 w-full object-cover" />
                      </a>
                    ) : null}
                    {image.reviewNote ? <p className="mt-1 text-xs text-muted-foreground">Note: {image.reviewNote}</p> : null}
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">Ingen medarbejder-upload endnu.</p>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-white p-5">
        <h2 className="text-lg font-semibold text-foreground">Afslut opgave og send faktura</h2>
        {!dineroConnected ? (
          <p className="mt-2 text-sm font-medium text-amber-700">
            Dinero er ikke forbundet på din medarbejderprofil endnu. Tilknyt den i kalenderen først.
          </p>
        ) : null}

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="grid gap-1 text-sm">
            <span className="text-xs text-muted-foreground">Kundenavn</span>
            <input
              value={invoiceCustomerName}
              onChange={(event) => setInvoiceCustomerName(event.target.value)}
              className="h-10 rounded-md border border-border bg-white px-3 text-sm"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-xs text-muted-foreground">Email</span>
            <input
              type="email"
              value={invoiceCustomerEmail}
              onChange={(event) => setInvoiceCustomerEmail(event.target.value)}
              className="h-10 rounded-md border border-border bg-white px-3 text-sm"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-xs text-muted-foreground">Telefon</span>
            <input
              value={invoiceCustomerPhone}
              onChange={(event) => setInvoiceCustomerPhone(event.target.value)}
              className="h-10 rounded-md border border-border bg-white px-3 text-sm"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-xs text-muted-foreground">Adresse</span>
            <input
              value={invoiceCustomerAddress}
              onChange={(event) => setInvoiceCustomerAddress(event.target.value)}
              className="h-10 rounded-md border border-border bg-white px-3 text-sm"
            />
          </label>
          <label className="grid gap-1 text-sm md:col-span-2">
            <span className="text-xs text-muted-foreground">Beskrivelse (sendes til faktura)</span>
            <input
              value={invoiceDescription}
              onChange={(event) => setInvoiceDescription(event.target.value)}
              className="h-10 rounded-md border border-border bg-white px-3 text-sm"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-xs text-muted-foreground">Pris ex. moms (DKK)</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={invoiceAmountExVat}
              onChange={(event) => setInvoiceAmountExVat(event.target.value)}
              className="h-10 rounded-md border border-border bg-white px-3 text-sm"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-xs text-muted-foreground">Moms %</span>
            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={invoiceVatPercent}
              onChange={(event) => setInvoiceVatPercent(event.target.value)}
              className="h-10 rounded-md border border-border bg-white px-3 text-sm"
            />
          </label>
        </div>

        <label className="mt-4 flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={completionConfirm}
            onChange={(event) => setCompletionConfirm(event.target.checked)}
          />
          Jeg har gennemgået oplysningerne og bekræfter at opgaven er færdig.
        </label>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={submitCompleteJob} disabled={!canComplete || completeBusy}>
            {completeBusy ? "Sender faktura..." : "Afslut opgave"}
          </Button>
        </div>

        {completeError ? <p className="mt-2 text-xs font-medium text-red-700">{completeError}</p> : null}
        {completeMessage ? <p className="mt-2 text-xs font-medium text-emerald-700">{completeMessage}</p> : null}
      </section>
    </main>
  );
};
