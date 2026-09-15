import { db } from "@/lib/db";
import { aiProvider } from "@/services/ai";
import type { Prisma } from "@prisma/client";

export class AIInsightsService {
  async generateClassInsights(classId: string) {
    const classData = await db.class.findUnique({
      where: { id: classId },
      include: {
        members: true,
        assignments: {
          where: { status: "PUBLISHED" },
          include: {
            questions: { include: { question: true } },
            submissions: {
              include: { attempts: true },
            },
          },
        },
      },
    });

    if (!classData) return [];

    const insights: Array<{ content: string; insightType: string; metadata?: Record<string, unknown> }> = [];

    for (const assignment of classData.assignments) {
      const totalStudents = classData.members.length;
      const submissions = assignment.submissions.filter(
        (s) => s.status === "SUBMITTED" || s.status === "GRADED"
      );

      for (const aq of assignment.questions) {
        const questionAttempts = submissions.flatMap((s) =>
          s.attempts.filter((a) => a.questionId === aq.questionId)
        );
        const incorrect = questionAttempts.filter((a) => a.isCorrect === false).length;
        const total = questionAttempts.length;

        if (total > 0 && incorrect / total > 0.5) {
          insights.push({
            content: `${incorrect} of ${total} students struggled with a question in "${assignment.title}".`,
            insightType: "DIFFICULT_QUESTION",
            metadata: { assignmentId: assignment.id, questionId: aq.questionId },
          });
        }
      }

      const avgScore =
        submissions.length > 0
          ? submissions.reduce((sum, s) => sum + (s.score ?? 0), 0) / submissions.length
          : 0;

      if (submissions.length > 0 && avgScore / (submissions[0]?.maxScore ?? 1) < 0.5) {
        const insight = await aiProvider.generateTeacherInsight({
          classContext: {
            strugglingCount: Math.round(submissions.length * 0.7),
            totalStudents,
            weakTopic: assignment.title,
          },
        });
        insights.push(insight);
      }
    }

    for (const insight of insights) {
      await db.aIInsight.create({
        data: {
          targetType: "Class",
          targetId: classId,
          insightType: insight.insightType,
          content: insight.content,
          metadata: (insight.metadata ?? {}) as Prisma.InputJsonValue,
        },
      });
    }

    return insights;
  }

  async getClassInsights(classId: string) {
    return db.aIInsight.findMany({
      where: { targetType: "Class", targetId: classId, isDismissed: false },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
  }
}

export const aiInsightsService = new AIInsightsService();
