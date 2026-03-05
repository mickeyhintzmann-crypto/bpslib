export type GuideCategory = "alle" | "bordplader" | "gulve" | "beslutningsguide" | "generelt";

export type GuideItem = {
  slug: string;
  category: Exclude<GuideCategory, "alle">;
  title: string;
  excerpt: string;
  readTimeMin: number;
  image?: string;
  imageAlt?: string;
};

const fallbackImage = "/media/featured:bordplade/20210302_160950.jpg";

export const guides: GuideItem[] = [
  {
    slug: "bordplade-hvornaar-slibe",
    category: "bordplader",
    title: "Hvornår skal man slibe en bordplade?",
    excerpt: "Tegnene på at overfladen trænger til en opfriskning eller fuld slibning.",
    readTimeMin: 5,
    image: "/media/galleries:bordplade:before-after/case-001_koekken_egetrae_hvid_olie/before.jpg",
    imageAlt: "Bordplade der vurderes inden slibning"
  },
  {
    slug: "bordplade-pris",
    category: "bordplader",
    title: "Hvad koster bordpladeslibning?",
    excerpt: "Overblik over de faktorer der påvirker prisen og hvad du typisk kan forvente.",
    readTimeMin: 4,
    image: "/media/galleries:bordplade:before-after/case-001_koekken_egetrae_hvid_olie/after.jpg",
    imageAlt: "Prisoversigt for bordpladeslibning"
  },
  {
    slug: "bordplade-skjolder",
    category: "bordplader",
    title: "Skjolder på bordplade: årsager og løsninger",
    excerpt: "Vand, varme og olie giver skjolder, men de fleste kan behandles.",
    readTimeMin: 6,
    image: "/media/galleries:bordplade:before-after/case-009_spisebord_teak_natur_olie/before.jpg",
    imageAlt: "Skjolder på træbordplade før behandling"
  },
  {
    slug: "bordplade-ridser",
    category: "bordplader",
    title: "Ridser i bordpladen: hvad kan reddes?",
    excerpt: "Lette ridser kan ofte fjernes, dybere skader kræver mere arbejde.",
    readTimeMin: 5,
    image: "/media/galleries:bordplade:before-after/case-009_spisebord_teak_natur_olie/after.jpg",
    imageAlt: "Ridser i bordplade inden slibning"
  },
  {
    slug: "bordplade-olie-eller-lak",
    category: "bordplader",
    title: "Olie eller lak: vælg rigtigt",
    excerpt: "Sammenligning af look, slidstyrke og vedligehold.",
    readTimeMin: 7,
    image: "/media/galleries:bordplade:before-after/case-004_koekken_egetrae_hvid_olie/case-004_koekken_before.jpeg",
    imageAlt: "Forskellige finish-udtryk på bordplade"
  },
  {
    slug: "bordplade-braendemaerker",
    category: "bordplader",
    title: "Brændemærker/varmepletter: kan det slibes væk?",
    excerpt: "Hvordan vi vurderer dybde og redder overfladen på massiv træ.",
    readTimeMin: 5,
    image: "/media/galleries:bordplade:before-after/case-004_koekken_egetrae_hvid_olie/case-004_koekken_after.jpeg",
    imageAlt: "Varmeplet på træbordplade før behandling"
  },
  {
    slug: "gulvslibning-vs-afhoevling",
    category: "gulve",
    title: "Gulvslibning vs gulvafhøvling",
    excerpt: "Hvornår er slibning nok, og hvornår kræver gulvet afhøvling?",
    readTimeMin: 6,
    image: "/media/galleries:bordplade:before-after/case-011_koekken_mahogni_natur_olie/before.jpeg",
    imageAlt: "Trægulv under renovering"
  },
  {
    slug: "gulv-lak-olie-saebe",
    category: "gulve",
    title: "Lak, olie eller sæbe til gulv?",
    excerpt: "Forskelle i udtryk, vedligehold og holdbarhed.",
    readTimeMin: 5,
    image: "/media/galleries:bordplade:before-after/case-011_koekken_mahogni_natur_olie/after.jpeg",
    imageAlt: "Gulvfinish i forskelligt lys"
  },
  {
    slug: "gulv-ridser",
    category: "gulve",
    title: "Ridser i gulv: løsninger",
    excerpt: "Hvad der kan slibes væk, og hvornår man bør renovere hele gulvet.",
    readTimeMin: 4,
    image: "/media/galleries:bordplade:before-after/case-010_koekken_valnoed_natur_olie/before.JPG",
    imageAlt: "Ridser i trægulv"
  },
  {
    slug: "bordplade-massiv-vs-finer",
    category: "beslutningsguide",
    title: "Kan din bordplade slibes? massiv vs finér/laminat",
    excerpt: "Sådan ser du forskel på materialer, og hvad vi kan hjælpe med.",
    readTimeMin: 6,
    image: "/media/galleries:bordplade:before-after/case-010_koekken_valnoed_natur_olie/after.jpeg",
    imageAlt: "Kant på bordplade der viser materiale"
  },
  {
    slug: "vaelg-finish-mat-vs-slidstaerk",
    category: "beslutningsguide",
    title: "Vælg finish: mat/naturlig vs slidstærk",
    excerpt: "Find det rigtige match til brug og forventninger.",
    readTimeMin: 5,
    image: "/media/galleries:bordplade:before-after/case-003_koekken_gummitrae_hvid_olie/case-003_koekken_before.jpeg",
    imageAlt: "Bordplade med mat finish"
  },
  {
    slug: "forberedelse-foer-besoeg",
    category: "generelt",
    title: "Sådan forbereder du hjemmet før vi kommer",
    excerpt: "Enkle forberedelser gør arbejdet hurtigere og mere effektivt.",
    readTimeMin: 4,
    image: "/media/galleries:bordplade:before-after/case-003_koekken_gummitrae_hvid_olie/case-003_koekken_after.jpeg",
    imageAlt: "Køkken klar til håndværkerbesøg"
  }
];
