import { db } from "@/lib/db";
import { aiProvider } from "@/services/ai";
import {
  IntegrityEventType,
  IntegrityRiskLevel,
  type Prisma,
} from "@prisma/client";
import { scoreIntegrityEvents } from "@/config/assignment-security";

export { assignmentSecurityDefaults, scoreIntegrityEvents } from "@/config/assignment-security";

export class IntegrityService {
  async logEvent(params: {
    submissionId: string;
    studentId: string;
    type: IntegrityEventType;
    metadata?: Prisma.InputJsonValue;
  }) {
    return db.integrityEvent.create({
      data: {
        submissionId: params.submissionId,
        studentId: params.studentId,
        type: params.type,
        metadata: params.metadata,
      },
    });
  }

  async analyzeSubmission(submissionId: string) {
    const submission = await db.assignmentSubmission.findUnique({
      where: { id: submissionId },
      include: {
        attempts: true,
        assignment: true,
        student: true,
        integrityEvents: true,
      },
    });

    if (!submission) throw new Error("Submission not found");

    const totalHelp = submission.attempts.reduce((sum, a) => sum + a.helpRequests, 0);
    const behavior = scoreIntegrityEvents(submission.integrityEvents);

    const ratio =
      submission.maxScore && submission.maxScore > 0
        ? (submission.score ?? 0) / submission.maxScore
        : 0;

    let riskScore = behavior.riskScore;
    const indicators = [...behavior.indicators];

    if (totalHelp > 0 && submission.assignment.aiAssistance === "OFF") {
      indicators.push("help_while_ai_off");
      riskScore = Math.min(1, riskScore + 0.25);
    }
    if (
      submission.timeSpentSeconds > 0 &&
      submission.timeSpentSeconds < 60 &&
      ratio >= 0.9 &&
      submission.attempts.length >= 3
    ) {
      indicators.push("very_fast_high_score");
      riskScore = Math.min(1, riskScore + 0.2);
    }
    if (ratio >= 0.95 && (behavior.riskScore >= 0.35 || totalHelp > 3)) {
      indicators.push("high_score_with_risk_signals");
      riskScore = Math.min(1, riskScore + 0.1);
    }

    try {
      const analysis = await aiProvider.analyzeIntegrity({
        submissionContext: {
          timeSpentSeconds: submission.timeSpentSeconds,
          helpRequests: totalHelp,
          score: submission.score,
          maxScore: submission.maxScore,
          attemptCount: submission.attempts.length,
          behaviorEvents: behavior.indicators,
        },
      });
      riskScore = Math.min(1, Math.max(riskScore, analysis.riskScore));
      if (Array.isArray(analysis.indicators)) {
        for (const ind of analysis.indicators) {
          const label =
            typeof ind === "string"
              ? ind
              : typeof ind === "object" && ind && "type" in ind
                ? String((ind as { type: string }).type)
                : null;
          if (label && !indicators.includes(label)) {
            indicators.push(label);
          }
        }
      }
    } catch {
      // Keep heuristic score if AI unavailable
    }

    const riskLevel: IntegrityRiskLevel =
      riskScore >= 0.65 ? "HIGH" : riskScore >= 0.35 ? "MEDIUM" : "LOW";

    if (
      riskLevel === "LOW" &&
      !submission.assignment.integrityMonitoring &&
      indicators.length === 0
    ) {
      return null;
    }

    const flag = await db.aIIntegrityFlag.create({
      data: {
        studentId: submission.studentId,
        submissionId: submission.id,
        riskLevel,
        riskScore,
        indicators,
      },
    });

    await db.auditLog.create({
      data: {
        actorId: submission.studentId,
        action: "INTEGRITY_FLAG_CREATED",
        targetType: "AssignmentSubmission",
        targetId: submission.id,
        metadata: { riskLevel, riskScore, indicators },
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
        submission: {
          include: {
            assignment: { select: { title: true, integrityMonitoring: true } },
            integrityEvents: { select: { type: true } },
          },
        },
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
