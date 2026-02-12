"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

const DEFAULT_SETTINGS = {
  enabled: true,
  price: 3000,
  windowDays: 14
};

const DEFAULT_AI_SETTINGS = {
  enabled: true,
  minSamples: 1,
  interval: 300,
  minPrice: 3000,
  maxPrice: 5000
};

type SettingsResponse = {
  item?: {
    enabled: boolean;
    price: number;
    windowDays: number;
  };
  message?: string;
};

type AiSettingsResponse = {
  item?: typeof DEFAULT_AI_SETTINGS;
  message?: string;
};

export const SettingsAdmin = () => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [aiSettings, setAiSettings] = useState(DEFAULT_AI_SETTINGS);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [aiSaving, setAiSaving] = useState(false);
  const [error, setError] = useState("");
  const [aiError, setAiError] = useState("");
  const [message, setMessage] = useState("");
  const [aiMessage, setAiMessage] = useState("");

  const loadSettings = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const [acuteResponse, aiResponse] = await Promise.all([
        fetch("/api/admin/settings/acute", { cache: "no-store" }),
        fetch("/api/admin/settings/estimator-ai", { cache: "no-store" })
      ]);

      const acutePayload = (await acuteResponse.json()) as SettingsResponse;
      const aiPayload = (await aiResponse.json()) as AiSettingsResponse;

      if (!acuteResponse.ok || !acutePayload.item) {
        setError(acutePayload.message || "Kunne ikke hente indstillinger.");
      } else {
        setSettings(acutePayload.item);
      }

      if (!aiResponse.ok || !aiPayload.item) {
        setAiError(aiPayload.message || "Kunne ikke hente AI-indstillinger.");
      } else {
        setAiSettings(aiPayload.item);
      }
    } catch (fetchError) {
      console.error(fetchError);
      setError("Netværksfejl ved hentning af indstillinger.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveSettings = async () => {
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/admin/settings/acute", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(settings)
      });

      const payload = (await response.json()) as SettingsResponse;
      if (!response.ok || !payload.item) {
        setError(payload.message || "Kunne ikke gemme indstillinger.");
        return;
      }

      setSettings(payload.item);
      setMessage("Gemt.");
    } catch (saveError) {
      console.error(saveError);
      setError("Netværksfejl ved gemning.");
    } finally {
      setSaving(false);
    }
  };

  const saveAiSettings = async () => {
    setAiSaving(true);
    setAiError("");
    setAiMessage("");

    try {
      const response = await fetch("/api/admin/settings/estimator-ai", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ enabled: aiSettings.enabled })
      });

      const payload = (await response.json()) as AiSettingsResponse;
      if (!response.ok || !payload.item) {
        setAiError(payload.message || "Kunne ikke gemme AI-indstillinger.");
        return;
      }

      setAiSettings(payload.item);
      setAiMessage("Gemt.");
    } catch (saveError) {
      console.error(saveError);
      setAiError("Netværksfejl ved gemning.");
    } finally {
      setAiSaving(false);
    }
  };

  return (
    <section className="space-y-6 rounded-2xl border border-border/70 bg-white/70 p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-foreground">Indstillinger</h1>
          <p className="text-sm text-muted-foreground">Styr akutte tider inden DNS.</p>
        </div>
        <Button onClick={() => loadSettings()} disabled={loading}>
          {loading ? "Henter..." : "Opdater"}
        </Button>
      </div>

      {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}
      {message ? <p className="text-sm font-medium text-emerald-700">{message}</p> : null}

      <div className="space-y-4 rounded-xl border border-border bg-background/70 p-4">
        <label className="flex items-center gap-3 text-sm font-medium text-foreground">
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={(event) => setSettings((prev) => ({ ...prev, enabled: event.target.checked }))}
          />
          Akutte tider aktiveret
        </label>

        <label className="grid gap-2 text-sm text-foreground">
          Pris
          <input
            type="number"
            min={0}
            value={settings.price}
            onChange={(event) =>
              setSettings((prev) => ({ ...prev, price: Number.parseInt(event.target.value || "0", 10) || 0 }))
            }
            className="h-10 rounded-md border border-border bg-white px-3 text-sm"
          />
        </label>

        <label className="grid gap-2 text-sm text-foreground">
          Vindue i dage
          <input
            type="number"
            min={1}
            max={30}
            value={settings.windowDays}
            onChange={(event) =>
              setSettings((prev) => ({
                ...prev,
                windowDays: Number.parseInt(event.target.value || "0", 10) || 1
              }))
            }
            className="h-10 rounded-md border border-border bg-white px-3 text-sm"
          />
        </label>

        <Button onClick={saveSettings} disabled={saving}>
          {saving ? "Gemmer..." : "Gem"}
        </Button>
      </div>

      <div className="space-y-4 rounded-xl border border-border bg-background/70 p-4">
        <div>
          <p className="text-base font-semibold text-foreground">AI-prisberegner</p>
          <p className="text-sm text-muted-foreground">
            Styr om AI-estimat vises direkte til kunden. Interval er 300 kr og basisprisen holdes mellem
            3.000 og 5.000 kr.
          </p>
        </div>

        {aiError ? <p className="text-sm font-medium text-red-700">{aiError}</p> : null}
        {aiMessage ? <p className="text-sm font-medium text-emerald-700">{aiMessage}</p> : null}

        <label className="flex items-center gap-3 text-sm font-medium text-foreground">
          <input
            type="checkbox"
            checked={aiSettings.enabled}
            onChange={(event) => setAiSettings((prev) => ({ ...prev, enabled: event.target.checked }))}
          />
          AI-prisberegner aktiveret
        </label>

        <div className="grid gap-2 text-xs text-muted-foreground">
          <span>Min. læringseksempler: {aiSettings.minSamples}</span>
          <span>Interval: {aiSettings.interval} kr</span>
          <span>
            Prisramme: {aiSettings.minPrice}–{aiSettings.maxPrice} kr
          </span>
        </div>

        <Button onClick={saveAiSettings} disabled={aiSaving}>
          {aiSaving ? "Gemmer..." : "Gem"}
        </Button>
      </div>
    </section>
  );
};
