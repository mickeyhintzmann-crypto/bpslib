export type ReferenceProject = {
  id: string;
  title: string;
  location: string;
  service: string;
  scope: string;
  result: string;
  image: string;
  imageAlt: string;
  href: string;
};

export const referenceProjects: ReferenceProject[] = [
  {
    id: "ref-eg-natur-koebenhavn",
    title: "Eg bordplade i køkkenmiljø",
    location: "København",
    service: "Bordpladeslibning i massiv træ",
    scope: "Slibning og ny oliebehandling med natur finish.",
    result: "Mere ensartet overflade med stærkere daglig beskyttelse.",
    image: "/images/cases/eg-natur-after.jpg",
    imageAlt: "Eg bordplade efter slibning med natur olie i København",
    href: "/cases"
  },
  {
    id: "ref-boeg-hvid-hvidovre",
    title: "Bøg bordplade med lys finish",
    location: "Hvidovre",
    service: "Bordpladeslibning i massiv træ",
    scope: "Renovering af slidt bordplade med hvid olie.",
    result: "Lysere udtryk og forbedret finish til daglig brug.",
    image: "/images/cases/boeg-hvid-after.jpg",
    imageAlt: "Bøg bordplade efter slibning med hvid olie i Hvidovre",
    href: "/cases"
  },
  {
    id: "ref-valnoed-natur-greve",
    title: "Valnød bordplade i familiens samlingsrum",
    location: "Greve",
    service: "Bordpladeslibning i massiv træ",
    scope: "Opfriskning af overflade og ny natur olie.",
    result: "Dyb træglød og mere modstandsdygtig bordplade.",
    image: "/images/cases/valnoed-natur-after.jpg",
    imageAlt: "Valnød bordplade efter slibning med natur olie i Greve",
    href: "/cases"
  },
  {
    id: "ref-boeg-sort-roskilde",
    title: "Bøg bordplade med mørk tone",
    location: "Roskilde",
    service: "Bordpladeslibning i massiv træ",
    scope: "Slibning af overflade og ny sort olie-finish.",
    result: "Mere markeret farve og ensartet afslutning.",
    image: "/images/cases/boeg-sort-after.jpg",
    imageAlt: "Bøg bordplade efter slibning med sort olie i Roskilde",
    href: "/cases"
  },
  {
    id: "ref-ask-hvid-ballerup",
    title: "Ask bordplade i moderne køkken",
    location: "Ballerup",
    service: "Bordpladeslibning i massiv træ",
    scope: "Fjernelse af slidspor og opbygning med hvid olie.",
    result: "Renere look og bedre overfladebeskyttelse.",
    image: "/images/cases/ask-hvid-after.jpg",
    imageAlt: "Ask bordplade efter slibning med hvid olie i Ballerup",
    href: "/cases"
  },
  {
    id: "ref-eg-hvid-frederiksberg",
    title: "Eg bordplade med nordisk udtryk",
    location: "Frederiksberg",
    service: "Bordpladeslibning i massiv træ",
    scope: "Slibning og omlægning til hvid olie.",
    result: "Lysere finish og mere jævn overflade.",
    image: "/images/cases/eg-hvid-after.jpg",
    imageAlt: "Eg bordplade efter slibning med hvid olie i Frederiksberg",
    href: "/cases"
  }
];
