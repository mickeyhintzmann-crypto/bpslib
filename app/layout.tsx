import type { Metadata } from "next";

import "./globals.css";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { MobileStickyCta } from "@/components/MobileStickyCta";

export const metadata: Metadata = {
  title: "BPSLIB",
  description: "Bordpladeslibning i massiv træ på Sjælland.",
  metadataBase: new URL("https://bpslib.dk")
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="da">
      <body className="flex min-h-screen flex-col font-sans">
        <Header />
        <div className="flex-1 pb-20 md:pb-0">{children}</div>
        <Footer />
        <MobileStickyCta />
      </body>
    </html>
  );
}
