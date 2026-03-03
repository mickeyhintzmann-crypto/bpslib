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
    <section className="py-8 md:py-12">
      <div className="space-y-3 text-center">
        <h2 className="text-2xl font-semibold text-foreground">Derfor vælger kunder os</h2>
        <p className="text-sm text-muted-foreground">
          Vi er din lokale håndværker med fokus på kvalitet og kundetilfredshed.
        </p>
      </div>
      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="group relative overflow-hidden rounded-[24px] border border-border/70 bg-gradient-to-br from-white via-white to-primary/5 p-6 shadow-[0_10px_24px_hsl(20_30%_20%/0.07)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_36px_hsl(20_30%_20%/0.14)]"
          >
            <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-primary/70 via-primary to-primary/60" />
            <div className="text-[2rem] font-semibold leading-none text-primary md:text-[2.3rem]">
              {stat.title}
            </div>
            <div className="mt-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-foreground/75">
              {stat.label}
            </div>
            <p className="mt-4 text-[15px] leading-relaxed text-foreground/80">{stat.text}</p>
            <div className="mt-5 h-px bg-gradient-to-r from-primary/20 to-transparent transition group-hover:from-primary/45" />
          </div>
        ))}
      </div>
      <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {checklist.map((item) => (
          <div
            key={item}
            className="surface-subtle flex items-center gap-3 rounded-2xl p-4 transition hover:shadow-[0_12px_24px_hsl(20_30%_20%/0.08)]"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-white text-primary">
              <CheckIcon className="h-5 w-5" />
            </span>
            <p className="text-sm font-medium text-foreground">{item}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
