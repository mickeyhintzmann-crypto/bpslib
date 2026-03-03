"use client";

import { useState } from "react";
import Link from "next/link";

type NavLink = {
  href: string;
  label: string;
};

const filterEnabled = (items: NavLink[]) => items;

type NavDropdownProps = {
  label: string;
  items: NavLink[];
  cta?: NavLink;
  emphasis?: boolean;
  variant?: "desktop" | "mobile";
  onNavigate?: () => void;
};

export const NavDropdown = ({
  label,
  items,
  cta,
  emphasis,
  variant = "desktop",
  onNavigate
}: NavDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const visibleItems = filterEnabled(items);

  if (variant === "mobile") {
    return (
      <details className="rounded-2xl border border-border/75 bg-white/80 px-4 py-3.5 shadow-[0_10px_24px_hsl(20_30%_20%/0.06)]">
        <summary
          className={`cursor-pointer list-none text-base font-semibold text-foreground ${
            emphasis ? "text-foreground" : "text-foreground"
          }`}
        >
          {label}
        </summary>
        <div className="mt-3 grid gap-2">
          {visibleItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
          {cta ? (
            <Link
              href={cta.href}
              onClick={onNavigate}
              className="pt-2 text-sm font-semibold text-primary"
            >
              {cta.label}
            </Link>
          ) : null}
        </div>
      </details>
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onFocusCapture={() => setIsOpen(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsOpen(false);
        }
      }}
    >
      <button
        type="button"
        className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[15px] font-semibold tracking-[0.01em] transition ${
          emphasis
            ? "border-primary/30 bg-primary/10 text-foreground shadow-[0_8px_18px_hsl(var(--primary)/0.15)]"
            : "border-transparent text-muted-foreground"
        } hover:border-border/70 hover:bg-white hover:text-foreground`}
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        {label}
        <span className="text-[11px]">▾</span>
      </button>
      <div
        className={`absolute left-0 top-[calc(100%+6px)] z-[90] min-w-[250px] transition-all duration-150 ${
          isOpen ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1 opacity-0"
        }`}
      >
        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-[0_20px_42px_hsl(20_30%_20%/0.2)]">
          <div className="border-b border-border/60 bg-[linear-gradient(180deg,hsl(35_30%_96%),hsl(32_22%_94%))] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
            {label}
          </div>
          <div className="grid gap-1.5 p-2">
            {visibleItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-stone-700 transition hover:bg-secondary/70 hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
            {cta ? (
              <Link
                href={cta.href}
                className="mt-1 border-t border-border/60 px-3 pt-3 pb-1 text-sm font-semibold text-primary"
              >
                {cta.label}
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
