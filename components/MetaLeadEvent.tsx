"use client";

import { useEffect } from "react";

export const MetaLeadEvent = () => {
  useEffect(() => {
    const key = `meta_lead_fired:${window.location.pathname}`;
    if (sessionStorage.getItem(key)) return;

    const fire = () => {
      if (typeof window.fbq !== "function") return false;
      window.fbq("track", "Lead");
      sessionStorage.setItem(key, "1");
      return true;
    };

    if (!fire()) {
      const id = setInterval(() => {
        if (fire()) clearInterval(id);
      }, 100);
      setTimeout(() => clearInterval(id), 3000);
    }
  }, []);

  return null;
};
