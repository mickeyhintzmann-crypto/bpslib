import { StarIcon } from "@/components/home/icons";

const results = [
  {
    value: "5-10 år",
    text: "Bordpladens levetid forlænges"
  },
  {
    value: "★★★★★",
    text: "Højt vurderet af kunder"
  },
  {
    value: "Stor besparelse",
    text: "Ofte billigere end ny bordplade"
  }
];

export const TypicalResults = () => {
  return (
    <section className="py-10 md:py-16">
      <div className="space-y-3 text-center">
        <h2 className="text-2xl font-semibold text-foreground">Typiske resultater</h2>
        <p className="text-sm text-muted-foreground">
          Når vi sliber en massiv træbordplade, får du en flot og holdbar overflade tilbage.
        </p>
      </div>
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {results.map((item) => (
          <div key={item.text} className="rounded-3xl border border-border/70 bg-white/80 p-6 text-center shadow-sm">
            <div className="text-xl font-semibold text-primary">
              {item.value === "★★★★★" ? (
                <span className="inline-flex items-center gap-1 text-primary">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <StarIcon key={index} className="h-5 w-5" />
                  ))}
                </span>
              ) : (
                item.value
              )}
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{item.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
