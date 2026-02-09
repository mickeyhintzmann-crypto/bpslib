export type CaseItem = {
  id: string;
  category: "bordplade" | "gulv" | "andet";
  title: string;
  location: string;
  finish: "olie" | "lak" | "saebe" | "andet";
  problem: string;
  beforeImage: string;
  afterImage?: string | null;
  beforeAlt: string;
  afterAlt?: string | null;
};

export const cases: CaseItem[] = [
  {
    id: "bordplade-eg-natur",
    category: "bordplade",
    title: "Eg · Natur olie",
    location: "København",
    finish: "olie",
    problem: "Natur olie",
    beforeImage: "/images/cases/eg-natur-before.jpg",
    afterImage: "/images/cases/eg-natur-after.jpg",
    beforeAlt: "Eg bordplade før slibning med natur olie",
    afterAlt: "Eg bordplade efter slibning med natur olie"
  },
  {
    id: "bordplade-eg-hvid",
    category: "bordplade",
    title: "Eg · Hvid olie",
    location: "Frederiksberg",
    finish: "olie",
    problem: "Hvid olie",
    beforeImage: "/images/cases/eg-hvid-before.jpg",
    afterImage: "/images/cases/eg-hvid-after.jpg",
    beforeAlt: "Eg bordplade før slibning med hvid olie",
    afterAlt: "Eg bordplade efter slibning med hvid olie"
  },
  {
    id: "bordplade-eg-sort",
    category: "bordplade",
    title: "Eg · Sort olie",
    location: "Roskilde",
    finish: "olie",
    problem: "Sort olie",
    beforeImage: "/images/cases/eg-sort-before.jpg",
    afterImage: "/images/cases/eg-sort-after.jpg",
    beforeAlt: "Eg bordplade før slibning med sort olie",
    afterAlt: "Eg bordplade efter slibning med sort olie"
  },
  {
    id: "bordplade-eg-dark-coco",
    category: "bordplade",
    title: "Eg · Dark Coco",
    location: "Gentofte",
    finish: "olie",
    problem: "Dark Coco olie",
    beforeImage: "/images/cases/eg-dark-coco-before.jpg",
    afterImage: "/images/cases/eg-dark-coco-after.jpg",
    beforeAlt: "Eg bordplade før slibning med dark coco olie",
    afterAlt: "Eg bordplade efter slibning med dark coco olie"
  },
  {
    id: "bordplade-boeg-natur",
    category: "bordplade",
    title: "Bøg · Natur olie",
    location: "Lyngby",
    finish: "olie",
    problem: "Natur olie",
    beforeImage: "/images/cases/boeg-natur-before.jpg",
    afterImage: "/images/cases/boeg-natur-after.jpg",
    beforeAlt: "Bøg bordplade før slibning med natur olie",
    afterAlt: "Bøg bordplade efter slibning med natur olie"
  },
  {
    id: "bordplade-boeg-hvid",
    category: "bordplade",
    title: "Bøg · Hvid olie",
    location: "Hvidovre",
    finish: "olie",
    problem: "Hvid olie",
    beforeImage: "/images/cases/boeg-hvid-before.jpg",
    afterImage: "/images/cases/boeg-hvid-after.jpg",
    beforeAlt: "Bøg bordplade før slibning med hvid olie",
    afterAlt: "Bøg bordplade efter slibning med hvid olie"
  },
  {
    id: "bordplade-ask-natur",
    category: "bordplade",
    title: "Ask · Natur olie",
    location: "Ballerup",
    finish: "olie",
    problem: "Natur olie",
    beforeImage: "/images/cases/ask-natur-before.jpg",
    afterImage: "/images/cases/ask-natur-after.jpg",
    beforeAlt: "Ask bordplade før slibning med natur olie",
    afterAlt: "Ask bordplade efter slibning med natur olie"
  },
  {
    id: "bordplade-valnoed-natur",
    category: "bordplade",
    title: "Valnød · Natur olie",
    location: "Greve",
    finish: "olie",
    problem: "Natur olie",
    beforeImage: "/images/cases/valnoed-natur-before.jpg",
    afterImage: "/images/cases/valnoed-natur-after.jpg",
    beforeAlt: "Valnød bordplade før slibning med natur olie",
    afterAlt: "Valnød bordplade efter slibning med natur olie"
  },
  {
    id: "bordplade-valnoed-dark-coco",
    category: "bordplade",
    title: "Valnød · Dark Coco",
    location: "Køge",
    finish: "olie",
    problem: "Dark Coco olie",
    beforeImage: "/images/cases/valnoed-dark-coco-before.jpg",
    afterImage: "/images/cases/valnoed-dark-coco-after.jpg",
    beforeAlt: "Valnød bordplade før slibning med dark coco olie",
    afterAlt: "Valnød bordplade efter slibning med dark coco olie"
  },
  {
    id: "bordplade-bambus-natur",
    category: "bordplade",
    title: "Bambus · Natur olie",
    location: "Sjælland",
    finish: "olie",
    problem: "Natur olie",
    beforeImage: "/images/cases/bambus-natur-before.jpg",
    afterImage: "/images/cases/bambus-natur-after.jpg",
    beforeAlt: "Bambus bordplade før slibning med natur olie",
    afterAlt: "Bambus bordplade efter slibning med natur olie"
  },
  {
    id: "gulv-opfriskning",
    category: "gulv",
    title: "Lys egetrae - opfriskning",
    location: "Koebenhavn",
    finish: "lak",
    problem: "Slidt overflade",
    beforeImage: "/images/placeholders/fallback.jpg",
    afterImage: null,
    beforeAlt: "Eksempel på opfrisket trægulv",
    afterAlt: null
  },
  {
    id: "gulv-ridser",
    category: "gulv",
    title: "Parketgulv - ridser fjernet",
    location: "Frederiksberg",
    finish: "olie",
    problem: "Ridser og pletter",
    beforeImage: "/images/placeholders/fallback.jpg",
    afterImage: null,
    beforeAlt: "Eksempel på gulv med ridser før opfriskning",
    afterAlt: null
  },
  {
    id: "gulv-saebe",
    category: "gulv",
    title: "Lyst gulv - saebebehandling",
    location: "Roskilde",
    finish: "saebe",
    problem: "Pletter og ujavn glans",
    beforeImage: "/images/placeholders/fallback.jpg",
    afterImage: null,
    beforeAlt: "Eksempel på lyst gulv efter sæbebehandling",
    afterAlt: null
  },
  {
    id: "andet-toemrer",
    category: "andet",
    title: "Lister og afslutninger",
    location: "Gentofte",
    finish: "andet",
    problem: "Slidte afslutninger",
    beforeImage: "/images/placeholders/fallback.jpg",
    afterImage: null,
    beforeAlt: "Eksempel på tømreropgave",
    afterAlt: null
  },
  {
    id: "andet-maler",
    category: "andet",
    title: "Maling af traevaerk",
    location: "Lyngby",
    finish: "andet",
    problem: "Skrammer og ujavn daekning",
    beforeImage: "/images/placeholders/fallback.jpg",
    afterImage: null,
    beforeAlt: "Eksempel på maleropgave",
    afterAlt: null
  },
  {
    id: "andet-murer",
    category: "andet",
    title: "Fugereparation",
    location: "Hvidovre",
    finish: "andet",
    problem: "Slidte fuger",
    beforeImage: "/images/placeholders/fallback.jpg",
    afterImage: null,
    beforeAlt: "Eksempel på mureropgave",
    afterAlt: null
  }
];
