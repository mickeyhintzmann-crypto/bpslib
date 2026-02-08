"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  BORDPLADE_TYPE_OPTIONS,
  OVERFLADE_OPTIONS,
  SKADE_OPTIONS,
  TRAESORT_OPTIONS,
  type GatingAnswer
} from "@/lib/estimator";
import { siteConfig } from "@/lib/site-config";
import { trackEvent } from "@/lib/tracking";

const PHONE_TEL = "tel:+45XXXXXXXX";

const gatingOptions: { value: GatingAnswer; label: string }[] = [
  { value: "ja", label: "Ja, massiv træ" },
  { value: "nej", label: "Nej" },
  { value: "ved_ikke", label: "Ved ikke" }
];

const uploadGuide = [
  "Hele bordpladen",
  "Kant/ende (obligatorisk ved Ja/Ved ikke)",
  "Tæt på overfladen",
  "Problemområde",
  "Omkring vask/komfur (hvis relevant)"
];

const signalLabel: Record<string, string> = {
  ridser: "Ridser",
  skjolder_vand: "Skjolder/vand",
  brændemærker: "Brændemærker",
  hakkede_kanter: "Hakkede kanter",
  misfarvning_vask: "Misfarvning ved vask"
};

type FormValues = {
  bordpladeType: string;
  traesort: string;
  overflade: string;
  skader: string[];
  laengdeCm: string;
  dybdeCm: string;
  antal: string;
  postnr: string;
  navn: string;
  telefon: string;
  email: string;
  note: string;
};

const initialValues: FormValues = {
  bordpladeType: "køkken",
  traesort: "ved_ikke",
  overflade: "ukendt",
  skader: [],
  laengdeCm: "",
  dybdeCm: "",
  antal: "1",
  postnr: "",
  navn: "",
  telefon: "",
  email: "",
  note: ""
};

export const EstimatorForm = () => {
  const router = useRouter();

  const [gatingAnswer, setGatingAnswer] = useState<GatingAnswer | null>(null);
  const [allowNoPriceFlow, setAllowNoPriceFlow] = useState(false);
  const [edgeImageIndex, setEdgeImageIndex] = useState<number | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [values, setValues] = useState<FormValues>(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const requiresEdgeImage = gatingAnswer === "ja" || gatingAnswer === "ved_ikke";
  const isNoPriceFlow = gatingAnswer === "nej";
  const formEnabled = gatingAnswer !== null && (!isNoPriceFlow || allowNoPriceFlow);

  const imageCountLabel = useMemo(() => `${images.length} billeder valgt`, [images.length]);

  const updateValue = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const toggleDamage = (damage: string) => {
    setValues((prev) => ({
      ...prev,
      skader: prev.skader.includes(damage)
        ? prev.skader.filter((item) => item !== damage)
        : [...prev.skader, damage]
    }));
  };

  const onImageChange = (files: FileList | null) => {
    if (!files) {
      setImages([]);
      setEdgeImageIndex(null);
      return;
    }

    const next = Array.from(files).slice(0, 6);
    setImages(next);

    if (edgeImageIndex !== null && edgeImageIndex >= next.length) {
      setEdgeImageIndex(null);
    }
  };

  const validate = () => {
    if (!gatingAnswer) {
      return "Vælg først om bordpladen er massiv træ, ikke massiv eller ved ikke.";
    }

    if (!formEnabled) {
      return "Aktivér vurdering uden pris, hvis du vil sende billeder alligevel.";
    }

    if (images.length < 3 || images.length > 6) {
      return "Upload 3 til 6 billeder for at fortsætte.";
    }

    if (requiresEdgeImage && (edgeImageIndex === null || edgeImageIndex < 0 || edgeImageIndex >= images.length)) {
      return "Markér hvilket billede der viser kant/ende.";
    }

    if (!/^\d{4}$/.test(values.postnr)) {
      return "Postnr skal være 4 tal.";
    }

    if (!values.navn.trim() || !values.telefon.trim() || !values.email.trim()) {
      return "Navn, telefon og email er obligatoriske.";
    }

    const lengthValue = Number(values.laengdeCm);
    const depthValue = Number(values.dybdeCm);

    if (!Number.isFinite(lengthValue) || lengthValue <= 0 || !Number.isFinite(depthValue) || depthValue <= 0) {
      return "Indtast gyldig længde og dybde i cm.";
    }

    return null;
  };

  const submit = async () => {
    const validationError = validate();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    if (!gatingAnswer) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("gatingAnswer", gatingAnswer);
      formData.append("edgeImageIndex", edgeImageIndex !== null ? `${edgeImageIndex}` : "");
      formData.append("noPrice", isNoPriceFlow ? "true" : "false");
      formData.append("bordpladeType", values.bordpladeType);
      formData.append("traesort", values.traesort);
      formData.append("overflade", values.overflade);
      formData.append("skader", JSON.stringify(values.skader));
      formData.append("laengdeCm", values.laengdeCm);
      formData.append("dybdeCm", values.dybdeCm);
      formData.append("antal", values.antal);
      formData.append("postnr", values.postnr);
      formData.append("navn", values.navn);
      formData.append("telefon", values.telefon);
      formData.append("email", values.email);
      formData.append("note", values.note);

      images.forEach((file) => formData.append("images", file));

      const response = await fetch("/api/estimator/submit", {
        method: "POST",
        body: formData
      });

      const payload = (await response.json()) as { id?: string; message?: string };

      if (!response.ok || !payload.id) {
        setErrorMessage(payload.message || "Kunne ikke sende vurderingen. Prøv igen.");
        return;
      }

      trackEvent("estimator_submit", {
        source: "prisberegner_submit",
        no_price: isNoPriceFlow
      });

      router.push(`/bordpladeslibning/prisberegner/tak?id=${payload.id}`);
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
        <h2 className="text-xl font-semibold text-foreground">1) Er bordpladen massiv træ?</h2>
        <p className="text-sm text-muted-foreground">Vælg først materiale. Formularen kan udfyldes på under 60 sekunder.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {gatingOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => {
              setGatingAnswer(option.value);
              setErrorMessage("");
            }}
            className={`rounded-xl border px-4 py-4 text-left text-sm ${
              gatingAnswer === option.value ? "border-primary bg-primary/5" : "border-border"
            }`}
          >
            <p className="font-semibold text-foreground">{option.label}</p>
          </button>
        ))}
      </div>

      {isNoPriceFlow ? (
        <div className="rounded-xl border border-border bg-background/60 p-4 text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">Vi sliber kun massive træbordplader.</p>
          <p className="mt-2">Du kan stadig sende en forespørgsel uden prisvurdering, eller gå direkte videre her:</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/tilbudstid">Uforpligtende tilbudstid</Link>
            </Button>
            <Button asChild variant="outline">
              <a
                href={PHONE_TEL}
                onClick={() => {
                  trackEvent("call_click", { source: "prisberegner_gating_nej" });
                }}
              >
                Ring mig op
              </a>
            </Button>
          </div>
          <label className="mt-4 flex items-start gap-3">
            <input
              type="checkbox"
              checked={allowNoPriceFlow}
              onChange={(event) => setAllowNoPriceFlow(event.target.checked)}
              className="mt-1"
            />
            <span>Jeg vil sende billeder til vurdering uden pris.</span>
          </label>
        </div>
      ) : null}

      {formEnabled ? (
        <>
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">2) Upload billeder (3–6)</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {uploadGuide.map((item, index) => (
                <li key={item}>
                  {index + 1}. {item}
                </li>
              ))}
            </ul>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(event) => onImageChange(event.target.files)}
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
            />
            <p className="text-xs text-muted-foreground">{imageCountLabel}</p>

            {images.length > 0 ? (
              <div className="space-y-2 rounded-xl border border-border bg-background/60 p-3">
                <p className="text-sm font-medium text-foreground">
                  Markér kant/ende-billede {requiresEdgeImage ? "(obligatorisk)" : "(valgfrit)"}
                </p>
                <div className="grid gap-2 text-sm text-muted-foreground">
                  {images.map((file, index) => (
                    <label key={`${file.name}-${index}`} className="flex items-center gap-3">
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
            ) : null}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">3) Opgaveoplysninger</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm text-foreground">
                Bordplade-type
                <select
                  value={values.bordpladeType}
                  onChange={(event) => updateValue("bordpladeType", event.target.value)}
                  className="h-10 rounded-md border border-border bg-white px-3"
                >
                  {BORDPLADE_TYPE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm text-foreground">
                Træsort (valgfri)
                <select
                  value={values.traesort}
                  onChange={(event) => updateValue("traesort", event.target.value)}
                  className="h-10 rounded-md border border-border bg-white px-3"
                >
                  {TRAESORT_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option.replace("_", " ").charAt(0).toUpperCase() + option.replace("_", " ").slice(1)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm text-foreground">
                Nuværende overflade
                <select
                  value={values.overflade}
                  onChange={(event) => updateValue("overflade", event.target.value)}
                  className="h-10 rounded-md border border-border bg-white px-3"
                >
                  {OVERFLADE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm text-foreground">
                Antal bordplader
                <select
                  value={values.antal}
                  onChange={(event) => updateValue("antal", event.target.value)}
                  className="h-10 rounded-md border border-border bg-white px-3"
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3+">3+</option>
                </select>
              </label>
              <label className="grid gap-2 text-sm text-foreground">
                Længde (cm)
                <input
                  value={values.laengdeCm}
                  onChange={(event) => updateValue("laengdeCm", event.target.value.replace(/\D/g, ""))}
                  className="h-10 rounded-md border border-border bg-white px-3"
                  inputMode="numeric"
                />
              </label>
              <label className="grid gap-2 text-sm text-foreground">
                Dybde (cm)
                <input
                  value={values.dybdeCm}
                  onChange={(event) => updateValue("dybdeCm", event.target.value.replace(/\D/g, ""))}
                  className="h-10 rounded-md border border-border bg-white px-3"
                  inputMode="numeric"
                />
              </label>
              <label className="grid gap-2 text-sm text-foreground">
                Postnr.
                <input
                  value={values.postnr}
                  onChange={(event) => updateValue("postnr", event.target.value.replace(/\D/g, "").slice(0, 4))}
                  className="h-10 rounded-md border border-border bg-white px-3"
                  inputMode="numeric"
                />
              </label>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">4) Skader</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {SKADE_OPTIONS.map((damage) => (
                <label key={damage} className="flex items-center gap-3 rounded-md border border-border px-3 py-2 text-sm">
                  <input
                    type="checkbox"
                    checked={values.skader.includes(damage)}
                    onChange={() => toggleDamage(damage)}
                  />
                  <span>{signalLabel[damage]}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">5) Kontaktoplysninger</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm text-foreground">
                Navn
                <input
                  value={values.navn}
                  onChange={(event) => updateValue("navn", event.target.value)}
                  className="h-10 rounded-md border border-border bg-white px-3"
                />
              </label>
              <label className="grid gap-2 text-sm text-foreground">
                Telefon
                <input
                  value={values.telefon}
                  onChange={(event) => updateValue("telefon", event.target.value)}
                  className="h-10 rounded-md border border-border bg-white px-3"
                />
              </label>
              <label className="grid gap-2 text-sm text-foreground md:col-span-2">
                Email
                <input
                  value={values.email}
                  onChange={(event) => updateValue("email", event.target.value)}
                  className="h-10 rounded-md border border-border bg-white px-3"
                  type="email"
                />
              </label>
              <label className="grid gap-2 text-sm text-foreground md:col-span-2">
                Note (valgfri)
                <textarea
                  value={values.note}
                  onChange={(event) => updateValue("note", event.target.value)}
                  className="min-h-24 rounded-md border border-border bg-white px-3 py-2"
                />
              </label>
            </div>
          </div>

          <div className="space-y-2 rounded-xl border border-border bg-background/60 p-4 text-sm text-muted-foreground">
            <p>Billeder bruges kun til vurdering af opgaven.</p>
            <p>Slettes automatisk efter {siteConfig.estimatorRetentionDays} dage.</p>
            <Link href="/privatlivspolitik" className="font-semibold text-primary">
              Læs privatlivspolitik
            </Link>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={submit} disabled={isSubmitting}>
              {isSubmitting ? "Sender..." : "Send til vurdering"}
            </Button>
            <Button asChild variant="outline">
              <Link href="/bordpladeslibning/book">Book tid i stedet</Link>
            </Button>
          </div>
        </>
      ) : null}

      {errorMessage ? <p className="text-sm font-medium text-red-700">{errorMessage}</p> : null}
    </section>
  );
};
