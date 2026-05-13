import { Section } from "@/components/ui/Section";

const steps = [
  {
    title: "Upload",
    text: "Send 3–6 billeder og mål, så vi kan vurdere opgaven."
  },
  {
    title: "Pris og anbefaling",
    text: "Du får et prisestimat og anbefaling af tid (1/2/3 slots) eller næste step."
  },
  {
    title: "Vi udfører",
    text: "Vi kommer til tiden, dækker af og sikrer støvkontrol under arbejdet."
  }
];

const trustNotes = ["Afdækning af arbejdsområde", "Støvkontrol under slibning", "Rydder op efter os"];

export const ProcessSteps = () => {
  return (
    <Section className="py-10 md:py-16" innerClassName="px-0">
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">Sådan foregår det</h2>
        <p className="text-sm text-muted-foreground">
          En enkel proces med klare forventninger fra start til slut.
        </p>
      </div>
      <div className="mt-6 grid gap-6 md:grid-cols-3">
        {steps.map((step, index) => (
          <div
            key={step.title}
            className="surface-subtle group relative overflow-hidden rounded-[24px] p-5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_32px_hsl(20_30%_20%/0.1)]"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full bg-primary/10 blur-xl transition group-hover:bg-primary/20"
            />
            <p className="relative text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Trin {index + 1}
            </p>
            <h3 className="mt-2 text-lg font-semibold text-foreground">{step.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{step.text}</p>
          </div>
        ))}
      </div>
      <p className="mt-6 text-sm text-muted-foreground">
        Vi aftaler altid tid og forventninger på forhånd, så processen bliver enkel for dig. Mange
        opgaver klares på 1–2 slots, mens større eller mere komplekse bordplader kan kræve 3 slots.
        Vi passer på dit hjem med grundig afdækning og støvkontrol, og vi sørger for, at du hurtigt
        kan bruge køkkenet igen.
      </p>
      <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
        {trustNotes.map((note) => (
          <span key={note} className="rounded-full border border-border/70 bg-white/70 px-3 py-1.5">
            {note}
          </span>
        ))}
      </div>
    </Section>
  );
};
