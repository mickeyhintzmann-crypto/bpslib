"use client";

import { useEffect } from "react";

export const MetaLeadEvent = () => {
  useEffect(() => {
    if (typeof window !== "undefined" && typeof window.fbq === "function") {
      window.fbq("track", "Lead");
    }
  }, []);

  return null;
};
