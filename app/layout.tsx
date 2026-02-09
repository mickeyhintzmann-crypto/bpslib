import type { Metadata } from "next";

import "./globals.css";
import Script from "next/script";
import { cookies } from "next/headers";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { MobileStickyCta } from "@/components/MobileStickyCta";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";
import { brandAssets } from "@/lib/assets";
import { getSiteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "BPSLIB",
  description: "Bordpladeslibning i massiv træ på Sjælland.",
  metadataBase: new URL(getSiteUrl()),
  robots:
    process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production"
      ? {
          index: false,
          follow: false,
          nocache: true
        }
      : undefined,
  icons: {
    icon: brandAssets.favicon,
    shortcut: brandAssets.favicon,
    apple: brandAssets.favicon
  }
};

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const gaId = process.env.NEXT_PUBLIC_GA4_ID || "";
  const consentCookie = (await cookies()).get("cookie_consent")?.value || "";
  const hasConsent = consentCookie === "accepted";

  return (
    <html lang="da">
      <body className="flex min-h-screen flex-col font-sans">
        <Header />
        <div className="flex-1 pb-20 md:pb-0">{children}</div>
        <Footer />
        <MobileStickyCta />
        <CookieConsentBanner />
        {gaId && hasConsent ? (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){window.dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}', { anonymize_ip: true });
              `}
            </Script>
          </>
        ) : null}
      </body>
    </html>
  );
}
