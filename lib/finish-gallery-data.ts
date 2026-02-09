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
  { value: "bambus", label: "Bambus" },
  { value: "andet", label: "Andet" }
];

export const oilColorOptions: { value: OilColor; label: string }[] = [
  { value: "natur", label: "Natur" },
  { value: "hvid", label: "Hvid" },
  { value: "sort", label: "Sort" },
  { value: "dark-coco", label: "Dark Coco" }
];

const fallbackImage = "/images/placeholders/fallback.jpg";
const imageForCombo = (wood: WoodType, oil: OilColor) => {
  if (wood === "andet") {
    return fallbackImage;
  }
  return `/images/cases/${wood}-${oil}-after.jpg`;
};

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

export const finishGallery: FinishGalleryItem[] = woodTypeOptions.flatMap((wood, woodIndex) =>
  oilColorOptions.map((oil, oilIndex) => {
    const title = `${wood.label} · ${oil.label}`;
    const location = woodIndex % 2 === 0 ? "Sjælland" : undefined;

    return {
      id: `${wood.value}-${oil.value}-${woodIndex + 1}-${oilIndex + 1}`,
      woodType: wood.value,
      oilColor: oil.value,
      title,
      image: imageForCombo(wood.value, oil.value),
      alt: `${wood.label} bordplade med ${oil.label.toLowerCase()} olie`,
      location,
      note: noteForOilColor(oil.value)
    };
  })
);
