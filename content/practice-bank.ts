/**
 * Original practice items for grades 9–12 (and the topic's grade band).
 *
 * Aligned to the 2022 bendrosios programos and to public NŠA exam formats
 * (VBE I: choice or short numeric answer; VBE II skills appear as short items).
 * Official exam papers, olympiad booklets, and textbooks are not copied.
 * Sources: emokykla.lt bendrosios programos, nsa.smsm.lt exam descriptions.
 */

export type PracticeDifficulty = "EASY" | "MEDIUM" | "HARD";

export type PracticeItem = {
  id: string;
  subjectKey: string;
  topicKey: string;
  minGrade: number;
  maxGrade: number;
  difficulty: PracticeDifficulty;
  type: "MULTIPLE_CHOICE" | "NUMERIC";
  content: string;
  explanation: string;
  options?: { content: string; isCorrect: boolean }[];
  correctAnswer?: { value: number };
  gradingConfig?: { tolerance: number };
};

type Row =
  | {
      kind: "n";
      s: string;
      t: string;
      g: [number, number];
      d: PracticeDifficulty;
      q: string;
      e: string;
      v: number;
    }
  | {
      kind: "m";
      s: string;
      t: string;
      g: [number, number];
      d: PracticeDifficulty;
      q: string;
      e: string;
      o: [string, boolean][];
    };

const ROWS: Row[] = [
  // --- Matematika: 9–10 ---
  { kind: "n", s: "mathematics", t: "percentages", g: [6, 9], d: "EASY", q: "Kuprinė kainavo 80 €. Pritaikyta 25 % nuolaida. Kiek eurų ji kainuoja dabar?", e: "25 % nuo 80 yra 20. 80 − 20 = 60.", v: 60 },
  { kind: "n", s: "mathematics", t: "percentages", g: [6, 9], d: "EASY", q: "Klasėje 200 mokinių. Kontrolinio nerašė 15 %. Kiek mokinių nerašė?", e: "0,15 × 200 = 30.", v: 30 },
  { kind: "n", s: "mathematics", t: "percentages", g: [6, 9], d: "MEDIUM", q: "Skaičius 40 padidintas 10 %. Koks skaičius gautas?", e: "10 % nuo 40 yra 4. 40 + 4 = 44.", v: 44 },

  { kind: "n", s: "mathematics", t: "linear-equations", g: [7, 9], d: "EASY", q: "Išspręskite lygtį 3x + 5 = 20. Kokia x reikšmė?", e: "3x = 15, todėl x = 5.", v: 5 },
  { kind: "n", s: "mathematics", t: "linear-equations", g: [7, 9], d: "MEDIUM", q: "Išspręskite lygtį 2(x − 3) = 10. Kokia x reikšmė?", e: "x − 3 = 5, todėl x = 8.", v: 8 },
  { kind: "n", s: "mathematics", t: "linear-equations", g: [7, 9], d: "MEDIUM", q: "Išspręskite lygtį 5x − 2 = 3x + 6. Kokia x reikšmė?", e: "2x = 8, todėl x = 4.", v: 4 },

  { kind: "n", s: "mathematics", t: "geometry", g: [7, 11], d: "EASY", q: "Stačiakampio kraštinės yra 7 cm ir 4 cm. Koks plotas kvadratiniais centimetrais?", e: "S = 7 × 4 = 28.", v: 28 },
  { kind: "n", s: "mathematics", t: "geometry", g: [7, 11], d: "EASY", q: "Trikampio du kampai yra 40° ir 60°. Kiek laipsnių yra trečiasis kampas?", e: "Kampų suma 180°. 180 − 40 − 60 = 80.", v: 80 },
  { kind: "m", s: "mathematics", t: "geometry", g: [9, 11], d: "MEDIUM", q: "Apskritimo spindulys 5 cm. Koks apskritimo ilgis?", e: "C = 2πr = 10π.", o: [["5π", false], ["10π", true], ["25π", false], ["20π", false]] },

  { kind: "n", s: "mathematics", t: "quadratic-equations", g: [9, 11], d: "MEDIUM", q: "Lygties x² − 5x + 6 = 0 šaknų suma (pagal Vijeto teoremą). Koks skaičius?", e: "Suma lygi koeficientui prie x su minuso ženklu: 5. Šaknys 2 ir 3.", v: 5 },
  { kind: "n", s: "mathematics", t: "quadratic-equations", g: [9, 11], d: "EASY", q: "Kokia teigiama lygties x² − 9 = 0 šaknis?", e: "x² = 9, teigiama šaknis x = 3.", v: 3 },
  { kind: "n", s: "mathematics", t: "quadratic-equations", g: [9, 11], d: "MEDIUM", q: "Lygties x² + 2x − 3 = 0 šaknų sandauga. Koks skaičius?", e: "Sandauga lygi laisvajam nariui: −3. Šaknys −3 ir 1.", v: -3 },

  { kind: "n", s: "mathematics", t: "powers-roots", g: [9, 11], d: "EASY", q: "Apskaičiuokite 2⁶.", e: "2⁶ = 64.", v: 64 },
  { kind: "n", s: "mathematics", t: "powers-roots", g: [9, 11], d: "MEDIUM", q: "Apskaičiuokite (3²)³.", e: "3² = 9, 9³ = 729. Arba 3⁶ = 729.", v: 729 },
  { kind: "n", s: "mathematics", t: "powers-roots", g: [9, 11], d: "EASY", q: "Apskaičiuokite √81.", e: "9 × 9 = 81, todėl √81 = 9.", v: 9 },
  { kind: "n", s: "mathematics", t: "powers-roots", g: [9, 11], d: "MEDIUM", q: "Apskaičiuokite 2³ · 2⁴.", e: "Dauginant laipsnius su tuo pačiu pagrindu rodikliai sudedami: 2⁷ = 128.", v: 128 },

  { kind: "n", s: "mathematics", t: "equations-systems", g: [9, 10], d: "MEDIUM", q: "Sistema: x + y = 10 ir x − y = 2. Kokia x reikšmė?", e: "Sudėjus lygtis: 2x = 12, x = 6. Tada y = 4.", v: 6 },
  { kind: "n", s: "mathematics", t: "equations-systems", g: [9, 10], d: "MEDIUM", q: "Sistema: 2x + y = 7 ir x + y = 4. Kokia y reikšmė?", e: "Atėmus antrą iš pirmos: x = 3. Tada y = 1.", v: 1 },
  { kind: "n", s: "mathematics", t: "equations-systems", g: [9, 10], d: "EASY", q: "Jei x = 2 ir 3x + 2y = 12, kokia y reikšmė?", e: "6 + 2y = 12, 2y = 6, y = 3.", v: 3 },

  { kind: "n", s: "mathematics", t: "statistics", g: [9, 11], d: "EASY", q: "Skaičių 2, 5, 5, 8 mediana. Koks skaičius?", e: "Surikiuota eilė jau didėjanti. Viduriniai du nariai yra 5 ir 5, mediana 5.", v: 5 },
  { kind: "n", s: "mathematics", t: "statistics", g: [9, 11], d: "EASY", q: "Skaičių 1, 3 ir 5 aritmetinis vidurkis.", e: "(1 + 3 + 5) / 3 = 3.", v: 3 },
  { kind: "n", s: "mathematics", t: "statistics", g: [9, 11], d: "MEDIUM", q: "Skaičių 4, 4, 7 ir 9 aritmetinis vidurkis.", e: "Suma 24. 24 / 4 = 6.", v: 6 },

  // --- Matematika: 10–12 ---
  { kind: "m", s: "mathematics", t: "trigonometry", g: [10, 12], d: "MEDIUM", q: "Statusis trikampis turi statinius 5 ir 12, įžambinę 13. Koks sinusas kampo, esančio prieš statinį 5?", e: "sin = priešinis / įžambinė = 5/13.", o: [["5/12", false], ["5/13", true], ["12/13", false], ["13/5", false]] },
  { kind: "m", s: "mathematics", t: "trigonometry", g: [10, 12], d: "EASY", q: "Kokia sin 30° reikšmė?", e: "sin 30° = 1/2.", o: [["1/2", true], ["√3/2", false], ["√2/2", false], ["1", false]] },
  { kind: "n", s: "mathematics", t: "trigonometry", g: [10, 12], d: "EASY", q: "Kokia tg 45° reikšmė?", e: "tg 45° = 1.", v: 1 },
  { kind: "m", s: "mathematics", t: "trigonometry", g: [11, 12], d: "MEDIUM", q: "Kosmuso reikšmė kampo, gretimo statiniui 12, kai įžambinė 13.", e: "cos = gretutinis / įžambinė = 12/13.", o: [["5/13", false], ["12/13", true], ["13/12", false], ["5/12", false]] },

  { kind: "m", s: "mathematics", t: "probability", g: [10, 12], d: "EASY", q: "Moneta metama du kartus. Kokia tikimybė, kad abu kartus iškris herbas?", e: "Keturios baigtys vienodai galimos. Viena palanki: HH. Tikimybė 1/4.", o: [["1/2", false], ["1/3", false], ["1/4", true], ["1/8", false]] },
  { kind: "m", s: "mathematics", t: "probability", g: [10, 12], d: "EASY", q: "Metamas standartinis kauliukas. Kokia tikimybė, kad iškris lyginis taškų skaičius?", e: "Lyginiai: 2, 4, 6. Tikimybė 3/6 = 1/2.", o: [["1/6", false], ["1/3", false], ["1/2", true], ["2/3", false]] },
  { kind: "n", s: "mathematics", t: "probability", g: [11, 12], d: "MEDIUM", q: "Kiek yra derinių iš 6 po 2? C(6, 2).", e: "6×5 / 2 = 15.", v: 15 },
  { kind: "n", s: "mathematics", t: "probability", g: [11, 12], d: "MEDIUM", q: "Kiek yra derinių iš 5 po 2? C(5, 2).", e: "5×4 / 2 = 10.", v: 10 },

  { kind: "n", s: "mathematics", t: "functions", g: [9, 12], d: "EASY", q: "f(x) = 3x − 2. Apskaičiuokite f(4).", e: "3×4 − 2 = 10.", v: 10 },
  { kind: "n", s: "mathematics", t: "functions", g: [9, 12], d: "EASY", q: "f(x) = x². Apskaičiuokite f(−3).", e: "(−3)² = 9.", v: 9 },
  { kind: "n", s: "mathematics", t: "functions", g: [9, 12], d: "MEDIUM", q: "Tiesinė funkcija eina per tašką (0; 2), jos krypties koeficientas 1. Apskaičiuokite f(5).", e: "f(x) = x + 2, f(5) = 7.", v: 7 },

  { kind: "n", s: "mathematics", t: "progressions", g: [11, 12], d: "MEDIUM", q: "Aritmetinės progresijos pirmasis narys 4, skirtumas 3. Koks šeštasis narys?", e: "a₆ = 4 + 5×3 = 19.", v: 19 },
  { kind: "n", s: "mathematics", t: "progressions", g: [11, 12], d: "MEDIUM", q: "Aritmetinės progresijos a₁ = 2, d = 2. Kokia pirmųjų penkių narių suma?", e: "Nariai 2, 4, 6, 8, 10. Suma 30.", v: 30 },
  { kind: "n", s: "mathematics", t: "progressions", g: [11, 12], d: "MEDIUM", q: "Geometrinės progresijos b₁ = 5, q = 2. Koks ketvirtasis narys?", e: "b₄ = 5 × 2³ = 40.", v: 40 },

  { kind: "n", s: "mathematics", t: "logarithms", g: [11, 12], d: "EASY", q: "Apskaičiuokite log₁₀ 1000.", e: "10³ = 1000, todėl logaritmas lygus 3.", v: 3 },
  { kind: "n", s: "mathematics", t: "logarithms", g: [11, 12], d: "EASY", q: "Apskaičiuokite log₂ 32.", e: "2⁵ = 32.", v: 5 },
  { kind: "n", s: "mathematics", t: "logarithms", g: [11, 12], d: "MEDIUM", q: "Apskaičiuokite log₃ 27.", e: "3³ = 27.", v: 3 },

  { kind: "n", s: "mathematics", t: "derivatives", g: [12, 12], d: "MEDIUM", q: "f(x) = x². Kokia f′(4) reikšmė? (A kursas)", e: "f′(x) = 2x, f′(4) = 8.", v: 8 },
  { kind: "n", s: "mathematics", t: "derivatives", g: [12, 12], d: "EASY", q: "f(x) = 3x. Kokia išvestinės reikšmė bet kuriame taške?", e: "Tiesinės funkcijos kx išvestinė lygi k. Čia k = 3.", v: 3 },
  { kind: "n", s: "mathematics", t: "derivatives", g: [12, 12], d: "MEDIUM", q: "f(x) = x³. Kokia f′(2) reikšmė?", e: "f′(x) = 3x², f′(2) = 12.", v: 12 },
  { kind: "n", s: "mathematics", t: "derivatives", g: [12, 12], d: "HARD", q: "f(x) = 5x². Kokia f′(1) reikšmė?", e: "f′(x) = 10x, f′(1) = 10.", v: 10 },

  { kind: "n", s: "mathematics", t: "olympiad-math", g: [9, 12], d: "MEDIUM", q: "Apskaičiuokite sumą 1 + 2 + … + 20.", e: "n(n+1)/2 = 20×21/2 = 210. Tai klasikinis sumos būdas, ne konkrečios olimpiados tekstas.", v: 210 },
  { kind: "n", s: "mathematics", t: "olympiad-math", g: [9, 12], d: "MEDIUM", q: "Kiek teigiamų daliklių turi skaičius 12?", e: "Dalikliai: 1, 2, 3, 4, 6, 12. Jų yra 6.", v: 6 },
  { kind: "n", s: "mathematics", t: "olympiad-math", g: [9, 12], d: "MEDIUM", q: "Koks paskutinis 2¹⁰ skaitmuo?", e: "2¹⁰ = 1024, paskutinis skaitmuo 4. Laipsnių paskutiniai skaitmenys kartojasi kas 4.", v: 4 },
  { kind: "n", s: "mathematics", t: "olympiad-math", g: [9, 12], d: "HARD", q: "Koks didžiausias sveikasis skaičius n, kuriam n² < 50?", e: "7² = 49, 8² = 64. Didžiausias toks n yra 7.", v: 7 },

  { kind: "n", s: "mathematics", t: "exam-math", g: [11, 12], d: "MEDIUM", q: "Kaina buvo 120 € ir padidėjo 15 %. Kokia nauja kaina eurais? (VBE I dalies tipo trumpas atsakymas)", e: "15 % nuo 120 yra 18. 120 + 18 = 138.", v: 138 },
  { kind: "n", s: "mathematics", t: "exam-math", g: [11, 12], d: "MEDIUM", q: "Lygties x² − 7x + 10 = 0 šaknų suma.", e: "Pagal Vijetą suma yra 7. Šaknys 2 ir 5.", v: 7 },
  { kind: "n", s: "mathematics", t: "exam-math", g: [11, 12], d: "EASY", q: "Apskaičiuokite log₂ 16.", e: "2⁴ = 16.", v: 4 },
  { kind: "n", s: "mathematics", t: "exam-math", g: [11, 12], d: "MEDIUM", q: "Aritmetinės progresijos a₁ = 5, d = 2. Koks ketvirtasis narys?", e: "a₄ = 5 + 3×2 = 11.", v: 11 },
  { kind: "m", s: "mathematics", t: "exam-math", g: [11, 12], d: "MEDIUM", q: "Moneta metama du kartus. Kokia tikimybė gauti vieną herbą ir vieną skaičių (tvarka nesvarbi)?", e: "Palankios baigtys HT ir TH. Tikimybė 2/4 = 1/2.", o: [["1/4", false], ["1/2", true], ["3/4", false], ["1", false]] },
  { kind: "n", s: "mathematics", t: "exam-math", g: [11, 12], d: "EASY", q: "Stačiakampio kraštinės 9 cm ir 5 cm. Koks plotas?", e: "9 × 5 = 45.", v: 45 },
  { kind: "n", s: "mathematics", t: "exam-math", g: [11, 12], d: "MEDIUM", q: "f(x) = x² − 1. Apskaičiuokite f(3).", e: "9 − 1 = 8.", v: 8 },
  { kind: "m", s: "mathematics", t: "exam-math", g: [11, 12], d: "EASY", q: "Kokia sin 90° reikšmė?", e: "sin 90° = 1.", o: [["0", false], ["1/2", false], ["√2/2", false], ["1", true]] },

  // --- Lietuvių kalba ---
  { kind: "m", s: "lithuanian", t: "punctuation", g: [9, 12], d: "MEDIUM", q: "Kuris sakinys parašytas su teisingu kableliu?", e: "Šalutinis sakinys, einantis po pagrindinio, atskiriamas kableliu.", o: [["Žinojau kad rytoj bus kontrolinis.", false], ["Žinojau, kad rytoj bus kontrolinis.", true], ["Žinojau kad, rytoj bus kontrolinis.", false], ["Žinojau ,kad rytoj bus kontrolinis.", false]] },
  { kind: "m", s: "lithuanian", t: "punctuation", g: [9, 12], d: "MEDIUM", q: "Kuris variantas parašytas taisyklingai?", e: "Vienarūšės sakinio dalys, sujungtos jungtuku „ir“, kableliu neskiriamos, kai jungtukas vienas.", o: [["Jis atėjo, ir atsisėdo.", false], ["Jis atėjo ir, atsisėdo.", false], ["Jis atėjo ir atsisėdo.", true], ["Jis, atėjo ir atsisėdo.", false]] },
  { kind: "m", s: "lithuanian", t: "punctuation", g: [9, 12], d: "MEDIUM", q: "Kuris sakinys turi teisingą kablelį, kai šalutinis sakinys eina pirmas?", e: "Po priekyje einančio šalutinio sakinio dedamas kablelis.", o: [["Kai lyja lieku namie.", false], ["Kai lyja, lieku namie.", true], ["Kai, lyja lieku namie.", false], ["Kai lyja lieku, namie.", false]] },

  { kind: "m", s: "lithuanian", t: "reading-vbe", g: [9, 12], d: "MEDIUM", q: "Tekstas: „Austėja kas vakarą sprendė po penkis matematikos uždavinius. Ji neieškojo atsakymo iš karto: pirmiausia užsirašydavo, ką jau žino, ir tik tada rinkdavosi veiksmą. Po mėnesio kontrolinio rezultatas pakilo.“ Ką Austėja darydavo prieš pasirinkdama veiksmą?", e: "Tekste tiesiogiai pasakyta, kad ji pirmiausia užsirašydavo, ką jau žino.", o: [["Iš karto žiūrėdavo atsakymą.", false], ["Užsirašydavo, ką jau žino.", true], ["Spręsdavo tik savaitgaliais.", false], ["Prašydavo, kad uždavinį išspręstų kitas.", false]] },
  { kind: "m", s: "lithuanian", t: "reading-vbe", g: [9, 12], d: "MEDIUM", q: "Tas pats tekstas apie Austėją. Kuri mintis labiausiai atitinka tekstą?", e: "Rezultatas pakilo, kai ji ėmė spręsti nuosekliai, o ne ieškoti atsakymo iš karto.", o: [["Uždavinių skaičius per vakarą neturi reikšmės.", false], ["Nuoseklus sprendimas susijęs su geresniu rezultatu.", true], ["Kontrolinis buvo lengvesnis nei pratybos.", false], ["Austėja metė matematiką.", false]] },
  { kind: "m", s: "lithuanian", t: "reading-vbe", g: [9, 12], d: "EASY", q: "Tekste apie Austėją: kiek uždavinių ji spręsdavo kiekvieną vakarą?", e: "Tekste parašyta „po penkis“.", o: [["Tris", false], ["Penkis", true], ["Dešimt", false], ["Skaičius nenurodytas", false]] },

  { kind: "m", s: "lithuanian", t: "exam-lithuanian", g: [11, 12], d: "EASY", q: "Iš ko sudarytas lietuvių kalbos ir literatūros valstybinis brandos egzaminas?", e: "Pagal NŠA aprašą I dalis yra kalbėjimas, II dalis yra rašymas.", o: [["Tik testas iš gramatikos", false], ["Kalbėjimas ir rašymas", true], ["Tik literatūros testas su vienu atsakymu", false], ["Žodinis matematikos gynimas", false]] },
  { kind: "m", s: "lithuanian", t: "exam-lithuanian", g: [11, 12], d: "MEDIUM", q: "Kuo skiriasi literatūrinė interpretacija nuo probleminio svarstymo?", e: "Interpretacija aiškina konkretų kūrinį. Probleminis svarstymas kelia problemą ir ją argumentuoja, remdamasis kūriniu.", o: [["Jos niekuo nesiskiria.", false], ["Interpretacija aiškina kūrinį, svarstymas argumentuoja problemą.", true], ["Interpretacijoje negalima remtis kūriniu.", false], ["Svarstyme negalima turėti savo nuomonės.", false]] },
  { kind: "n", s: "lithuanian", t: "exam-lithuanian", g: [11, 12], d: "MEDIUM", q: "Kiek žodžių yra mažiausia A kurso rašinio apimtis lietuvių kalbos VBE II dalyje? Įrašykite skaičių.", e: "A kurso rašinio mažiausia apimtis yra 450 žodžių. B kurso — 400. Tai vieša egzamino sąlyga, ne konkretaus rašinio tekstas.", v: 450 },

  { kind: "m", s: "lithuanian", t: "essay", g: [9, 12], d: "MEDIUM", q: "Kurį teiginį geriausia dėti samprotavimo pastraipos pradžioje?", e: "Pastraipa laikosi, kai pirmas sakinys pasako mintį, o tolesni ją pagrindžia pavyzdžiu.", o: [["Iš karto ilgas siužeto perpasakojimas be minties.", false], ["Aiški mintis, kurią toliau pagrindžiate.", true], ["Tik šauktukas be argumento.", false], ["Kito mokinio pavardė vietoj argumento.", false]] },
  { kind: "m", s: "lithuanian", t: "essay", g: [9, 12], d: "EASY", q: "Ko reikia argumentui samprotavime?", e: "Argumentas sieja teiginį su pavyzdžiu ar priežastimi, ne su pakartotu tuo pačiu sakiniu.", o: [["Pakartoti teiginį kitais žodžiais ir sustoti.", false], ["Pagrįsti teiginį priežastimi arba pavyzdžiu.", true], ["Parašyti kuo daugiau šauktukų.", false], ["Pakeisti temą paskutiniame sakinyje.", false]] },
  { kind: "m", s: "lithuanian", t: "essay", g: [11, 12], d: "MEDIUM", q: "Rašote probleminį svarstymą. Ką turite padaryti įžangoje?", e: "Įžanga pristato problemą ir kryptį, o ne iš karto atpasakoja visą kūrinį.", o: [["Išvardyti visus perskaitytus kūrinius.", false], ["Suformuluoti problemą, kurią svarstysite.", true], ["Parašyti tik baigiamąjį sakinį.", false], ["Pateikti vien teisingą atsakymo variantą.", false]] },

  // --- Anglų kalba ---
  { kind: "m", s: "english", t: "grammar", g: [9, 12], d: "MEDIUM", q: "Choose the correct sentence.", e: "Second conditional: If + past simple, would + verb.", o: [["If I would know, I would tell you.", false], ["If I knew the answer, I would tell you.", true], ["If I know, I would told you.", false], ["If I knew, I will tell you.", false]] },
  { kind: "m", s: "english", t: "grammar", g: [9, 12], d: "MEDIUM", q: "She ___ in Vilnius since 2019.", e: "Present perfect with since: has lived.", o: [["lives", false], ["lived", false], ["has lived", true], ["is living since", false]] },
  { kind: "m", s: "english", t: "grammar", g: [9, 12], d: "EASY", q: "There isn't ___ time left.", e: "Time is uncountable, so use much, not many.", o: [["many", false], ["much", true], ["a few", false], ["several", false]] },

  { kind: "m", s: "english", t: "reading", g: [9, 12], d: "MEDIUM", q: "Text: \"Rūta checks her notes before she starts a task. She writes what the question asks, then chooses a method.\" What does Rūta do first?", e: "The text says she checks her notes and writes what the question asks before choosing a method.", o: [["She chooses a method immediately.", false], ["She writes what the question asks.", true], ["She skips the question.", false], ["She copies a classmate's answer.", false]] },
  { kind: "m", s: "english", t: "reading", g: [9, 12], d: "EASY", q: "In the same text, when does Rūta choose a method?", e: "After she has written what the question asks.", o: [["Before reading the question.", false], ["After she writes what the question asks.", true], ["Only on Fridays.", false], ["The text does not say.", false]] },
  { kind: "m", s: "english", t: "reading", g: [9, 12], d: "MEDIUM", q: "Which sentence best matches the text about Rūta?", e: "The point is a planned start, not guessing.", o: [["Planning the start of a task helps her work.", true], ["Notes are useless.", false], ["She never reads the question.", false], ["Methods are chosen at random.", false]] },

  { kind: "m", s: "english", t: "exam-english", g: [11, 12], d: "MEDIUM", q: "A short email task asks you to invite a friend and suggest a time. Which opening fits?", e: "An invitation email states the purpose in the first lines.", o: [["I am writing to invite you to the museum on Saturday.", true], ["The mitochondria produce energy.", false], ["Dear Sir or Madam, I demand a refund for a car.", false], ["Once upon a time there was a king.", false]] },
  { kind: "m", s: "english", t: "exam-english", g: [11, 12], d: "MEDIUM", q: "In a B2 opinion paragraph, what should follow your opinion?", e: "An opinion needs a reason or example.", o: [["A reason or a short example.", true], ["A new unrelated topic.", false], ["Only the words \"I agree\".", false], ["A list of random verbs.", false]] },
  { kind: "m", s: "english", t: "exam-english", g: [11, 12], d: "EASY", q: "Choose the best linking word: \"The task was hard. ___, she finished it.\"", e: "However / Still marks contrast. \"Because\" would need a clause of reason in a different structure. Here the second sentence contrasts the first.", o: [["Because", false], ["However", true], ["Such as", false], ["For example she", false]] },

  // --- Istorija ---
  { kind: "m", s: "history", t: "20th-century", g: [9, 12], d: "EASY", q: "Kurią dieną pasirašytas Lietuvos Nepriklausomybės Aktas?", e: "1918 m. vasario 16 d. Lietuvos Taryba pasirašė Nepriklausomybės Aktą.", o: [["1918 m. vasario 16 d.", true], ["1990 m. kovo 11 d.", false], ["1940 m. birželio 15 d.", false], ["2004 m. gegužės 1 d.", false]] },
  { kind: "m", s: "history", t: "20th-century", g: [9, 12], d: "EASY", q: "Kada atkurtas Lietuvos nepriklausomos valstybės tęstinumas?", e: "1990 m. kovo 11 d. Aukščiausioji Taryba priėmė aktą dėl nepriklausomos valstybės atstatymo.", o: [["1988 m. birželio 3 d.", false], ["1990 m. kovo 11 d.", true], ["1991 m. sausio 13 d.", false], ["2004 m. kovo 29 d.", false]] },
  { kind: "m", s: "history", t: "20th-century", g: [9, 12], d: "MEDIUM", q: "Kuris įvykis žymi 1940 m. Lietuvos okupacijos pradžią?", e: "1940 m. birželį SSRS pateikė ultimatumą ir įvedė kariuomenę. Tai okupacijos pradžia.", o: [["Įstojimas į NATO", false], ["SSRS ultimatumas ir kariuomenės įvedimas", true], ["Vasario 16-osios aktas", false], ["Euro įvedimas", false]] },
  { kind: "m", s: "history", t: "20th-century", g: [11, 12], d: "MEDIUM", q: "Kurie metai Lietuvai yra ir NATO, ir Europos Sąjungos narystės pradžia?", e: "2004 m. Lietuva tapo NATO ir ES nare.", o: [["1990", false], ["1991", false], ["2004", true], ["2015", false]] },

  { kind: "m", s: "history", t: "exam-history", g: [11, 12], d: "MEDIUM", q: "Šaltinis: mokyklos laikraščio 1991 m. sausio 14 d. žinutė apie sausio 13-osios aukas. Ką pirmiausia turite padaryti, kai VBE tipo užduotis duoda šaltinį?", e: "Pirmiausia nustatykite, kas, kada ir kam skirta, tada atsakyme remkitės šaltinio teiginiu, ne bendra atmintimi.", o: [["Iš karto rašyti savo nuomonę, šaltinio neskaičius.", false], ["Nustatyti autorių, datą ir ką šaltinis teigia.", true], ["Pakeisti datą, jei ji neatitinka vadovėlio.", false], ["Cituoti visą šaltinį vietoj atsakymo.", false]] },
  { kind: "m", s: "history", t: "exam-history", g: [11, 12], d: "MEDIUM", q: "Kuris teiginys yra priežastis, o ne vien data?", e: "Egzamino atsakyme priežastis paaiškina, kodėl įvykis vyko.", o: [["1918 m. vasario 16 d.", false], ["Nepriklausomybės aktas skelbtas, nes siekta atkurti valstybę.", true], ["Vilnius yra sostinė.", false], ["Žemėlapyje pažymėta upė.", false]] },
  { kind: "m", s: "history", t: "exam-history", g: [11, 12], d: "EASY", q: "Kuri data susijusi su 1991 m. sausio įvykiais Vilniuje?", e: "1991 m. sausio 13 d. prie Televizijos bokšto žuvo gynėjai.", o: [["Sausio 13 d.", true], ["Vasario 16 d.", false], ["Kovo 11 d.", false], ["Birželio 14 d.", false]] },

  // --- Geografija ---
  { kind: "m", s: "geography", t: "lithuania-geography", g: [5, 9], d: "EASY", q: "Kuri upė yra ilgiausia Lietuvoje?", e: "Nemunas yra ilgiausia Lietuvos upė.", o: [["Neris", false], ["Nemunas", true], ["Šventoji", false], ["Minija", false]] },
  { kind: "m", s: "geography", t: "lithuania-geography", g: [6, 9], d: "EASY", q: "Prie kurios jūros yra Lietuva?", e: "Lietuva yra prie Baltijos jūros.", o: [["Juodosios", false], ["Baltijos", true], ["Šiaurės", false], ["Viduržemio", false]] },
  { kind: "m", s: "geography", t: "lithuania-geography", g: [5, 9], d: "EASY", q: "Koks Lietuvos sostinės pavadinimas?", e: "Lietuvos sostinė yra Vilnius.", o: [["Kaunas", false], ["Klaipėda", false], ["Vilnius", true], ["Šiauliai", false]] },

  { kind: "m", s: "geography", t: "climate-population", g: [8, 11], d: "MEDIUM", q: "Kuris teiginys apie Lietuvos klimato juostą teisingas?", e: "Lietuva yra vidutinių platumų klimato juostoje, pereinamojo iš jūrinio į žemyninį klimato.", o: [["Pusiaujo klimatas", false], ["Vidutinių platumų pereinamasis klimatas", true], ["Atogrąžų musoninis klimatas", false], ["Arktinis klimatas", false]] },
  { kind: "m", s: "geography", t: "climate-population", g: [8, 11], d: "MEDIUM", q: "Ką rodo gyventojų tankis?", e: "Tankis yra gyventojų skaičius ploto vienete, dažniausiai 1 km².", o: [["Kiek upių yra šalyje", false], ["Kiek gyventojų tenka ploto vienetui", true], ["Aukščiausią kalvą", false], ["Vidutinę oro temperatūrą", false]] },
  { kind: "n", s: "geography", t: "climate-population", g: [8, 11], d: "MEDIUM", q: "Žemėlapio mastelis 1 : 100 000. Kiek kilometrų vietovėje atitinka 1 cm žemėlapyje?", e: "1 cm žemėlapyje yra 100 000 cm vietovėje. 100 000 cm = 1 km.", v: 1 },

  { kind: "n", s: "geography", t: "exam-geography", g: [11, 12], d: "MEDIUM", q: "Mastelis 1 : 50 000. Kiek kilometrų vietovėje atitinka 2 cm žemėlapyje?", e: "1 cm = 0,5 km. 2 cm = 1 km.", v: 1 },
  { kind: "m", s: "geography", t: "exam-geography", g: [11, 12], d: "MEDIUM", q: "Grafike miesto gyventojų skaičius nuo 2000 iki 2020 m. sumažėjo. Kuris teiginys yra išvada, o ne duomenų pakartojimas?", e: "Išvada paaiškina galimą priežastį arba pasekmę, ne vien nuskaito skaičių.", o: [["Gyventojų sumažėjo.", false], ["Mažėjimas galėjo sietis su emigracija.", true], ["Grafikas yra stulpelinis.", false], ["2000 metai parašyti ašyje.", false]] },
  { kind: "m", s: "geography", t: "exam-geography", g: [11, 12], d: "EASY", q: "Kuri kryptis yra priešinga šiaurei?", e: "Priešinga šiaurei kryptis yra pietūs.", o: [["Rytai", false], ["Vakarai", false], ["Pietūs", true], ["Šiaurės rytai", false]] },

  // --- Biologija ---
  { kind: "m", s: "biology", t: "genetics", g: [9, 12], d: "MEDIUM", q: "Kur ląstelėje yra pagrindinė DNR dalis eukariotuose?", e: "Eukariotų pagrindinė genetinė informacija yra branduolyje.", o: [["Tik mitochondrijose", false], ["Branduolyje", true], ["Tik ląstelės sienelėje", false], ["Tik ribosomose", false]] },
  { kind: "m", s: "biology", t: "genetics", g: [9, 12], d: "MEDIUM", q: "Kryžminami Aa ir Aa. Kokia tikimybė, kad palikuonis bus aa (recesyvinis fenotipas, jei a yra recesyvinis)?", e: "Puneto gardelėje aa yra 1 iš 4, tikimybė 1/4.", o: [["0", false], ["1/4", true], ["1/2", false], ["3/4", false]] },
  { kind: "m", s: "biology", t: "genetics", g: [9, 12], d: "EASY", q: "Kuris rinkinys yra DNR azotinės bazės?", e: "DNR bazės: adeninas, timinas, guaninas, citozinas.", o: [["A, T, G, C", true], ["A, U, G, C", false], ["Tik A ir B", false], ["Fe, Na, Cl, K", false]] },

  { kind: "m", s: "biology", t: "ecology", g: [9, 11], d: "EASY", q: "Kuris organizmas mitybos grandinėje paprastai yra gamintojas?", e: "Gamintojai yra žali augalai, vykdantys fotosintezę.", o: [["Lapė", false], ["Žalias augalas", true], ["Grybas skaidytojas", false], ["Vanagas", false]] },
  { kind: "m", s: "biology", t: "ecology", g: [9, 11], d: "MEDIUM", q: "Kas atsitinka energijai, kylant mitybos grandine?", e: "Kiekviename lygyje didžioji energijos dalis prarandama šiluma, todėl aukštesniam lygiui jos lieka mažiau.", o: [["Jos kiekis kiekviename lygyje padvigubėja.", false], ["Aukštesniam lygiui prieinamos energijos lieka mažiau.", true], ["Energija išnyksta ir nebevartojama.", false], ["Energija virsta nauja medžiaga be nuostolių.", false]] },
  { kind: "m", s: "biology", t: "ecology", g: [9, 11], d: "MEDIUM", q: "Kurios organelės augalo ląstelėje vykdo fotosintezę?", e: "Fotosintezė vyksta chloroplastuose.", o: [["Mitochondrijos", false], ["Chloroplastai", true], ["Ribosomos", false], ["Branduolėlis", false]] },

  { kind: "m", s: "biology", t: "exam-biology", g: [11, 12], d: "MEDIUM", q: "Bandymo aprašyme viena grupė augalų gauna šviesą, kita laikoma tamsoje, laistoma vienodai. Kas čia yra kintamasis, kurį tiriate?", e: "Keičiama tik šviesa. Laistymas paliktas vienodas, todėl tai kontrolė.", o: [["Vandens kiekis", false], ["Šviesa", true], ["Augalų lotyniški vardai", false], ["Vazonų spalva, jei ji vienoda", false]] },
  { kind: "m", s: "biology", t: "exam-biology", g: [11, 12], d: "MEDIUM", q: "Kuri organelė tiekia ląstelei didžiąją dalį ATP aerobinėmis sąlygomis?", e: "Mitochondrijose vyksta ląstelinis kvėpavimas ir susidaro ATP.", o: [["Mitochondrija", true], ["Vakuolė", false], ["Ląstelės sienelė", false], ["Citozolis be jokių organelių", false]] },
  { kind: "m", s: "biology", t: "exam-biology", g: [11, 12], d: "EASY", q: "Kuris teiginys apie fotosintezę teisingas?", e: "Fotosintezėje iš anglies dioksido ir vandens, naudojant šviesą, susidaro gliukozė ir išsiskiria deguonis.", o: [["Sunaudojamas deguonis ir gaminamas anglies dioksidas kaip pagrindinis tikslas.", false], ["Naudojant šviesą gaminama gliukozė ir išskiriamas deguonis.", true], ["Ji vyksta tik gyvūnų raumenyse.", false], ["Jai nereikia šviesos.", false]] },

  // --- Fizika ---
  { kind: "n", s: "physics", t: "mechanics", g: [7, 10], d: "EASY", q: "Kūnas nueina 100 m per 20 s tolygiai tiesiai. Koks greitis m/s?", e: "v = s / t = 100 / 20 = 5.", v: 5 },
  { kind: "n", s: "physics", t: "mechanics", g: [8, 10], d: "MEDIUM", q: "Masė 2 kg, pagreitis 3 m/s². Kokia jėga niutonais? F = ma.", e: "F = 2 × 3 = 6 N.", v: 6 },
  { kind: "n", s: "physics", t: "mechanics", g: [9, 10], d: "MEDIUM", q: "Kūno masė 2 kg, greitis 3 m/s. Kokia kinetinė energija džauliais? E = mv² / 2.", e: "E = 2 × 9 / 2 = 9 J.", v: 9 },

  { kind: "n", s: "physics", t: "electric-current", g: [8, 11], d: "MEDIUM", q: "Įtampa 12 V, srovė 2 A. Kokia varža omais? U = IR.", e: "R = U / I = 12 / 2 = 6 Ω.", v: 6 },
  { kind: "n", s: "physics", t: "electric-current", g: [8, 11], d: "MEDIUM", q: "Varža 4 Ω, srovė 3 A. Kokia įtampa voltais?", e: "U = IR = 4 × 3 = 12 V.", v: 12 },
  { kind: "n", s: "physics", t: "electric-current", g: [8, 11], d: "EASY", q: "Įtampa 9 V, varža 3 Ω. Kokia srovė amperais?", e: "I = U / R = 9 / 3 = 3 A.", v: 3 },

  { kind: "n", s: "physics", t: "exam-physics", g: [11, 12], d: "MEDIUM", q: "Automobilis 10 s padidino greitį nuo 5 m/s iki 25 m/s. Koks pagreitis m/s²?", e: "a = Δv / Δt = 20 / 10 = 2.", v: 2 },
  { kind: "n", s: "physics", t: "exam-physics", g: [11, 12], d: "MEDIUM", q: "Šildytuvas veikia 2 minutes, galia 1000 W. Kiek džaulių energijos sunaudota? E = Pt, laiką imkite sekundėmis.", e: "t = 120 s. E = 1000 × 120 = 120 000 J.", v: 120000 },
  { kind: "m", s: "physics", t: "exam-physics", g: [11, 12], d: "MEDIUM", q: "Kuris teiginys atitinka Omo dėsnį grandinės daliai?", e: "Įtampa lygi srovės ir varžos sandaugai.", o: [["U = I / R", false], ["U = IR", true], ["I = U × R", false], ["R = U × I", false]] },

  // --- Chemija ---
  { kind: "m", s: "chemistry", t: "reactions", g: [9, 11], d: "EASY", q: "Kokia vandens molekulinė formulė?", e: "Vandens molekulėje du vandenilio atomai ir vienas deguonies: H₂O.", o: [["HO", false], ["H₂O", true], ["H₂O₂", false], ["CO₂", false]] },
  { kind: "n", s: "chemistry", t: "reactions", g: [9, 11], d: "MEDIUM", q: "Reakcijoje 2H₂ + O₂ → 2H₂O. Kiek vandenilio molekulių reikia vienai deguonies molekulei?", e: "Koeficientai: 2 mol H₂ vienam mol O₂.", v: 2 },
  { kind: "m", s: "chemistry", t: "reactions", g: [9, 11], d: "MEDIUM", q: "Kuris kitimas yra cheminis, o ne vien fizinis?", e: "Degant susidaro naujos medžiagos. Lydymasis medžiagos sudėties nepakeičia.", o: [["Ledo tirpimas", false], ["Popieriaus degimas", true], ["Vandens garavimas", false], ["Cukraus tirpimas vandenyje", false]] },

  { kind: "m", s: "chemistry", t: "acids-bases", g: [9, 11], d: "EASY", q: "Koks apytikslis neutralaus vandens pH kambario temperatūroje?", e: "Neutralaus tirpalo pH yra 7.", o: [["1", false], ["7", true], ["12", false], ["0", false]] },
  { kind: "m", s: "chemistry", t: "acids-bases", g: [9, 11], d: "MEDIUM", q: "Tirpalo pH = 2. Koks jis?", e: "pH < 7 reiškia rūgštinę terpę.", o: [["Neutralus", false], ["Rūgštinis", true], ["Šarminis", false], ["Neturi pH", false]] },
  { kind: "m", s: "chemistry", t: "acids-bases", g: [9, 11], d: "MEDIUM", q: "Kuris junginys yra natrio chloridas?", e: "Valgomoji druska yra NaCl.", o: [["NaCl", true], ["HCl", false], ["NaOH", false], ["CaCO₃", false]] },

  { kind: "m", s: "chemistry", t: "organic", g: [10, 12], d: "EASY", q: "Kokia metano formulė?", e: "Metanas yra paprasčiausias alkanas, formulė CH₄.", o: [["CH₄", true], ["C₂H₆", false], ["C₂H₄", false], ["CH₃OH", false]] },
  { kind: "m", s: "chemistry", t: "organic", g: [10, 12], d: "MEDIUM", q: "Kuri funkcinė grupė būdinga alkoholiams?", e: "Alkoholiai turi hidroksilo grupę −OH.", o: [["−OH", true], ["−COOH", false], ["−CHO", false], ["Tik −Cl", false]] },
  { kind: "m", s: "chemistry", t: "organic", g: [10, 12], d: "MEDIUM", q: "Kiek anglies atomų yra etano molekulėje?", e: "Etanas C₂H₆ turi du anglies atomus.", o: [["1", false], ["2", true], ["3", false], ["6", false]] },

  { kind: "m", s: "chemistry", t: "exam-chemistry", g: [11, 12], d: "MEDIUM", q: "Lygyje trūksta koeficiento: __ Fe + 3 Cl₂ → 2 FeCl₃. Koks koeficientas prieš Fe?", e: "Dešinėje 2 geležies atomai, todėl kairėje reikia 2 Fe.", o: [["1", false], ["2", true], ["3", false], ["6", false]] },
  { kind: "n", s: "chemistry", t: "exam-chemistry", g: [11, 12], d: "MEDIUM", q: "Anglies atominė masė apytiksliai 12. Kiek gramų yra 2 mol anglies? Įrašykite skaičių.", e: "n × M = 2 × 12 = 24 g.", v: 24 },
  { kind: "m", s: "chemistry", t: "exam-chemistry", g: [11, 12], d: "EASY", q: "Kuris užrašas yra cheminė lygtis, o ne vien žodžiai?", e: "Lygtis rodo formules ir koeficientus.", o: [["Vanduo užverda.", false], ["2H₂ + O₂ → 2H₂O", true], ["Rūgštis yra aštri.", false], ["Druska yra balta.", false]] },
];

function hashSeed(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export const PRACTICE_BANK: PracticeItem[] = ROWS.map((row, index) => {
  const id = `pb-${row.s}-${row.t}-${index + 1}`;
  if (row.kind === "n") {
    return {
      id,
      subjectKey: row.s,
      topicKey: row.t,
      minGrade: row.g[0],
      maxGrade: row.g[1],
      difficulty: row.d,
      type: "NUMERIC",
      content: row.q,
      explanation: row.e,
      correctAnswer: { value: row.v },
      gradingConfig: { tolerance: 0.01 },
    };
  }
  return {
    id,
    subjectKey: row.s,
    topicKey: row.t,
    minGrade: row.g[0],
    maxGrade: row.g[1],
    difficulty: row.d,
    type: "MULTIPLE_CHOICE",
    content: row.q,
    explanation: row.e,
    options: row.o.map(([content, isCorrect]) => ({ content, isCorrect })),
  };
});

export function pickPracticeItems(params: {
  subjectKey: string;
  topicKey: string;
  grade: number | null;
  count: number;
  seed?: string;
}): PracticeItem[] {
  const pool = PRACTICE_BANK.filter((item) => {
    if (item.subjectKey !== params.subjectKey || item.topicKey !== params.topicKey) return false;
    if (params.grade == null) return true;
    return params.grade >= item.minGrade && params.grade <= item.maxGrade;
  });
  if (pool.length === 0) return [];
  const count = Math.max(1, Math.min(params.count, pool.length));
  const start = hashSeed(params.seed ?? "") % pool.length;
  const rotated = pool.slice(start).concat(pool.slice(0, start));
  return rotated.slice(0, count);
}
