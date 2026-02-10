export type OilColor = "natur" | "hvid" | "sort" | "dark-coco";
export type WoodType = "eg" | "boeg" | "ask" | "valnoed" | "bambus" | "andet";

export type FinishGalleryItem = {
  id: string;
  woodType: WoodType;
  oilColor: OilColor;
  title: string;
  image: string;
  alt: string;
  location?: string;
  note?: string;
};

export const woodTypeOptions: { value: WoodType; label: string }[] = [
  { value: "eg", label: "Eg" },
  { value: "boeg", label: "Bøg" },
  { value: "ask", label: "Ask" },
  { value: "valnoed", label: "Valnød" },
  { value: "andet", label: "Andet" }
];

export const oilColorOptions: { value: OilColor; label: string }[] = [
  { value: "natur", label: "Natur" },
  { value: "hvid", label: "Hvid" },
  { value: "sort", label: "Sort" },
  { value: "dark-coco", label: "Dark Coco" }
];

const noteForOilColor = (oilColor: OilColor) => {
  switch (oilColor) {
    case "natur":
      return "Silkemat finish";
    case "hvid":
      return "Lysnet udtryk";
    case "sort":
      return "Dyb kontrast";
    case "dark-coco":
      return "Varm tone";
    default:
      return undefined;
  }
};

export const finishGallery: FinishGalleryItem[] = [
  {
    id: "eg-natur",
    woodType: "eg",
    oilColor: "natur",
    title: "Eg · Natur",
    image: "/images/cases/eg-natur-after.jpg",
    alt: "Eg bordplade med natur olie",
    location: "København",
    note: noteForOilColor("natur")
  },
  {
    id: "eg-hvid",
    woodType: "eg",
    oilColor: "hvid",
    title: "Eg · Hvid",
    image: "/images/cases/eg-hvid-after.jpg",
    alt: "Eg bordplade med hvid olie",
    location: "Frederiksberg",
    note: noteForOilColor("hvid")
  },
  {
    id: "boeg-hvid",
    woodType: "boeg",
    oilColor: "hvid",
    title: "Bøg · Hvid",
    image: "/images/cases/boeg-hvid-after.jpg",
    alt: "Bøg bordplade med hvid olie",
    location: "Hvidovre",
    note: noteForOilColor("hvid")
  },
  {
    id: "boeg-sort",
    woodType: "boeg",
    oilColor: "sort",
    title: "Bøg · Sort",
    image: "/images/cases/boeg-sort-after.jpg",
    alt: "Bøg bordplade med sort olie",
    location: "Roskilde",
    note: noteForOilColor("sort")
  },
  {
    id: "ask-hvid",
    woodType: "ask",
    oilColor: "hvid",
    title: "Ask · Hvid",
    image: "/images/cases/ask-hvid-after.jpg",
    alt: "Ask bordplade med hvid olie",
    location: "Ballerup",
    note: noteForOilColor("hvid")
  },
  {
    id: "valnoed-natur",
    woodType: "valnoed",
    oilColor: "natur",
    title: "Valnød · Natur",
    image: "/images/cases/valnoed-natur-after.jpg",
    alt: "Valnød bordplade med natur olie",
    location: "Greve",
    note: noteForOilColor("natur")
  },
  {
    id: "mahogni-natur",
    woodType: "andet",
    oilColor: "natur",
    title: "Massiv træ · Natur",
    image: "/images/cases/mahogni-natur-after.jpg",
    alt: "Massiv træbordplade med natur olie",
    location: "Sjælland",
    note: noteForOilColor("natur")
  }
];
