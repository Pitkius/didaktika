"use server";

import { requireStudent } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { gradingService } from "@/services/grading/grading-service";
import { adaptiveLearningService } from "@/services/learning/adaptive-learning-service";
import { aiProvider } from "@/services/ai";
import { entitlementService } from "@/services/entitlements/entitlement-service";
import { usageService } from "@/services/usage/usage-service";
import { AIAssistanceLevel, AIHelpLevel, IntegrityEventType, type Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { lt, tStatus } from "@/lib/i18n";

const INTEGRITY_EVENT_TYPES = new Set<IntegrityEventType>([
  "TAB_HIDDEN",
  "WINDOW_BLUR",
  "PASTE",
  "COPY",
  "FOCUS_RETURN",
  "CONTEXT_MENU",
]);

export async function submitAnswerAction(params: {
  questionId: string;
  answer: unknown;
  solutionSteps?: unknown;
  timeSpentSeconds: number;
  submissionId?: string;
}) {
  const session = await requireStudent();
  const studentId = session.user.id;

  const question = await db.question.findUnique({
    where: { id: params.questionId },
    include: { skill: true },
  });
  if (!question) return { error: lt.student.questionNotFound };

  const gradeResult = await gradingService.grade({
    questionType: question.type,
    correctAnswer: question.correctAnswer,
    studentAnswer: params.answer,
    gradingConfig: question.gradingConfig as Record<string, unknown> | null,
  });

  const attempt = await db.questionAttempt.create({
    data: {
      questionId: params.questionId,
      studentId,
      submissionId: params.submissionId,
      answer: params.answer as object,
      solutionSteps: params.solutionSteps as object | undefined,
      isCorrect: gradeResult.isCorrect,
      score: gradeResult.score,
      timeSpentSeconds: params.timeSpentSeconds,
      feedback: gradeResult.feedback,
    },
  });

  if (question.skillId) {
    await adaptiveLearningService.updateLearningProfile({
      studentId,
      skillId: question.skillId,
      isCorrect: gradeResult.isCorrect,
      timeSpentSeconds: params.timeSpentSeconds,
    });
  }

  if (!gradeResult.isCorrect && question.skillId) {
    const analysis = await aiProvider.analyzeMistake({
      questionContent: question.content,
      studentAnswer: params.answer,
      correctAnswer: question.correctAnswer,
    });
    await db.mistake.create({
      data: {
        studentId,
        skillId: question.skillId,
        attemptId: attempt.id,
        mistakeType: analysis.mistakeType,
        description: analysis.description,
        studentAnswer: params.answer as object,
        correctAnswer: question.correctAnswer as object,
      },
    });
  }

  await db.learningEvent.create({
    data: {
      studentId,
      eventType: "QUESTION_ATTEMPTED",
      skillId: question.skillId,
      subjectId: question.subjectId,
      durationSeconds: params.timeSpentSeconds,
      metadata: { isCorrect: gradeResult.isCorrect, questionId: question.id },
    },
  });

  revalidatePath("/student");
  return { success: true, ...gradeResult, attemptId: attempt.id };
}

export async function requestAIHelpAction(params: {
  questionId: string;
  helpLevel: AIHelpLevel;
  conversationId?: string;
  assignmentId?: string;
}) {
  const session = await requireStudent();
  const studentId = session.user.id;

  const entitlement = await entitlementService.canUseAI({
    userId: studentId,
    role: "STUDENT",
    schoolId: session.user.schoolId,
  });
  if (!entitlement.allowed) {
    return {
      error: entitlement.reason ?? lt.billing.limitReached,
      upgradeRequired: true,
      plan: entitlement.plan,
    };
  }

  // Block AI teacher while a secure assessment is in progress
  if (!params.assignmentId) {
    const activeSecure = await db.assignmentSubmission.findFirst({
      where: {
        studentId,
        status: "IN_PROGRESS",
        assignment: { integrityMonitoring: true },
      },
      select: { id: true },
    });
    if (activeSecure) {
      return { error: lt.student.aiBlockedDuringSecure };
    }
  }

  const question = await db.question.findUnique({ where: { id: params.questionId } });
  if (!question) return { error: lt.student.questionNotFound };

  let restrictFinalAnswer = false;
  let aiAssistance: AIAssistanceLevel = "GUIDANCE";

  if (params.assignmentId) {
    const assignment = await db.assignment.findUnique({
      where: { id: params.assignmentId },
    });
    if (assignment) {
      aiAssistance = assignment.aiAssistance;
      if (aiAssistance === "OFF") {
        return { error: lt.student.aiDisabled };
      }
      if (assignment.type === "EXAM" || assignment.type === "TEST") {
        restrictFinalAnswer = aiAssistance !== "FULL_TUTORING";
      }
      if (aiAssistance === "HINTS_ONLY" && params.helpLevel !== "HINT") {
        return { error: lt.student.hintsOnly };
      }
    }
  }

  const hint = await aiProvider.generateHint({
    questionContent: question.content,
    helpLevel: params.helpLevel,
    restrictFinalAnswer,
    context: { skillId: question.skillId, topicId: question.topicId },
  });

  await usageService.increment(studentId, "AI_TEACHER_MESSAGES", 1, session.user.schoolId);

  let conversation = params.conversationId
    ? await db.aIConversation.findUnique({ where: { id: params.conversationId } })
    : null;

  if (!conversation) {
    conversation = await db.aIConversation.create({
      data: {
        studentId,
        contextType: params.assignmentId ? "ASSIGNMENT" : "LEARNING",
        questionId: params.questionId,
        assignmentId: params.assignmentId,
      },
    });
  }

  await db.aIConversationMessage.createMany({
    data: [
      {
        conversationId: conversation.id,
        role: "user",
        content: lt.student.requestingHelp.replace("{level}", tStatus(params.helpLevel)),
        helpLevel: params.helpLevel,
      },
      {
        conversationId: conversation.id,
        role: "assistant",
        content: hint.content,
        helpLevel: params.helpLevel,
      },
    ],
  });

  await db.aIInteraction.create({
    data: {
      userId: studentId,
      type: "AI_HELP",
      metadata: { helpLevel: params.helpLevel, questionId: params.questionId },
    },
  });

  if (question.skillId) {
    const profile = await db.learningProfile.findUnique({
      where: { studentId_skillId: { studentId, skillId: question.skillId } },
    });
    if (profile) {
      await db.learningProfile.update({
        where: { id: profile.id },
        data: { helpRequests: { increment: 1 } },
      });
    }
  }

  return { success: true, content: hint.content, conversationId: conversation.id };
}

export async function startLearningSessionAction(subjectId?: string) {
  const session = await requireStudent();
  const question = await adaptiveLearningService.selectNextQuestion(
    session.user.id,
    subjectId
  );
  if (!question) return { error: lt.student.noQuestions };
  return { success: true, question };
}

export async function chatWithAIAction(params: {
  message: string;
  conversationId: string;
  assignmentId?: string;
}) {
  const session = await requireStudent();

  const entitlement = await entitlementService.canUseAI({
    userId: session.user.id,
    role: "STUDENT",
    schoolId: session.user.schoolId,
  });
  if (!entitlement.allowed) {
    return {
      error: entitlement.reason ?? lt.billing.limitReached,
      upgradeRequired: true,
      plan: entitlement.plan,
    };
  }

  if (params.assignmentId) {
    const assignment = await db.assignment.findUnique({
      where: { id: params.assignmentId },
    });
    if (assignment?.aiAssistance === "OFF") {
      return { error: lt.student.aiDisabled };
    }
  }

  const conversation = await db.aIConversation.findFirst({
    where: { id: params.conversationId, studentId: session.user.id },
    include: { messages: { orderBy: { createdAt: "asc" }, take: 20 } },
  });
  if (!conversation) return { error: lt.student.conversationNotFound };

  const systemPrompt = `You are a patient, Socratic tutor. Guide the student step by step. Do not give final answers directly for homework or test questions. Ask guiding questions.`;

  const messages = [
    ...conversation.messages.map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: params.message },
  ];

  const response = await aiProvider.chat({ messages, systemPrompt });

  await usageService.increment(
    session.user.id,
    "AI_TEACHER_MESSAGES",
    1,
    session.user.schoolId
  );

  await db.aIConversationMessage.createMany({
    data: [
      { conversationId: conversation.id, role: "user", content: params.message },
      { conversationId: conversation.id, role: "assistant", content: response },
    ],
  });

  await db.aIInteraction.create({
    data: { userId: session.user.id, type: "AI_CHAT" },
  });

  return { success: true, content: response };
}

export async function markNotificationReadAction(notificationId: string) {
  const session = await requireStudent();
  await db.notification.updateMany({
    where: { id: notificationId, userId: session.user.id },
    data: { isRead: true },
  });
  revalidatePath("/student/notifications");
  return { success: true };
}

export async function markAllNotificationsReadAction() {
  const session = await requireStudent();
  await db.notification.updateMany({
    where: { userId: session.user.id, isRead: false },
    data: { isRead: true },
  });
  revalidatePath("/student/notifications");
  return { success: true };
}

export async function startAITeacherConversationAction() {
  const session = await requireStudent();
  const conversation = await db.aIConversation.create({
    data: {
      studentId: session.user.id,
      contextType: "LEARNING",
    },
  });
  return { success: true, conversationId: conversation.id };
}

export async function updateStudentSettingsAction(formData: FormData) {
  const session = await requireStudent();
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const gradeLevel = formData.get("gradeLevel") as string;

  if (!firstName || !lastName) {
    return { error: lt.student.nameRequired };
  }

  await db.user.update({
    where: { id: session.user.id },
    data: { firstName, lastName },
  });

  if (gradeLevel) {
    const nextGrade = parseInt(gradeLevel, 10);
    const existing = await db.studentProfile.findUnique({
      where: { userId: session.user.id },
      select: { selfStudySelections: true, gradeLevel: true },
    });
    const { filterSelectionsForGrade } = await import("@/config/curriculum");
    const raw = Array.isArray(existing?.selfStudySelections)
      ? (existing!.selfStudySelections as { subjectKey: string; topicKeys: string[] }[])
      : [];
    const filtered = filterSelectionsForGrade(raw, nextGrade);

    await db.studentProfile.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        gradeLevel: nextGrade,
        selfStudySelections: filtered,
      },
      update: {
        gradeLevel: nextGrade,
        selfStudySelections: filtered,
      },
    });
  }

  revalidatePath("/student/settings");
  revalidatePath("/student/profile");
  revalidatePath("/student/assignments");
  return { success: true };
}

async function assertStudentCanAccessAssignment(studentId: string, assignmentId: string) {
  const assignment = await db.assignment.findUnique({
    where: { id: assignmentId },
    include: {
      questions: {
        include: { question: { include: { options: { orderBy: { orderIndex: "asc" } } } } },
        orderBy: { orderIndex: "asc" },
      },
      class: { include: { members: { where: { userId: studentId } } } },
    },
  });
  if (!assignment || assignment.status !== "PUBLISHED") return null;
  if (assignment.classId) {
    if (assignment.class?.members.length === 0) return null;
  } else if (assignment.createdById !== studentId) {
    return null;
  }
  return assignment;
}

export async function startOrResumeSubmissionAction(assignmentId: string) {
  const session = await requireStudent();
  const assignment = await assertStudentCanAccessAssignment(session.user.id, assignmentId);
  if (!assignment) return { error: lt.teacher.assignmentNotFound };

  const existing = await db.assignmentSubmission.findUnique({
    where: {
      assignmentId_studentId: {
        assignmentId,
        studentId: session.user.id,
      },
    },
    include: { attempts: true },
  });

  if (existing && (existing.status === "SUBMITTED" || existing.status === "GRADED")) {
    return {
      success: true,
      submissionId: existing.id,
      status: existing.status,
      score: existing.score,
      maxScore: existing.maxScore,
      readOnly: true,
      answeredQuestionIds: existing.attempts.map((a) => a.questionId),
    };
  }

  const submission =
    existing ??
    (await db.assignmentSubmission.create({
      data: {
        assignmentId,
        studentId: session.user.id,
        status: "IN_PROGRESS",
        maxScore: assignment.questions.reduce((sum, q) => sum + q.points, 0),
      },
      include: { attempts: true },
    }));

  return {
    success: true,
    submissionId: submission.id,
    status: submission.status,
    readOnly: false,
    answeredQuestionIds: submission.attempts.map((a) => a.questionId),
    aiAssistance: assignment.aiAssistance,
    integrityMonitoring: assignment.integrityMonitoring,
    showResultsImmediately: assignment.showResultsImmediately,
    timeLimitMinutes: assignment.timeLimitMinutes,
  };
}

export async function logIntegrityEventAction(params: {
  submissionId: string;
  type: string;
  metadata?: Record<string, unknown>;
}) {
  const session = await requireStudent();
  if (!INTEGRITY_EVENT_TYPES.has(params.type as IntegrityEventType)) {
    return { error: "Invalid event" };
  }

  const submission = await db.assignmentSubmission.findFirst({
    where: {
      id: params.submissionId,
      studentId: session.user.id,
      status: "IN_PROGRESS",
    },
    include: { assignment: { select: { integrityMonitoring: true } } },
  });
  if (!submission) return { error: lt.student.submissionClosed };
  if (!submission.assignment.integrityMonitoring) {
    return { success: true, skipped: true };
  }

  // Rate-limit noisy focus events
  if (params.type === "FOCUS_RETURN" || params.type === "WINDOW_BLUR") {
    const recent = await db.integrityEvent.count({
      where: {
        submissionId: submission.id,
        type: params.type as IntegrityEventType,
        createdAt: { gte: new Date(Date.now() - 3000) },
      },
    });
    if (recent > 0) return { success: true, deduped: true };
  }

  const { integrityService } = await import("@/services/integrity/integrity-service");
  await integrityService.logEvent({
    submissionId: submission.id,
    studentId: session.user.id,
    type: params.type as IntegrityEventType,
    metadata: params.metadata as Prisma.InputJsonValue | undefined,
  });

  return { success: true };
}

export async function submitAssignmentAnswerAction(params: {
  assignmentId: string;
  submissionId: string;
  questionId: string;
  answer: unknown;
  timeSpentSeconds: number;
}) {
  const session = await requireStudent();
  const assignment = await assertStudentCanAccessAssignment(session.user.id, params.assignmentId);
  if (!assignment) return { error: lt.teacher.assignmentNotFound };

  const submission = await db.assignmentSubmission.findFirst({
    where: {
      id: params.submissionId,
      studentId: session.user.id,
      assignmentId: params.assignmentId,
      status: "IN_PROGRESS",
    },
  });
  if (!submission) return { error: lt.student.submissionClosed };

  const aq = assignment.questions.find((q) => q.questionId === params.questionId);
  if (!aq) return { error: lt.student.questionNotFound };

  const existingAttempt = await db.questionAttempt.findFirst({
    where: {
      submissionId: submission.id,
      questionId: params.questionId,
      studentId: session.user.id,
    },
  });
  if (existingAttempt) {
    return {
      success: true,
      alreadyAnswered: true,
      isCorrect: existingAttempt.isCorrect,
      feedback: existingAttempt.feedback,
      score: existingAttempt.score,
    };
  }

  const gradeResult = await gradingService.grade({
    questionType: aq.question.type,
    correctAnswer: aq.question.correctAnswer,
    studentAnswer: params.answer,
    gradingConfig: aq.question.gradingConfig as Record<string, unknown> | null,
  });

  const pointsEarned = gradeResult.isCorrect ? aq.points : gradeResult.score * aq.points;

  let feedback = gradeResult.feedback;
  if (!gradeResult.isCorrect && assignment.showResultsImmediately) {
    try {
      const analysis = await aiProvider.analyzeMistake({
        questionContent: aq.question.content,
        studentAnswer: params.answer,
        correctAnswer: aq.question.correctAnswer,
      });
      feedback = [feedback, analysis.description, analysis.suggestion]
        .filter(Boolean)
        .join(" ");
      await usageService.increment(
        session.user.id,
        "AI_ANALYSIS",
        1,
        session.user.schoolId
      );
    } catch {
      if (aq.question.explanation) {
        feedback = feedback
          ? `${feedback} ${aq.question.explanation}`
          : aq.question.explanation;
      }
    }
  }

  await db.questionAttempt.create({
    data: {
      questionId: params.questionId,
      studentId: session.user.id,
      submissionId: submission.id,
      answer: params.answer as object,
      isCorrect: gradeResult.isCorrect,
      score: pointsEarned,
      timeSpentSeconds: params.timeSpentSeconds,
      feedback: assignment.showResultsImmediately ? feedback : null,
    },
  });

  if (aq.question.skillId) {
    await adaptiveLearningService.updateLearningProfile({
      studentId: session.user.id,
      skillId: aq.question.skillId,
      isCorrect: gradeResult.isCorrect,
      timeSpentSeconds: params.timeSpentSeconds,
    });
  }

  await db.assignmentSubmission.update({
    where: { id: submission.id },
    data: { timeSpentSeconds: { increment: params.timeSpentSeconds } },
  });

  const showResults = assignment.showResultsImmediately;

  return {
    success: true,
    isCorrect: showResults ? gradeResult.isCorrect : null,
    feedback: showResults ? feedback : lt.student.answerSavedSecure,
    explanation: showResults ? aq.question.explanation : undefined,
    score: showResults ? pointsEarned : undefined,
    points: aq.points,
    showResultsImmediately: showResults,
  };
}

export async function finalizeSubmissionAction(params: {
  assignmentId: string;
  submissionId: string;
}) {
  const session = await requireStudent();
  const submission = await db.assignmentSubmission.findFirst({
    where: {
      id: params.submissionId,
      studentId: session.user.id,
      assignmentId: params.assignmentId,
      status: "IN_PROGRESS",
    },
    include: {
      attempts: true,
      assignment: { include: { questions: true, createdBy: true } },
    },
  });
  if (!submission) return { error: lt.student.submissionClosed };

  const maxScore =
    submission.maxScore ??
    submission.assignment.questions.reduce((sum, q) => sum + q.points, 0);
  const score = submission.attempts.reduce((sum, a) => sum + (a.score ?? 0), 0);

  await db.assignmentSubmission.update({
    where: { id: submission.id },
    data: {
      status: "SUBMITTED",
      submittedAt: new Date(),
      score,
      maxScore,
    },
  });

  try {
    const shouldAnalyze =
      submission.assignment.integrityMonitoring ||
      submission.assignment.type === "TEST" ||
      submission.assignment.type === "EXAM";

    if (shouldAnalyze) {
      const { integrityService } = await import("@/services/integrity/integrity-service");
      await integrityService.analyzeSubmission(submission.id);
    } else {
      const { entitlementService } = await import(
        "@/services/entitlements/entitlement-service"
      );
      const integrityAccess = await entitlementService.canUseIntegrity({
        userId: submission.assignment.createdById,
        role: "TEACHER",
        schoolId: session.user.schoolId,
      });
      if (integrityAccess.allowed) {
        const { integrityService } = await import("@/services/integrity/integrity-service");
        await integrityService.analyzeSubmission(submission.id);
      }
    }
  } catch (err) {
    console.error("Integrity analysis failed:", err);
  }

  if (submission.assignment.createdById && submission.assignment.createdById !== session.user.id) {
    await db.notification.create({
      data: {
        userId: submission.assignment.createdById,
        type: "CLASS_ANNOUNCEMENT",
        title: "Naujas pateikimas",
        message: `${session.user.firstName} ${session.user.lastName} pateikė „${submission.assignment.title}"`,
        link: `/teacher/assignments/${submission.assignmentId}`,
      },
    }).catch(() => undefined);
  }

  revalidatePath(`/student/assignments/${params.assignmentId}`);
  revalidatePath("/student/assignments");
  return { success: true, score, maxScore };
}

export async function saveSelfStudySelectionsAction(selections: {
  subjectKey: string;
  topicKeys: string[];
}[]) {
  const session = await requireStudent();
  const { saveSelfStudySelections } = await import(
    "@/services/learning/self-study-service"
  );
  const result = await saveSelfStudySelections({
    userId: session.user.id,
    schoolId: session.user.schoolId,
    selections,
  });
  if (result.error) return { error: result.error };
  revalidatePath("/student/assignments");
  revalidatePath("/student/learn");
  revalidatePath("/student/subjects");
  return { success: true };
}

export async function startSelfStudyPracticeAction(params: {
  subjectKey: string;
  topicKey: string;
}) {
  const session = await requireStudent();
  const { startSelfStudyPractice } = await import(
    "@/services/learning/self-study-service"
  );
  const result = await startSelfStudyPractice({
    userId: session.user.id,
    schoolId: session.user.schoolId,
    subjectKey: params.subjectKey,
    topicKey: params.topicKey,
  });
  if (result.error) return { error: result.error };
  revalidatePath("/student/assignments");
  return { success: true, assignmentId: result.assignmentId };
}
