"use client";

import { useEffect } from "react";

import { captureUtmFromCurrentUrl, track } from "@/lib/analytics";

const OFFER_TIME_PATH = "/tilbudstid";

const asAnchor = (target: EventTarget | null): HTMLAnchorElement | null => {
  if (!(target instanceof Element)) {
    return null;
  }
  return target.closest("a");
};

const isOfferTimeHref = (href: string) => {
  if (!href) {
    return false;
  }

  if (href.startsWith(`${OFFER_TIME_PATH}?`) || href === OFFER_TIME_PATH || href.startsWith(`${OFFER_TIME_PATH}/`)) {
    return true;
  }

  try {
    const parsed = new URL(href, window.location.origin);
    return parsed.pathname === OFFER_TIME_PATH;
  } catch {
    return false;
  }
};

export const AnalyticsBootstrap = () => {
  useEffect(() => {
    captureUtmFromCurrentUrl();

    const onClick = (event: MouseEvent) => {
      const anchor = asAnchor(event.target);
      if (!anchor) {
        return;
      }

      const href = anchor.getAttribute("href") || "";
      if (href.startsWith("tel:")) {
        track("contact_call_click", {
          source_path: window.location.pathname
        });
        return;
      }

      if (isOfferTimeHref(href)) {
        track("offer_time_click", {
          source_path: window.location.pathname
        });
      }
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
};

