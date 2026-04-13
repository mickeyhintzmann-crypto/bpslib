import type { Metadata, Viewport } from "next";

import "./globals.css";
import Script from "next/script";
import { cookies, headers } from "next/headers";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { StickyContactBar } from "@/components/contact/StickyContactBar";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";
import { AnalyticsBootstrap } from "@/components/AnalyticsBootstrap";
import { FooterCityCoverageSection } from "@/components/footer/FooterCityCoverageSection";
import { getSiteUrl } from "@/lib/site-url";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

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
    icon: [
      { url: "/images/brand/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/images/brand/favicon-16x16.png", sizes: "16x16", type: "image/png" }
    ],
    shortcut: "/images/brand/favicon-32x32.png",
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }]
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
  const headerList = await headers();
  const host = headerList.get("host") || "";
  const pathHint =
    headerList.get("x-pathname") ||
    headerList.get("x-nextjs-route") ||
    headerList.get("x-invoke-path") ||
    headerList.get("x-matched-path") ||
    headerList.get("x-next-url") ||
    headerList.get("next-url") ||
    "";
  const isAdminShell = host.startsWith("app.") || pathHint.startsWith("/admin");

  return (
    <html lang="da">
      <body className="flex min-h-screen flex-col bg-background font-sans text-foreground">
        {isAdminShell ? null : <Header />}
        <div className={`flex-1 ${isAdminShell ? "" : "pb-20 md:pb-0"}`}>{children}</div>
        {isAdminShell ? null : <FooterCityCoverageSection />}
        {isAdminShell ? null : <Footer />}
        {isAdminShell ? null : <StickyContactBar />}
        {isAdminShell ? null : <CookieConsentBanner />}
        {isAdminShell ? null : <AnalyticsBootstrap />}
        {!isAdminShell && gaId && hasConsent ? (
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
        {!isAdminShell ? (
          <Script id="meta-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '3551381571684975');
              fbq('track', 'PageView');
            `}
          </Script>
        ) : null}
      </body>
    </html>
  );
}
