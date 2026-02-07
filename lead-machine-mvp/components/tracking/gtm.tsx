"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { publicEnv } from "@/lib/env.public";
import { getStoredConsent, hasTrackingConsent } from "@/lib/consent";

export function GtmScript() {
  const gtmId = publicEnv.NEXT_PUBLIC_GTM_ID;
  const [canLoad, setCanLoad] = useState(false);

  useEffect(() => {
    const stored = getStoredConsent();
    setCanLoad(hasTrackingConsent(stored));

    const handleConsent = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      setCanLoad(hasTrackingConsent(detail));
    };

    window.addEventListener("consent:updated", handleConsent);
    return () => window.removeEventListener("consent:updated", handleConsent);
  }, []);

  if (!gtmId || !canLoad) return null;

  return (
    <>
      <Script id="gtm-script" strategy="afterInteractive">
        {`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${gtmId}');
        `}
      </Script>
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
          height="0"
          width="0"
          style={{ display: "none", visibility: "hidden" }}
        />
      </noscript>
    </>
  );
}

export function GtmNoScript() {
  return null;
}
