"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";

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
const SERVICE_OPTIONS = [
  { value: "gulvafslibning", label: "Gulvafslibning" },
  { value: "bordplade", label: "Bordplade" }
] as const;
const FLOOR_CONDITION_OPTIONS = [
  { value: "let", label: "Let slid" },
  { value: "middel", label: "Middel slid" },
  { value: "kraftig", label: "Kraftig slid/skader" }
] as const;
const FLOOR_TREATMENT_OPTIONS = [
  { value: "lak", label: "Lak" },
  { value: "olie", label: "Olie" },
  { value: "saebe", label: "Sæbe" },
  { value: "ukendt", label: "Ukendt" }
] as const;
const PROPERTY_TYPE_OPTIONS = [
  { value: "hus", label: "Hus" },
  { value: "lejlighed", label: "Lejlighed" }
] as const;

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
  const [service, setService] = useState<(typeof SERVICE_OPTIONS)[number]["value"]>("gulvafslibning");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [areaM2, setAreaM2] = useState("");
  const [description, setDescription] = useState("");
  const [floorCondition, setFloorCondition] = useState<(typeof FLOOR_CONDITION_OPTIONS)[number]["value"]>("middel");
  const [floorTreatment, setFloorTreatment] = useState<(typeof FLOOR_TREATMENT_OPTIONS)[number]["value"]>("ukendt");
  const [postalCode, setPostalCode] = useState("");
  const [propertyType, setPropertyType] = useState<(typeof PROPERTY_TYPE_OPTIONS)[number]["value"]>("hus");
  const [apartmentFloor, setApartmentFloor] = useState("");
  const [hasDoorThresholds, setHasDoorThresholds] = useState(false);
  const [doorThresholdCount, setDoorThresholdCount] = useState("");
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
    const minValue = parseNumber(priceMin);
    const maxValue = parseNumber(priceMax);

    if (!minValue || !maxValue) {
      return "Angiv prisinterval (min/max).";
    }
    if (minValue > maxValue) {
      return "Prisinterval: min må ikke være større end max.";
    }
    if (service === "gulvafslibning") {
      const m2 = Number.parseFloat(areaM2.replace(",", "."));
      if (!Number.isFinite(m2) || m2 <= 0) {
        return "Angiv gyldigt m2 for gulv-træning.";
      }
      if (!description.trim()) {
        return "Tilføj kort beskrivelse (træsort, behandling, stand).";
      }
      if (!floorCondition) {
        return "Vælg gulvets tilstand.";
      }
      if (!floorTreatment) {
        return "Vælg nuværende behandling.";
      }
      if (!/^\d{4}$/.test(postalCode.trim())) {
        return "Angiv gyldigt postnummer (4 cifre).";
      }
      if (!propertyType) {
        return "Vælg boligtype (hus/lejlighed).";
      }
      if (propertyType === "lejlighed" && !apartmentFloor.trim()) {
        return "Angiv sal for lejlighed.";
      }
      if (hasDoorThresholds) {
        const thresholdCount = Number.parseInt(doorThresholdCount.trim(), 10);
        if (!Number.isFinite(thresholdCount) || thresholdCount < 1 || thresholdCount > 30) {
          return "Angiv antal dørtrin (1-30).";
        }
      }
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
      formData.append("service", service);
      formData.append("priceMin", String(parseNumber(priceMin) ?? ""));
      formData.append("priceMax", String(parseNumber(priceMax) ?? ""));
      formData.append("areaM2", areaM2.trim());
      formData.append("description", description.trim());
      formData.append("floorCondition", floorCondition);
      formData.append("floorTreatment", floorTreatment);
      formData.append("postalCode", postalCode.trim());
      formData.append("propertyType", propertyType);
      formData.append("apartmentFloor", apartmentFloor.trim());
      formData.append("hasDoorThresholds", hasDoorThresholds ? "true" : "false");
      formData.append("doorThresholdCount", doorThresholdCount.trim());
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
      setAreaM2("");
      setDescription("");
      setFloorCondition("middel");
      setFloorTreatment("ukendt");
      setPostalCode("");
      setPropertyType("hus");
      setApartmentFloor("");
      setHasDoorThresholds(false);
      setDoorThresholdCount("");
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
          Manuel træningsupload. Data bruges kun inden for valgt service, så gulv-træning påvirker ikke
          bordplade-estimatoren.
        </p>
      </div>

      {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}
      {message ? <p className="text-sm font-medium text-emerald-700">{message}</p> : null}

      <div className="space-y-3 rounded-xl border border-border bg-background/70 p-4">
        <label className="grid gap-2 text-sm text-foreground">
          Service
          <select
            value={service}
            onChange={(event) => setService(event.target.value as (typeof SERVICE_OPTIONS)[number]["value"])}
            className="h-10 rounded-md border border-border bg-white px-3"
          >
            {SERVICE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <h2 className="text-base font-semibold text-foreground">1) Upload billeder</h2>
        <p className="text-xs text-muted-foreground">
          Upload 1-6 billeder pr. træningscase. Brug realistiske billeder fra udførte opgaver.
        </p>
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
        <p className="text-xs text-muted-foreground">{imageCountLabel}</p>
        {images.length > 1 ? (
          <p className="text-xs text-muted-foreground">
            Tjek at du ikke har uploadet samme bordplade to gange.
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 rounded-xl border border-border bg-background/70 p-4 md:grid-cols-2">
        {service === "gulvafslibning" ? (
          <label className="grid gap-2 text-sm text-foreground">
            Gulvets tilstand
            <select
              value={floorCondition}
              onChange={(event) =>
                setFloorCondition(event.target.value as (typeof FLOOR_CONDITION_OPTIONS)[number]["value"])
              }
              className="h-10 rounded-md border border-border bg-white px-3"
            >
              {FLOOR_CONDITION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        {service === "gulvafslibning" ? (
          <label className="grid gap-2 text-sm text-foreground">
            Nuværende behandling
            <select
              value={floorTreatment}
              onChange={(event) =>
                setFloorTreatment(event.target.value as (typeof FLOOR_TREATMENT_OPTIONS)[number]["value"])
              }
              className="h-10 rounded-md border border-border bg-white px-3"
            >
              {FLOOR_TREATMENT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        {service === "gulvafslibning" ? (
          <label className="grid gap-2 text-sm text-foreground">
            Areal (m2)
            <input
              value={areaM2}
              onChange={(event) => setAreaM2(event.target.value)}
              inputMode="decimal"
              className="h-10 rounded-md border border-border bg-white px-3"
              placeholder="fx 42.5"
            />
          </label>
        ) : null}
        {service === "gulvafslibning" ? (
          <label className="grid gap-2 text-sm text-foreground">
            Postnummer
            <input
              value={postalCode}
              onChange={(event) => setPostalCode(event.target.value)}
              inputMode="numeric"
              className="h-10 rounded-md border border-border bg-white px-3"
              placeholder="fx 2100"
            />
          </label>
        ) : null}
        {service === "gulvafslibning" ? (
          <label className="grid gap-2 text-sm text-foreground">
            Boligtype
            <select
              value={propertyType}
              onChange={(event) =>
                setPropertyType(event.target.value as (typeof PROPERTY_TYPE_OPTIONS)[number]["value"])
              }
              className="h-10 rounded-md border border-border bg-white px-3"
            >
              {PROPERTY_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        {service === "gulvafslibning" && propertyType === "lejlighed" ? (
          <label className="grid gap-2 text-sm text-foreground">
            Sal
            <input
              value={apartmentFloor}
              onChange={(event) => setApartmentFloor(event.target.value)}
              className="h-10 rounded-md border border-border bg-white px-3"
              placeholder="fx 3. sal"
            />
          </label>
        ) : null}
        {service === "gulvafslibning" ? (
          <label className="grid gap-2 text-sm text-foreground">
            Dørtrin
            <select
              value={hasDoorThresholds ? "ja" : "nej"}
              onChange={(event) => setHasDoorThresholds(event.target.value === "ja")}
              className="h-10 rounded-md border border-border bg-white px-3"
            >
              <option value="nej">Nej</option>
              <option value="ja">Ja</option>
            </select>
          </label>
        ) : null}
        {service === "gulvafslibning" && hasDoorThresholds ? (
          <label className="grid gap-2 text-sm text-foreground">
            Antal dørtrin
            <input
              value={doorThresholdCount}
              onChange={(event) => setDoorThresholdCount(event.target.value)}
              inputMode="numeric"
              className="h-10 rounded-md border border-border bg-white px-3"
              placeholder="fx 6"
            />
          </label>
        ) : null}
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
          Beskrivelse {service === "gulvafslibning" ? "(påkrævet)" : "(valgfri)"}
          <input
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="h-10 rounded-md border border-border bg-white px-3"
            placeholder="fx Fyrretræ, lakeret, dybe ridser, 42 m2 stue/gang"
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
