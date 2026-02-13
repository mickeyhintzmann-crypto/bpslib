"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site-config";
import { trackEvent } from "@/lib/tracking";

const PHONE_TEL = "tel:+45XXXXXXXX";

const UPLOAD_GUIDE = [
  "Upload 1 billede pr. bordplade (hele bordpladen i billedet).",
  "Har du 2 bordplader? Upload 2 billeder.",
  "Undgå at uploade samme bordplade flere gange."
];

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
const MAX_IMAGE_DIMENSION = 1280;
const JPEG_QUALITY = 0.78;

export const EstimatorForm = () => {
  const router = useRouter();

  const [images, setImages] = useState<File[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const imageCountLabel = useMemo(() => `${images.length} billeder valgt`, [images.length]);

  const loadImage = (file: File) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Kunne ikke indlæse billede."));
      };
      img.src = url;
    });

  const compressImage = async (file: File) => {
    try {
      const img = await loadImage(file);
      const maxSide = Math.max(img.width, img.height);
      const scale = maxSide > MAX_IMAGE_DIMENSION ? MAX_IMAGE_DIMENSION / maxSide : 1;
      const targetWidth = Math.max(1, Math.round(img.width * scale));
      const targetHeight = Math.max(1, Math.round(img.height * scale));

      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return file;
      }
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY)
      );
      if (!blob) {
        return file;
      }

      const baseName = file.name.replace(/\.[^/.]+$/, "");
      return new File([blob], `${baseName}.jpg`, { type: "image/jpeg" });
    } catch (error) {
      console.warn("Kunne ikke komprimere billede, bruger original.", error);
      return file;
    }
  };

  const onImageChange = async (files: FileList | null) => {
    if (!files) {
      setImages([]);
      return;
    }

    setIsProcessing(true);
    setErrorMessage("");

    const selected = Array.from(files)
      .filter((file) => file.size > 0)
      .slice(0, MAX_IMAGES);

    const processed = await Promise.all(selected.map((file) => compressImage(file)));
    setImages(processed);
    setIsProcessing(false);
  };

  const validateImages = () => {
    if (images.length < MIN_IMAGES || images.length > MAX_IMAGES) {
      return "Upload 1 til 6 billeder for at fortsætte.";
    }
    if (images.some((file) => !ALLOWED_IMAGE_TYPES.has(file.type))) {
      return "Kun JPEG, PNG, WEBP eller HEIC billeder er tilladt.";
    }
    const oversized = images.find((file) => file.size > MAX_IMAGE_SIZE_BYTES);
    if (oversized) {
      return `Billedet "${oversized.name}" er for stort. Maks 10 MB pr. billede.`;
    }
    const totalBytes = images.reduce((sum, file) => sum + file.size, 0);
    if (totalBytes > MAX_TOTAL_UPLOAD_BYTES) {
      return "Den samlede upload er for stor. Maks 40 MB i alt.";
    }
    return null;
  };

  const validate = () => {
    const imageError = validateImages();
    if (imageError) {
      return imageError;
    }
    if (!name.trim() || !phone.trim()) {
      return "Navn og telefonnummer er obligatoriske.";
    }
    return null;
  };

  const submit = async () => {
    if (isProcessing) {
      setErrorMessage("Vi er stadig i gang med at behandle billederne. Prøv igen om et øjeblik.");
      return;
    }
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
        if (response.status === 413) {
          setErrorMessage("Upload er for stor. Vælg færre billeder eller mindre filer.");
          return;
        }
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
        source: "prisberegner_submit",
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
    <section className="space-y-6 rounded-3xl border border-border/70 bg-white/70 p-5 md:p-8">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-foreground">1) Upload billeder (1–6)</h2>
        <p className="text-sm text-muted-foreground">
          Vi bruger billederne til at give et hurtigt AI-estimat. Husk at hele bordpladen er synlig i hvert billede.
          Vi komprimerer automatisk billederne, så de går hurtigere igennem.
        </p>
      </div>

      <ul className="space-y-1 text-sm text-muted-foreground">
        {UPLOAD_GUIDE.map((item, index) => (
          <li key={item}>
            {index + 1}. {item}
          </li>
        ))}
      </ul>

      <label className="grid gap-2 text-sm text-foreground">
        Vælg billeder (JPEG/PNG/WEBP/HEIC)
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
          multiple
          onChange={(event) => onImageChange(event.target.files)}
          className="rounded-md border border-border bg-white px-3 py-2"
        />
      </label>
      <p className="text-xs text-muted-foreground">
        {isProcessing ? "Behandler billeder..." : imageCountLabel}
      </p>
      {images.length > 1 ? (
        <p className="text-xs text-muted-foreground">
          Tjek at du ikke har uploadet samme bordplade to gange.
        </p>
      ) : null}

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">2) Kontaktoplysninger</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm text-foreground">
            Navn
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="h-10 rounded-md border border-border bg-white px-3"
            />
          </label>
          <label className="grid gap-2 text-sm text-foreground">
            Telefon
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="h-10 rounded-md border border-border bg-white px-3"
            />
          </label>
        </div>
      </div>

      <div className="space-y-2 rounded-xl border border-border bg-background/60 p-4 text-sm text-muted-foreground">
        <p>Vi sliber kun massive træbordplader. Er du i tvivl, så send billeder alligevel.</p>
        <p>Prisen gælder først efter bookingbekræftelse. Vi ringer altid, hvis der er spørgsmål.</p>
        <p>Billeder bruges kun til vurdering af opgaven og slettes automatisk efter {siteConfig.estimatorRetentionDays} dage.</p>
        <Link href="/privatlivspolitik" className="font-semibold text-primary">
          Læs privatlivspolitik
        </Link>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button onClick={submit} disabled={isSubmitting || isProcessing}>
      {isSubmitting ? "Sender..." : "Få AI-prisestimat"}
        </Button>
        <Button asChild variant="outline">
          <a
            href={PHONE_TEL}
            onClick={() => {
              trackEvent("call_click", { source: "prisberegner" });
            }}
          >
            Ring os op
          </a>
        </Button>
      </div>

      {errorMessage ? <p className="text-sm font-medium text-red-700">{errorMessage}</p> : null}
    </section>
  );
};
