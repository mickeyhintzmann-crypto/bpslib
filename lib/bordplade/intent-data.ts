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
          "Holdbarheden afhænger af belastning, rengøring og hvor konsekvent du er med efterbehandling. I et travlt køkken anbefaler vi som regel en let vedligeholdelsesplan med intervaller, så du undgår at overfladen bliver helt tør før næste pleje. På den måde bliver samlet driftsomkostning ofte lavere, fordi du forebygger dybe skader og store indgreb senere.",
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
          "En anden misforståelse er at lak altid ser plastisk ud. Med rigtige produkter og korrekt opbygning kan du opnå et roligt og naturligt udtryk, der stadig beskytter effektivt. Valget står ikke mellem natur og holdbarhed, men mellem forskellige kompromiser. Vi hjælper dig med at vælge niveauet ud fra æstetik, brug og ønsket serviceinterval."
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
          "Hvis du prioriterer en flade der visuelt ændrer sig mindre over tid, kan lak være det sikre valg. Hvis du derimod accepterer lidt mere naturlig patina i bytte for fleksibel vedligehold, peger valget ofte mod olie. Begge løsninger kan være rigtige, men de kræver forskellige forventninger til drift, rengøring og fremtidig opfriskning."
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
          "Efter afrensning og slibning anbefaler vi en finish, der passer til brugen af bordpladen. Nogle hjem har størst gavn af olie med planlagt vedligehold, andre af lak for højere daglig robusthed. Valget påvirker hvor hurtigt nye skjolder kan opstå, og hvor let de senere kan håndteres. Derfor kobler vi altid behandling og driftsrutine sammen i samme anbefaling.",
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
          "Efter slibning vælger vi finish ud fra hvordan bordpladen bruges. Ved høj belastning kan en robust lakopbygning være relevant, mens olie kan være bedre hvis du ønsker let lokal vedligehold og et naturligt look. Der findes ikke én løsning til alle. Vi anbefaler ud fra dine vaner, ikke ud fra standardpakker.",
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
  }
};
