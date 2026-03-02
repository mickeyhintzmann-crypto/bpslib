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
    <div className="relative group">
      <button
        type="button"
        className={`inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm font-semibold transition ${
          emphasis ? "text-foreground" : "text-muted-foreground"
        } hover:bg-white/70 hover:text-foreground`}
        aria-haspopup="menu"
      >
        {label}
        <span className="text-[11px]">▾</span>
      </button>
      <div className="absolute left-0 top-full z-20 hidden min-w-[240px] pt-3 group-hover:block group-focus-within:block">
        <div className="rounded-2xl border border-border/80 bg-white/95 p-4 shadow-[0_18px_38px_hsl(20_30%_20%/0.16)] backdrop-blur">
          <div className="grid gap-2">
            {visibleItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-2 py-1 text-sm text-muted-foreground transition hover:bg-secondary/55 hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
            {cta ? (
              <Link href={cta.href} className="pt-2 text-sm font-semibold text-primary">
                {cta.label}
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
