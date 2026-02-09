import Link from "next/link";

const linkedTypes = [
  { label: "Eg", href: "/bordpladeslibning/egetrae" },
  { label: "Bøg", href: "/bordpladeslibning/boeg" },
  { label: "Ask", href: "/bordpladeslibning/ask" },
  { label: "Valnød", href: "/bordpladeslibning/valnoed" },
  { label: "Bambus", href: "/bordpladeslibning/bambus" }
];

const otherTypes = ["Teak", "Kirsebær", "Ahorn", "Fyr"];

export const WoodTypes = () => {
  return (
    <section className="py-10 md:py-16">
      <div className="space-y-3 text-center">
        <h2 className="text-2xl font-semibold text-foreground">Træsorter vi arbejder med</h2>
        <p className="text-sm text-muted-foreground">
          Vi kan håndtere de fleste træsorter, hvis bordpladen er massiv træ.
        </p>
      </div>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {linkedTypes.map((type) => (
          <Link
            key={type.href}
            href={type.href}
            className="rounded-full border border-border/70 bg-white px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
          >
            {type.label}
          </Link>
        ))}
        {otherTypes.map((type) => (
          <span
            key={type}
            className="rounded-full border border-border/70 bg-white px-4 py-2 text-sm text-muted-foreground"
          >
            {type}
          </span>
        ))}
      </div>
    </section>
  );
};
