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
    <section className="py-10 md:py-16">
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">Sådan foregår det</h2>
        <p className="text-sm text-muted-foreground">
          En enkel proces med klare forventninger fra start til slut.
        </p>
      </div>
      <div className="mt-6 grid gap-6 md:grid-cols-3">
        {steps.map((step, index) => (
          <div key={step.title} className="rounded-2xl border border-border/70 bg-white/70 p-5">
            <p className="text-xs font-semibold text-muted-foreground">Trin {index + 1}</p>
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
          <span key={note} className="rounded-full border border-border/70 px-3 py-1">
            {note}
          </span>
        ))}
      </div>
    </section>
  );
};
