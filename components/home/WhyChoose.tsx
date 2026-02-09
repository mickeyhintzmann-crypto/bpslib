import { CheckIcon } from "@/components/home/icons";

const stats = [
  {
    title: "15+",
    label: "Års erfaring",
    text: "Vi har arbejdet med bordplader i over 15 år."
  },
  {
    title: "100%",
    label: "Bordplade‑fokus",
    text: "Vi er specialister i slibning og oliebehandling."
  },
  {
    title: "Massiv",
    label: "Kun træ",
    text: "Vi arbejder ikke med laminat eller finer."
  },
  {
    title: "Sjælland",
    label: "Hele regionen",
    text: "Vi kører fra København til Nordsjælland."
  }
];

const checklist = [
  "Lokalt håndværk",
  "Gratis vurdering",
  "Professionelt udstyr",
  "Miljøvenlige produkter",
  "Rydder op efter os",
  "Fast pris på akutte tider"
];

export const WhyChoose = () => {
  return (
    <section className="py-10 md:py-16">
      <div className="space-y-3 text-center">
        <h2 className="text-2xl font-semibold text-foreground">Derfor vælger kunder os</h2>
        <p className="text-sm text-muted-foreground">
          Vi er din lokale håndværker med fokus på kvalitet og kundetilfredshed.
        </p>
      </div>
      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-3xl border border-border/70 bg-white/80 p-6 shadow-sm">
            <div className="text-2xl font-semibold text-primary">{stat.title}</div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {stat.label}
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{stat.text}</p>
          </div>
        ))}
      </div>
      <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {checklist.map((item) => (
          <div key={item} className="flex items-center gap-3 rounded-2xl border border-border/70 bg-white/70 p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-primary">
              <CheckIcon className="h-5 w-5" />
            </span>
            <p className="text-sm font-medium text-foreground">{item}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
