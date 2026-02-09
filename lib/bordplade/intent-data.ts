export type IntentLink = {
  href: string;
  label: string;
};

export type IntentFaq = {
  question: string;
  answer: string;
};

export type IntentSection = {
  heading: string;
  paragraphs: string[];
};

export type IntentMiniCase = {
  title: string;
  problem: string;
  solution: string;
  outcome: string;
};

export type IntentPageData = {
  path: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  heroIntro: string;
  sections: IntentSection[];
  miniCase: IntentMiniCase;
  faq: IntentFaq[];
  relatedLinks: IntentLink[];
  serviceName: string;
  serviceDescription: string;
};

export const intentPages: Record<string, IntentPageData> = {
  olie: {
    path: "/bordpladeslibning/olie",
    title: "Oliebehandling af bordplade i massiv træ",
    metaTitle: "Oliebehandling af bordplade",
    metaDescription:
      "Læs hvornår olie er den rigtige finish til massiv træbordplade, hvad du kan forvente af holdbarhed og hvordan vi udfører behandlingen.",
    eyebrow: "Finish i fokus",
    heroIntro:
      "Olie fremhæver træets struktur og giver en naturlig overflade, der kan vedligeholdes løbende. Vi vurderer trætype, brugsmønster og nuværende slitage før vi anbefaler behandling.",
    sections: [
      {
        heading: "Hvornår giver olie mest mening?",
        paragraphs: [
          "Olie er ofte det bedste valg, når du vil bevare et varmt og levende udtryk i bordpladen. Overfladen får dybde, og årer i træet står tydeligere frem end ved mange laksystemer. I køkkener med moderat belastning kan olie være en stærk løsning, fordi små mærker kan vedligeholdes lokalt uden at hele fladen skal bygges op igen. Det gør modellen mere fleksibel over tid.",
          "Vi anbefaler især olie, hvis du ønsker en mere taktil overflade og accepterer løbende pleje som en del af vedligeholdet. Det er ikke en svag løsning, men den kræver en realistisk forventning til brug. Spild bør tørres af hurtigt, og vi gennemgår altid en konkret rutine efter behandling, så du ved hvordan finishen holder bedst muligt i hverdagen."
        ]
      },
      {
        heading: "Sådan udfører vi oliebehandling",
        paragraphs: [
          "Først sliber vi bordpladen ned i flere trin, så overfladen bliver ensartet og klar til at optage olie jævnt. Vi arbejder med kontrolleret støv og afdækning af omkringliggende områder, fordi en ren overflade er afgørende for resultatet. Hvis der er gamle skjolder eller mørke områder, vurderer vi om de kan reduceres fuldt eller kun delvist, og du får tydelig forventningsafstemning inden finish.",
          "Når slibningen er godkendt, påfører vi olie i den rigtige mængde i forhold til trætype og sugeevne. For meget olie kan give en fedtet overflade, og for lidt olie giver ujævnt udtryk. Derfor arbejder vi i kontrollerede lag og med korrekt aftørring mellem trin. Til sidst rådgiver vi om første rengøring, tørretid og hvornår bordpladen igen kan belastes normalt."
        ]
      },
      {
        heading: "Holdbarhed, vedligehold og pris",
        paragraphs: [
          "Holdbarheden afhænger af belastning, rengøring og hvor konsekvent du er med efterbehandling. I et travlt køkken anbefaler vi som regel en let vedligeholdelsesplan med intervaller, så du undgår at overfladen bliver helt tør før næste pleje. På den måde bliver samlet driftsomkostning ofte lavere, fordi du forebygger dybe skader og store indgreb senere. Vi kan udføre sæbebehandling, men til bordplader anbefaler vi den sjældent, fordi beskyttelsen er lavere i et køkkenmiljø.",
          "Prisniveauet påvirkes af bordpladens størrelse, nuværende tilstand og hvor mange trin der kræves før finish. Hvis bordpladen har dybe ridser, gammel lakrest eller misfarvning, kan klargøringen tage længere tid end selve olielaget. Derfor er foto-vurdering vigtig før endelig pris. Upload altid kantbillede og nærbillede, så vurderingen bliver mere præcis fra starten."
        ]
      },
      {
        heading: "Typiske fejl vi hjælper dig uden om",
        paragraphs: [
          "En klassisk fejl er at vælge en tilfældig olie uden at matche produktet til trætype og slidniveau. Det kan give skjolder, ujævn glans eller overflader, der føles klistrede i lang tid. En anden fejl er for aggressiv rengøring med stærke midler lige efter behandling. Vi giver konkrete anbefalinger til milde produkter, så finishen stabiliserer sig korrekt i de første uger.",
          "Vi ser også mange bordplader hvor tidligere lag ikke er fjernet ensartet før ny olie. Resultatet bliver pletvis absorbering og et udtryk, der hurtigt ser slidt ud igen. Derfor prioriterer vi grundarbejdet højt og bruger tid på at få fladen ens, før finishen lægges. Det er den del, der giver et resultat som både ser bedre ud og holder længere."
        ]
      }
    ],
    miniCase: {
      title: "Eg-bordplade med tørre zoner",
      problem: "Overfladen var mat, tør og havde begyndende skjolder omkring vasken.",
      solution: "Hel slibning i trin og ny oliebehandling med korrekt mætning og aftørring.",
      outcome: "Jævn, varm finish og en overflade der var nem at vedligeholde i daglig brug."
    },
    faq: [
      {
        question: "Hvor ofte skal en olieret bordplade vedligeholdes?",
        answer:
          "Det afhænger af brugen, men mange køkkenbordplader har gavn af let vedligehold flere gange årligt."
      },
      {
        question: "Kan olie tåle vand i køkkenet?",
        answer:
          "Ja, hvis overfladen er korrekt opbygget og spild tørres af hurtigt. Vi rådgiver om konkret vedligehold."
      },
      {
        question: "Bliver overfladen fedtet efter olie?",
        answer:
          "Ikke når olien påføres og aftørres korrekt. En fedtet følelse skyldes typisk overdosering eller forkert hærdning."
      },
      {
        question: "Kan I oliere uden at slibe først?",
        answer:
          "I nogle tilfælde ja, men ved synlig slitage anbefaler vi slibning for at få et ensartet resultat."
      },
      {
        question: "Er olie billigere end lak?",
        answer:
          "Det kan være billigere ved opstart, men samlet økonomi afhænger af hvor ofte der skal vedligeholdes."
      },
      {
        question: "Hvordan får jeg en præcis pris?",
        answer:
          "Upload 3–6 billeder inklusiv kantfoto, så vi kan vurdere trætype, slitage og behandlingsbehov."
      }
    ],
    relatedLinks: [
      { href: "/bordpladeslibning/lak", label: "Se hvornår lak er bedre" },
      { href: "/bordpladeslibning/olie-eller-lak", label: "Sammenlign olie og lak" },
      { href: "/bordpladeslibning/skjolder", label: "Læs om skjolder" }
    ],
    serviceName: "Oliebehandling af massiv træbordplade",
    serviceDescription:
      "Slibning og oliebehandling af bordplader i massiv træ med fokus på holdbarhed, finish og vedligehold."
  },
  lak: {
    path: "/bordpladeslibning/lak",
    title: "Lakering af bordplade i massiv træ",
    metaTitle: "Lakering af bordplade",
    metaDescription:
      "Forstå hvornår lak er det rigtige valg til massiv træbordplade, hvad der er inkluderet i processen og hvordan du får en holdbar overflade.",
    eyebrow: "Slidstærk finish",
    heroIntro:
      "Lak er relevant når du ønsker en robust, nemt rengørbar overflade med høj modstand mod daglig slitage. Vi rådgiver om glans, opbygning og realistisk levetid.",
    sections: [
      {
        heading: "Hvornår bør du vælge lak?",
        paragraphs: [
          "Lak er typisk det stærkeste valg i hjem med høj belastning, hvor bordpladen bruges intensivt hver dag. En korrekt opbygget lakfilm giver god modstand mod væske, fedt og almindelig rengøring, og den gør løbende vedligehold mere enkel end ved nogle olieforløb. Hvis du vil minimere hyppigheden af efterbehandling, er lak ofte et fornuftigt kompromis mellem beskyttelse og udtryk.",
          "Samtidig er det vigtigt at vælge den rigtige laktype i forhold til ønsket finish. Nogle foretrækker et næsten usynligt, mat resultat, mens andre ønsker mere dybde og glød. Vi gennemgår altid de visuelle mål før opstart, så du undgår at ende med en overflade der føles for blank eller for lukket i forhold til din stil."
        ]
      },
      {
        heading: "Proces fra slibning til færdig lak",
        paragraphs: [
          "Et holdbart resultat starter med korrekt forarbejde. Vi sliber ned i flere trin, retter lokale ujævnheder og sikrer en ren overflade uden rester fra tidligere behandling. Hvis gammel lak sidder ujævnt, skal den fjernes kontrolleret, ellers binder nye lag ikke ensartet. Vi dokumenterer undervejs, så du ved hvor vi er i processen og hvad næste trin er.",
          "Efter forarbejde opbygges lakken i lag med passende tørretid. Vi går ikke på kompromis med hærdning, fordi det er her mange hurtigløsninger fejler. En overflade kan se tør ud uden at være klar til belastning. Derfor får du tydelig information om hvornår bordpladen kan bruges normalt igen, og hvilke rengøringsmidler der er sikre i de første uger."
        ]
      },
      {
        heading: "Pris og levetid i praksis",
        paragraphs: [
          "Prisen afhænger af areal, slidniveau, eksisterende behandling og hvor mange lag der er nødvendige for den ønskede robusthed. Et bord med dybe ridser eller gammel ujævn finish kræver mere klargøring, og det påvirker tidsforbruget markant. Derfor giver vi kun endelig pris efter billeder og korte projektoplysninger, så estimatet bliver realistisk.",
          "Levetiden på lak varierer med brug og vedligehold, men den opfattes ofte som stabil fordi overfladen kræver mindre løbende pleje. Hvis der senere opstår lokal skade, vurderer vi om punktreparation giver et acceptabelt resultat, eller om en større genopbygning er bedst. Vores mål er altid at vælge den løsning der giver bedst samlet økonomi over tid."
        ]
      },
      {
        heading: "Typiske misforståelser om lak",
        paragraphs: [
          "Mange tror at lak er vedligeholdelsesfri. Det passer ikke helt. Overfladen kræver stadig korrekt rengøring og skånsomme rutiner for at holde pæn længst muligt. Grov slibende rengøring eller hårde kemikalier kan reducere holdbarheden markant. Vi giver derfor altid en kort driftsguide, så du kan bevare finishen uden unødige fejl i dagligdagen.",
          "En anden misforståelse er at lak altid ser plastisk ud. Med rigtige produkter og korrekt opbygning kan du opnå et roligt og naturligt udtryk, der stadig beskytter effektivt. Valget står ikke mellem natur og holdbarhed, men mellem forskellige kompromiser. Sæbebehandling kan udføres, men vi anbefaler normalt olie eller lak til bordplader. Vi hjælper dig med at vælge niveauet ud fra æstetik, brug og ønsket serviceinterval."
        ]
      }
    ],
    miniCase: {
      title: "Familiekøkken med høj belastning",
      problem: "Bordpladen havde slidbaner, matte felter og begyndende vandskader omkring vasken.",
      solution: "Kontrolleret afslibning og ny lakopbygning med fokus på kanter og vådzoner.",
      outcome: "Robust overflade med ensartet udtryk og markant lettere rengøring i hverdagen."
    },
    faq: [
      {
        question: "Er lak bedre end olie?",
        answer:
          "Det afhænger af brug og ønsket look. Lak er ofte stærkere mod daglig belastning, olie er mere fleksibel at vedligeholde lokalt."
      },
      {
        question: "Kan I lave mat lak?",
        answer:
          "Ja, vi kan tilpasse glansniveau efter ønsket udtryk og praktiske krav i rummet."
      },
      {
        question: "Hvor længe skal lak tørre?",
        answer:
          "Der er forskel på overfladetør og fuld hærdning. Vi giver konkrete tider for netop din løsning."
      },
      {
        question: "Kan ridser fjernes før lakering?",
        answer:
          "Som regel ja. Dybde og trætype afgør hvor meget der kan fjernes ved slibning."
      },
      {
        question: "Kan jeg selv lappe en lokal skade i lak?",
        answer:
          "Nogle små skader kan håndteres, men synlig overgang er en risiko. Vi vurderer bedst metode ud fra skaden."
      },
      {
        question: "Hvordan får jeg et tilbud?",
        answer:
          "Upload billeder og mål i prisberegneren. Så får du et konkret forslag til behandling og prisniveau."
      }
    ],
    relatedLinks: [
      { href: "/bordpladeslibning/olie", label: "Læs om oliebehandling" },
      { href: "/bordpladeslibning/olie-eller-lak", label: "Sammenlign olie og lak" },
      { href: "/bordpladeslibning/ridser", label: "Læs om ridser" }
    ],
    serviceName: "Lakering af massiv træbordplade",
    serviceDescription:
      "Slibning og opbygning af lak på massiv træbordplader med fokus på slidstyrke, rengøring og ensartet finish."
  },
  "olie-eller-lak": {
    path: "/bordpladeslibning/olie-eller-lak",
    title: "Olie eller lak til bordplade i massiv træ",
    metaTitle: "Olie eller lak til bordplade",
    metaDescription:
      "Sammenlign olie og lak til massiv træbordplade. Se forskelle i udtryk, holdbarhed, vedligehold og pris før du vælger finish.",
    eyebrow: "Vælg den rigtige finish",
    heroIntro:
      "Valget mellem olie og lak handler ikke kun om smag. Det handler om belastning, vedligeholdsvaner og hvor meget beskyttelse du ønsker i hverdagen.",
    sections: [
      {
        heading: "Udtryk og følelse i overfladen",
        paragraphs: [
          "Olie giver som regel det mest naturlige look. Træets struktur og farvespil står tydeligt frem, og overfladen får en mere levende karakter. Mange vælger olie, når de ønsker et varmt og organisk udtryk i køkkenet. Lak kan også være flot og rolig, men opleves ofte mere ensartet og lukket. Derfor starter vi altid med at afklare, hvordan du gerne vil have bordpladen til at se ud i dagligdagen.",
          "Hvis du prioriterer en flade der visuelt ændrer sig mindre over tid, kan lak være det sikre valg. Hvis du derimod accepterer lidt mere naturlig patina i bytte for fleksibel vedligehold, peger valget ofte mod olie. Begge løsninger kan være rigtige, men de kræver forskellige forventninger til drift, rengøring og fremtidig opfriskning. Sæbebehandling er muligt, men vi anbefaler det sjældent til bordplader, fordi beskyttelsen er lavere."
        ]
      },
      {
        heading: "Holdbarhed og daglig brug",
        paragraphs: [
          "I hjem med mange måltider, høj aktivitet og hyppig rengøring vil lak ofte give den mest robuste barriere på kort sigt. Den beskytter effektivt mod almindelig påvirkning, når opbygningen er korrekt udført. Olie kan stadig være holdbar, men kræver hurtigere reaktion på væskespild og en mere aktiv vedligeholdelsesrutine. Derfor spørger vi altid ind til brugsmønster før vi anbefaler finish.",
          "Holdbarhed skal ikke kun måles i måneder før næste behandling, men i samlet driftsøkonomi over flere år. En løsning med færre indgreb kan være dyrere at reparere, mens en løsning med hyppigere pleje kan være billigere at holde pæn kontinuerligt. Vi hjælper med at vælge den model, der passer til dine vaner og dit ønskede serviceniveau."
        ]
      },
      {
        heading: "Vedligehold og fremtidige reparationer",
        paragraphs: [
          "Med olie kan mindre slitage ofte håndteres lokalt, hvilket giver fleksibilitet hvis du vil undgå større indgreb. Til gengæld kræver det disciplin i vedligehold, især i vådzoner. Lak kræver som regel mindre løbende indsats i hverdagen, men lokale reparationer kan være vanskeligere at skjule helt. Derfor anbefaler vi at tænke både kort og langt, når finish vælges første gang.",
          "Vi møder ofte kunder der vælger ud fra pris alene ved opstart. Det kan give forkerte forventninger senere. Den rigtige beslutning kræver at man sammenligner opstartspris, vedligehold, udseende og sandsynlige fremtidige reparationer samlet. På den måde vælger du ikke kun den billigste løsning nu, men den mest stabile løsning over tid."
        ]
      },
      {
        heading: "Sådan vælger du sikkert",
        paragraphs: [
          "Hvis du er i tvivl, anbefaler vi at starte med en hurtig foto-vurdering. Med billeder af overflade og kant kan vi bedre vurdere trætype, slitage og hvilke løsninger der realistisk giver det resultat du ønsker. Derefter får du en tydelig anbefaling med begrundelse, så valget mellem olie og lak bliver datadrevet i stedet for gæt.",
          "Du kan også booke tid direkte, hvis bordpladen allerede er klar til behandling. Vi kan typisk afklare finish-valg i forbindelse med opgaven, så du ikke skal træffe beslutningen alene. Målet er et resultat, der holder i praksis og ikke kun ser godt ud de første uger."
        ]
      }
    ],
    miniCase: {
      title: "Valg mellem olie og lak i nyt køkken",
      problem: "Kunden var i tvivl om naturligt look eller maksimal robusthed ved daglig brug.",
      solution: "Sammenligning af brugsmønster, rengøring og forventet serviceinterval før valg.",
      outcome: "Valgt løsning matchede både æstetik og drift, uden behov for hurtig ombehandling."
    },
    faq: [
      {
        question: "Hvad holder længst, olie eller lak?",
        answer:
          "Lak holder ofte længst mellem behandlinger, mens olie er lettere at vedligeholde lokalt."
      },
      {
        question: "Hvad ser mest naturligt ud?",
        answer: "Olie giver som regel det mest naturlige og varme udtryk i træet."
      },
      {
        question: "Hvad er billigst?",
        answer:
          "Opstartsprisen kan variere, men samlet økonomi afhænger af vedligehold og fremtidige reparationer."
      },
      {
        question: "Kan man skifte fra olie til lak?",
        answer:
          "Ja, i mange tilfælde. Bordpladen skal dog forberedes korrekt for at sikre god vedhæftning."
      },
      {
        question: "Hvordan vælger I for mig?",
        answer:
          "Vi vurderer trætype, belastning og ønsket udtryk ud fra billeder og din daglige brug."
      },
      {
        question: "Skal jeg booke eller bruge prisberegneren først?",
        answer:
          "Hvis du er i tvivl om finish, start med prisberegneren. Hvis du er klar, kan du booke direkte."
      }
    ],
    relatedLinks: [
      { href: "/bordpladeslibning/olie", label: "Læs om olie" },
      { href: "/bordpladeslibning/lak", label: "Læs om lak" },
      { href: "/bordpladeslibning/kan-det-slibes", label: "Tjek om bordpladen kan slibes" }
    ],
    serviceName: "Valg af finish til massiv træbordplade",
    serviceDescription:
      "Rådgivning om olie eller lak til bordplader i massiv træ baseret på brugsmønster, æstetik og holdbarhed."
  },
  skjolder: {
    path: "/bordpladeslibning/skjolder",
    title: "Fjern skjolder på bordplade i massiv træ",
    metaTitle: "Fjern skjolder på bordplade",
    metaDescription:
      "Se hvordan skjolder opstår i massiv træbordplader, hvad der kan fjernes ved slibning, og hvornår olie eller lak giver bedst beskyttelse bagefter.",
    eyebrow: "Problem: skjolder",
    heroIntro:
      "Skjolder opstår typisk ved varme, vand eller kemisk påvirkning. Vi vurderer dybde og type før vi anbefaler slibning og ny finish.",
    sections: [
      {
        heading: "Hvorfor opstår skjolder?",
        paragraphs: [
          "Skjolder i massiv træ opstår ofte når væske eller varme påvirker overfladen over tid. I nogle tilfælde ligger skaden i den eksisterende finish, i andre tilfælde er træet selv påvirket. Den forskel er vigtig, fordi den afgør om en let opfriskning er nok, eller om der skal dybere slibning til. Derfor starter vi altid med at kortlægge typen af skade før vi anbefaler løsning.",
          "Typiske årsager er varme gryder, vand omkring vask, stærke rengøringsmidler eller manglende vedligehold over længere tid. Nogle skjolder ser værre ud end de reelt er, mens andre er mere dybe end man tror. Foto-vurdering med nærbillede og skrå lysretning hjælper os med at se niveauet tidligt og give et mere præcist forslag."
        ]
      },
      {
        heading: "Kan skjolder fjernes helt?",
        paragraphs: [
          "I mange tilfælde kan skjolder reduceres markant eller fjernes helt med korrekt slibning. Resultatet afhænger dog af hvor dybt misfarvningen er trukket ned i træet. Jo tidligere du reagerer, jo bedre er chancen for fuld korrektion. Ved meget dybe skader kan en vis toneforskel blive tilbage, men vi kan ofte bringe overfladen til et niveau, hvor skaden ikke længere dominerer visuelt.",
          "Vi kommunikerer altid realistisk forventning før opstart. Det betyder at du får ærlig besked om sandsynligt slutresultat, ikke kun et optimistisk løfte. Hvis vi vurderer at total fjernelse er usandsynlig, foreslår vi den bedste balance mellem æstetik, pris og tidsforbrug. Det giver færre overraskelser og et mere trygt forløb."
        ]
      },
      {
        heading: "Slibning, finish og forebyggelse",
        paragraphs: [
          "Efter afrensning og slibning anbefaler vi en finish, der passer til brugen af bordpladen. Nogle hjem har størst gavn af olie med planlagt vedligehold, andre af lak for højere daglig robusthed. Vi kan udføre sæbebehandling, men til bordplader anbefaler vi typisk olie eller lak, fordi beskyttelsen er bedre i et køkken. Valget påvirker hvor hurtigt nye skjolder kan opstå, og hvor let de senere kan håndteres. Derfor kobler vi altid behandling og driftsrutine sammen i samme anbefaling.",
          "Forebyggelse handler især om rutiner: hurtig aftørring af væske, varmebeskyttelse og korrekt rengøring. Små vaner gør stor forskel på lang sigt. Vi giver en kort vedligeholdelsesguide efter opgaven, så du ved præcis hvad der skal gøres uge for uge og måned for måned. Det reducerer risikoen for at samme problem vender tilbage kort tid efter."
        ]
      },
      {
        heading: "Sådan får du hurtig afklaring",
        paragraphs: [
          "Send 3–6 billeder hvor skjolden ses i forskelligt lys og med fokus på kantområder. Det gør det lettere at skelne mellem overfladeskade og dybere misfarvning. Vi bruger billederne til at estimere omfang, foreslå behandling og anbefale om du bør starte med prisberegner eller gå direkte til booking. Processen er hurtig og giver dig en konkret retning med det samme.",
          "Hvis bordpladen ikke er massiv træ, hjælper vi dig stadig videre med en venlig anbefaling. Vi prioriterer at give ærlig afklaring tidligt, så du ikke bruger tid eller budget på en løsning der ikke passer til materialet."
        ]
      }
    ],
    miniCase: {
      title: "Varme-skjolder ved kogezone",
      problem: "Store hvide skjolder efter varmepåvirkning og gammel udtørret finish.",
      solution: "Slibning i trin, lokal korrektion og ny behandling tilpasset høj belastning.",
      outcome: "Skjolderne blev fjernet markant, og overfladen fremstod ensartet og robust."
    },
    faq: [
      {
        question: "Kan varme-skjolder fjernes?",
        answer:
          "Ofte ja, men det afhænger af hvor dybt skaden er trukket ned i træet eller finishen."
      },
      {
        question: "Skal hele bordpladen slibes?",
        answer:
          "I mange tilfælde ja, for at sikre ensartet udtryk og undgå synlige overgange."
      },
      {
        question: "Kommer skjolderne igen?",
        answer:
          "Ikke nødvendigvis. Med korrekt finish og gode rutiner kan risikoen reduceres betydeligt."
      },
      {
        question: "Er olie eller lak bedst mod skjolder?",
        answer:
          "Det afhænger af brugsmønster. Lak giver ofte høj robusthed, olie giver fleksibel vedligehold."
      },
      {
        question: "Hvor hurtigt kan I vurdere min bordplade?",
        answer:
          "Som regel samme dag eller næste hverdag, når billederne er tydelige."
      },
      {
        question: "Kan I hjælpe hvis bordpladen ikke er massiv?",
        answer:
          "Ja, vi giver en ærlig afklaring og henviser videre til relevant løsning via tilbudstid."
      }
    ],
    relatedLinks: [
      { href: "/bordpladeslibning/ridser", label: "Læs om ridser" },
      { href: "/bordpladeslibning/olie-eller-lak", label: "Vælg mellem olie og lak" },
      { href: "/bordpladeslibning/kan-det-slibes", label: "Tjek om den kan slibes" }
    ],
    serviceName: "Fjernelse af skjolder på massiv træbordplade",
    serviceDescription:
      "Vurdering og behandling af skjolder på massiv træbordplader med slibning og korrekt efterbehandling."
  },
  ridser: {
    path: "/bordpladeslibning/ridser",
    title: "Fjern ridser i bordplade i massiv træ",
    metaTitle: "Fjern ridser i bordplade",
    metaDescription:
      "Læs hvordan ridser i massiv træbordplader vurderes og fjernes, samt hvilke finish-valg der bedst forebygger nye synlige mærker.",
    eyebrow: "Problem: ridser",
    heroIntro:
      "Ridser i massiv træ kan ofte fjernes eller reduceres tydeligt med korrekt slibning. Vi vurderer dybde og vælger finish, så overfladen holder bedre fremover.",
    sections: [
      {
        heading: "Typer af ridser og hvad de betyder",
        paragraphs: [
          "Overfladiske ridser ligger typisk i den eksisterende behandling og kan ofte korrigeres relativt hurtigt. Dybe ridser går længere ned i træet og kræver mere kontrolleret slibning for at få en jævn flade igen. Forskellen er vigtig for både tidsforbrug og pris. Derfor beder vi om nærbilleder i skråt lys, så dybde og retning bliver tydelig allerede i første vurdering.",
          "Ridser opstår ofte i områder med høj aktivitet, for eksempel omkring madlavning og servering. Hvis overfladen i forvejen er tør eller ujævn, bliver mærkerne mere synlige. Vi vurderer derfor ikke kun ridsen isoleret, men hele bordpladens tilstand. Det giver en mere holdbar løsning end hurtige punktløsninger, der kun skjuler problemet kortvarigt."
        ]
      },
      {
        heading: "Hvornår kan ridser fjernes helt?",
        paragraphs: [
          "Mange ridser kan fjernes helt, især hvis de ikke går for dybt ned i fibrene. Ved dybere mærker kan vi ofte reducere synligheden markant, men i enkelte tilfælde kan en svag strukturforskel blive tilbage. Vi lover ikke mere end materialet tillader, men vi finder den løsning der giver bedst kombination af æstetik, økonomi og holdbarhed.",
          "Hvis bordpladen har mange gamle ridser i forskellige retninger, anbefaler vi typisk en samlet genopfriskning fremfor lokale korrektioner. Det giver en rolig, ensartet overflade og bedre bund for ny finish. Lokale lapninger kan virke billige her og nu, men kan give ujævn glans og kortere levetid i praksis."
        ]
      },
      {
        heading: "Efterbehandling som forebygger nye ridser",
        paragraphs: [
          "Efter slibning vælger vi finish ud fra hvordan bordpladen bruges. Ved høj belastning kan en robust lakopbygning være relevant, mens olie kan være bedre hvis du ønsker let lokal vedligehold og et naturligt look. Sæbebehandling kan udføres, men vi anbefaler den sjældent til bordplader, fordi den kræver mere vedligehold. Der findes ikke én løsning til alle. Vi anbefaler ud fra dine vaner, ikke ud fra standardpakker.",
          "Forebyggelse handler også om daglig adfærd. Brug skærebræt konsekvent, undgå hårde rengøringsredskaber og tør grus eller partikler af før de bliver trukket hen over overfladen. Små rutiner gør stor forskel for hvor hurtigt nye ridser opstår. Vi giver altid konkrete råd, så du kan beskytte investeringen efter opgaven."
        ]
      },
      {
        heading: "Sådan får du et realistisk tilbud",
        paragraphs: [
          "Upload billeder med både nærbilleder af ridserne og et samlet billede af hele bordpladen. Kombiner gerne med et billede af kanten, så vi kan bekræfte materialet. Det giver os mulighed for at estimere både slibedybde, finishbehov og forventet tidsforbrug mere præcist. Jo bedre input, jo mere præcist tilbud.",
          "Er du i tvivl om bordpladen overhovedet kan slibes, så start med siden om materialeafklaring. Vi hjælper dig videre hurtigt og ærligt, så du undgår at bruge tid på en løsning der ikke passer til underlaget."
        ]
      }
    ],
    miniCase: {
      title: "Ridset køkkenø i massiv eg",
      problem: "Mange dybe ridser fra daglig brug og ujævn tidligere behandling.",
      solution: "Helhedsslibning med fokus på ens retning i fibrene og ny finish.",
      outcome: "Markant roligere overflade med færre synlige mærker og stærkere beskyttelse."
    },
    faq: [
      {
        question: "Kan alle ridser fjernes?",
        answer:
          "Mange kan fjernes helt, men meget dybe ridser kan efterlade svage spor afhængigt af trætype og dybde."
      },
      {
        question: "Er punktreparation en god idé?",
        answer:
          "Kun ved mindre skader. Ved større slid giver helhedsslibning normalt et langt bedre resultat."
      },
      {
        question: "Bliver bordpladen tyndere af slibning?",
        answer:
          "Der fjernes kun den nødvendige mængde. Vi sliber kontrolleret for at bevare styrke og geometri."
      },
      {
        question: "Hvilken finish skjuler ridser bedst?",
        answer:
          "Matte og rolige finish kan gøre små mærker mindre synlige, men valg afhænger af brug og ønsket look."
      },
      {
        question: "Hvor hurtigt kan jeg få en pris?",
        answer:
          "Typisk samme dag eller næste hverdag, når vi har modtaget tydelige billeder."
      },
      {
        question: "Sliber I også finer?",
        answer:
          "Vi arbejder kun med massiv træ. Hvis du er i tvivl, kan vi afklare det ud fra kantfoto."
      }
    ],
    relatedLinks: [
      { href: "/bordpladeslibning/skjolder", label: "Læs om skjolder" },
      { href: "/bordpladeslibning/olie-eller-lak", label: "Vælg den rigtige finish" },
      { href: "/bordpladeslibning/kan-det-slibes", label: "Tjek materialet" }
    ],
    serviceName: "Fjernelse af ridser på massiv træbordplade",
    serviceDescription:
      "Slibning og efterbehandling af ridset massiv træbordplade med fokus på ensartet finish og holdbar beskyttelse."
  },
  "slidt-mat-overflade": {
    path: "/bordpladeslibning/slidt-mat-overflade",
    title: "Slidt eller mat bordplade – få den som ny igen",
    metaTitle: "Slidt eller mat bordplade | Få den som ny igen (massiv træ)",
    metaDescription:
      "Er din bordplade blevet slidt og mat? Vi sliber og behandler kun massive træbordplader på Sjælland. Få pris via billeder eller book tid.",
    eyebrow: "Problem: slidt/mat",
    heroIntro:
      "En bordplade bliver ofte mat og slidt i de mest brugte zoner omkring vask, komfur og servering. Når finishen slides ned, mister træet glød og beskyttelse, men massiv træ kan ofte reddes med kontrolleret slibning og ny behandling. Vi vurderer altid slidets omfang, træsort og nuværende finish, så du får en realistisk forventning til resultatet.",
    sections: [
      {
        heading: "Hvad betyder slidt eller mat overflade?",
        paragraphs: [
          "En mat overflade opstår typisk når olie eller lak er nedbrudt i overfladen, og træets fibre ikke længere er beskyttet ensartet. Du vil ofte se grå eller kedelige felter, ujævn glans og små mærker der tidligere var skjulte.",
          "Det betyder ikke, at bordpladen er færdig. Hvis træet er massivt, kan vi ofte slibe os ned til et frisk lag og genopbygge finishen, så bordpladen igen fremstår rolig og modstandsdygtig."
        ]
      },
      {
        heading: "Hvad kan typisk reddes?",
        paragraphs: [
          "Vi ser ofte matte felter, lette ridser, overfladeslid og misfarvning ved vask. I mange tilfælde kan det behandles i samme forløb. Jo tidligere du reagerer, jo mindre slibning kræves, og jo bedre bliver den endelige finish.",
          "Hvis overfladen er meget udtørret, kan vi vælge en behandling der lukker bedre af mod fremtidig slid. Vi gennemgår altid dine vaner i køkkenet, så anbefalingen passer til den daglige brug."
        ]
      },
      {
        heading: "Sådan løser vi det",
        paragraphs: [
          "Vi starter med billedvurdering, hvor du sender 3-6 fotos inklusiv kant/ende. Derefter planlægger vi slibning i trin, så overfladen bliver ensartet uden unødigt materiale-tab.",
          "Til sidst vælger vi behandling, typisk olie eller lak. Sæbebehandling kan udføres, men vi anbefaler den sjældent til bordplader, fordi beskyttelsen er lavere i et aktivt køkken."
        ]
      },
      {
        heading: "Pris og tid",
        paragraphs: [
          "Prisen afhænger af størrelse, slid og valg af finish. Mindre opgaver klarer vi ofte på 1 slot, mens større opgaver kan kræve 2-3 slots. Se prisguiden for overblik og brug prisberegneren for et konkret estimat.",
          "Hvis du allerede er klar, kan du booke tid direkte. Er du i tvivl om materialet, starter vi altid med at afklare om bordpladen er massiv træ."
        ]
      },
      {
        heading: "Kun massiv træ",
        paragraphs: [
          "Vi sliber kun massive træbordplader. Er du i tvivl, kan et kant- eller endebillede give hurtig afklaring via prisberegneren."
        ]
      }
    ],
    miniCase: {
      title: "Mat køkkenbord blev frisket op",
      problem: "Matte felter og ujævn glans i de mest brugte zoner.",
      solution: "Kontrolleret slibning og ny behandling tilpasset daglig belastning.",
      outcome: "Ensartet overflade med roligt udtryk og bedre beskyttelse."
    },
    faq: [
      {
        question: "Kan en mat bordplade blive pæn igen?",
        answer:
          "Ja, i massiv træ kan vi ofte slibe og genopbygge finishen, så overfladen ser ny ud."
      },
      {
        question: "Skal hele bordpladen slibes?",
        answer:
          "Som regel ja, for at undgå synlige overgange og sikre ensartet udtryk."
      },
      {
        question: "Olie eller lak bagefter?",
        answer:
          "Det afhænger af brug og ønsket look. Vi rådgiver ud fra belastning og vedligehold."
      },
      {
        question: "Hvor lang tid tager det?",
        answer:
          "Mange opgaver klares på 1 slot, men større opgaver kan kræve 2-3 slots."
      },
      {
        question: "Hvad koster det typisk?",
        answer:
          "Pris afhænger af størrelse, tilstand og finish. Brug prisberegneren for et konkret estimat."
      },
      {
        question: "Kører I på hele Sjælland?",
        answer:
          "Ja, vi dækker hele Sjælland og planlægger tider ud fra opgavens omfang."
      }
    ],
    relatedLinks: [
      { href: "/bordpladeslibning/pris", label: "Se prisguiden" },
      { href: "/bordpladeslibning/olie-eller-lak", label: "Vælg mellem olie og lak" },
      { href: "/bordpladeslibning/skjolder", label: "Skjolder og varmepletter" },
      { href: "/bordpladeslibning/ridser", label: "Ridser i bordpladen" }
    ],
    serviceName: "Renovering af slidt eller mat massiv træbordplade",
    serviceDescription:
      "Slibning og ny behandling af slidt eller mat massiv træbordplade med fokus på ensartet finish og holdbar beskyttelse."
  },
  egetrae: {
    path: "/bordpladeslibning/egetrae",
    title: "Egetræsbordplade – slibning og behandling (kun massiv træ)",
    metaTitle: "Egetræsbordplade: slibning, behandling og vedligehold | BPSLIB",
    metaDescription:
      "Har du en massiv egetræsbordplade? Vi sliber og behandler kun massiv træ på Sjælland. Få pris via billeder eller book tid.",
    eyebrow: "Materiale: egetræ",
    heroIntro:
      "Massiv egetræ kan ofte reddes, selv når overfladen er mat, ridset eller har varmepletter. Vi vurderer trætype, slid og finish og anbefaler den løsning der giver bedst holdbarhed på Sjælland.",
    sections: [
      {
        heading: "Hvorfor egetræ ofte kan reddes",
        paragraphs: [
          "Egetræ er en tæt og stabil træsort, som typisk tåler kontrolleret slibning godt. Det betyder, at overflader med slid, matte felter eller mindre skader ofte kan bringes tilbage til et jævnt og roligt udtryk. Resultatet afhænger af tykkelse, tidligere behandling og hvor dybe skaderne er, men i mange tilfælde kan en massiv egetræsbordplade få et markant løft uden udskiftning. Vi bruger billeder til at vurdere niveauet og anbefaler realistisk, hvad der kan opnås."
        ]
      },
      {
        heading: "Typiske problemer på egetræ",
        paragraphs: [
          "De mest almindelige udfordringer er skjolder fra varme eller vand, ridser fra daglig brug, lokale brændemærker og en generelt slidt eller mat overflade. Vi vurderer både omfang og årsag, så vi kan vælge den behandling der giver mest holdbart resultat."
        ]
      },
      {
        heading: "Hvilken behandling passer bedst?",
        paragraphs: [
          "Valget mellem olie og lak afhænger af hvordan bordpladen bruges, og hvilket udtryk du ønsker. Olie giver et mere naturligt look og mulighed for lokal vedligehold, mens lak ofte giver en mere robust hverdagsoverflade. Vi hjælper dig med at vælge den rigtige løsning ud fra billeder og brugsmønster."
        ]
      },
      {
        heading: "Sådan foregår det",
        paragraphs: [
          "Først vurderer vi dine billeder og bekræfter massiv træ og skadeomfang. Derefter sliber vi i kontrollerede trin, så overfladen bliver ensartet. Til sidst afslutter vi med olie eller lak og giver en kort vedligeholdelsesguide, så resultatet holder længst muligt."
        ]
      },
      {
        heading: "Pris og tid",
        paragraphs: [
          "Pris afhænger af størrelse, tilstand og valg af finish. Mindre opgaver kan klares i 1 slot, mens større eller dybere skader ofte kræver 2-3 sammenhængende slots. Brug prisberegneren for en præcis vurdering og se prisguiden for et hurtigt overblik."
        ]
      },
      {
        heading: "Vi sliber kun massiv træ",
        paragraphs: [
          "Er du i tvivl om materialet, så upload et kant- eller ende-billede i prisberegneren. Så afklarer vi hurtigt, om bordpladen er massiv og kan behandles."
        ]
      }
    ],
    miniCase: {
      title: "Egetræsbord i køkken med høj belastning",
      problem: "Mat overflade med ridser og skjolder omkring vask og arbejdszone.",
      solution: "Helhedsslibning og ny behandling, tilpasset daglig brug og ønsket glansniveau.",
      outcome: "Ensartet finish og en bordplade der igen fremstår rolig og nem at vedligeholde."
    },
    faq: [
      {
        question: "Kan alle egetræsbordplader slibes?",
        answer:
          "De fleste massive egetræsbordplader kan slibes, men tykkelse, tidligere behandling og skadedybde afgør hvor meget der kan fjernes."
      },
      {
        question: "Olie eller lak til egetræ – hvad anbefaler I?",
        answer:
          "Det afhænger af brug og ønsket look. Vi vurderer belastning og rådgiver om den mest holdbare løsning."
      },
      {
        question: "Kan skjolder i egetræ slibes væk?",
        answer:
          "Ofte ja, især hvis skaden ligger i overfladen. Dybere misfarvning kan kræve mere arbejde, men kan som regel reduceres markant."
      },
      {
        question: "Hvor lang tid tager det?",
        answer:
          "Mindre opgaver kan klares i 1 slot, mens større flader eller dybere skader typisk kræver 2-3 slots."
      },
      {
        question: "Hvad koster det typisk?",
        answer:
          "Prisen varierer efter størrelse, tilstand og finish. Du får hurtigst et realistisk estimat ved at sende billeder."
      },
      {
        question: "Kører I på hele Sjælland?",
        answer:
          "Ja, vi dækker hele Sjælland og planlægger tider ud fra opgavens omfang og geografien."
      }
    ],
    relatedLinks: [
      { href: "/bordpladeslibning/skjolder", label: "Læs om skjolder" },
      { href: "/bordpladeslibning/ridser", label: "Læs om ridser" },
      { href: "/bordpladeslibning/braendemaerker", label: "Læs om brændemærker" },
      { href: "/bordpladeslibning/olie-eller-lak", label: "Vælg mellem olie og lak" },
      { href: "/bordpladeslibning/olie", label: "Læs om oliebehandling" }
    ],
    serviceName: "Slibning og behandling af egetræsbordplade",
    serviceDescription:
      "Vurdering, slibning og efterbehandling af massive egetræsbordplader med fokus på holdbarhed og ensartet finish."
  },
  boeg: {
    path: "/bordpladeslibning/boeg",
    title: "Bøgebordplade – slibning og behandling (kun massiv træ)",
    metaTitle: "Bøgebordplade: slibning, behandling og vedligehold | BPSLIB",
    metaDescription:
      "Har du en massiv bøgebordplade? Vi sliber og behandler kun massiv træ på Sjælland. Få pris via billeder eller book tid.",
    eyebrow: "Materiale: bøg",
    heroIntro:
      "Bøg har et lyst, roligt udtryk, men overfladen bliver ofte mat og sårbar ved vand, varme og daglig brug. Med korrekt slibning og ny finish kan en massiv bøgebordplade få sit udtryk tilbage.",
    sections: [
      {
        heading: "Bøg og typisk slitage",
        paragraphs: [
          "Bøg er en populær træsort til køkkenbordplader, fordi den har en lys og ensartet struktur. Over tid bliver overfladen dog ofte mat, især omkring vask og kogezone hvor vand, varme og rengøring påvirker finishen. Når overfladen tørrer ud eller bliver ujævn, ser bordpladen hurtigt slidt ud, selv om træet stadig er solidt. Det gør bøg til en god kandidat for slibning og ny behandling, så udseendet bliver roligt igen."
        ]
      },
      {
        heading: "Typiske problemer på bøgebordplader",
        paragraphs: [
          "De mest almindelige udfordringer er vand- og varmeskjolder, ridser fra daglig brug, matte felter og misfarvning omkring vask. Vi vurderer dybde og årsag, så vi kan anbefale den rigtige behandling."
        ]
      },
      {
        heading: "Hvilken behandling passer bedst?",
        paragraphs: [
          "Valget mellem olie og lak afhænger af hvordan bordpladen bruges. Olie giver et mere naturligt udtryk og mulighed for lokal vedligehold, mens lak ofte giver højere modstand mod daglig belastning. Vi hjælper dig med at vælge den løsning der passer til bøg og dit brugsmønster."
        ]
      },
      {
        heading: "Sådan foregår det",
        paragraphs: [
          "Først vurderer vi dine billeder og bekræfter massiv træ. Derefter sliber vi kontrolleret i trin for at få en jævn flade. Til sidst afslutter vi med olie eller lak og giver korte råd til vedligehold, så resultatet holder længst muligt."
        ]
      },
      {
        heading: "Pris og tid",
        paragraphs: [
          "Pris afhænger af størrelse, tilstand og valg af finish. Mindre opgaver kan klares i 1 slot, mens større flader eller dybere skader ofte kræver 2-3 sammenhængende slots. Start med prisguiden og brug prisberegneren for en præcis vurdering."
        ]
      },
      {
        heading: "Vi sliber kun massiv træ",
        paragraphs: [
          "Er du i tvivl om materialet, så upload et kant- eller ende-billede i prisberegneren. Så afklarer vi hurtigt om bordpladen er massiv."
        ]
      }
    ],
    miniCase: {
      title: "Bøgebordplade med matte felter",
      problem: "Overfladen var tør og mat omkring vask og arbejdszone med tydelige skjolder.",
      solution: "Helhedsslibning og ny behandling tilpasset daglig brug og ønsket glansniveau.",
      outcome: "Lys, ensartet overflade og en bordplade der igen tåler hverdagen bedre."
    },
    faq: [
      {
        question: "Kan alle bøgebordplader slibes?",
        answer:
          "De fleste massive bøgebordplader kan slibes, men tykkelse og skadedybde afgør hvor meget der kan fjernes."
      },
      {
        question: "Olie eller lak til bøg – hvad anbefaler I?",
        answer:
          "Det afhænger af brug og ønsket udtryk. Vi vurderer belastning og anbefaler den mest holdbare løsning."
      },
      {
        question: "Kan skjolder i bøg slibes væk?",
        answer:
          "Ofte ja, især hvis skaden ligger i finishen. Dybere misfarvning kan som regel reduceres markant."
      },
      {
        question: "Hvor lang tid tager det?",
        answer:
          "Mindre opgaver klares ofte i 1 slot, mens større opgaver typisk kræver 2-3 slots."
      },
      {
        question: "Hvad koster det typisk?",
        answer:
          "Prisen afhænger af størrelse, tilstand og finish. Du får hurtigst et realistisk estimat via prisberegneren."
      },
      {
        question: "Kører I på hele Sjælland?",
        answer:
          "Ja, vi dækker hele Sjælland og planlægger tider ud fra opgavens omfang."
      }
    ],
    relatedLinks: [
      { href: "/bordpladeslibning/skjolder", label: "Læs om skjolder" },
      { href: "/bordpladeslibning/ridser", label: "Læs om ridser" },
      { href: "/bordpladeslibning/olie-eller-lak", label: "Vælg mellem olie og lak" },
      { href: "/bordpladeslibning/olie", label: "Læs om oliebehandling" }
    ],
    serviceName: "Slibning og behandling af bøgebordplade",
    serviceDescription:
      "Vurdering, slibning og efterbehandling af massive bøgebordplader med fokus på holdbarhed og ensartet finish."
  },
  ask: {
    path: "/bordpladeslibning/ask",
    title: "Askebordplade – slibning og behandling (kun massiv træ)",
    metaTitle: "Askebordplade: slibning, behandling og vedligehold | BPSLIB",
    metaDescription:
      "Har du en massiv askebordplade? Vi sliber og behandler kun massiv træ på Sjælland. Få pris via billeder eller book tid.",
    eyebrow: "Materiale: ask",
    heroIntro:
      "Ask har et lyst, levende udtryk og tydelige årer, men overfladen bliver ofte mat og ujævn ved daglig brug. Med korrekt slibning og ny behandling kan en massiv askebordplade få sit roligere, ensartede udtryk tilbage.",
    sections: [
      {
        heading: "Ask og typisk slitage",
        paragraphs: [
          "Ask er en hård og slidstærk træsort, men lyse overflader afslører hurtigere matte felter, ridser og skjolder fra vand eller varme. I køkkenet ser vi ofte, at overfladen bliver ujævn omkring vask og madlavning, hvor der spildes væske og rengøres hyppigt. Når finishen tørrer ud, mister bordpladen sin glød og får et slidt look. Derfor er ask ofte oplagt til kontrolleret slibning og ny behandling, så fladen bliver jævn og mere modstandsdygtig."
        ]
      },
      {
        heading: "Typiske problemer på ask",
        paragraphs: [
          "De mest almindelige udfordringer er ridser, skjolder, matte felter og misfarvning ved vask eller sollys. Vi vurderer skadens dybde og omfang, så behandlingen matcher både æstetik og holdbarhed."
        ]
      },
      {
        heading: "Hvilken behandling passer bedst?",
        paragraphs: [
          "Valget mellem olie og lak afhænger af brugen i hverdagen. Olie giver et naturligt udtryk og fleksibel vedligehold, mens lak ofte giver højere modstand mod slid. Vi hjælper dig med at vælge den løsning der passer til ask og dit køkken."
        ]
      },
      {
        heading: "Sådan foregår det",
        paragraphs: [
          "Først vurderer vi dine billeder og bekræfter massiv træ. Derefter sliber vi i kontrollerede trin for at få en ensartet overflade. Til sidst afslutter vi med olie eller lak og giver korte vedligeholdelsesråd."
        ]
      },
      {
        heading: "Pris og tid",
        paragraphs: [
          "Pris afhænger af størrelse, tilstand og valg af finish. Mindre opgaver kan klares i 1 slot, mens større flader eller dybere skader typisk kræver 2-3 slots. Start med prisguiden og brug prisberegneren for præcis vurdering."
        ]
      },
      {
        heading: "Vi sliber kun massiv træ",
        paragraphs: [
          "Er du i tvivl om materialet, så upload et kant- eller ende-billede i prisberegneren. Så afklarer vi hurtigt om bordpladen er massiv."
        ]
      }
    ],
    miniCase: {
      title: "Askebordplade med mat overflade",
      problem: "Overfladen var tør og mat med ridser og skjolder omkring vasken.",
      solution: "Helhedsslibning og ny behandling, tilpasset daglig brug og ønsket glansniveau.",
      outcome: "Ensartet, lys finish og en bordplade der igen tåler hverdagen bedre."
    },
    faq: [
      {
        question: "Kan alle askebordplader slibes?",
        answer:
          "De fleste massive askebordplader kan slibes, men tykkelse og skadedybde afgør hvor meget der kan fjernes."
      },
      {
        question: "Olie eller lak til ask – hvad anbefaler I?",
        answer:
          "Det afhænger af brug og ønsket udtryk. Vi vurderer belastning og anbefaler den mest holdbare løsning."
      },
      {
        question: "Kan skjolder i ask slibes væk?",
        answer:
          "Ofte ja, især hvis skaden ligger i finishen. Dybere misfarvning kan som regel reduceres markant."
      },
      {
        question: "Hvor lang tid tager det?",
        answer:
          "Mindre opgaver klares ofte i 1 slot, mens større opgaver typisk kræver 2-3 slots."
      },
      {
        question: "Hvad koster det typisk?",
        answer:
          "Prisen afhænger af størrelse, tilstand og finish. Du får hurtigst et realistisk estimat via prisberegneren."
      },
      {
        question: "Kører I på hele Sjælland?",
        answer:
          "Ja, vi dækker hele Sjælland og planlægger tider ud fra opgavens omfang."
      }
    ],
    relatedLinks: [
      { href: "/bordpladeslibning/skjolder", label: "Læs om skjolder" },
      { href: "/bordpladeslibning/ridser", label: "Læs om ridser" },
      { href: "/bordpladeslibning/olie-eller-lak", label: "Vælg mellem olie og lak" },
      { href: "/bordpladeslibning/lak", label: "Læs om lak" }
    ],
    serviceName: "Slibning og behandling af askebordplade",
    serviceDescription:
      "Vurdering, slibning og efterbehandling af massive askebordplader med fokus på holdbarhed og ensartet finish."
  },
  valnoed: {
    path: "/bordpladeslibning/valnoed",
    title: "Valnødsbordplade – slibning og behandling (kun massiv træ)",
    metaTitle: "Valnødsbordplade: slibning, behandling og vedligehold | BPSLIB",
    metaDescription:
      "Har du en massiv valnødsbordplade? Vi sliber og behandler kun massiv træ på Sjælland. Få pris via billeder eller book tid.",
    eyebrow: "Materiale: valnød",
    heroIntro:
      "Valnød giver et mørkt og eksklusivt udtryk, men overfladen kan hurtigt blive mat eller ridset ved daglig brug. Med korrekt slibning og ny finish kan en massiv valnødsbordplade bevares smuk og ensartet.",
    sections: [
      {
        heading: "Valnød og det eksklusive udtryk",
        paragraphs: [
          "Valnød er mørkere end mange andre træsorter og har et varmt, dybt farvespil. Det gør overfladen meget flot, men også mere følsom over for ridser og matte felter, som bliver synlige i lyset. Vi ser ofte valnød med slitage omkring vask og arbejdszone, hvor vand og rengøring påvirker finishen. Når finishen er ujævn, mister bordpladen sit rolige udtryk. En kontrolleret slibning og ny behandling kan genskabe den dybde og ro, som valnød er kendt for."
        ]
      },
      {
        heading: "Typiske problemer på valnød",
        paragraphs: [
          "De mest almindelige udfordringer er matte felter, ridser, skjolder fra vand, misfarvning omkring vasken og lokale brændemærker. Vi vurderer skadens dybde og omfang, så behandlingen matcher både udtryk og holdbarhed."
        ]
      },
      {
        heading: "Hvilken behandling passer bedst?",
        paragraphs: [
          "Valget mellem olie og lak afhænger af hvor robust overfladen skal være i hverdagen. Olie giver et mere naturligt, varmt udtryk og er let at vedligeholde lokalt, mens lak kan give bedre modstand mod daglig belastning. Vi hjælper dig med at vælge den rigtige løsning til valnød og dit brugsmønster."
        ]
      },
      {
        heading: "Sådan foregår det",
        paragraphs: [
          "Først vurderer vi dine billeder og bekræfter massiv træ. Derefter sliber vi i kontrollerede trin for at få en ensartet overflade. Til sidst afslutter vi med olie eller lak og giver korte vedligeholdelsesråd."
        ]
      },
      {
        heading: "Pris og tid",
        paragraphs: [
          "Pris afhænger af størrelse, tilstand og finish. Mindre opgaver kan klares i 1 slot, mens større flader eller dybere skader typisk kræver 2-3 slots. Start med prisguiden og brug prisberegneren for en præcis vurdering."
        ]
      },
      {
        heading: "Vi sliber kun massiv træ",
        paragraphs: [
          "Er du i tvivl om materialet, så upload et kant- eller ende-billede i prisberegneren. Så afklarer vi hurtigt om bordpladen er massiv."
        ]
      }
    ],
    miniCase: {
      title: "Valnød med matte felter ved vask",
      problem: "Mørk overflade med matte felter, ridser og skjolder omkring vasken.",
      solution: "Helhedsslibning og ny finish, tilpasset daglig brug og ønsket udtryk.",
      outcome: "Ensartet dybde i farven og en bordplade der igen fremstår rolig og eksklusiv."
    },
    faq: [
      {
        question: "Kan alle valnødsbordplader slibes?",
        answer:
          "De fleste massive valnødsbordplader kan slibes, men tykkelse og skadedybde afgør hvor meget der kan fjernes."
      },
      {
        question: "Olie eller lak til valnød – hvad anbefaler I?",
        answer:
          "Det afhænger af brug og ønsket udtryk. Vi vurderer belastning og anbefaler den mest holdbare løsning."
      },
      {
        question: "Kan ridser i valnød slibes væk?",
        answer:
          "Ofte ja, især hvis ridserne ikke er meget dybe. Dybere mærker kan reduceres markant."
      },
      {
        question: "Hvor lang tid tager det?",
        answer:
          "Mindre opgaver klares ofte i 1 slot, mens større opgaver typisk kræver 2-3 slots."
      },
      {
        question: "Hvad koster det typisk?",
        answer:
          "Prisen afhænger af størrelse, tilstand og finish. Du får hurtigst et realistisk estimat via prisberegneren."
      },
      {
        question: "Kører I på hele Sjælland?",
        answer:
          "Ja, vi dækker hele Sjælland og planlægger tider ud fra opgavens omfang."
      }
    ],
    relatedLinks: [
      { href: "/bordpladeslibning/ridser", label: "Læs om ridser" },
      { href: "/bordpladeslibning/skjolder", label: "Læs om skjolder" },
      { href: "/bordpladeslibning/braendemaerker", label: "Læs om brændemærker" },
      { href: "/bordpladeslibning/olie-eller-lak", label: "Vælg mellem olie og lak" }
    ],
    serviceName: "Slibning og behandling af valnødsbordplade",
    serviceDescription:
      "Vurdering, slibning og efterbehandling af massive valnødsbordplader med fokus på holdbarhed og ensartet finish."
  },
  bambus: {
    path: "/bordpladeslibning/bambus",
    title: "Bambusbordplade – slibning og behandling (kun massiv træ)",
    metaTitle: "Bambusbordplade: slibning, behandling og vedligehold | BPSLIB",
    metaDescription:
      "Har du en massiv bambusbordplade? Vi sliber og behandler kun massiv træ på Sjælland. Få pris via billeder eller book tid.",
    eyebrow: "Materiale: bambus",
    heroIntro:
      "Bambus har et moderne udtryk og en hård overflade, men den bliver ofte mat eller ujævn ved daglig brug. Med korrekt slibning og ny behandling kan en massiv bambusbordplade få et roligt og ensartet look igen.",
    sections: [
      {
        heading: "Bambus som materiale",
        paragraphs: [
          "Bambus er et tæt og hårdt materiale, men overfladen påvirkes stadig af vand, varme og rengøring. Vi ser ofte matte felter, små hakker i kanter og misfarvning omkring vasken, når finishen er slidt ned. Hvis bordpladen er massiv, kan slibning og ny behandling som regel forbedre udtrykket markant. Vi vurderer altid materialets opbygning og slitage før vi anbefaler en løsning."
        ]
      },
      {
        heading: "Typiske problemer på bambus",
        paragraphs: [
          "De mest almindelige udfordringer er matte felter, ridser, skjolder fra vand, misfarvning ved vask og små hakker i kanter. Vi vurderer omfang og dybde, så behandlingen matcher både udtryk og holdbarhed."
        ]
      },
      {
        heading: "Hvilken behandling passer bedst?",
        paragraphs: [
          "Valget mellem olie og lak afhænger af hvor robust overfladen skal være i hverdagen. Olie giver et mere naturligt udtryk og fleksibel vedligehold, mens lak ofte giver højere modstand mod daglig belastning. Vi hjælper dig med at vælge den rigtige løsning til bambus og dit brugsmønster."
        ]
      },
      {
        heading: "Sådan foregår det",
        paragraphs: [
          "Først vurderer vi dine billeder og bekræfter massiv træ. Derefter sliber vi kontrolleret i trin for at få en ensartet overflade. Til sidst afslutter vi med olie eller lak og giver korte vedligeholdelsesråd."
        ]
      },
      {
        heading: "Pris og tid",
        paragraphs: [
          "Pris afhænger af størrelse, tilstand og finish. Mindre opgaver kan klares i 1 slot, mens større flader eller dybere skader typisk kræver 2-3 slots. Start med prisguiden og brug prisberegneren for en præcis vurdering."
        ]
      },
      {
        heading: "Vi sliber kun massiv træ",
        paragraphs: [
          "Er du i tvivl om materialet, så upload et kant- eller ende-billede i prisberegneren. Så afklarer vi hurtigt om bordpladen er massiv."
        ]
      }
    ],
    miniCase: {
      title: "Bambusbordplade med matte felter",
      problem: "Overfladen var mat og ujævn med skjolder omkring vasken og små hakker i kanten.",
      solution: "Helhedsslibning og ny finish tilpasset daglig brug og ønsket udtryk.",
      outcome: "Ensartet overflade med bedre modstand og et roligt look."
    },
    faq: [
      {
        question: "Kan en bambusbordplade slibes?",
        answer:
          "Ja, hvis den er massiv. Vi vurderer opbygning og slitage før vi anbefaler slibning."
      },
      {
        question: "Olie eller lak til bambus – hvad anbefaler I?",
        answer:
          "Det afhænger af brug og ønsket udtryk. Vi vurderer belastning og anbefaler den mest holdbare løsning."
      },
      {
        question: "Kan skjolder og ridser fjernes?",
        answer:
          "Ofte ja, især hvis skaden ligger i overfladen. Dybere mærker kan som regel reduceres markant."
      },
      {
        question: "Hvor lang tid tager det?",
        answer:
          "Mindre opgaver klares ofte i 1 slot, mens større opgaver typisk kræver 2-3 slots."
      },
      {
        question: "Hvad koster det typisk?",
        answer:
          "Prisen afhænger af størrelse, tilstand og finish. Du får hurtigst et realistisk estimat via prisberegneren."
      },
      {
        question: "Kører I på hele Sjælland?",
        answer:
          "Ja, vi dækker hele Sjælland og planlægger tider ud fra opgavens omfang."
      }
    ],
    relatedLinks: [
      { href: "/bordpladeslibning/ridser", label: "Læs om ridser" },
      { href: "/bordpladeslibning/skjolder", label: "Læs om skjolder" },
      { href: "/bordpladeslibning/olie-eller-lak", label: "Vælg mellem olie og lak" },
      { href: "/bordpladeslibning/olie", label: "Læs om oliebehandling" }
    ],
    serviceName: "Slibning og behandling af bambusbordplade",
    serviceDescription:
      "Vurdering, slibning og efterbehandling af massive bambusbordplader med fokus på holdbarhed og ensartet finish."
  },
  "finer-laminat-kan-det-slibes": {
    path: "/bordpladeslibning/finer-laminat-kan-det-slibes",
    title: "Kan finér eller laminat bordplader slibes?",
    metaTitle: "Kan man slibe finér eller laminat bordplade? | BPSLIB",
    metaDescription:
      "Er din bordplade finér eller laminat? Vi sliber kun massiv træ, men vi kan hjælpe dig med at vurdere materialet. Upload billeder.",
    eyebrow: "Materialeafklaring",
    heroIntro:
      "Mange er i tvivl om bordpladen er massiv, finér eller laminat. Muligheden for slibning afhænger af materialet og lagtykkelsen, så en tidlig afklaring sparer både tid og budget.",
    sections: [
      {
        heading: "Vi sliber kun massive træbordplader",
        paragraphs: [
          "Reglen er enkel: Vi sliber kun massive træbordplader. Finér og laminat har typisk et tyndt lag, som ikke tåler traditionel afslibning. Derfor starter vi altid med at afklare materialet, før vi anbefaler en løsning."
        ]
      },
      {
        heading: "Sådan kan du selv tjekke materialet",
        paragraphs: [
          "Kig på kanten eller enden af bordpladen og se efter om der er synlige lag. Undersøg åre-mønsteret, og om det fortsætter naturligt hele vejen igennem. Se også ved udskæringer omkring vask eller komfur, hvor opbygningen ofte er tydeligst."
        ]
      },
      {
        heading: "Hvad gør du hvis du er i tvivl?",
        paragraphs: [
          "Upload billeder i prisberegneren og vælg \"Ved ikke\", så vi kan vurdere materialet ud fra kant/ende-billeder. Du kan også kontakte os direkte, hvis du vil have en hurtig afklaring."
        ]
      },
      {
        heading: "Hvis bordpladen er finér eller laminat",
        paragraphs: [
          "Ved finér eller laminat anbefaler vi normalt udskiftning eller en ny bordplade. Det er den mest holdbare løsning, når overfladen er slidt, fordi slibning ikke er realistisk."
        ]
      }
    ],
    miniCase: {
      title: "Afklaring før beslutning",
      problem: "Kunden var i tvivl om bordpladen var massiv eller finér efter synlige skjolder.",
      solution: "Materialeafklaring via kantbillede og vurdering af opbygning.",
      outcome: "Klar besked og korrekt valg af næste skridt uden spildte omkostninger."
    },
    faq: [
      {
        question: "Hvordan ser jeg om det er massiv træ?",
        answer:
          "Tjek kanten eller enden for lag. Massiv træ har samme struktur hele vejen igennem."
      },
      {
        question: "Kan en finérbordplade slibes?",
        answer:
          "Som regel nej, fordi finérlaget er meget tyndt og ikke tåler slibning."
      },
      {
        question: "Kan en laminatbordplade slibes?",
        answer:
          "Nej, laminat er en overfladebelægning og kan ikke slibes som træ."
      },
      {
        question: "Hvad hvis jeg kun vil fjerne små ridser?",
        answer:
          "Det afhænger af materialet. Vi hjælper dig med at afklare om en løsning er realistisk."
      },
      {
        question: "Hvad gør jeg hvis jeg er i tvivl?",
        answer:
          "Upload billeder i prisberegneren og vælg \"Ved ikke\", så vurderer vi materialet hurtigt."
      },
      {
        question: "Kører I på hele Sjælland?",
        answer:
          "Ja, vi dækker hele Sjælland og planlægger tider ud fra opgavens omfang."
      }
    ],
    relatedLinks: [
      { href: "/bordpladeslibning/kan-det-slibes", label: "Afklar om bordpladen kan slibes" },
      { href: "/bordpladeslibning/ridser", label: "Læs om ridser" },
      { href: "/bordpladeslibning/skjolder", label: "Læs om skjolder" },
      { href: "/kontakt", label: "Kontakt os direkte" }
    ],
    serviceName: "Materialeafklaring for bordplader",
    serviceDescription:
      "Hjælp til at afklare om bordpladen er massiv træ, finér eller laminat før slibning."
  }
};
