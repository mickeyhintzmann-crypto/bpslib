import type { Metadata } from "next";
import { Suspense } from "react";
import localFont from "next/font/local";
import { GtmNoScript, GtmScript } from "@/components/tracking/gtm";
import { UtmProvider } from "@/components/tracking/utm-provider";
import { TrackingDebugPanel } from "@/components/tracking/tracking-debug";
import { siteConfig } from "@/lib/site";
import "./globals.css";

const bodyFont = localFont({
  src: "./fonts/noto-sans-regular.ttf",
  variable: "--font-body",
  display: "swap",
  fallback: ["system-ui", "sans-serif"]
});

const displayFont = localFont({
  src: "./fonts/noto-sans-regular.ttf",
  variable: "--font-display",
  display: "swap",
  fallback: ["Georgia", "serif"]
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.baseUrl),
  title: {
    default: siteConfig.defaultTitle,
    template: siteConfig.titleTemplate
  },
  description: siteConfig.defaultDescription,
  openGraph: {
    title: siteConfig.defaultTitle,
    description: siteConfig.defaultDescription,
    url: siteConfig.baseUrl,
    siteName: siteConfig.siteName,
    locale: siteConfig.locale,
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.defaultTitle,
    description: siteConfig.defaultDescription,
    site: siteConfig.social.twitterHandle || undefined,
    creator: siteConfig.social.twitterHandle || undefined
  }
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`dark ${bodyFont.variable} ${displayFont.variable}`}
    >
      <body className="min-h-screen font-sans">
        <GtmScript />
        <GtmNoScript />
        <Suspense fallback={null}>
          <UtmProvider />
        </Suspense>
        {children}
        <TrackingDebugPanel />
      </body>
    </html>
  );
}
