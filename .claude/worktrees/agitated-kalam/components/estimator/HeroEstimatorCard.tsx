"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/tracking";

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif"
]);
const MIN_IMAGES = 1;
const MAX_IMAGES = 6;
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_TOTAL_UPLOAD_BYTES = 40 * 1024 * 1024;

export const HeroEstimatorCard = () => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const imageCountLabel = useMemo(() => `${images.length} billeder valgt`, [images.length]);

  const onImageChange = (files: FileList | null) => {
    if (!files) {
      setImages([]);
      return;
    }
    setImages(Array.from(files).slice(0, MAX_IMAGES));
    setErrorMessage("");
  };

  const validate = () => {
    if (!name.trim() || !phone.trim()) {
      return "Udfyld navn og telefon.";
    }
    if (images.length < MIN_IMAGES || images.length > MAX_IMAGES) {
      return "Upload 1 til 6 billeder.";
    }
    if (images.some((file) => !ALLOWED_IMAGE_TYPES.has(file.type))) {
      return "Kun JPEG, PNG, WEBP eller HEIC billeder er tilladt.";
    }
    const oversized = images.find((file) => file.size > MAX_IMAGE_SIZE_BYTES);
    if (oversized) {
      return `Billedet "${oversized.name}" er for stort (maks 10 MB).`;
    }
    const totalBytes = images.reduce((sum, file) => sum + file.size, 0);
    if (totalBytes > MAX_TOTAL_UPLOAD_BYTES) {
      return "Samlet upload er for stor (maks 40 MB).";
    }
    return null;
  };

  const submit = async () => {
    const validationError = validate();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("navn", name.trim());
      formData.append("telefon", phone.trim());
      images.forEach((file) => formData.append("images", file));

      const response = await fetch("/api/estimator/submit", {
        method: "POST",
        body: formData
      });
      const rawBody = await response.text();

      type EstimatorResponsePayload = {
        id?: string;
        aiPriceMin?: number | null;
        aiPriceMax?: number | null;
        aiStatus?: string;
        message?: string;
      };
      let payload: EstimatorResponsePayload | null = null;
      try {
        payload = rawBody ? (JSON.parse(rawBody) as EstimatorResponsePayload) : null;
      } catch {
        payload = null;
      }

      if (!response.ok || !payload?.id) {
        setErrorMessage(payload?.message || "Kunne ikke sende vurderingen. Prøv igen.");
        return;
      }

      if (typeof window !== "undefined") {
        const stored = {
          estimatorId: payload.id,
          name: name.trim(),
          phone: phone.trim(),
          priceMin: payload.aiPriceMin ?? null,
          priceMax: payload.aiPriceMax ?? null
        };
        window.sessionStorage.setItem("estimator_contact", JSON.stringify(stored));
      }

      trackEvent("estimator_submit", {
        source: "hero_estimator_card",
        ai_status: payload.aiStatus || "unknown"
      });

      const params = new URLSearchParams();
      params.set("id", payload.id);
      if (payload.aiPriceMin !== null && payload.aiPriceMin !== undefined) {
        params.set("min", String(payload.aiPriceMin));
      }
      if (payload.aiPriceMax !== null && payload.aiPriceMax !== undefined) {
        params.set("max", String(payload.aiPriceMax));
      }
      if (payload.aiStatus) {
        params.set("status", payload.aiStatus);
      }

      router.push(`/bordpladeslibning/prisberegner/tak?${params.toString()}`);
    } catch (error) {
      console.error(error);
      setErrorMessage("Der opstod en fejl under upload. Prøv igen.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <aside className="w-full max-w-[430px] rounded-[28px] border border-border/75 bg-white p-5 text-foreground shadow-[0_24px_50px_hsl(20_35%_10%/0.25)] md:p-6">
      <div className="mb-3 inline-flex items-center rounded-full bg-primary px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white">
        AI-prisberegner · kun bordplader
      </div>
      <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground">
        Få et prisestimat
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Upload 1–6 billeder af bordpladen, så får du et hurtigt AI-estimat og næste skridt.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm">
          <span className="text-xs font-medium text-muted-foreground">Navn</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="h-11 rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/15"
          />
        </label>
        <label className="grid gap-1 text-sm">
          <span className="text-xs font-medium text-muted-foreground">Telefon</span>
          <input
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className="h-11 rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/15"
          />
        </label>
      </div>

      <label className="mt-3 grid gap-1 text-sm">
        <span className="text-xs font-medium text-muted-foreground">Billeder (1–6)</span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
          multiple
          onChange={(event) => onImageChange(event.target.files)}
          className="block h-11 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none transition file:mr-3 file:rounded-lg file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-foreground hover:file:bg-secondary/80"
        />
      </label>
      <p className="mt-1 text-xs text-muted-foreground">{imageCountLabel}</p>

      {errorMessage ? (
        <p className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
          {errorMessage}
        </p>
      ) : null}

      <div className="mt-4 grid gap-2.5">
        <Button
          onClick={submit}
          disabled={isSubmitting}
          className="h-11 rounded-xl text-sm font-semibold"
        >
          {isSubmitting ? "Sender..." : "Få AI-prisestimat"}
        </Button>
        <Button asChild variant="outline" className="h-10 rounded-xl text-sm">
          <Link href="/bordpladeslibning/prisberegner">Åbn fuld prisberegner</Link>
        </Button>
      </div>
    </aside>
  );
};
