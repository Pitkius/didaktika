import { db } from "@/lib/db";
import {
  getCurriculumSubject,
  getCurriculumTopic,
  resolveSelectionLabels,
  type SelfStudySelection,
} from "@/config/curriculum";
import {
  getSelfStudyLimits,
  validateSelfStudySelections,
} from "@/config/self-study";
import { entitlementService } from "@/services/entitlements/entitlement-service";
import { aiProvider } from "@/services/ai";
import { usageService } from "@/services/usage/usage-service";
import type { Difficulty, QuestionType, SubscriptionPlan } from "@prisma/client";

function parseSelections(raw: unknown): SelfStudySelection[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      if (typeof row.subjectKey !== "string" || !Array.isArray(row.topicKeys)) return null;
      return {
        subjectKey: row.subjectKey,
        topicKeys: row.topicKeys.filter((t): t is string => typeof t === "string"),
      };
    })
    .filter((s): s is SelfStudySelection => s !== null);
}

export async function getSelfStudyContext(userId: string, schoolId: string | null) {
  const independent = entitlementService.isIndependentStudent({
    userId,
    role: "STUDENT",
    schoolId,
  });
  if (!independent) {
    return { independent: false as const };
  }

  const { plan, limits } = await entitlementService.getSelfStudyLimitsFor({
    userId,
    role: "STUDENT",
    schoolId,
  });

  const profile = await db.studentProfile.findUnique({
    where: { userId },
    select: { selfStudySelections: true },
  });
  const selections = parseSelections(profile?.selfStudySelections);

  return {
    independent: true as const,
    plan,
    limits,
    selections,
    labeled: resolveSelectionLabels(selections),
  };
}

export async function saveSelfStudySelections(params: {
  userId: string;
  schoolId: string | null;
  selections: SelfStudySelection[];
}) {
  if (
    !entitlementService.isIndependentStudent({
      userId: params.userId,
      role: "STUDENT",
      schoolId: params.schoolId,
    })
  ) {
    return { error: "Ši funkcija skirta savarankiškiems mokiniams be mokyklos." };
  }

  const plan = await entitlementService.resolvePlan({
    userId: params.userId,
    role: "STUDENT",
    schoolId: params.schoolId,
  });
  const limits = getSelfStudyLimits(plan);
  const validated = validateSelfStudySelections(params.selections, limits);
  if (!validated.ok) return { error: validated.error };

  await db.studentProfile.upsert({
    where: { userId: params.userId },
    create: {
      userId: params.userId,
      selfStudySelections: params.selections,
    },
    update: {
      selfStudySelections: params.selections,
    },
  });

  return { success: true as const, plan, limits, selections: params.selections };
}

async function resolveDifficulty(
  userId: string,
  subjectKey: string,
  topicKey: string
): Promise<Difficulty> {
  const recent = await db.questionAttempt.findMany({
    where: {
      studentId: userId,
      question: { isAIGenerated: true },
    },
    orderBy: { createdAt: "desc" },
    take: 30,
    select: {
      isCorrect: true,
      question: { select: { metadata: true } },
    },
  });

  const topicAttempts = recent.filter((a) => {
    const meta = a.question.metadata as Record<string, unknown> | null;
    return meta?.selfStudy === true && meta?.subjectKey === subjectKey && meta?.topicKey === topicKey;
  });

  if (topicAttempts.length < 3) return "MEDIUM";
  const correct = topicAttempts.filter((a) => a.isCorrect).length;
  const accuracy = correct / topicAttempts.length;
  if (accuracy >= 0.8) return "HARD";
  if (accuracy <= 0.4) return "EASY";
  return "MEDIUM";
}

function questionTypeForSubject(subjectKey: string): QuestionType {
  if (subjectKey === "mathematics" || subjectKey === "physics" || subjectKey === "chemistry") {
    return "NUMERIC";
  }
  if (subjectKey === "english" || subjectKey === "lithuanian") {
    return "MULTIPLE_CHOICE";
  }
  return "SHORT_ANSWER";
}

export async function startSelfStudyPractice(params: {
  userId: string;
  schoolId: string | null;
  subjectKey: string;
  topicKey: string;
  questionCount?: number;
}) {
  if (
    !entitlementService.isIndependentStudent({
      userId: params.userId,
      role: "STUDENT",
      schoolId: params.schoolId,
    })
  ) {
    return { error: "Ši funkcija skirta savarankiškiems mokiniams be mokyklos." };
  }

  const ctx = await getSelfStudyContext(params.userId, params.schoolId);
  if (!ctx.independent) return { error: "Negalima pradėti savarankiškos praktikos." };

  const allowed = ctx.selections.some(
    (s) => s.subjectKey === params.subjectKey && s.topicKeys.includes(params.topicKey)
  );
  if (!allowed) {
    return { error: "Tema neįtraukta į jūsų pasirinkimus. Atnaujinkite dalykų sąrašą." };
  }

  const subject = getCurriculumSubject(params.subjectKey);
  const topic = getCurriculumTopic(params.subjectKey, params.topicKey);
  if (!subject || !topic) return { error: "Nežinomas dalykas arba tema." };

  const entitlement = await entitlementService.canGenerateQuestions({
    userId: params.userId,
    role: "STUDENT",
    schoolId: params.schoolId,
  });
  if (!entitlement.allowed) {
    return { error: entitlement.reason ?? "Pasiektas DI klausimų limitas." };
  }

  const count = Math.min(Math.max(params.questionCount ?? 5, 1), 8);
  const difficulty = await resolveDifficulty(params.userId, params.subjectKey, params.topicKey);
  const type = questionTypeForSubject(params.subjectKey);

  const generated = await aiProvider.generateQuestion({
    subject: subject.name,
    topic: topic.name,
    difficulty,
    type,
    count,
  });

  if (generated.length === 0) {
    return { error: "Nepavyko sugeneruoti užduočių. Bandykite dar kartą." };
  }

  const assignment = await db.assignment.create({
    data: {
      title: `${subject.name}: ${topic.name}`,
      description:
        "DI sugeneruota mokymosi praktika pagal jūsų pasirinkimą. Po kiekvieno atsakymo gausite grįžtamąjį ryšį.",
      type: "PRACTICE",
      status: "PUBLISHED",
      aiAssistance: "FULL_TUTORING",
      attemptsAllowed: 1,
      classId: null,
      schoolId: null,
      createdById: params.userId,
      publishedAt: new Date(),
    },
  });

  let order = 0;
  for (const g of generated) {
    const questionType = (g.type as QuestionType) || type;
    const question = await db.question.create({
      data: {
        type: questionType,
        difficulty: (g.difficulty as Difficulty) || difficulty,
        content: g.content,
        explanation: g.explanation,
        correctAnswer: g.correctAnswer as object,
        gradingConfig: g.gradingConfig as object,
        createdById: params.userId,
        schoolId: null,
        isAIGenerated: true,
        metadata: {
          selfStudy: true,
          subjectKey: params.subjectKey,
          topicKey: params.topicKey,
          subjectName: subject.name,
          topicName: topic.name,
        },
        options: g.options
          ? {
              create: g.options.map((o, i) => ({
                content: o.content,
                isCorrect: o.isCorrect,
                orderIndex: i,
              })),
            }
          : undefined,
      },
      include: { options: true },
    });

    if (
      (questionType === "MULTIPLE_CHOICE" || questionType === "SINGLE_ANSWER") &&
      question.options.length > 0
    ) {
      const correctIds = question.options.filter((o) => o.isCorrect).map((o) => o.id);
      await db.question.update({
        where: { id: question.id },
        data: { correctAnswer: { optionIds: correctIds } },
      });
    }

    await db.assignmentQuestion.create({
      data: {
        assignmentId: assignment.id,
        questionId: question.id,
        orderIndex: order++,
        points: 1,
      },
    });
  }

  await usageService.increment(
    params.userId,
    "AI_QUESTION_GENERATION",
    generated.length,
    params.schoolId
  );

  await db.aIInteraction.create({
    data: {
      userId: params.userId,
      type: "AI_GENERATION",
      metadata: {
        selfStudy: true,
        subjectKey: params.subjectKey,
        topicKey: params.topicKey,
        count: generated.length,
        difficulty,
      },
    },
  });

  await db.learningEvent.create({
    data: {
      studentId: params.userId,
      eventType: "SESSION_STARTED",
      metadata: {
        selfStudy: true,
        subjectKey: params.subjectKey,
        topicKey: params.topicKey,
        assignmentId: assignment.id,
      },
    },
  });

  return {
    success: true as const,
    assignmentId: assignment.id,
    difficulty,
    count: generated.length,
    plan: ctx.plan as SubscriptionPlan,
  };
}
