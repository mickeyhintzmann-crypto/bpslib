"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  createConsentState,
  defaultConsentState,
  getStoredConsent,
  setStoredConsent,
  type ConsentState
} from "@/lib/consent";

type ConsentContextValue = {
  consent: ConsentState | null;
  updateConsent: (consent: ConsentState) => void;
  openSettings: () => void;
  closeSettings: () => void;
};

const ConsentContext = createContext<ConsentContextValue | null>(null);

export function ConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<ConsentState | null>(null);
  const [bannerVisible, setBannerVisible] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const stored = getStoredConsent();
    if (stored) {
      setConsent(stored);
      setBannerVisible(false);
      setStoredConsent(stored);
    } else {
      setBannerVisible(true);
    }
  }, []);

  const updateConsent = (next: ConsentState) => {
    setStoredConsent(next);
    setConsent(next);
    setBannerVisible(false);
    setSettingsOpen(false);
  };

  const contextValue = useMemo<ConsentContextValue>(
    () => ({
      consent,
      updateConsent,
      openSettings: () => setSettingsOpen(true),
      closeSettings: () => setSettingsOpen(false)
    }),
    [consent]
  );

  return (
    <ConsentContext.Provider value={contextValue}>
      {children}
      <CookieBanner
        isVisible={bannerVisible}
        onAccept={() => updateConsent(createConsentState({ analytics: true, marketing: true }))}
        onReject={() => updateConsent(createConsentState({ analytics: false, marketing: false }))}
        onSettings={() => setSettingsOpen(true)}
      />
      <CookieSettingsModal
        isOpen={settingsOpen}
        consent={consent ?? defaultConsentState()}
        onClose={() => setSettingsOpen(false)}
        onSave={(next) => updateConsent(next)}
      />
    </ConsentContext.Provider>
  );
}

export function useConsent() {
  const ctx = useContext(ConsentContext);
  if (!ctx) {
    throw new Error("useConsent must be used within ConsentProvider");
  }
  return ctx;
}

function CookieBanner({
  isVisible,
  onAccept,
  onReject,
  onSettings
}: {
  isVisible: boolean;
  onAccept: () => void;
  onReject: () => void;
  onSettings: () => void;
}) {
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-4xl rounded-3xl border border-neutral-200 bg-white p-6 text-neutral-900 shadow-xl">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Cookie settings</p>
          <p className="mt-2 text-sm text-neutral-700">
            We use cookies to understand demand and improve your experience. You can
            accept or manage preferences anytime.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={onReject} className="text-xs uppercase tracking-[0.2em]">
            Reject
          </Button>
          <Button variant="outline" onClick={onSettings} className="text-xs uppercase tracking-[0.2em]">
            Settings
          </Button>
          <Button onClick={onAccept} className="text-xs uppercase tracking-[0.2em]">
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}

function CookieSettingsModal({
  isOpen,
  consent,
  onClose,
  onSave
}: {
  isOpen: boolean;
  consent: ConsentState;
  onClose: () => void;
  onSave: (next: ConsentState) => void;
}) {
  const [analytics, setAnalytics] = useState(consent.analytics);
  const [marketing, setMarketing] = useState(consent.marketing);

  useEffect(() => {
    if (!isOpen) return;
    setAnalytics(consent.analytics);
    setMarketing(consent.marketing);
  }, [isOpen, consent]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/60 px-6">
      <div className="w-full max-w-lg rounded-3xl border border-neutral-200 bg-white p-6 text-neutral-900 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-2xl">Cookie preferences</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-neutral-200 px-3 py-1 text-xs uppercase tracking-[0.2em]"
          >
            Close
          </button>
        </div>
        <p className="mt-3 text-sm text-neutral-600">
          Choose which cookies we can use. Necessary cookies are always active to
          keep the site working.
        </p>

        <div className="mt-6 space-y-4">
          <div className="flex items-start justify-between gap-4 rounded-2xl border border-neutral-200 p-4">
            <div>
              <p className="text-sm font-medium">Necessary</p>
              <p className="text-xs text-neutral-500">Required for core site functions.</p>
            </div>
            <span className="rounded-full bg-neutral-900 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white">
              Always on
            </span>
          </div>

          <label className="flex items-start justify-between gap-4 rounded-2xl border border-neutral-200 p-4">
            <div>
              <p className="text-sm font-medium">Analytics</p>
              <p className="text-xs text-neutral-500">Helps us understand demand and improve UX.</p>
            </div>
            <input
              type="checkbox"
              checked={analytics}
              onChange={(event) => setAnalytics(event.target.checked)}
              className="mt-1 h-4 w-4"
            />
          </label>

          <label className="flex items-start justify-between gap-4 rounded-2xl border border-neutral-200 p-4">
            <div>
              <p className="text-sm font-medium">Marketing</p>
              <p className="text-xs text-neutral-500">Allows ad platform attribution and retargeting.</p>
            </div>
            <input
              type="checkbox"
              checked={marketing}
              onChange={(event) => setMarketing(event.target.checked)}
              className="mt-1 h-4 w-4"
            />
          </label>
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <Button variant="outline" onClick={onClose} className="text-xs uppercase tracking-[0.2em]">
            Cancel
          </Button>
          <Button
            onClick={() =>
              onSave(
                createConsentState({
                  analytics,
                  marketing
                })
              )
            }
            className="text-xs uppercase tracking-[0.2em]"
          >
            Save preferences
          </Button>
        </div>
      </div>
    </div>
  );
}
