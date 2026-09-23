export function isQuestionVisibleToStudent(
  question: { schoolId: string | null; createdById: string | null },
  studentId: string,
  schoolId: string | null
): boolean {
  if (question.createdById === studentId) return true;
  if (question.schoolId == null) return true;
  return schoolId != null && question.schoolId === schoolId;
}

export function visibleQuestionWhere(studentId: string, schoolId: string | null) {
  return {
    isArchived: false as const,
    OR: [
      { schoolId: null },
      { createdById: studentId },
      ...(schoolId ? [{ schoolId }] : []),
    ],
  };
}

export function toPublicQuestion(question: {
  id: string;
  content: string;
  type: string;
  difficulty: string;
  options?: Array<{ id: string; content: string; isCorrect?: boolean }>;
}) {
  return {
    id: question.id,
    content: question.content,
    type: question.type,
    difficulty: question.difficulty,
    options: (question.options ?? []).map((option) => ({
      id: option.id,
      content: option.content,
    })),
  };
}
