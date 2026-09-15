import { db } from "@/lib/db";
import { aiProvider } from "@/services/ai";
import { IntegrityRiskLevel } from "@prisma/client";

export class IntegrityService {
  async analyzeSubmission(submissionId: string) {
    const submission = await db.assignmentSubmission.findUnique({
      where: { id: submissionId },
      include: {
        attempts: true,
        assignment: true,
        student: true,
      },
    });

    if (!submission) throw new Error("Submission not found");

    const totalHelp = submission.attempts.reduce((sum, a) => sum + a.helpRequests, 0);
    const analysis = await aiProvider.analyzeIntegrity({
      submissionContext: {
        timeSpentSeconds: submission.timeSpentSeconds,
        helpRequests: totalHelp,
        score: submission.score,
        maxScore: submission.maxScore,
        attemptCount: submission.attempts.length,
      },
    });

    const flag = await db.aIIntegrityFlag.create({
      data: {
        studentId: submission.studentId,
        submissionId: submission.id,
        riskLevel: analysis.riskLevel as IntegrityRiskLevel,
        riskScore: analysis.riskScore,
        indicators: analysis.indicators,
      },
    });

    await db.auditLog.create({
      data: {
        actorId: submission.studentId,
        action: "INTEGRITY_FLAG_CREATED",
        targetType: "AssignmentSubmission",
        targetId: submission.id,
        metadata: { riskLevel: analysis.riskLevel, riskScore: analysis.riskScore },
      },
    });

    return flag;
  }

  async getFlagsForTeacher(teacherId: string) {
    return db.aIIntegrityFlag.findMany({
      where: {
        submission: {
          assignment: { createdById: teacherId },
        },
        isResolved: false,
      },
      include: {
        student: { select: { firstName: true, lastName: true, email: true } },
        submission: { include: { assignment: { select: { title: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async resolveFlag(params: {
    flagId: string;
    reviewerId: string;
    teacherNotes?: string;
  }) {
    const flag = await db.aIIntegrityFlag.findUnique({ where: { id: params.flagId } });
    if (!flag) throw new Error("Flag not found");

    return db.aIIntegrityFlag.update({
      where: { id: params.flagId },
      data: {
        isResolved: true,
        reviewedById: params.reviewerId,
        reviewedAt: new Date(),
        teacherNotes: params.teacherNotes,
      },
    });
  }
}

export const integrityService = new IntegrityService();
