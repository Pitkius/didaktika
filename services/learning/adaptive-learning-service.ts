import { db } from "@/lib/db";
import { Difficulty, MasteryLevel } from "@prisma/client";

export class AdaptiveLearningService {
  async getNextDifficulty(studentId: string, skillId: string): Promise<Difficulty> {
    const profile = await db.learningProfile.findUnique({
      where: { studentId_skillId: { studentId, skillId } },
    });

    if (!profile || profile.attemptCount < 3) return "EASY";

    if (profile.accuracy >= 90) return "HARD";
    if (profile.accuracy >= 75) return "MEDIUM";
    if (profile.accuracy >= 50) return "MEDIUM";
    return "EASY";
  }

  async identifyWeakSkills(studentId: string, limit = 5) {
    return db.learningProfile.findMany({
      where: {
        studentId,
        masteryLevel: { in: ["WEAK", "NEEDS_PRACTICE"] },
      },
      include: {
        skill: { include: { topic: { include: { subject: true } } } },
      },
      orderBy: { masteryScore: "asc" },
      take: limit,
    });
  }

  async identifyStrongSkills(studentId: string, limit = 5) {
    return db.learningProfile.findMany({
      where: {
        studentId,
        masteryLevel: { in: ["GOOD", "STRONG"] },
      },
      include: {
        skill: { include: { topic: { include: { subject: true } } } },
      },
      orderBy: { masteryScore: "desc" },
      take: limit,
    });
  }

  async updateLearningProfile(params: {
    studentId: string;
    skillId: string;
    isCorrect: boolean;
    timeSpentSeconds: number;
    helpRequests?: number;
  }) {
    const existing = await db.learningProfile.findUnique({
      where: {
        studentId_skillId: {
          studentId: params.studentId,
          skillId: params.skillId,
        },
      },
    });

    const attemptCount = (existing?.attemptCount ?? 0) + 1;
    const mistakeCount = (existing?.mistakeCount ?? 0) + (params.isCorrect ? 0 : 1);
    const helpRequests = (existing?.helpRequests ?? 0) + (params.helpRequests ?? 0);
    const correctCount =
      (existing ? Math.round((existing.accuracy / 100) * existing.attemptCount) : 0) +
      (params.isCorrect ? 1 : 0);
    const accuracy = (correctCount / attemptCount) * 100;

    const prevAve = existing?.averageTimeSeconds ?? 0;
    const prevCount = existing?.attemptCount ?? 0;
    const averageTimeSeconds =
      prevCount > 0
        ? (prevAve * prevCount + params.timeSpentSeconds) / attemptCount
        : params.timeSpentSeconds;

    const masteryScore = this.calculateMasteryScore({
      accuracy,
      attemptCount,
      helpRequests,
      averageTimeSeconds,
    });

    const masteryLevel = this.getMasteryLevel(masteryScore);
    const trend = existing ? masteryScore - existing.masteryScore : 0;

    return db.learningProfile.upsert({
      where: {
        studentId_skillId: {
          studentId: params.studentId,
          skillId: params.skillId,
        },
      },
      create: {
        studentId: params.studentId,
        skillId: params.skillId,
        masteryScore,
        accuracy,
        attemptCount,
        mistakeCount,
        helpRequests,
        averageTimeSeconds,
        lastPracticed: new Date(),
        confidence: Math.min(accuracy / 100, 1),
        trend,
        masteryLevel,
      },
      update: {
        masteryScore,
        accuracy,
        attemptCount,
        mistakeCount,
        helpRequests,
        averageTimeSeconds,
        lastPracticed: new Date(),
        confidence: Math.min(accuracy / 100, 1),
        trend,
        masteryLevel,
      },
    });
  }

  private calculateMasteryScore(params: {
    accuracy: number;
    attemptCount: number;
    helpRequests: number;
    averageTimeSeconds: number;
  }): number {
    let score = params.accuracy * 0.6;
    const experienceBonus = Math.min(params.attemptCount * 2, 20);
    score += experienceBonus;
    const helpPenalty = Math.min(params.helpRequests * 3, 15);
    score -= helpPenalty;
    return Math.max(0, Math.min(100, score));
  }

  private getMasteryLevel(score: number): MasteryLevel {
    if (score >= 80) return "STRONG";
    if (score >= 60) return "GOOD";
    if (score >= 40) return "NEEDS_PRACTICE";
    return "WEAK";
  }

  async selectNextQuestion(studentId: string, subjectId?: string) {
    const weakSkills = await this.identifyWeakSkills(studentId, 3);
    const targetSkill = weakSkills[0];

    const difficulty = targetSkill
      ? await this.getNextDifficulty(studentId, targetSkill.skillId)
      : "MEDIUM";

    const where: Record<string, unknown> = {
      isArchived: false,
      difficulty,
    };
    if (subjectId) where.subjectId = subjectId;
    if (targetSkill) where.skillId = targetSkill.skillId;

    const questions = await db.question.findMany({
      where,
      include: { options: true, skill: true, topic: true },
      take: 10,
    });

    if (questions.length === 0) {
      return db.question.findFirst({
        where: { isArchived: false, ...(subjectId ? { subjectId } : {}) },
        include: { options: true, skill: true, topic: true },
      });
    }

    const attemptedIds = await db.questionAttempt.findMany({
      where: { studentId },
      select: { questionId: true },
      distinct: ["questionId"],
    });
    const attemptedSet = new Set(attemptedIds.map((a) => a.questionId));
    const unattempted = questions.filter((q) => !attemptedSet.has(q.id));
    const pool = unattempted.length > 0 ? unattempted : questions;
    return pool[Math.floor(Math.random() * pool.length)];
  }
}

export const adaptiveLearningService = new AdaptiveLearningService();
