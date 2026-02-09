"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  EXTRA_OPTIONS,
  VANDFALD_PRICE_LABEL,
  defaultBordpladeExtras,
  formatExtrasSummary,
  type BordpladeExtras
} from "@/lib/bordplade/extras";
import { siteConfig } from "@/lib/site-config";
import { trackEvent } from "@/lib/tracking";

const PHONE_TEL = "tel:+45XXXXXXXX";

const UPLOAD_GUIDE = [
  "Hel bordplade/køkken (obligatorisk)",
  "Kant/ende (obligatorisk)",
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
  const [edgeImageIndex, setEdgeImageIndex] = useState<number | null>(null);
  const [kitchenImageIndex, setKitchenImageIndex] = useState<number | null>(null);
  const [lengthCm, setLengthCm] = useState("");
  const [depthCm, setDepthCm] = useState("");
  const [count, setCount] = useState("1");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [extras, setExtras] = useState<BordpladeExtras>(defaultBordpladeExtras);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const imageCountLabel = useMemo(() => `${images.length} billeder valgt`, [images.length]);
  const extrasSummary = useMemo(() => formatExtrasSummary(extras), [extras]);

  const onImageChange = (files: FileList | null) => {
    if (!files) {
      setImages([]);
      setEdgeImageIndex(null);
      setKitchenImageIndex(null);
      return;
    }

    const next = Array.from(files)
      .filter((file) => file.size > 0)
      .slice(0, MAX_IMAGES);
    setImages(next);

    if (edgeImageIndex !== null && edgeImageIndex >= next.length) {
      setEdgeImageIndex(null);
    }
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
    if (edgeImageIndex === null || edgeImageIndex < 0 || edgeImageIndex >= images.length) {
      return "Markér hvilket billede der viser kant/ende.";
    }
    return null;
  };

  const validate = () => {
    const imageError = validateImages();
    if (imageError) {
      return imageError;
    }
    const lengthValue = Number.parseInt(lengthCm.replace(/\D/g, ""), 10);
    const depthValue = Number.parseInt(depthCm.replace(/\D/g, ""), 10);
    const countValue = Number.parseInt(count.replace(/\D/g, ""), 10);
    if (!Number.isFinite(lengthValue) || lengthValue < 50 || lengthValue > 800) {
      return "Angiv ca. længde på bordpladen (50–800 cm).";
    }
    if (!Number.isFinite(depthValue) || depthValue < 40 || depthValue > 200) {
      return "Angiv ca. dybde på bordpladen (40–200 cm).";
    }
    if (!Number.isFinite(countValue) || countValue < 1 || countValue > 10) {
      return "Angiv antal bordplader (1–10).";
    }
    if (!name.trim() || !phone.trim()) {
      return "Navn og telefonnummer er obligatoriske.";
    }
    return null;
  };

  const toggleExtra = (key: (typeof EXTRA_OPTIONS)[number]["key"]) => {
    setExtras((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const updateVandfaldCount = (value: string) => {
    if (!value.trim()) {
      setExtras((prev) => ({ ...prev, vandfaldCount: 0 }));
      return;
    }
    const parsed = Number.parseInt(value.replace(/\D/g, ""), 10);
    const safeValue = Number.isNaN(parsed) ? 0 : Math.max(0, Math.min(20, parsed));
    setExtras((prev) => ({ ...prev, vandfaldCount: safeValue }));
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
      const lengthValue = Number.parseInt(lengthCm.replace(/\D/g, ""), 10);
      const depthValue = Number.parseInt(depthCm.replace(/\D/g, ""), 10);
      const countValue = Number.parseInt(count.replace(/\D/g, ""), 10);

      const formData = new FormData();
      formData.append("navn", name.trim());
      formData.append("telefon", phone.trim());
      formData.append("laengdeCm", Number.isFinite(lengthValue) ? String(lengthValue) : "");
      formData.append("dybdeCm", Number.isFinite(depthValue) ? String(depthValue) : "");
      formData.append("antal", Number.isFinite(countValue) ? String(countValue) : "");
      formData.append("edgeImageIndex", edgeImageIndex !== null ? `${edgeImageIndex}` : "");
      formData.append("kitchenImageIndex", kitchenImageIndex !== null ? `${kitchenImageIndex}` : "");
      formData.append("extras", JSON.stringify(extras));

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
          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">Markér kant/ende-billede</p>
            <div className="grid gap-2 text-sm text-muted-foreground">
              {images.map((file, index) => (
                <label key={`edge-${file.name}-${index}`} className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="edgeImage"
                    checked={edgeImageIndex === index}
                    onChange={() => setEdgeImageIndex(index)}
                  />
                  <span>{file.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">2) Størrelse (ca. mål)</h2>
        <p className="text-sm text-muted-foreground">
          Brug ca.-mål. Vi skal blot have en idé om størrelse og omfang for at beregne et AI-estimat.
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          <label className="grid gap-2 text-sm text-foreground">
            Længde (cm)
            <input
              value={lengthCm}
              onChange={(event) => setLengthCm(event.target.value)}
              inputMode="numeric"
              placeholder="fx 280"
              className="h-10 rounded-md border border-border bg-white px-3"
            />
          </label>
          <label className="grid gap-2 text-sm text-foreground">
            Dybde (cm)
            <input
              value={depthCm}
              onChange={(event) => setDepthCm(event.target.value)}
              inputMode="numeric"
              placeholder="fx 60"
              className="h-10 rounded-md border border-border bg-white px-3"
            />
          </label>
          <label className="grid gap-2 text-sm text-foreground">
            Antal bordplader
            <input
              value={count}
              onChange={(event) => setCount(event.target.value)}
              inputMode="numeric"
              placeholder="1"
              className="h-10 rounded-md border border-border bg-white px-3"
            />
          </label>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">3) Kontaktoplysninger</h2>
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

      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-foreground">4) Tilvalg (valgfrit)</h2>
        <p className="text-sm text-muted-foreground">
          Tilføj ekstra flader, hvis du ønsker at få dem vurderet sammen med køkkenbordpladen.
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {EXTRA_OPTIONS.map((option) => (
            <label
              key={option.key}
              className="flex items-center justify-between gap-3 rounded-md border border-border bg-white/90 px-3 py-2 text-sm"
            >
              <span className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={extras[option.key]}
                  onChange={() => toggleExtra(option.key)}
                />
                <span className="font-medium text-foreground">{option.label}</span>
              </span>
              <span className="text-xs text-muted-foreground">{option.priceLabel}</span>
            </label>
          ))}
        </div>
        <label className="grid gap-2 text-sm text-foreground">
          Vandfald (antal)
          <div className="flex items-center gap-3">
            <input
              value={extras.vandfaldCount ? String(extras.vandfaldCount) : ""}
              onChange={(event) => updateVandfaldCount(event.target.value)}
              className="h-10 w-24 rounded-md border border-border bg-white px-3"
              inputMode="numeric"
              placeholder="0"
            />
            <span className="text-xs text-muted-foreground">{VANDFALD_PRICE_LABEL}</span>
          </div>
        </label>
        <p className="text-xs text-muted-foreground">Valgte tilvalg: {extrasSummary}</p>
      </div>

      <div className="space-y-2 rounded-xl border border-border bg-background/60 p-4 text-sm text-muted-foreground">
        <p>Vi sliber kun massive træbordplader. Er du i tvivl, så send billeder alligevel.</p>
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
