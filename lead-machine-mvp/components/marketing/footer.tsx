import Link from "next/link";
import { ContactLinks } from "@/components/marketing/contact-links";
import { CookieSettingsLink } from "@/components/consent/cookie-settings-link";

const footerLinks = [
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" }
];

export function MarketingFooter() {
  return (
    <footer className="border-t border-white/10 bg-neutral-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 text-sm text-neutral-400 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Buyer Concierge Costa del Sol</p>
          <p className="mt-2 max-w-md text-sm text-neutral-400">
            A discreet, buyer-first path to owning in Spain. Advisory, not listing aggregation.
          </p>
          <div className="mt-4">
            <ContactLinks />
          </div>
        </div>
        <div className="flex flex-wrap gap-4 text-xs uppercase tracking-[0.2em]">
          {footerLinks.map((link) => (
            <Link key={link.href} href={link.href} className="transition hover:text-white">
              {link.label}
            </Link>
          ))}
          <CookieSettingsLink />
        </div>
      </div>
    </footer>
  );
}
