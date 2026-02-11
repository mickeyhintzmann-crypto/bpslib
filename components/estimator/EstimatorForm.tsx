"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site-config";
import { trackEvent } from "@/lib/tracking";

const PHONE_TEL = "tel:+45XXXXXXXX";

const UPLOAD_GUIDE = [
  "Hel bordplade/køkken (obligatorisk)",
  "Tæt på overfladen",
  "Problemområde",
  "Omkring vask/komfur (hvis relevant)"
];

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MIN_IMAGES = 3;
const MAX_IMAGES = 6;
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_TOTAL_UPLOAD_BYTES = 20 * 1024 * 1024;

export const EstimatorForm = () => {
  const router = useRouter();

  const [images, setImages] = useState<File[]>([]);
  const [kitchenImageIndex, setKitchenImageIndex] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const imageCountLabel = useMemo(() => `${images.length} billeder valgt`, [images.length]);

  const onImageChange = (files: FileList | null) => {
    if (!files) {
      setImages([]);
      setKitchenImageIndex(null);
      return;
    }

    const next = Array.from(files)
      .filter((file) => file.size > 0)
      .slice(0, MAX_IMAGES);
    setImages(next);

    if (kitchenImageIndex !== null && kitchenImageIndex >= next.length) {
      setKitchenImageIndex(null);
    }
  };

  const validateImages = () => {
    if (images.length < MIN_IMAGES || images.length > MAX_IMAGES) {
      return "Upload 3 til 6 billeder for at fortsætte.";
    }
    if (images.some((file) => !ALLOWED_IMAGE_TYPES.has(file.type))) {
      return "Kun JPEG, PNG eller WEBP billeder er tilladt.";
    }
    const oversized = images.find((file) => file.size > MAX_IMAGE_SIZE_BYTES);
    if (oversized) {
      return `Billedet "${oversized.name}" er for stort. Maks 5 MB pr. billede.`;
    }
    const totalBytes = images.reduce((sum, file) => sum + file.size, 0);
    if (totalBytes > MAX_TOTAL_UPLOAD_BYTES) {
      return "Den samlede upload er for stor. Maks 20 MB i alt.";
    }
    if (kitchenImageIndex === null || kitchenImageIndex < 0 || kitchenImageIndex >= images.length) {
      return "Markér hvilket billede der viser hele køkkenet/bordpladen.";
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
      formData.append("kitchenImageIndex", kitchenImageIndex !== null ? `${kitchenImageIndex}` : "");

      images.forEach((file) => formData.append("images", file));

      const response = await fetch("/api/estimator/submit", {
        method: "POST",
        body: formData
      });

      const payload = (await response.json()) as {
        id?: string;
        aiPriceMin?: number | null;
        aiPriceMax?: number | null;
        aiStatus?: string;
        message?: string;
      };

      if (!response.ok || !payload.id) {
        setErrorMessage(payload.message || "Kunne ikke sende vurderingen. Prøv igen.");
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
        <h2 className="text-xl font-semibold text-foreground">1) Upload billeder (3–6)</h2>
        <p className="text-sm text-muted-foreground">
          Vi bruger billederne til at give et hurtigt AI-estimat. Husk at vise hele køkkenet, så vi kan vurdere størrelsen.
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
        Vælg billeder (JPEG/PNG/WEBP)
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={(event) => onImageChange(event.target.files)}
          className="rounded-md border border-border bg-white px-3 py-2"
        />
      </label>
      <p className="text-xs text-muted-foreground">{imageCountLabel}</p>

      {images.length > 0 ? (
        <div className="grid gap-4 rounded-xl border border-border bg-background/60 p-4">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">Markér hel bordplade/køkken</p>
            <div className="grid gap-2 text-sm text-muted-foreground">
              {images.map((file, index) => (
                <label key={`kitchen-${file.name}-${index}`} className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="kitchenImage"
                    checked={kitchenImageIndex === index}
                    onChange={() => setKitchenImageIndex(index)}
                  />
                  <span>{file.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
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
        <Button onClick={submit} disabled={isSubmitting}>
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
