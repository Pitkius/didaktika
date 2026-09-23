"use server";

import { requireTeacher } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { aiProvider } from "@/services/ai";
import { aiInsightsService } from "@/services/analytics/ai-insights-service";
import { notificationService } from "@/services/notifications/notification-service";
import { entitlementService } from "@/services/entitlements/entitlement-service";
import { usageService } from "@/services/usage/usage-service";
import { rateLimit } from "@/lib/security/rate-limit";
import { isRequiredEmailOperational } from "@/services/email/email-service";
import {
  AssignmentStatus,
  AssignmentType,
  AIAssistanceLevel,
  Difficulty,
  QuestionType,
} from "@prisma/client";
import { revalidatePath } from "next/cache";
import { lt } from "@/lib/i18n";

export async function createClassAction(formData: FormData) {
  const session = await requireTeacher();
  const name = String(formData.get("name") ?? "").trim();
  const description = formData.get("description") as string;
  const subjectId = String(formData.get("subjectId") ?? "");

  if (!name) return { error: lt.teacher.classNameRequired };
  if (!session.user.schoolId) return { error: lt.teacher.schoolRequired };

  const entitlement = await entitlementService.canCreateClass({
    userId: session.user.id,
    role: session.user.role,
    schoolId: session.user.schoolId,
  });
  if (!entitlement.allowed) return { error: entitlement.reason ?? lt.billing.limitReached };

  if (subjectId) {
    const subject = await db.subject.findFirst({
      where: { id: subjectId, schoolId: session.user.schoolId },
    });
    if (!subject) return { error: lt.teacher.classNotFound };
  }

  const classRecord = await db.class.create({
    data: {
      name,
      description: description || null,
      schoolId: session.user.schoolId,
      teacherId: session.user.id,
      subjectId: subjectId || null,
    },
  });

  await db.auditLog.create({
    data: {
      actorId: session.user.id,
      action: "CLASS_CREATED",
      targetType: "Class",
      targetId: classRecord.id,
      schoolId: session.user.schoolId,
    },
  });

  revalidatePath("/teacher/classes");
  return { success: true, classId: classRecord.id };
}

export async function createAssignmentAction(params: {
  title: string;
  description?: string;
  type: AssignmentType;
  classId?: string;
  subjectId?: string;
  topicId?: string;
  dueDate?: string;
  timeLimitMinutes?: number;
  attemptsAllowed?: number;
  aiAssistance?: AIAssistanceLevel;
  integrityMonitoring?: boolean;
  showResultsImmediately?: boolean;
  questionIds?: string[];
}) {
  const session = await requireTeacher();
  const { assignmentSecurityDefaults } = await import(
    "@/config/assignment-security"
  );
  const defaults = assignmentSecurityDefaults(params.type);

  if (params.classId) {
    const klass = await db.class.findFirst({
      where: {
        id: params.classId,
        ...(session.user.role === "SUPER_ADMIN"
          ? {}
          : session.user.role === "SCHOOL_ADMIN"
            ? { schoolId: session.user.schoolId ?? "missing-school" }
            : { teacherId: session.user.id }),
      },
    });
    if (!klass) return { error: lt.teacher.classNotFound };
  }

  if (params.subjectId && session.user.role !== "SUPER_ADMIN") {
    const subject = await db.subject.findFirst({
      where: { id: params.subjectId, schoolId: session.user.schoolId ?? "missing-school" },
    });
    if (!subject) return { error: lt.teacher.classNotFound };
  }

  const questionIds = params.questionIds ? [...new Set(params.questionIds)] : undefined;
  if (questionIds?.length) {
    const found = await db.question.count({
      where: {
        id: { in: questionIds },
        isArchived: false,
        OR: [
          { createdById: session.user.id },
          { schoolId: null },
          ...(session.user.schoolId ? [{ schoolId: session.user.schoolId }] : []),
        ],
      },
    });
    if (found !== questionIds.length) return { error: lt.teacher.questionsNotAllowed };
  }

  const assignment = await db.assignment.create({
    data: {
      title: params.title,
      description: params.description,
      type: params.type,
      classId: params.classId,
      subjectId: params.subjectId,
      topicId: params.topicId,
      dueDate: params.dueDate ? new Date(params.dueDate) : null,
      timeLimitMinutes: params.timeLimitMinutes ?? defaults.timeLimitMinutes,
      attemptsAllowed: params.attemptsAllowed ?? defaults.attemptsAllowed,
      aiAssistance: params.aiAssistance ?? defaults.aiAssistance,
      integrityMonitoring: params.integrityMonitoring ?? defaults.integrityMonitoring,
      showResultsImmediately:
        params.showResultsImmediately ?? defaults.showResultsImmediately,
      createdById: session.user.id,
      schoolId: session.user.schoolId,
      status: "DRAFT",
      questions:
        questionIds && questionIds.length > 0
          ? {
              create: questionIds.map((qId, i) => ({
                questionId: qId,
                orderIndex: i,
              })),
            }
          : undefined,
    },
  });

  await db.auditLog.create({
    data: {
      actorId: session.user.id,
      action: "ASSIGNMENT_CREATED",
      targetType: "Assignment",
      targetId: assignment.id,
      schoolId: session.user.schoolId,
      metadata: {
        type: params.type,
        integrityMonitoring: assignment.integrityMonitoring,
        aiAssistance: assignment.aiAssistance,
      },
    },
  });

  revalidatePath("/teacher/assignments");
  return { success: true, assignmentId: assignment.id };
}

export async function publishAssignmentAction(assignmentId: string) {
  const session = await requireTeacher();

  const assignment = await db.assignment.findFirst({
    where: { id: assignmentId, createdById: session.user.id },
    include: { class: { include: { members: true } } },
  });
  if (!assignment) return { error: lt.teacher.assignmentNotFound };

  await db.assignment.update({
    where: { id: assignmentId },
    data: { status: "PUBLISHED" as AssignmentStatus, publishedAt: new Date() },
  });

  if (assignment.class) {
    for (const member of assignment.class.members) {
      await notificationService.create({
        userId: member.userId,
        type: "NEW_ASSIGNMENT",
        title: lt.teacher.newAssignmentNotif,
        message: lt.teacher.assignmentPublished.replace("{title}", assignment.title),
        link: `/student/assignments/${assignment.id}`,
      });
    }
  }

  await db.auditLog.create({
    data: {
      actorId: session.user.id,
      action: "ASSIGNMENT_PUBLISHED",
      targetType: "Assignment",
      targetId: assignmentId,
      schoolId: session.user.schoolId,
    },
  });

  revalidatePath("/teacher/assignments");
  return { success: true };
}

export async function generateQuestionsAction(params: {
  subject: string;
  topic: string;
  difficulty: Difficulty;
  type: QuestionType;
  count: number;
  subjectId?: string;
  topicId?: string;
  skillId?: string;
}) {
  const session = await requireTeacher();
  const count = Math.min(10, Math.max(1, Math.floor(params.count) || 1));
  const limited = rateLimit(`ai:${session.user.id}`, 30, 60 * 1000);
  if (!limited.ok) return { error: lt.auth.tooManyAttempts };

  const ctx = {
    userId: session.user.id,
    role: session.user.role,
    schoolId: session.user.schoolId,
  };

  if (!(await entitlementService.hasFeature(ctx, "AI_GENERATOR"))) {
    return { error: lt.billing.limitReached };
  }

  const limit = await entitlementService.getLimit(ctx, "AI_QUESTION_GENERATION");
  const consumed = await usageService.consume(
    session.user.id,
    "AI_QUESTION_GENERATION",
    count,
    limit,
    session.user.schoolId
  );
  if (!consumed.ok) return { error: lt.billing.limitReached };

  let generated;
  try {
    generated = await aiProvider.generateQuestion({
      subject: params.subject,
      topic: params.topic,
      difficulty: params.difficulty,
      type: params.type,
      count,
    });
  } catch (error) {
    console.error("Question generation failed:", error);
    return { error: lt.common.unexpectedError };
  }

  const questions = [];
  for (const e of generated) {
    const question = await db.question.create({
      data: {
        type: params.type,
        difficulty: params.difficulty,
        content: e.content,
        explanation: e.explanation,
        correctAnswer: e.correctAnswer as object,
        gradingConfig: e.gradingConfig as object,
        subjectId: params.subjectId,
        topicId: params.topicId,
        skillId: params.skillId,
        createdById: session.user.id,
        schoolId: session.user.schoolId,
        isAIGenerated: true,
        options: e.options
          ? {
              create: e.options.map((o, i) => ({
                content: o.content,
                isCorrect: o.isCorrect,
                orderIndex: i,
              })),
            }
          : undefined,
      },
    });
    questions.push(question);
  }

  await db.aIInteraction.create({
    data: {
      userId: session.user.id,
      type: "AI_GENERATION",
      metadata: { count: params.count, topic: params.topic },
    },
  });

  await db.auditLog.create({
    data: {
      actorId: session.user.id,
      action: "AI_GENERATION",
      targetType: "Question",
      schoolId: session.user.schoolId,
      metadata: { count: params.count },
    },
  });

  revalidatePath("/teacher/questions");
  return { success: true, questions };
}

export async function createTargetedPracticeAction(params: {
  classId: string;
  topicId?: string;
  title?: string;
}) {
  const session = await requireTeacher();

  const where: Record<string, unknown> = {
    isArchived: false,
    schoolId: session.user.schoolId,
  };
  if (params.topicId) where.topicId = params.topicId;

  const questions = await db.question.findMany({ where, take: 10 });
  if (questions.length === 0) return { error: lt.teacher.noQuestionsForTopic };

  const result = await createAssignmentAction({
    title: params.title ?? lt.teacher.targetedPractice,
    type: "PRACTICE",
    classId: params.classId,
    topicId: params.topicId,
    aiAssistance: "FULL_TUTORING",
    questionIds: questions.map((q) => q.id),
  });

  return result;
}

export async function inviteStudentAction(params: {
  email: string;
  classId?: string;
}) {
  const session = await requireTeacher();
  const email = params.email.trim().toLowerCase();
  if (!email.includes("@")) return { error: lt.validation.invalidEmail };
  if (!session.user.schoolId) return { error: lt.teacher.schoolRequired };
  if (!isRequiredEmailOperational()) return { error: lt.auth.emailUnavailable };

  const seats = await entitlementService.canAddStudent({
    userId: session.user.id,
    role: session.user.role,
    schoolId: session.user.schoolId,
  });
  if (!seats.allowed) return { error: seats.reason ?? lt.auth.seatsFull };

  if (params.classId) {
    const klass = await db.class.findFirst({
      where: { id: params.classId, teacherId: session.user.id, schoolId: session.user.schoolId },
    });
    if (!klass) return { error: lt.teacher.classNotFound };
  }

  const invitation = await db.invitation.create({
    data: {
      email,
      role: "STUDENT",
      schoolId: session.user.schoolId,
      classId: params.classId,
      sentById: session.user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  await db.auditLog.create({
    data: {
      actorId: session.user.id,
      action: "STUDENT_INVITED",
      targetType: "Invitation",
      targetId: invitation.id,
      schoolId: session.user.schoolId,
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const inviteUrl = `${appUrl}/register?token=${invitation.token}`;
  const { emailService } = await import("@/services/email/email-service");
  try {
    await emailService.sendInvitation(email, inviteUrl);
  } catch (error) {
    console.error("Invitation email failed:", error);
    await db.invitation.delete({ where: { id: invitation.id } });
    return { error: lt.auth.emailUnavailable };
  }

  return { success: true, inviteUrl: `/register?token=${invitation.token}` };
}

export async function generateClassInsightsAction(classId: string) {
  const session = await requireTeacher();
  const klass = await db.class.findFirst({
    where: {
      id: classId,
      ...(session.user.role === "SUPER_ADMIN"
        ? {}
        : session.user.role === "SCHOOL_ADMIN"
          ? { schoolId: session.user.schoolId ?? "missing-school" }
          : { teacherId: session.user.id }),
    },
    select: { id: true },
  });
  if (!klass) return { error: lt.teacher.classNotFound };
  const insights = await aiInsightsService.generateClassInsights(classId);
  revalidatePath(`/teacher/classes/${classId}`);
  return { success: true, insights };
}

export async function archiveClassAction(classId: string) {
  const session = await requireTeacher();
  await db.class.updateMany({
    where: { id: classId, teacherId: session.user.id },
    data: { status: "ARCHIVED" },
  });
  revalidatePath("/teacher/classes");
  return { success: true };
}

export async function resolveIntegrityFlagAction(formData: FormData) {
  const session = await requireTeacher();
  const flagId = formData.get("flagId") as string;
  const teacherNotes = (formData.get("teacherNotes") as string) || undefined;
  if (!flagId) return { error: lt.common.invalidInput };

  const flag = await db.aIIntegrityFlag.findFirst({
    where: {
      id: flagId,
      submission: { assignment: { createdById: session.user.id } },
    },
  });
  if (!flag) return { error: lt.common.noData };

  const { integrityService } = await import("@/services/integrity/integrity-service");
  await integrityService.resolveFlag({
    flagId,
    reviewerId: session.user.id,
    teacherNotes,
  });

  revalidatePath("/teacher/integrity");
  return { success: true };
}
