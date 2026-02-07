"use client";

import { useConsent } from "@/components/consent/consent-provider";

export function CookieSettingsLink({ className }: { className?: string }) {
  const { openSettings } = useConsent();
  return (
    <button
      type="button"
      onClick={openSettings}
      className={className ?? "text-xs uppercase tracking-[0.2em] text-neutral-400 hover:text-white"}
    >
      Cookie settings
    </button>
  );
}
