import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

type Tx = Prisma.TransactionClient;

export async function exportAccountData(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      status: true,
      schoolId: true,
      createdAt: true,
      studentProfile: {
        select: { gradeLevel: true, currentStreak: true, totalStudyMinutes: true },
      },
      teacherProfile: { select: { bio: true, department: true, title: true } },
    },
  });
  if (!user) return null;

  const [submissions, attempts, notifications, conversations, usage] = await Promise.all([
    db.assignmentSubmission.findMany({
      where: { studentId: userId },
      select: {
        id: true,
        assignmentId: true,
        status: true,
        score: true,
        maxScore: true,
        submittedAt: true,
      },
    }),
    db.questionAttempt.findMany({
      where: { studentId: userId },
      select: {
        questionId: true,
        isCorrect: true,
        score: true,
        timeSpentSeconds: true,
        createdAt: true,
      },
    }),
    db.notification.findMany({
      where: { userId },
      select: { type: true, title: true, message: true, createdAt: true, isRead: true },
    }),
    db.aIConversation.findMany({
      where: { studentId: userId },
      select: {
        id: true,
        contextType: true,
        createdAt: true,
        messages: { select: { role: true, content: true, createdAt: true } },
      },
    }),
    db.usageRecord.findMany({
      where: { userId },
      select: { metric: true, quantity: true, periodStart: true },
    }),
  ]);

  return {
    exportedAt: new Date().toISOString(),
    user,
    submissions,
    attempts,
    notifications,
    conversations,
    usage,
  };
}

async function deletePersonalGraph(tx: Tx, userId: string) {
  const conversations = await tx.aIConversation.findMany({
    where: { studentId: userId },
    select: { id: true },
  });
  const conversationIds = conversations.map((item) => item.id);
  if (conversationIds.length) {
    await tx.aIConversationMessage.deleteMany({ where: { conversationId: { in: conversationIds } } });
  }
  await tx.aIIntegrityFlag.deleteMany({
    where: { OR: [{ studentId: userId }, { reviewedById: userId }] },
  });
  await tx.integrityEvent.deleteMany({ where: { studentId: userId } });
  await tx.mistake.deleteMany({ where: { studentId: userId } });
  await tx.questionAttempt.deleteMany({ where: { studentId: userId } });
  await tx.assignmentSubmission.deleteMany({ where: { studentId: userId } });
  await tx.learningProfile.deleteMany({ where: { studentId: userId } });
  await tx.learningEvent.deleteMany({ where: { studentId: userId } });
  await tx.aIInteraction.deleteMany({ where: { userId } });
  await tx.aIConversation.deleteMany({ where: { studentId: userId } });
  await tx.notification.deleteMany({ where: { userId } });
  await tx.verificationToken.deleteMany({ where: { userId } });
  await tx.passwordResetToken.deleteMany({ where: { userId } });
  await tx.usageRecord.deleteMany({ where: { userId } });
  await tx.licenseKeyRedemption.deleteMany({ where: { userId } });
  await tx.subscription.deleteMany({ where: { userId } });
  await tx.classMember.deleteMany({ where: { userId } });
  await tx.session.deleteMany({ where: { userId } });
  await tx.account.deleteMany({ where: { userId } });
}

async function pseudonymize(userId: string) {
  await db.$transaction(async (tx) => {
    await tx.verificationToken.deleteMany({ where: { userId } });
    await tx.passwordResetToken.deleteMany({ where: { userId } });
    await tx.session.deleteMany({ where: { userId } });
    await tx.account.deleteMany({ where: { userId } });
    await tx.notification.deleteMany({ where: { userId } });
    await tx.user.update({
      where: { id: userId },
      data: {
        email: `deleted-${userId}@invalid.local`,
        passwordHash: null,
        firstName: "Ištrinta",
        lastName: "paskyra",
        status: "INACTIVE",
        authVersion: { increment: 1 },
        emailVerified: null,
        avatarUrl: null,
      },
    });
  });
}

async function hardDeleteStudent(userId: string) {
  await db.$transaction(async (tx) => {
    const assignments = await tx.assignment.findMany({
      where: { createdById: userId },
      select: { id: true },
    });
    const assignmentIds = assignments.map((item) => item.id);
    if (assignmentIds.length) {
      const submissions = await tx.assignmentSubmission.findMany({
        where: { assignmentId: { in: assignmentIds } },
        select: { id: true },
      });
      const submissionIds = submissions.map((item) => item.id);
      if (submissionIds.length) {
        await tx.integrityEvent.deleteMany({ where: { submissionId: { in: submissionIds } } });
        await tx.aIIntegrityFlag.deleteMany({ where: { submissionId: { in: submissionIds } } });
        await tx.questionAttempt.deleteMany({ where: { submissionId: { in: submissionIds } } });
        await tx.assignmentSubmission.deleteMany({ where: { id: { in: submissionIds } } });
      }
      await tx.assignmentQuestion.deleteMany({ where: { assignmentId: { in: assignmentIds } } });
      await tx.assignment.deleteMany({ where: { id: { in: assignmentIds } } });
    }

    await deletePersonalGraph(tx, userId);
    await tx.invitation.updateMany({
      where: { acceptedById: userId },
      data: { acceptedById: null },
    });
    await tx.auditLog.deleteMany({ where: { actorId: userId } });
    await tx.studentProfile.deleteMany({ where: { userId } });
    await tx.teacherProfile.deleteMany({ where: { userId } });
    await tx.user.delete({ where: { id: userId } });
  });
}

export async function eraseAccount(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (!user) return;
  if (user.role !== "STUDENT") {
    await pseudonymize(userId);
    return;
  }
  try {
    await hardDeleteStudent(userId);
  } catch (error) {
    console.error("Hard delete failed, pseudonymizing account:", error);
    await pseudonymize(userId);
  }
}
