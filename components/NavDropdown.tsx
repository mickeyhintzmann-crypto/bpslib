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
      <details className="rounded-xl border border-border/70 bg-white/70 px-4 py-3">
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
        className={`inline-flex items-center gap-2 text-sm font-medium ${
          emphasis ? "text-foreground" : "text-muted-foreground"
        } hover:text-foreground`}
        aria-haspopup="menu"
      >
        {label}
        <span className="text-xs">▾</span>
      </button>
      <div className="absolute left-0 top-full z-20 hidden min-w-[240px] pt-3 group-hover:block group-focus-within:block">
        <div className="rounded-xl border border-border/80 bg-white p-4 shadow-lg">
          <div className="grid gap-2">
            {visibleItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-muted-foreground hover:text-foreground"
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
