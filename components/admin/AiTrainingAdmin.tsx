"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  EXTRA_OPTIONS,
  VANDFALD_PRICE_LABEL,
  defaultBordpladeExtras,
  formatExtrasSummary,
  type BordpladeExtras
} from "@/lib/bordplade/extras";

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MIN_IMAGES = 3;
const MAX_IMAGES = 6;
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_TOTAL_UPLOAD_BYTES = 20 * 1024 * 1024;

const parseNumber = (value: string) => {
  const normalized = value.replace(",", ".").replace(/[^0-9.]/g, "");
  const parsed = Number.parseFloat(normalized);
  if (!Number.isFinite(parsed)) {
    return null;
  }
  return Math.round(parsed);
};

export const AiTrainingAdmin = () => {
  const [images, setImages] = useState<File[]>([]);
  const [kitchenImageIndex, setKitchenImageIndex] = useState<number | null>(null);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [label, setLabel] = useState("");
  const [note, setNote] = useState("");
  const [extras, setExtras] = useState<BordpladeExtras>(defaultBordpladeExtras);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const imageCountLabel = useMemo(() => `${images.length} billeder valgt`, [images.length]);
  const extrasSummary = useMemo(() => formatExtrasSummary(extras), [extras]);

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

  const validate = () => {
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
    const minValue = parseNumber(priceMin);
    const maxValue = parseNumber(priceMax);

    if (!minValue || !maxValue) {
      return "Angiv prisinterval (min/max).";
    }
    if (minValue > maxValue) {
      return "Prisinterval: min må ikke være større end max.";
    }

    return null;
  };

  const submit = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("priceMin", String(parseNumber(priceMin) ?? ""));
      formData.append("priceMax", String(parseNumber(priceMax) ?? ""));
      formData.append("label", label.trim());
      formData.append("note", note.trim());
      formData.append("kitchenImageIndex", kitchenImageIndex !== null ? `${kitchenImageIndex}` : "");
      formData.append("extras", JSON.stringify(extras));

      images.forEach((file) => formData.append("images", file));

      const response = await fetch("/api/admin/ai-training", {
        method: "POST",
        body: formData
      });

      const payload = (await response.json()) as { id?: string; message?: string };
      if (!response.ok || !payload.id) {
        setError(payload.message || "Kunne ikke gemme træningscase.");
        return;
      }

      setMessage(`Træningscase gemt (id: ${payload.id}).`);
      setImages([]);
      setKitchenImageIndex(null);
      setPriceMin("");
      setPriceMax("");
      setLabel("");
      setNote("");
      setExtras(defaultBordpladeExtras);
    } catch (submitError) {
      console.error(submitError);
      setError("Uventet fejl under upload.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-6 rounded-2xl border border-border/70 bg-white/70 p-6 md:p-8">
      <div>
        <h1 className="font-display text-3xl font-semibold text-foreground">AI træning</h1>
        <p className="text-sm text-muted-foreground">
          Upload billeder og pris, så AI-estimatoren lærer ud fra rigtige cases. Kræver hel
          køkkenbillede.
        </p>
      </div>

      {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}
      {message ? <p className="text-sm font-medium text-emerald-700">{message}</p> : null}

      <div className="space-y-3 rounded-xl border border-border bg-background/70 p-4">
        <h2 className="text-base font-semibold text-foreground">1) Upload billeder</h2>
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
          <div className="grid gap-4 rounded-xl border border-border bg-white/70 p-4">
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
      </div>

      <div className="grid gap-4 rounded-xl border border-border bg-background/70 p-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm text-foreground">
          Pris min (kr)
          <input
            value={priceMin}
            onChange={(event) => setPriceMin(event.target.value)}
            inputMode="numeric"
            className="h-10 rounded-md border border-border bg-white px-3"
          />
        </label>
        <label className="grid gap-2 text-sm text-foreground">
          Pris max (kr)
          <input
            value={priceMax}
            onChange={(event) => setPriceMax(event.target.value)}
            inputMode="numeric"
            className="h-10 rounded-md border border-border bg-white px-3"
          />
        </label>
        <label className="grid gap-2 text-sm text-foreground">
          Kort label (valgfri)
          <input
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            className="h-10 rounded-md border border-border bg-white px-3"
            placeholder="fx Træning køkken 1"
          />
        </label>
        <label className="grid gap-2 text-sm text-foreground md:col-span-3">
          Note (valgfri)
          <input
            value={note}
            onChange={(event) => setNote(event.target.value)}
            className="h-10 rounded-md border border-border bg-white px-3"
          />
        </label>
      </div>

      <div className="space-y-3 rounded-xl border border-border bg-background/70 p-4">
        <h2 className="text-base font-semibold text-foreground">Tilvalg</h2>
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

      <Button onClick={submit} disabled={saving}>
        {saving ? "Uploader..." : "Gem træningscase"}
      </Button>
    </section>
  );
};
