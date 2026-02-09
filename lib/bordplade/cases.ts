export type BordpladeCase = {
  caseSlug: string;
  title: string;
  solution: string;
  finish: string;
};

export const bordpladeCasePlaceholders: BordpladeCase[] = [
  {
    caseSlug: "mat-og-toer-overflade",
    title: "Mat og tør overflade",
    solution: "Slibning + oliebehandling",
    finish: "Silkemat finish"
  },
  {
    caseSlug: "dybe-ridser",
    title: "Dybe ridser",
    solution: "Nedslibning + opbygning",
    finish: "Jævn og slidstærk"
  },
  {
    caseSlug: "skjolder-efter-varme",
    title: "Skjolder efter varme",
    solution: "Slibning + lak",
    finish: "Klar, beskyttet top"
  },
  {
    caseSlug: "moerke-pletter",
    title: "Mørke pletter",
    solution: "Afrensning + olie",
    finish: "Naturligt look"
  },
  {
    caseSlug: "vandmaerker",
    title: "Vandmærker",
    solution: "Finslibning + finish",
    finish: "Lys og ren flade"
  },
  {
    caseSlug: "slidt-koekkenbord",
    title: "Slidt køkkenbord",
    solution: "Slibning + topcoat",
    finish: "Klar til hverdag"
  },
  {
    caseSlug: "hak-og-ujaevnheder",
    title: "Hak og ujævnheder",
    solution: "Udfyldning + slibning",
    finish: "Ensartet overflade"
  },
  {
    caseSlug: "gulnet-lak",
    title: "Gulnet lak",
    solution: "Afslibning + ny behandling",
    finish: "Lysere tone"
  }
];
