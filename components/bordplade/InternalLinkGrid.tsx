import Link from "next/link";

type LinkItem = {
  href: string;
  label: string;
};

type InternalLinkGridProps = {
  title?: string;
  intro?: string;
  links: LinkItem[];
};

export const InternalLinkGrid = ({
  title = "Relaterede sider",
  intro = "Fortsæt herfra til de sider, der matcher din situation.",
  links
}: InternalLinkGridProps) => {
  return (
    <section className="py-8">
      <div className="rounded-3xl border border-border/70 bg-white/70 px-6 py-8 md:px-10">
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{intro}</p>
        <div className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2 lg:grid-cols-3">
          {links.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-foreground">
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
