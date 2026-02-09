"use client";

import Link from "next/link";
import { useState } from "react";

const COOKIE_NAME = "cookie_consent";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 180;

const getCookie = (name: string) => {
  if (typeof document === "undefined") {
    return "";
  }
  const match = document.cookie
    .split(";")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : "";
};

const setCookie = (name: string, value: string) => {
  if (typeof document === "undefined") {
    return;
  }
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${MAX_AGE_SECONDS}; Path=/; SameSite=Lax`;
};

export const CookieConsentBanner = () => {
  const [visible, setVisible] = useState(() => {
    if (typeof document === "undefined") {
      return false;
    }
    return !getCookie(COOKIE_NAME);
  });

  if (!visible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-xl rounded-2xl border border-border bg-white/95 p-4 shadow-lg">
      <p className="text-sm text-foreground">
        Vi bruger cookies til statistik og forbedringer. Du kan vælge til eller fra.
        <Link href="/cookiepolitik" className="ml-1 font-semibold text-primary">
          Læs mere
        </Link>
        .
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setCookie(COOKIE_NAME, "accepted");
            setVisible(false);
          }}
          className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"
        >
          Accepter
        </button>
        <button
          type="button"
          onClick={() => {
            setCookie(COOKIE_NAME, "declined");
            setVisible(false);
          }}
          className="rounded-md border border-border px-3 py-2 text-sm font-semibold text-foreground"
        >
          Afvis
        </button>
      </div>
    </div>
  );
};
