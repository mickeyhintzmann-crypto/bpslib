"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getAreas, getAreaBySlug } from "@/lib/areas";
import { defaultConsentState } from "@/lib/consent";
import type { PageContext } from "@/lib/tracking";
import {
  buildTrackingParams,
  getPersistedUtm,
  persistUtmFromUrl,
  pushEvent
} from "@/lib/tracking";
import { calculateLeadScore } from "@/lib/leads/score";
import { LeadSchema, type LeadFormData } from "@/lib/leads/schema";
import type { PageSource } from "@/lib/page-context";
import { publicEnv } from "@/lib/env.public";
import { useConsent } from "@/components/consent/consent-provider";
import { TurnstileWidget } from "@/components/lead/turnstile-widget";

const mustHaveOptions = [
  "sea view",
  "parking",
  "pool",
  "walkable",
  "new build",
  "gated",
  "terrace",
  "quiet street",
  "near beach",
  "gym"
];

const timelineOptions: LeadFormData["timeline"][] = [
  "0-1m",
  "1-3m",
  "3-6m",
  "6-12m"
];

const financingOptions: LeadFormData["financing"][] = ["cash", "pre-approval", "unknown"];
const purposeOptions: LeadFormData["purpose"][] = ["live", "holiday", "investment"];
const contactOptions: LeadFormData["preferred_contact"][] = ["whatsapp", "phone", "email"];

export function LeadForm({
  defaultAreas,
  pageContext,
  pageSource,
  onSuccess
}: {
  defaultAreas: string[];
  pageContext: PageContext;
  pageSource: PageSource;
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const { consent } = useConsent();
  const turnstileSiteKey = publicEnv.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const [step, setStep] = useState<1 | 2>(1);
  const [formState, setFormState] = useState<LeadFormData>({
    name: "",
    email: "",
    phone: "",
    preferred_contact: "whatsapp",
    areas: defaultAreas.length ? defaultAreas : [],
    budget_band: "",
    budget_min: undefined,
    budget_max: undefined,
    timeline: "1-3m",
    financing: "unknown",
    purpose: "live",
    must_haves: [],
    notes: "",
    company: "",
    turnstile_token: "",
    page: {
      page_type: pageSource.page_type,
      area: pageSource.area,
      intent: pageSource.intent,
      path: typeof window !== "undefined" ? window.location.pathname : undefined
    },
    utm: getPersistedUtm()
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const startedRef = useRef(false);
  const submitRef = useRef(false);
  const leadSubmitSuccessRef = useRef(false);

  const areas = getAreas();
  const selectedArea = useMemo(() => {
    if (formState.areas.length) {
      return getAreaBySlug(formState.areas[0]);
    }
    return areas[0];
  }, [formState.areas, areas]);

  const budgetBands = selectedArea?.budgetRanges ?? [];

  useEffect(() => {
    if (typeof window === "undefined") return;
    const { company, turnstile_token, ...rest } = formState;
    window.localStorage.setItem("lead_machine_lead_draft", JSON.stringify(rest));
  }, [formState]);

  function handleStart() {
    if (startedRef.current) return;
    startedRef.current = true;
    pushEvent("form_start", buildTrackingParams(pageContext, getPersistedUtm()));
  }

  function toggleArea(slug: string) {
    handleStart();
    setFormState((prev) => {
      const exists = prev.areas.includes(slug);
      const updated = exists
        ? prev.areas.filter((area) => area !== slug)
        : [...prev.areas, slug];
      return { ...prev, areas: updated };
    });
  }

  function toggleMustHave(item: string) {
    handleStart();
    setFormState((prev) => {
      const exists = prev.must_haves?.includes(item);
      const updated = exists
        ? prev.must_haves?.filter((value) => value !== item) ?? []
        : [...(prev.must_haves ?? []), item];
      return { ...prev, must_haves: updated };
    });
  }

  function setBudgetBand(label: string, min?: number, max?: number) {
    handleStart();
    setFormState((prev) => ({
      ...prev,
      budget_band: label,
      budget_min: min,
      budget_max: max
    }));
  }

  function updateField<T extends keyof LeadFormData>(key: T, value: LeadFormData[T]) {
    handleStart();
    setFormState((prev) => ({
      ...prev,
      [key]: value
    }));
  }

  function canProceedStep1() {
    return (
      formState.areas.length > 0 &&
      Boolean(formState.budget_band) &&
      Boolean(formState.timeline) &&
      Boolean(formState.purpose)
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (submitRef.current) return;
    submitRef.current = true;

    persistUtmFromUrl();
    const attribution = getPersistedUtm();
    pushEvent("lead_submit", buildTrackingParams(pageContext, attribution));

    const consentState = consent ?? defaultConsentState();
    const payload: LeadFormData = {
      ...formState,
      page: {
        ...formState.page,
        page_type: pageSource.page_type,
        area: pageSource.area,
        intent: pageSource.intent,
        path: typeof window !== "undefined" ? window.location.pathname : undefined
      },
      utm: attribution,
      consent: consentState
    };

    const parsed = LeadSchema.safeParse(payload);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check your inputs.");
      submitRef.current = false;
      return;
    }

    const leadScore = calculateLeadScore(parsed.data);
    const idempotencyKey = typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey
        },
        body: JSON.stringify(parsed.data)
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Something went wrong. Please try again.");
      }

      if (!leadSubmitSuccessRef.current) {
        const conversionValue =
          leadScore >= 80 ? 300 : leadScore >= 60 ? 200 : leadScore >= 40 ? 100 : 50;
        leadSubmitSuccessRef.current = true;
        pushEvent("lead_submit_success", {
          ...buildTrackingParams(pageContext, attribution),
          lead_score: leadScore,
          conversion_value_eur: conversionValue
        });
      }

      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(
          "lead_machine_last_lead",
          JSON.stringify(parsed.data)
        );
      }

      onSuccess?.();
      router.push("/thank-you");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Submission failed.";
      setError(message);
    } finally {
      setIsSubmitting(false);
      submitRef.current = false;
      leadSubmitSuccessRef.current = false;
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Step {step} of 2</p>
        <h2 className="mt-3 font-display text-3xl">Get a curated shortlist in 24 hours</h2>
        <p className="mt-2 text-sm text-neutral-600">
          Share your criteria and we’ll respond fast. No spam.
        </p>
      </div>

      {step === 1 ? (
        <div className="space-y-6">
          <div className="space-y-3">
            <Label>Areas of interest</Label>
            <div className="flex flex-wrap gap-2">
              {areas.map((area) => {
                const active = formState.areas.includes(area.slug);
                return (
                  <button
                    key={area.slug}
                    type="button"
                    onClick={() => toggleArea(area.slug)}
                    className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.2em] transition ${
                      active
                        ? "border-neutral-900 bg-neutral-900 text-white"
                        : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400"
                    }`}
                  >
                    {area.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Budget band</Label>
            <div className="grid gap-3 md:grid-cols-3">
              {budgetBands.map((band) => (
                <button
                  key={band.label}
                  type="button"
                  onClick={() => setBudgetBand(band.label, band.min, band.max)}
                  className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                    formState.budget_band === band.label
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400"
                  }`}
                >
                  <p className="font-medium">{band.label}</p>
                  <p className="mt-2 text-xs text-neutral-400">
                    {band.max ? "Guided range" : "Prime range"}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <Label>Timeline</Label>
              <div className="flex flex-wrap gap-2">
                {timelineOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => updateField("timeline", option)}
                    className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.2em] transition ${
                      formState.timeline === option
                        ? "border-neutral-900 bg-neutral-900 text-white"
                        : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <Label>Purpose</Label>
              <div className="flex flex-wrap gap-2">
                {purposeOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => updateField("purpose", option)}
                    className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.2em] transition ${
                      formState.purpose === option
                        ? "border-neutral-900 bg-neutral-900 text-white"
                        : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-neutral-500">No spam. We reply fast.</p>
            <Button
              type="button"
              onClick={() => setStep(2)}
              disabled={!canProceedStep1()}
            >
              Continue
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formState.name}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="Your full name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formState.email}
                onChange={(event) => updateField("email", event.target.value)}
                placeholder="you@email.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formState.phone}
                onChange={(event) => updateField("phone", event.target.value)}
                placeholder="+34"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Preferred contact</Label>
              <div className="flex flex-wrap gap-2">
                {contactOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => updateField("preferred_contact", option)}
                    className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.2em] transition ${
                      formState.preferred_contact === option
                        ? "border-neutral-900 bg-neutral-900 text-white"
                        : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <Label>Financing</Label>
              <div className="flex flex-wrap gap-2">
                {financingOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => updateField("financing", option)}
                    className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.2em] transition ${
                      formState.financing === option
                        ? "border-neutral-900 bg-neutral-900 text-white"
                        : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <Label>Must-haves</Label>
              <div className="flex flex-wrap gap-2">
                {mustHaveOptions.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleMustHave(item)}
                    className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.2em] transition ${
                      formState.must_haves?.includes(item)
                        ? "border-neutral-900 bg-neutral-900 text-white"
                        : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formState.notes}
              onChange={(event) => updateField("notes", event.target.value)}
              placeholder="Anything else we should know?"
            />
          </div>

          <div className="hidden">
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              value={formState.company ?? ""}
              onChange={(event) => updateField("company", event.target.value)}
              placeholder="Leave this field empty"
              autoComplete="off"
              tabIndex={-1}
              aria-hidden="true"
            />
          </div>

          {turnstileSiteKey ? (
            <div className="rounded-2xl border border-neutral-200 bg-white p-4">
              <TurnstileWidget
                siteKey={turnstileSiteKey}
                onToken={(token) => updateField("turnstile_token", token)}
              />
            </div>
          ) : null}

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <div className="flex items-center justify-between">
            <Button type="button" variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Get my shortlist"}
            </Button>
          </div>
          <p className="text-xs text-neutral-500">No spam. We reply fast.</p>
        </div>
      )}
    </form>
  );
}
