"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MIN_IMAGES = 1;
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
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [label, setLabel] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const imageCountLabel = useMemo(() => `${images.length} billeder valgt`, [images.length]);

  const onImageChange = (files: FileList | null) => {
    if (!files) {
      setImages([]);
      return;
    }
    const next = Array.from(files)
      .filter((file) => file.size > 0)
      .slice(0, MAX_IMAGES);
    setImages(next);
  };
  const validate = () => {
    if (images.length < MIN_IMAGES || images.length > MAX_IMAGES) {
      return "Upload 1 til 6 billeder for at fortsætte.";
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
      setPriceMin("");
      setPriceMax("");
      setLabel("");
      setNote("");
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
          Upload 1 billede pr. bordplade, så AI-estimatoren lærer ud fra rigtige cases. Hvert billede
          skal vise hele bordpladen.
        </p>
      </div>

      {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}
      {message ? <p className="text-sm font-medium text-emerald-700">{message}</p> : null}

      <div className="space-y-3 rounded-xl border border-border bg-background/70 p-4">
        <h2 className="text-base font-semibold text-foreground">1) Upload billeder</h2>
        <p className="text-xs text-muted-foreground">
          Upload 1 billede pr. bordplade. Har du 2 bordplader? Upload 2 billeder.
        </p>
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
        {images.length > 1 ? (
          <p className="text-xs text-muted-foreground">
            Tjek at du ikke har uploadet samme bordplade to gange.
          </p>
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

      <Button onClick={submit} disabled={saving}>
        {saving ? "Uploader..." : "Gem træningscase"}
      </Button>
    </section>
  );
};
