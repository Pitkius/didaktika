/** Platform curriculum for independent (no-school) students. */

export type CurriculumTopic = {
  key: string;
  name: string;
  description?: string;
};

export type CurriculumSubject = {
  key: string;
  name: string;
  color: string;
  topics: CurriculumTopic[];
};

export const PLATFORM_CURRICULUM: CurriculumSubject[] = [
  {
    key: "mathematics",
    name: "Matematika",
    color: "#2563eb",
    topics: [
      { key: "quadratic-equations", name: "Kvadratinės lygtys" },
      { key: "functions", name: "Funkcijos" },
      { key: "geometry", name: "Geometrija" },
      { key: "linear-equations", name: "Tiesinės lygtys" },
      { key: "percentages", name: "Procentai" },
      { key: "fractions", name: "Trupmenos" },
    ],
  },
  {
    key: "english",
    name: "Anglų kalba",
    color: "#059669",
    topics: [
      { key: "grammar", name: "Grammar" },
      { key: "vocabulary", name: "Vocabulary" },
      { key: "reading", name: "Reading" },
      { key: "writing", name: "Writing" },
      { key: "listening", name: "Listening" },
    ],
  },
  {
    key: "physics",
    name: "Fizika",
    color: "#7c3aed",
    topics: [
      { key: "mechanics", name: "Mechanika" },
      { key: "electric-current", name: "Elektros srovė" },
      { key: "energy", name: "Energija" },
      { key: "optics", name: "Optika" },
      { key: "waves", name: "Bangos" },
    ],
  },
  {
    key: "lithuanian",
    name: "Lietuvių kalba",
    color: "#dc2626",
    topics: [
      { key: "spelling", name: "Rašyba" },
      { key: "punctuation", name: "Skyryba" },
      { key: "literature", name: "Literatūra" },
      { key: "text-analysis", name: "Teksto analizė" },
    ],
  },
  {
    key: "biology",
    name: "Biologija",
    color: "#16a34a",
    topics: [
      { key: "cell", name: "Ląstelė" },
      { key: "genetics", name: "Genetika" },
      { key: "ecology", name: "Ekologija" },
      { key: "human-body", name: "Žmogaus kūnas" },
    ],
  },
  {
    key: "chemistry",
    name: "Chemija",
    color: "#ea580c",
    topics: [
      { key: "atoms", name: "Atomai ir molekulės" },
      { key: "reactions", name: "Cheminės reakcijos" },
      { key: "acids-bases", name: "Rūgštys ir bazės" },
      { key: "organic", name: "Organinė chemija" },
    ],
  },
];

export type SelfStudySelection = {
  subjectKey: string;
  topicKeys: string[];
};

export function getCurriculumSubject(key: string) {
  return PLATFORM_CURRICULUM.find((s) => s.key === key);
}

export function getCurriculumTopic(subjectKey: string, topicKey: string) {
  const subject = getCurriculumSubject(subjectKey);
  return subject?.topics.find((t) => t.key === topicKey);
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
