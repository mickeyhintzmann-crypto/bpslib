export const defaultFallback = "/images/placeholders/fallback.jpg";

export const brandAssets = {
  logo: "/images/brand/logo-placeholder.svg",
  favicon: "/images/brand/favicon.png",
  hero: "/images/home/hero.jpg"
} as const;

export const trustAssets = {
  anmeldHaandvaerkerBadge: "/images/trust/anmeld-haandvaerker-badge.png"
} as const;

export const homeAssets = {
  hero: "/images/home/hero.jpg",
  specialist: "/images/home/specialist.jpg",
  estimator: "/images/home/ai-estimator.jpg",
  booking: "/images/home/booking.jpg",
  about: "/images/home/about.jpg",
  guideDefault: "/images/guides/guide-default.jpg"
} as const;

export type CaseAssetItem = {
  src: string;
  alt: string;
};

export type CaseAsset = {
  before: CaseAssetItem;
  after: CaseAssetItem;
};

const defaultCaseAsset: CaseAsset = {
  before: {
    src: defaultFallback,
    alt: "Før-billede af bordplade"
  },
  after: {
    src: defaultFallback,
    alt: "Efter-billede af bordplade"
  }
};

export const caseAssets: Record<string, CaseAsset> = {
  default: defaultCaseAsset,
  "mat-og-toer-overflade": {
    before: {
      src: "/images/cases/eg-natur-before.jpg",
      alt: "Eg bordplade før slibning (natur olie)"
    },
    after: {
      src: "/images/cases/eg-natur-after.jpg",
      alt: "Eg bordplade efter slibning (natur olie)"
    }
  },
  "dybe-ridser": {
    before: {
      src: "/images/cases/boeg-hvid-before.jpg",
      alt: "Bøg bordplade før slibning (hvid olie)"
    },
    after: {
      src: "/images/cases/boeg-hvid-after.jpg",
      alt: "Bøg bordplade efter slibning (hvid olie)"
    }
  },
  "skjolder-efter-varme": {
    before: {
      src: "/images/cases/eg-hvid-before.jpg",
      alt: "Eg bordplade før slibning (hvid olie)"
    },
    after: {
      src: "/images/cases/eg-hvid-after.jpg",
      alt: "Eg bordplade efter slibning (hvid olie)"
    }
  },
  "moerke-pletter": {
    before: {
      src: "/images/cases/valnoed-natur-before.jpg",
      alt: "Valnød bordplade før slibning (natur olie)"
    },
    after: {
      src: "/images/cases/valnoed-natur-after.jpg",
      alt: "Valnød bordplade efter slibning (natur olie)"
    }
  },
  vandmaerker: {
    before: {
      src: "/images/cases/ask-hvid-before.jpg",
      alt: "Ask bordplade før slibning (hvid olie)"
    },
    after: {
      src: "/images/cases/ask-hvid-after.jpg",
      alt: "Ask bordplade efter slibning (hvid olie)"
    }
  },
  "slidt-koekkenbord": {
    before: {
      src: "/images/cases/mahogni-natur-before.jpg",
      alt: "Massiv bordplade før slibning (natur olie)"
    },
    after: {
      src: "/images/cases/mahogni-natur-after.jpg",
      alt: "Massiv bordplade efter slibning (natur olie)"
    }
  },
  "hak-og-ujaevnheder": {
    before: {
      src: "/images/cases/boeg-sort-before.jpg",
      alt: "Bøg bordplade før slibning (sort olie)"
    },
    after: {
      src: "/images/cases/boeg-sort-after.jpg",
      alt: "Bøg bordplade efter slibning (sort olie)"
    }
  },
  "gulnet-lak": {
    before: {
      src: "/images/cases/eg-natur-before.jpg",
      alt: "Eg bordplade før slibning (natur olie)"
    },
    after: {
      src: "/images/cases/eg-natur-after.jpg",
      alt: "Eg bordplade efter slibning (natur olie)"
    }
  },
  olie: {
    before: {
      src: "/images/cases/eg-natur-before.jpg",
      alt: "Eg bordplade før slibning (natur olie)"
    },
    after: {
      src: "/images/cases/eg-natur-after.jpg",
      alt: "Eg bordplade efter slibning (natur olie)"
    }
  },
  lak: {
    before: {
      src: "/images/cases/eg-hvid-before.jpg",
      alt: "Eg bordplade før slibning (hvid olie)"
    },
    after: {
      src: "/images/cases/eg-hvid-after.jpg",
      alt: "Eg bordplade efter slibning (hvid olie)"
    }
  },
  "olie-eller-lak": {
    before: {
      src: "/images/cases/boeg-sort-before.jpg",
      alt: "Bøg bordplade før slibning (sort olie)"
    },
    after: {
      src: "/images/cases/boeg-sort-after.jpg",
      alt: "Bøg bordplade efter slibning (sort olie)"
    }
  },
  skjolder: {
    before: {
      src: "/images/cases/valnoed-natur-before.jpg",
      alt: "Valnød bordplade før slibning (natur olie)"
    },
    after: {
      src: "/images/cases/valnoed-natur-after.jpg",
      alt: "Valnød bordplade efter slibning (natur olie)"
    }
  },
  ridser: {
    before: {
      src: "/images/cases/ask-hvid-before.jpg",
      alt: "Ask bordplade før slibning (hvid olie)"
    },
    after: {
      src: "/images/cases/ask-hvid-after.jpg",
      alt: "Ask bordplade efter slibning (hvid olie)"
    }
  },
  "pris-hub": {
    before: {
      src: "/images/cases/eg-natur-before.jpg",
      alt: "Eg bordplade før slibning (natur olie)"
    },
    after: {
      src: "/images/cases/eg-natur-after.jpg",
      alt: "Eg bordplade efter slibning (natur olie)"
    }
  }
};

export const assets = {
  brand: brandAssets,
  home: homeAssets,
  trust: trustAssets,
  cases: caseAssets
} as const;

export const getCaseAsset = (caseSlug?: string | null): CaseAsset => {
  if (!caseSlug) {
    return defaultCaseAsset;
  }

  return caseAssets[caseSlug] ?? defaultCaseAsset;
};
