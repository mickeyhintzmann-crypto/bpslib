export type FaqItem = {
  question: string;
  answer: string;
};

export const faqItems: FaqItem[] = [
  {
    question: "Hvad koster bordpladeslibning?",
    answer: "Prisen afhænger af bordpladens mål, tilstand og ønsket finish. Upload billeder for en præcis vurdering."
  },
  {
    question: "Hvor lang tid tager det?",
    answer:
      "De fleste opgaver kan udføres på en dag. Vi bekræfter tidsforbruget som 1/2/3 slots, når vi har set billeder og mål."
  },
  {
    question: "Olie eller lak – hvad anbefaler I?",
    answer: "Vi rådgiver ud fra brug og ønsket udtryk. Olie giver et naturligt look, mens lak giver ekstra beskyttelse."
  },
  {
    question: "Kan I fjerne skjolder og ridser?",
    answer: "Ja, i langt de fleste tilfælde kan skjolder og ridser fjernes med korrekt slibning og behandling."
  },
  {
    question: "Sliber I alle bordplader?",
    answer: "Vi arbejder kun med massiv træ. Laminat og finer kan som udgangspunkt ikke slibes."
  },
  {
    question: "Kører I på hele Sjælland?",
    answer: "Ja, vi dækker hele Sjælland og planlægger ruterne, så du får en tid hurtigt."
  },
  {
    question: "Hvad kræver det af forberedelse?",
    answer: "Vi beder om fri adgang til bordpladen og lidt plads omkring arbejdsområdet. Resten klarer vi."
  }
];

export const FaqSchema = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema)
      }}
    />
  );
};

export const FaqSection = () => {
  return (
    <section className="py-10 md:py-16">
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">FAQ</h2>
        <p className="text-sm text-muted-foreground">
          Få svar på de mest almindelige spørgsmål om bordpladeslibning i massiv træ.
        </p>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {faqItems.map((item) => (
          <div key={item.question} className="rounded-2xl border border-border/70 bg-white/70 p-5">
            <h3 className="text-base font-semibold text-foreground">{item.question}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{item.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
