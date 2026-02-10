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
    id: "bordplade-boeg-sort",
    category: "bordplade",
    title: "Bøg · Sort olie",
    location: "Roskilde",
    finish: "olie",
    problem: "Sort olie",
    beforeImage: "/images/cases/boeg-sort-before.jpg",
    afterImage: "/images/cases/boeg-sort-after.jpg",
    beforeAlt: "Bøg bordplade før slibning med sort olie",
    afterAlt: "Bøg bordplade efter slibning med sort olie"
  },
  {
    id: "bordplade-ask-hvid",
    category: "bordplade",
    title: "Ask · Hvid olie",
    location: "Ballerup",
    finish: "olie",
    problem: "Hvid olie",
    beforeImage: "/images/cases/ask-hvid-before.jpg",
    afterImage: "/images/cases/ask-hvid-after.jpg",
    beforeAlt: "Ask bordplade før slibning med hvid olie",
    afterAlt: "Ask bordplade efter slibning med hvid olie"
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
    id: "bordplade-mahogni-natur",
    category: "bordplade",
    title: "Massiv træ · Natur olie",
    location: "Sjælland",
    finish: "olie",
    problem: "Natur olie",
    beforeImage: "/images/cases/mahogni-natur-before.jpg",
    afterImage: "/images/cases/mahogni-natur-after.jpg",
    beforeAlt: "Massiv bordplade før slibning med natur olie",
    afterAlt: "Massiv bordplade efter slibning med natur olie"
  }
];
