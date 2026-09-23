/**
 * Lithuanian general-education curriculum for independent students.
 *
 * Sources (official / public catalogs — not verbatim textbook pages):
 * - LR ŠMSM įsakymas V-1269 (2022) bendrosios programos
 * - https://emokykla.lt/bendrosios-programos
 * - NŠA gamtos mokslų rekomendacijos 1–4 / 5–8
 * - Emokykla vadovėlių DB (serijos „TAIP!“, „Maži milžinai“, EDUKA)
 *
 * Textbook series are recommendations only. Full book text is copyrighted —
 * we store topic titles, short learning goals, and public catalog references.
 */

export type TextbookRef = {
  series: string;
  publisher?: string;
  grades: string;
  note?: string;
  catalogUrl?: string;
};

export type CurriculumTopic = {
  key: string;
  name: string;
  /** Short learning goal for students / AI generation context */
  goal?: string;
  minGrade: number;
  maxGrade: number;
};

export type CurriculumSubject = {
  key: string;
  name: string;
  color: string;
  minGrade: number;
  maxGrade: number;
  /** Official BUP subject family */
  bupArea?: string;
  textbooks?: TextbookRef[];
  topics: CurriculumTopic[];
};

export const CURRICULUM_SOURCES = [
  {
    title: "Bendrosios programos (Emokykla)",
    url: "https://emokykla.lt/bendrosios-programos/visos-bendrosios-programos",
  },
  {
    title: "Įsakymas V-1269 (2022) – BUP patvirtinimas",
    url: "https://www.e-tar.lt/portal/lt/legalAct/1a764050239511edb4cae1b158f98ea5/asr",
  },
  {
    title: "Vadovėlių duomenų bazė",
    url: "https://emokykla.lt/vadoveliai/vadoveliu-duomenu-baze",
  },
  {
    title: "Gamtos mokslai 1–4 SMP",
    url: "https://gm1-4.smp.emokykla.lt/",
  },
  {
    title: "Matematikos VBE struktūra (NŠA)",
    url: "https://www.nsa.smsm.lt/wp-content/uploads/2024/11/MAT.pdf",
  },
  {
    title: "Lietuvių kalbos ir literatūros VBE aprašas (NŠA)",
    url: "https://www.nsa.smsm.lt/wp-content/uploads/2024/11/NSA-VBE-LKL.pdf",
  },
] as const;

/**
 * Structure per BUP 2022:
 * 1–4: Gamtos mokslai (integrated) — not separate Fizika/Chemija/Biologija
 * 5–6: Gamtos mokslai (integrated)
 * 7–8: either Gamtos mokslai OR separate Bio/Chem/Fiz
 * 9–10: separate sciences; 11–12: electives / exam prep
 */
export const PLATFORM_CURRICULUM: CurriculumSubject[] = [
  {
    key: "lithuanian",
    name: "Lietuvių kalba ir literatūra",
    color: "#dc2626",
    minGrade: 1,
    maxGrade: 12,
    bupArea: "Kalbinis ugdymas",
    textbooks: [
      {
        series: "TAIP!",
        publisher: "Šviesa",
        grades: "1–4",
        note: "Pagal 2022 m. BUP; EDUKA skaitmeninis turinys",
        catalogUrl: "https://emokykla.lt/vadoveliai/vadoveliu-duomenu-baze/knyga/10903",
      },
      {
        series: "Maži milžinai",
        publisher: "Šviesa",
        grades: "1–4",
        catalogUrl: "https://emokykla.lt/vadoveliai/vadoveliu-duomenu-baze/knyga/11209",
      },
    ],
    topics: [
      { key: "letters-sounds", name: "Raidės ir garsai", goal: "Atpažinti raides, jungti į skiemenis ir žodžius.", minGrade: 1, maxGrade: 1 },
      { key: "reading-basics", name: "Skaitymo pradmenys", goal: "Skaityti trumpus sakinius ir paprastus tekstus.", minGrade: 1, maxGrade: 2 },
      { key: "speaking-listening", name: "Kalbėjimas ir klausymas", goal: "Pasakoti, klausytis, perduoti informaciją.", minGrade: 1, maxGrade: 4 },
      { key: "writing-basics", name: "Rašymo pradmenys", goal: "Rašyti žodžius ir paprastus sakinius.", minGrade: 1, maxGrade: 3 },
      { key: "spelling-primary", name: "Rašyba (3–4 kl.)", goal: "Taikyti pagrindines rašybos taisykles.", minGrade: 3, maxGrade: 4 },
      { key: "text-understanding-primary", name: "Teksto suvokimas", goal: "Rasti pagrindinę mintį, atsakyti į klausimus apie tekstą.", minGrade: 3, maxGrade: 4 },
      { key: "creative-writing-primary", name: "Kūrybinis rašymas", goal: "Kurti pasakojimą chronologiškai.", minGrade: 3, maxGrade: 4 },
      { key: "spelling", name: "Rašyba", goal: "Įtvirtinti rašybos normas.", minGrade: 5, maxGrade: 8 },
      { key: "punctuation", name: "Skyryba", goal: "Skyrybos ženklai sakinyje ir tekste.", minGrade: 5, maxGrade: 12 },
      { key: "text-analysis", name: "Teksto analizė ir suvokimas", goal: "Analizuoti sakytinius ir rašytinius tekstus.", minGrade: 5, maxGrade: 12 },
      { key: "literature", name: "Literatūra", goal: "Skaityti ir aptarti grožinius kūrinius.", minGrade: 5, maxGrade: 12 },
      { key: "essay", name: "Rašinys / samprotavimas", goal: "Kurti argumentuotą tekstą.", minGrade: 9, maxGrade: 12 },
      { key: "reading-vbe", name: "Teksto suvokimas", goal: "Rasti teksto teiginį ir autoriaus požiūrį. VBE kalbėjimo ir rašymo pasiruošimas.", minGrade: 9, maxGrade: 12 },
      { key: "exam-lithuanian", name: "Brandos egzamino ruošimas", goal: "VBE I dalis yra kalbėjimas, II dalis yra interpretacija arba probleminis svarstymas.", minGrade: 11, maxGrade: 12 },
    ],
  },
  {
    key: "mathematics",
    name: "Matematika",
    color: "#2563eb",
    minGrade: 1,
    maxGrade: 12,
    bupArea: "Matematinis, gamtamokslinis ir technologinis ugdymas",
    textbooks: [
      {
        series: "TAIP!",
        publisher: "Šviesa",
        grades: "4",
        note: "Skaičiai iki 10 000, trupmenos, geometrija, matavimai",
        catalogUrl: "https://emokykla.lt/vadoveliai/vadoveliu-duomenu-baze/knyga/10887",
      },
      {
        series: "Maži milžinai",
        publisher: "Šviesa",
        grades: "4",
        catalogUrl: "https://emokykla.lt/vadoveliai/vadoveliu-duomenu-baze/knyga/11210",
      },
      {
        series: "Opiq / EDUKA skaitmeninis turinys",
        grades: "1–12",
        note: "Skaitmeninės temos ir pratimai",
        catalogUrl: "https://www.opiq.lt/",
      },
    ],
    topics: [
      { key: "numbers-20", name: "Skaičiai iki 20", goal: "Skaičiuoti, lyginti, sudėti ir atimti iki 20.", minGrade: 1, maxGrade: 1 },
      { key: "numbers-100", name: "Skaičiai iki 100", goal: "Sandara, sudėtis, atimtis iki 100.", minGrade: 1, maxGrade: 2 },
      { key: "addition-subtraction", name: "Sudėtis ir atimtis", goal: "Veiksmai mintinai ir stulpeliu.", minGrade: 1, maxGrade: 4 },
      { key: "multiplication-table", name: "Daugybos lentelė", goal: "Įsiminti ir taikyti daugybą.", minGrade: 2, maxGrade: 4 },
      { key: "division", name: "Dalyba ir liekana", goal: "Dalyba mintinai ir stulpeliu, liekana.", minGrade: 3, maxGrade: 4 },
      { key: "numbers-10000", name: "Skaičiai iki 10 000", goal: "Skaitmens vieta, lyginimas, veiksmai iki 10 000.", minGrade: 4, maxGrade: 4 },
      { key: "fractions", name: "Trupmenos", goal: "Pusė, ketvirtadaliai, lyginimas, sudėtis/atimtis.", minGrade: 4, maxGrade: 7 },
      { key: "decimals-primary", name: "Dešimtainės trupmenos (pradinė)", goal: "Suprasti dešimtaines trupmenas ir mišriuosius skaičius.", minGrade: 4, maxGrade: 4 },
      { key: "expressions-equations-primary", name: "Reiškiniai ir lygtys", goal: "Sudaryti ir spręsti paprastas lygtis.", minGrade: 4, maxGrade: 4 },
      { key: "measurements", name: "Matavimai (ilgis, masė, tūris, laikas)", goal: "Naudoti cm, m, kg, l, valandas.", minGrade: 2, maxGrade: 4 },
      { key: "geometry-primary", name: "Geometrinės figūros, perimetras, plotas", goal: "Atpažinti figūras, skaičiuoti perimetrą ir plotą.", minGrade: 3, maxGrade: 4 },
      { key: "word-problems-primary", name: "Tekstiniai uždaviniai", goal: "Spręsti žingsniais, nuo galo, su lentelėmis.", minGrade: 2, maxGrade: 4 },
      { key: "decimals", name: "Dešimtainės trupmenos", goal: "Veiksmai su dešimtainėmis trupmenomis.", minGrade: 5, maxGrade: 7 },
      { key: "percentages", name: "Procentai", goal: "Skaičiuoti procentus realiose situacijose.", minGrade: 6, maxGrade: 9 },
      { key: "linear-equations", name: "Tiesinės lygtys", goal: "Spręsti tiesines lygtis ir nelygybes.", minGrade: 7, maxGrade: 9 },
      { key: "geometry", name: "Geometrija", goal: "Kampai, trikampiai, plotai, tūriai.", minGrade: 7, maxGrade: 11 },
      { key: "quadratic-equations", name: "Kvadratinės lygtys", goal: "Spręsti kvadratines lygtis.", minGrade: 9, maxGrade: 11 },
      { key: "powers-roots", name: "Laipsniai ir šaknys", goal: "9–11 kl. Laipsnių savybės ir šaknys, kaip VBE I dalyje.", minGrade: 9, maxGrade: 11 },
      { key: "equations-systems", name: "Lygčių sistemos", goal: "Spręsti dviejų tiesinių lygčių sistemas.", minGrade: 9, maxGrade: 10 },
      { key: "statistics", name: "Statistika", goal: "Vidurkis, mediana, diagrama. 9–11 kl. ir VBE I dalis.", minGrade: 9, maxGrade: 11 },
      { key: "trigonometry", name: "Trigonometrija", goal: "Stačiojo trikampio sin, cos, tg. VBE formulių rinkinys.", minGrade: 10, maxGrade: 12 },
      { key: "probability", name: "Tikimybės ir kombinatorika", goal: "Klasikinė tikimybė ir deriniai. A kurse ir atsitiktiniai dydžiai.", minGrade: 10, maxGrade: 12 },
      { key: "functions", name: "Funkcijos", goal: "Skaityti grafikus, skaičiuoti reikšmes, tirti funkcijas.", minGrade: 9, maxGrade: 12 },
      { key: "progressions", name: "Progresijos", goal: "Aritmetinė ir geometrinė progresija. III–IV gimnazijos klasė.", minGrade: 11, maxGrade: 12 },
      { key: "logarithms", name: "Logaritmai (A kursas)", goal: "Logaritmų reikšmės ir savybės. III gimnazijos klasė.", minGrade: 11, maxGrade: 12 },
      { key: "derivatives", name: "Išvestinės (A kursas)", goal: "Funkcijos išvestinė taške. IV gimnazijos klasė, VBE II dalis.", minGrade: 12, maxGrade: 12 },
      { key: "olympiad-math", name: "Olimpiadinis mąstymas", goal: "Sunkesni originalūs uždaviniai olimpiadų stiliumi. Oficialūs olimpiadų tekstai čia nekeliami.", minGrade: 9, maxGrade: 12 },
      { key: "exam-math", name: "Brandos egzamino ruošimas", goal: "VBE I dalies forma: pasirenkamas arba trumpas atsakymas. 40 taškų, 120 min. tipo įgūdžiai.", minGrade: 11, maxGrade: 12 },
    ],
  },
  {
    key: "natural-science",
    name: "Gamtos mokslai",
    color: "#0d9488",
    minGrade: 1,
    maxGrade: 8,
    bupArea: "Matematinis, gamtamokslinis ir technologinis ugdymas",
    textbooks: [
      {
        series: "Gamtos mokslai 1–4 (SMP Emokykla)",
        grades: "1–4",
        note: "Oficiali skaitmeninė priemonė pagal BUP",
        catalogUrl: "https://gm1-4.smp.emokykla.lt/",
      },
      {
        series: "Integruoto gamtos mokslų kurso rekomendacijos",
        grades: "5–8",
        catalogUrl:
          "https://emokykla.lt/upload/files/2023/05/22/integruoto-gamtos-mokslu-kurso-5-8-klasems-metodines-rekomendacijos.pdf",
      },
    ],
    topics: [
      // 1–2
      { key: "safe-behavior", name: "Saugus elgesys", goal: "Saugiai elgtis namuose, mokykloje, lauke.", minGrade: 1, maxGrade: 2 },
      { key: "healthy-living", name: "Sveikas gyvenimas", goal: "Mityba, judėjimas, poilsis.", minGrade: 1, maxGrade: 2 },
      { key: "living-organisms", name: "Gyvi organizmai", goal: "Bendri gyvų organizmų požymiai.", minGrade: 1, maxGrade: 2 },
      { key: "plants-animals-primary", name: "Augalai ir gyvūnai", goal: "Stebėti ir apibūdinti augalus bei gyvūnus.", minGrade: 1, maxGrade: 3 },
      { key: "materials-primary", name: "Daiktai ir medžiagos", goal: "Medžiagų savybės, tausojimas.", minGrade: 1, maxGrade: 2 },
      // 3–4
      { key: "health-3-4", name: "Fizinė ir emocinė sveikata", goal: "Sveikatos samprata, ligų prevencija.", minGrade: 3, maxGrade: 4 },
      { key: "adaptation", name: "Prisitaikymas prie aplinkos", goal: "Kaip organizmai prisitaiko.", minGrade: 3, maxGrade: 4 },
      { key: "water-cycle", name: "Vandens apytakos ratas", goal: "Vandens kelias gamtoje.", minGrade: 3, maxGrade: 4 },
      { key: "reproduction-heredity", name: "Dauginimasis ir paveldėjimas", goal: "Kartos, panašumai šeimoje.", minGrade: 4, maxGrade: 4 },
      { key: "human-life-stages", name: "Žmogaus amžiaus tarpsniai", goal: "Augimas ir raida.", minGrade: 4, maxGrade: 4 },
      { key: "habitat-pollution", name: "Buveinės ir tarša", goal: "Kaip saugoti gamtą.", minGrade: 4, maxGrade: 4 },
      { key: "forces-light-space-primary", name: "Jėgos, šviesa, Žemė ir kosmosas", goal: "Judėjimas, šešėliai, Saulės sistema (pradinė).", minGrade: 3, maxGrade: 4 },
      // 5–6 (integrated)
      { key: "atmosphere-weather", name: "Atmosfera ir orai", goal: "Kaip nuspėjami orai (5 kl.).", minGrade: 5, maxGrade: 6 },
      { key: "hydrosphere-water", name: "Hidrosfera – geriamas vanduo", goal: "Koks vanduo tinkamas gerti.", minGrade: 5, maxGrade: 6 },
      { key: "biosphere-ecosystems", name: "Biosfera – ekosistemos", goal: "Ekosistemų gyvybingumas.", minGrade: 5, maxGrade: 6 },
      { key: "earth-space-5", name: "Žemė ir kosmosas", goal: "Kosmosas žvelgiant nuo Žemės.", minGrade: 5, maxGrade: 6 },
      { key: "earth-resources", name: "Žemės ištekliai", goal: "Išteklių vartojimas ir tausojimas.", minGrade: 5, maxGrade: 6 },
      { key: "forces-motion-5", name: "Jėgos ir judėjimas", goal: "Judėjimas veikiant jėgoms.", minGrade: 5, maxGrade: 6 },
      { key: "energy-homes", name: "Energija namuose", goal: "Šiluma ir šviesa kasdienybėje.", minGrade: 5, maxGrade: 6 },
      { key: "healthy-person-5", name: "Sveikas žmogus", goal: "Sveikatos samprata.", minGrade: 5, maxGrade: 6 },
      // 7–8 integrated track
      { key: "climate-change", name: "Klimato kaita", goal: "Kaip suprantame, kad klimatas kinta.", minGrade: 7, maxGrade: 8 },
      { key: "water-systems", name: "Vanduo namuose ir aplinkoje", goal: "Kaip vanduo patenka į namus.", minGrade: 7, maxGrade: 8 },
      { key: "cell-intro", name: "Ląstelė – gyvoji sistema", goal: "Ląstelės sandara (7 kl.).", minGrade: 7, maxGrade: 8 },
      { key: "chemical-reactions-intro", name: "Cheminės reakcijos (įvadas)", goal: "Medžiagų kitimai (8 kl.).", minGrade: 7, maxGrade: 8 },
      { key: "magnetic-field", name: "Magnetinis laukas", goal: "Magnetai ir laukai.", minGrade: 7, maxGrade: 8 },
      { key: "internal-energy", name: "Vidinė energija", goal: "Šiluma ir energijos rūšys.", minGrade: 7, maxGrade: 8 },
      { key: "social-health", name: "Socialinė sveikata", goal: "Sveikata socialiniame kontekste.", minGrade: 7, maxGrade: 8 },
    ],
  },
  {
    key: "english",
    name: "Anglų kalba",
    color: "#059669",
    minGrade: 2,
    maxGrade: 12,
    bupArea: "Kalbinis ugdymas",
    textbooks: [
      {
        series: "Įvairūs BUP atitinkantys komplektai (Emokykla DB)",
        grades: "2–12",
        catalogUrl: "https://emokykla.lt/vadoveliai/vadoveliu-duomenu-baze",
      },
    ],
    topics: [
      { key: "abc-greetings", name: "ABC and greetings", goal: "Alphabet, hello, my name is…", minGrade: 2, maxGrade: 3 },
      { key: "words-school", name: "School and home words", goal: "Classroom, family, colours, numbers.", minGrade: 2, maxGrade: 4 },
      { key: "simple-sentences", name: "Simple sentences", goal: "I like / I have / There is.", minGrade: 3, maxGrade: 5 },
      { key: "grammar", name: "Grammar", goal: "Tenses and structures for the grade band.", minGrade: 5, maxGrade: 12 },
      { key: "vocabulary", name: "Vocabulary", goal: "Thematic word sets.", minGrade: 5, maxGrade: 12 },
      { key: "reading", name: "Reading", goal: "Understand short and longer texts.", minGrade: 5, maxGrade: 12 },
      { key: "writing", name: "Writing", goal: "Emails, stories, opinion texts.", minGrade: 7, maxGrade: 12 },
      { key: "listening", name: "Listening", goal: "Understand spoken English.", minGrade: 6, maxGrade: 12 },
      { key: "exam-english", name: "Exam preparation", goal: "Prepare for national exam tasks.", minGrade: 11, maxGrade: 12 },
    ],
  },
  {
    key: "history",
    name: "Istorija",
    color: "#a16207",
    minGrade: 5,
    maxGrade: 12,
    bupArea: "Visuomeninis ugdymas",
    textbooks: [
      {
        series: "BUP atitinkantys istorijos komplektai",
        grades: "5–12",
        catalogUrl: "https://emokykla.lt/vadoveliai/vadoveliu-duomenu-baze",
      },
    ],
    topics: [
      { key: "lithuanian-history-intro", name: "Lietuvos istorijos pradmenys", goal: "Svarbiausi Lietuvos istorijos etapai.", minGrade: 5, maxGrade: 6 },
      { key: "middle-ages", name: "Viduramžiai", goal: "Europa ir LDK viduramžiais.", minGrade: 6, maxGrade: 8 },
      { key: "lithuania-statehood", name: "Lietuvos valstybingumas", goal: "Valstybės raida ir simboliai.", minGrade: 7, maxGrade: 10 },
      { key: "modern-europe", name: "Naujieji laikai Europoje", goal: "Pokyčiai Europoje ir Lietuvoje.", minGrade: 8, maxGrade: 11 },
      { key: "20th-century", name: "XX amžius", goal: "Karai, okupacijos, nepriklausomybė.", minGrade: 9, maxGrade: 12 },
      { key: "exam-history", name: "Brandos egzamino ruošimas", goal: "VBE tipo užduotys.", minGrade: 11, maxGrade: 12 },
    ],
  },
  {
    key: "geography",
    name: "Geografija",
    color: "#0284c7",
    minGrade: 5,
    maxGrade: 12,
    bupArea: "Visuomeninis ugdymas",
    textbooks: [
      {
        series: "BUP atitinkantys geografijos komplektai",
        grades: "5–12",
        catalogUrl: "https://emokykla.lt/vadoveliai/vadoveliu-duomenu-baze",
      },
    ],
    topics: [
      { key: "map-skills", name: "Žemėlapiai", goal: "Skaityti žemėlapius ir mastelius.", minGrade: 5, maxGrade: 7 },
      { key: "lithuania-geography", name: "Lietuvos geografija", goal: "Reljefas, vandenys, gyventojai.", minGrade: 5, maxGrade: 9 },
      { key: "europe", name: "Europa", goal: "Europos regionai ir valstybės.", minGrade: 6, maxGrade: 9 },
      { key: "continents", name: "Žemynai", goal: "Pasaulio žemynai.", minGrade: 6, maxGrade: 8 },
      { key: "climate-population", name: "Klimatas ir gyventojai", goal: "Klimato zonos, migracija.", minGrade: 8, maxGrade: 11 },
      { key: "exam-geography", name: "Brandos egzamino ruošimas", goal: "VBE tipo užduotys.", minGrade: 11, maxGrade: 12 },
    ],
  },
  {
    key: "biology",
    name: "Biologija",
    color: "#16a34a",
    minGrade: 7,
    maxGrade: 12,
    bupArea: "Matematinis, gamtamokslinis ir technologinis ugdymas",
    textbooks: [
      {
        series: "Biologijos BUP vadovėliai (Emokykla DB)",
        grades: "7–12",
        note: "7–8 kl. mokykla gali rinktis ir integruotą Gamtos mokslų kursą",
        catalogUrl: "https://emokykla.lt/bendrosios-programos/visos-bendrosios-programos",
      },
    ],
    topics: [
      { key: "cell", name: "Ląstelė", goal: "Ląstelės sandara ir funkcijos.", minGrade: 7, maxGrade: 9 },
      { key: "human-body", name: "Žmogaus kūnas", goal: "Organų sistemos ir sveikata.", minGrade: 7, maxGrade: 10 },
      { key: "ecology", name: "Ekologija", goal: "Ekosistemos, mitybos grandinės.", minGrade: 8, maxGrade: 11 },
      { key: "genetics", name: "Genetika", goal: "Paveldimumas, DNR pagrindai.", minGrade: 9, maxGrade: 12 },
      { key: "exam-biology", name: "Brandos egzamino ruošimas", goal: "VBE tipo užduotys.", minGrade: 11, maxGrade: 12 },
    ],
  },
  {
    key: "physics",
    name: "Fizika",
    color: "#7c3aed",
    minGrade: 7,
    maxGrade: 12,
    bupArea: "Matematinis, gamtamokslinis ir technologinis ugdymas",
    textbooks: [
      {
        series: "Fizikos BUP vadovėliai (Emokykla DB)",
        grades: "7–12",
        note: "7–8 kl. galima tęsti integruotą Gamtos mokslų kursą",
        catalogUrl: "https://emokykla.lt/bendrosios-programos/visos-bendrosios-programos",
      },
    ],
    topics: [
      { key: "mechanics", name: "Mechanika", goal: "Judėjimas, jėgos, energija.", minGrade: 7, maxGrade: 10 },
      { key: "energy", name: "Energija", goal: "Energijos rūšys ir virsmai.", minGrade: 7, maxGrade: 10 },
      { key: "electric-current", name: "Elektros srovė", goal: "Grandinės, įtampa, srovė.", minGrade: 8, maxGrade: 11 },
      { key: "optics", name: "Optika", goal: "Šviesa, atspindys, lęšiai.", minGrade: 9, maxGrade: 12 },
      { key: "waves", name: "Bangos", goal: "Garso ir elektromagnetinės bangos.", minGrade: 9, maxGrade: 12 },
      { key: "exam-physics", name: "Brandos egzamino ruošimas", goal: "VBE tipo užduotys.", minGrade: 11, maxGrade: 12 },
    ],
  },
  {
    key: "chemistry",
    name: "Chemija",
    color: "#ea580c",
    minGrade: 8,
    maxGrade: 12,
    bupArea: "Matematinis, gamtamokslinis ir technologinis ugdymas",
    textbooks: [
      {
        series: "Chemijos BUP vadovėliai (Emokykla DB)",
        grades: "8–12",
        note: "Pradmenys – per Gamtos mokslus 1–6; atskiras dalykas dažniausiai nuo 8–9 kl.",
        catalogUrl: "https://emokykla.lt/bendrosios-programos/visos-bendrosios-programos",
      },
    ],
    topics: [
      { key: "atoms", name: "Atomai ir molekulės", goal: "Medžiagos sandara.", minGrade: 8, maxGrade: 10 },
      { key: "reactions", name: "Cheminės reakcijos", goal: "Reakcijų tipai ir lygtys.", minGrade: 8, maxGrade: 11 },
      { key: "acids-bases", name: "Rūgštys ir bazės", goal: "pH, rūgštys, šarmai.", minGrade: 9, maxGrade: 11 },
      { key: "organic", name: "Organinė chemija", goal: "Angliavandeniliai ir funkcinės grupės.", minGrade: 10, maxGrade: 12 },
      { key: "exam-chemistry", name: "Brandos egzamino ruošimas", goal: "VBE tipo užduotys.", minGrade: 11, maxGrade: 12 },
    ],
  },
];

export type SelfStudySelection = {
  subjectKey: string;
  topicKeys: string[];
};

function inGradeBand(grade: number, minGrade: number, maxGrade: number) {
  return grade >= minGrade && grade <= maxGrade;
}

export function getCurriculumSubject(key: string) {
  return PLATFORM_CURRICULUM.find((s) => s.key === key);
}

export function getCurriculumTopic(subjectKey: string, topicKey: string) {
  const subject = getCurriculumSubject(subjectKey);
  return subject?.topics.find((t) => t.key === topicKey);
}

/** Subjects + topics for a concrete Lithuanian grade (1–12). */
export function getCurriculumForGrade(grade: number | null | undefined): CurriculumSubject[] {
  const g = grade != null && grade >= 1 && grade <= 12 ? grade : null;
  if (g == null) return getCurriculumForGrade(4);

  return PLATFORM_CURRICULUM.filter((s) => inGradeBand(g, s.minGrade, s.maxGrade))
    .map((s) => ({
      ...s,
      topics: s.topics.filter((t) => inGradeBand(g, t.minGrade, t.maxGrade)),
      textbooks: s.textbooks?.filter(
        (tb) =>
          tb.grades.includes("1–12") ||
          tb.grades.includes(String(g)) ||
          tb.grades.includes(`${g}`) ||
          // ranges like "1–4", "5–8", "7–12"
          (() => {
            const m = tb.grades.match(/(\d+)\s*[–-]\s*(\d+)/);
            if (!m) return false;
            return g >= Number(m[1]) && g <= Number(m[2]);
          })()
      ),
    }))
    .filter((s) => s.topics.length > 0);
}

export function isSelectionAllowedForGrade(
  selection: SelfStudySelection,
  grade: number | null | undefined
): boolean {
  const available = getCurriculumForGrade(grade);
  const subject = available.find((s) => s.key === selection.subjectKey);
  if (!subject) return false;
  return selection.topicKeys.every((topicKey) =>
    subject.topics.some((t) => t.key === topicKey)
  );
}

export function filterSelectionsForGrade(
  selections: SelfStudySelection[],
  grade: number | null | undefined
): SelfStudySelection[] {
  return selections
    .map((sel) => {
      const available = getCurriculumForGrade(grade);
      const subject = available.find((s) => s.key === sel.subjectKey);
      if (!subject) return null;
      const topicKeys = sel.topicKeys.filter((k) =>
        subject.topics.some((t) => t.key === k)
      );
      if (topicKeys.length === 0) return null;
      return { subjectKey: sel.subjectKey, topicKeys };
    })
    .filter((s): s is SelfStudySelection => s !== null);
}

export function resolveSelectionLabels(selections: SelfStudySelection[]) {
  return selections.map((sel) => {
    const subject = getCurriculumSubject(sel.subjectKey);
    return {
      subjectKey: sel.subjectKey,
      subjectName: subject?.name ?? sel.subjectKey,
      color: subject?.color ?? "#2563eb",
      topics: sel.topicKeys.map((topicKey) => ({
        key: topicKey,
        name: getCurriculumTopic(sel.subjectKey, topicKey)?.name ?? topicKey,
        goal: getCurriculumTopic(sel.subjectKey, topicKey)?.goal,
      })),
    };
  });
}

export function gradeBandLabel(grade: number): string {
  if (grade <= 4) return "Pradinė mokykla (BUP 1–4)";
  if (grade <= 8) return "Pagrindinė mokykla (BUP 5–8)";
  if (grade <= 10) return "I–II gimnazijos klasės";
  return "III–IV gimnazijos / brandos";
}
