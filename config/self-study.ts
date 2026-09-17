import type { SubscriptionPlan } from "@prisma/client";
import type { SelfStudySelection } from "@/config/curriculum";
import {
  getCurriculumForGrade,
  getCurriculumSubject,
  getCurriculumTopic,
  isSelectionAllowedForGrade,
} from "@/config/curriculum";

export type SelfStudyLimits = {
  maxSubjects: number;
  maxTopicsPerSubject: number;
};

/** Independent-student curriculum caps by personal plan. */
export const SELF_STUDY_LIMITS: Record<SubscriptionPlan, SelfStudyLimits> = {
  FREE: { maxSubjects: 3, maxTopicsPerSubject: 3 },
  PLUS: { maxSubjects: 6, maxTopicsPerSubject: 5 },
  PRO: { maxSubjects: 12, maxTopicsPerSubject: 10 },
  TEACHER: { maxSubjects: 3, maxTopicsPerSubject: 3 },
  SMALL_SCHOOL: { maxSubjects: 3, maxTopicsPerSubject: 3 },
  SCHOOL: { maxSubjects: 3, maxTopicsPerSubject: 3 },
  SCHOOL_PLUS: { maxSubjects: 3, maxTopicsPerSubject: 3 },
  ENTERPRISE: { maxSubjects: 50, maxTopicsPerSubject: 20 },
};

export function getSelfStudyLimits(plan: SubscriptionPlan): SelfStudyLimits {
  return SELF_STUDY_LIMITS[plan] ?? SELF_STUDY_LIMITS.FREE;
}

export function validateSelfStudySelections(
  selections: SelfStudySelection[],
  limits: SelfStudyLimits,
  gradeLevel?: number | null
): { ok: true } | { ok: false; error: string } {
  if (selections.length === 0) {
    return { ok: false, error: "Pasirinkite bent vieną dalyką." };
  }
  if (selections.length > limits.maxSubjects) {
    return {
      ok: false,
      error: `Galima pasirinkti iki ${limits.maxSubjects} dalykų. Norėdami daugiau — atnaujinkite planą.`,
    };
  }

  const available =
    gradeLevel != null ? getCurriculumForGrade(gradeLevel) : null;
  const availableKeys = available
    ? new Set(available.map((s) => s.key))
    : null;

  const seenSubjects = new Set<string>();
  for (const sel of selections) {
    if (seenSubjects.has(sel.subjectKey)) {
      return { ok: false, error: "Dalykas pasirinktas kelis kartus." };
    }
    seenSubjects.add(sel.subjectKey);

    const subject = getCurriculumSubject(sel.subjectKey);
    if (!subject) {
      return { ok: false, error: `Nežinomas dalykas: ${sel.subjectKey}` };
    }

    if (availableKeys && !availableKeys.has(sel.subjectKey)) {
      return {
        ok: false,
        error: `Dalykas „${subject.name}“ nepriklauso ${gradeLevel} klasės programai.`,
      };
    }

    if (sel.topicKeys.length === 0) {
      return {
        ok: false,
        error: `Dalykui „${subject.name}“ pasirinkite bent vieną temą.`,
      };
    }
    if (sel.topicKeys.length > limits.maxTopicsPerSubject) {
      return {
        ok: false,
        error: `Vienam dalykui galima iki ${limits.maxTopicsPerSubject} temų. Norėdami daugiau — atnaujinkite planą.`,
      };
    }

    const gradeTopics = available?.find((s) => s.key === sel.subjectKey)?.topics;
    const seenTopics = new Set<string>();
    for (const topicKey of sel.topicKeys) {
      if (seenTopics.has(topicKey)) {
        return { ok: false, error: "Tema pasirinkta kelis kartus." };
      }
      seenTopics.add(topicKey);
      const topic = getCurriculumTopic(sel.subjectKey, topicKey);
      if (!topic) {
        return {
          ok: false,
          error: `Nežinoma tema „${topicKey}“ dalykui „${subject.name}“.`,
        };
      }
      if (gradeTopics && !gradeTopics.some((t) => t.key === topicKey)) {
        return {
          ok: false,
          error: `Tema „${topic.name}“ netinka ${gradeLevel} klasei.`,
        };
      }
    }

    if (gradeLevel != null && !isSelectionAllowedForGrade(sel, gradeLevel)) {
      return {
        ok: false,
        error: `Pasirinkimas netinka ${gradeLevel} klasės programai.`,
      };
    }
  }

  return { ok: true };
}
