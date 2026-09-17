/** Lithuanian general-education curriculum for independent students, by grade. */

export type CurriculumTopic = {
  key: string;
  name: string;
  description?: string;
  /** Inclusive grade band (1–12). */
  minGrade: number;
  maxGrade: number;
};

export type CurriculumSubject = {
  key: string;
  name: string;
  color: string;
  /** Subject available from this grade (inclusive). */
  minGrade: number;
  /** Subject available until this grade (inclusive). */
  maxGrade: number;
  topics: CurriculumTopic[];
};

/**
 * Aligned with typical Lithuanian school structure:
 * 1–4 pradinė · 5–8 pagrindinė · 9–10 · 11–12 (brandos lygis).
 * Separate Fizika / Chemija / Biologija from ~7 klasė; before that — Pasaulio pažinimas / Gamtos mokslai.
 */
export const PLATFORM_CURRICULUM: CurriculumSubject[] = [
  {
    key: "lithuanian",
    name: "Lietuvių kalba",
    color: "#dc2626",
    minGrade: 1,
    maxGrade: 12,
    topics: [
      { key: "reading-basics", name: "Skaitymas ir raidės", minGrade: 1, maxGrade: 2 },
      { key: "writing-basics", name: "Rašymas ir sakiniai", minGrade: 1, maxGrade: 3 },
      { key: "spelling-primary", name: "Rašyba (pradinė)", minGrade: 2, maxGrade: 4 },
      { key: "story-retell", name: "Teksto atpasakojimas", minGrade: 2, maxGrade: 4 },
      { key: "spelling", name: "Rašyba", minGrade: 5, maxGrade: 8 },
      { key: "punctuation", name: "Skyryba", minGrade: 5, maxGrade: 10 },
      { key: "text-analysis", name: "Teksto suvokimas", minGrade: 5, maxGrade: 12 },
      { key: "literature", name: "Literatūra", minGrade: 7, maxGrade: 12 },
      { key: "essay", name: "Rašinys / samprotavimas", minGrade: 9, maxGrade: 12 },
      { key: "exam-lithuanian", name: "Brandos egzamino ruošimas", minGrade: 11, maxGrade: 12 },
    ],
  },
  {
    key: "mathematics",
    name: "Matematika",
    color: "#2563eb",
    minGrade: 1,
    maxGrade: 12,
    topics: [
      { key: "numbers-20", name: "Skaičiai iki 20", minGrade: 1, maxGrade: 1 },
      { key: "addition-subtraction", name: "Sudėtis ir atimtis", minGrade: 1, maxGrade: 3 },
      { key: "multiplication-table", name: "Daugybos lentelė", minGrade: 2, maxGrade: 4 },
      { key: "division", name: "Dalyba", minGrade: 3, maxGrade: 4 },
      { key: "measurements", name: "Matavimai (cm, kg, l)", minGrade: 2, maxGrade: 4 },
      { key: "geometry-primary", name: "Figūros ir plotas (pradinė)", minGrade: 3, maxGrade: 4 },
      { key: "fractions", name: "Trupmenos", minGrade: 4, maxGrade: 7 },
      { key: "decimals", name: "Dešimtainės trupmenos", minGrade: 5, maxGrade: 7 },
      { key: "percentages", name: "Procentai", minGrade: 6, maxGrade: 9 },
      { key: "linear-equations", name: "Tiesinės lygtys", minGrade: 7, maxGrade: 9 },
      { key: "geometry", name: "Geometrija", minGrade: 7, maxGrade: 11 },
      { key: "quadratic-equations", name: "Kvadratinės lygtys", minGrade: 9, maxGrade: 11 },
      { key: "functions", name: "Funkcijos", minGrade: 9, maxGrade: 12 },
      { key: "exam-math", name: "Brandos egzamino ruošimas", minGrade: 11, maxGrade: 12 },
    ],
  },
  {
    key: "world-studies",
    name: "Pasaulio pažinimas",
    color: "#0d9488",
    minGrade: 1,
    maxGrade: 4,
    topics: [
      { key: "me-and-family", name: "Aš ir šeima", minGrade: 1, maxGrade: 2 },
      { key: "seasons-weather", name: "Metų laikai ir oras", minGrade: 1, maxGrade: 3 },
      { key: "plants-animals", name: "Augalai ir gyvūnai", minGrade: 1, maxGrade: 4 },
      { key: "human-body-primary", name: "Žmogaus kūnas (pradinė)", minGrade: 2, maxGrade: 4 },
      { key: "home-school-safety", name: "Saugumas namuose ir mokykloje", minGrade: 1, maxGrade: 4 },
      { key: "lithuania-primary", name: "Lietuva aplink mus", minGrade: 3, maxGrade: 4 },
      { key: "nature-care", name: "Gamtos saugojimas", minGrade: 2, maxGrade: 4 },
    ],
  },
  {
    key: "english",
    name: "Anglų kalba",
    color: "#059669",
    minGrade: 2,
    maxGrade: 12,
    topics: [
      { key: "abc-greetings", name: "ABC and greetings", minGrade: 2, maxGrade: 3 },
      { key: "words-school", name: "School and home words", minGrade: 2, maxGrade: 4 },
      { key: "simple-sentences", name: "Simple sentences", minGrade: 3, maxGrade: 5 },
      { key: "grammar", name: "Grammar", minGrade: 5, maxGrade: 12 },
      { key: "vocabulary", name: "Vocabulary", minGrade: 5, maxGrade: 12 },
      { key: "reading", name: "Reading", minGrade: 5, maxGrade: 12 },
      { key: "writing", name: "Writing", minGrade: 7, maxGrade: 12 },
      { key: "listening", name: "Listening", minGrade: 6, maxGrade: 12 },
      { key: "exam-english", name: "Exam preparation", minGrade: 11, maxGrade: 12 },
    ],
  },
  {
    key: "natural-science",
    name: "Gamtos mokslai",
    color: "#65a30d",
    minGrade: 5,
    maxGrade: 6,
    topics: [
      { key: "living-nonliving", name: "Gyvoji ir negyvoji gamta", minGrade: 5, maxGrade: 6 },
      { key: "water-air", name: "Vanduo ir oras", minGrade: 5, maxGrade: 6 },
      { key: "energy-intro", name: "Energija aplink mus", minGrade: 5, maxGrade: 6 },
      { key: "ecosystems-intro", name: "Ekosistemos (įvadas)", minGrade: 5, maxGrade: 6 },
      { key: "human-health", name: "Žmogaus sveikata", minGrade: 5, maxGrade: 6 },
      { key: "materials", name: "Medžiagos ir jų savybės", minGrade: 5, maxGrade: 6 },
    ],
  },
  {
    key: "history",
    name: "Istorija",
    color: "#a16207",
    minGrade: 5,
    maxGrade: 12,
    topics: [
      { key: "lithuanian-history-intro", name: "Lietuvos istorijos pradmenys", minGrade: 5, maxGrade: 6 },
      { key: "middle-ages", name: "Viduramžiai", minGrade: 6, maxGrade: 8 },
      { key: "lithuania-statehood", name: "Lietuvos valstybingumas", minGrade: 7, maxGrade: 10 },
      { key: "modern-europe", name: "Naujieji laikai Europoje", minGrade: 8, maxGrade: 11 },
      { key: "20th-century", name: "XX amžius", minGrade: 9, maxGrade: 12 },
      { key: "exam-history", name: "Brandos egzamino ruošimas", minGrade: 11, maxGrade: 12 },
    ],
  },
  {
    key: "geography",
    name: "Geografija",
    color: "#0284c7",
    minGrade: 5,
    maxGrade: 12,
    topics: [
      { key: "map-skills", name: "Žemėlapiai", minGrade: 5, maxGrade: 7 },
      { key: "lithuania-geography", name: "Lietuvos geografija", minGrade: 5, maxGrade: 9 },
      { key: "europe", name: "Europa", minGrade: 6, maxGrade: 9 },
      { key: "continents", name: "Žemynai", minGrade: 6, maxGrade: 8 },
      { key: "climate-population", name: "Klimatas ir gyventojai", minGrade: 8, maxGrade: 11 },
      { key: "exam-geography", name: "Brandos egzamino ruošimas", minGrade: 11, maxGrade: 12 },
    ],
  },
  {
    key: "biology",
    name: "Biologija",
    color: "#16a34a",
    minGrade: 7,
    maxGrade: 12,
    topics: [
      { key: "cell", name: "Ląstelė", minGrade: 7, maxGrade: 9 },
      { key: "human-body", name: "Žmogaus kūnas", minGrade: 7, maxGrade: 10 },
      { key: "ecology", name: "Ekologija", minGrade: 8, maxGrade: 11 },
      { key: "genetics", name: "Genetika", minGrade: 9, maxGrade: 12 },
      { key: "exam-biology", name: "Brandos egzamino ruošimas", minGrade: 11, maxGrade: 12 },
    ],
  },
  {
    key: "physics",
    name: "Fizika",
    color: "#7c3aed",
    minGrade: 7,
    maxGrade: 12,
    topics: [
      { key: "mechanics", name: "Mechanika", minGrade: 7, maxGrade: 10 },
      { key: "energy", name: "Energija", minGrade: 7, maxGrade: 10 },
      { key: "electric-current", name: "Elektros srovė", minGrade: 8, maxGrade: 11 },
      { key: "optics", name: "Optika", minGrade: 9, maxGrade: 12 },
      { key: "waves", name: "Bangos", minGrade: 9, maxGrade: 12 },
      { key: "exam-physics", name: "Brandos egzamino ruošimas", minGrade: 11, maxGrade: 12 },
    ],
  },
  {
    key: "chemistry",
    name: "Chemija",
    color: "#ea580c",
    minGrade: 8,
    maxGrade: 12,
    topics: [
      { key: "atoms", name: "Atomai ir molekulės", minGrade: 8, maxGrade: 10 },
      { key: "reactions", name: "Cheminės reakcijos", minGrade: 8, maxGrade: 11 },
      { key: "acids-bases", name: "Rūgštys ir bazės", minGrade: 9, maxGrade: 11 },
      { key: "organic", name: "Organinė chemija", minGrade: 10, maxGrade: 12 },
      { key: "exam-chemistry", name: "Brandos egzamino ruošimas", minGrade: 11, maxGrade: 12 },
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

/** Subjects + topics available for a concrete Lithuanian grade (1–12). */
export function getCurriculumForGrade(grade: number | null | undefined): CurriculumSubject[] {
  const g = grade != null && grade >= 1 && grade <= 12 ? grade : null;
  if (g == null) {
    // No grade yet — show only primary-safe defaults so kids aren't shown exam science.
    return getCurriculumForGrade(4);
  }

  return PLATFORM_CURRICULUM.filter((s) => inGradeBand(g, s.minGrade, s.maxGrade))
    .map((s) => ({
      ...s,
      topics: s.topics.filter((t) => inGradeBand(g, t.minGrade, t.maxGrade)),
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
      })),
    };
  });
}

export function gradeBandLabel(grade: number): string {
  if (grade <= 4) return "Pradinė mokykla";
  if (grade <= 8) return "Pagrindinė mokykla";
  if (grade <= 10) return "Vidurinė (I–II gimnazijos)";
  return "III–IV gimnazijos / brandos";
}
