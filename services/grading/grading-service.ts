import { aiProvider } from "@/services/ai";
import { lt } from "@/lib/i18n";
import { QuestionType } from "@prisma/client";

export interface GradingInput {
  questionType: QuestionType;
  correctAnswer: unknown;
  studentAnswer: unknown;
  gradingConfig?: Record<string, unknown> | null;
}

export interface GradingOutput {
  isCorrect: boolean;
  score: number;
  feedback?: string;
}

function normalizeNumeric(value: unknown): number | null {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = parseFloat(value.replace(/,/g, "."));
    return isNaN(parsed) ? null : parsed;
  }
  if (value && typeof value === "object" && "value" in value) {
    return normalizeNumeric((value as { value: unknown }).value);
  }
  return null;
}

function normalizeMathExpression(expr: string): string {
  return expr
    .replace(/\s+/g, "")
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .toLowerCase();
}

export class GradingService {
  async grade(input: GradingInput): Promise<GradingOutput> {
    const { questionType, correctAnswer, studentAnswer, gradingConfig } = input;

    switch (questionType) {
      case "NUMERIC":
        return this.gradeNumeric(correctAnswer, studentAnswer, gradingConfig);
      case "MATHEMATICAL_EXPRESSION":
      case "FORMULA":
        return this.gradeMathExpression(correctAnswer, studentAnswer, gradingConfig);
      case "TRUE_FALSE":
        return this.gradeTrueFalse(correctAnswer, studentAnswer);
      case "MULTIPLE_CHOICE":
      case "SINGLE_ANSWER":
        return this.gradeChoice(correctAnswer, studentAnswer);
      case "MATCHING":
        return this.gradeMatching(correctAnswer, studentAnswer);
      default:
        return aiProvider.gradeAnswer({
          questionType,
          correctAnswer,
          studentAnswer,
          gradingConfig: gradingConfig ?? undefined,
        });
    }
  }

  private gradeNumeric(
    correctAnswer: unknown,
    studentAnswer: unknown,
    gradingConfig?: Record<string, unknown> | null
  ): GradingOutput {
    const tolerance = (gradingConfig?.tolerance as number) ?? 0.01;
    const correctVal = normalizeNumeric(correctAnswer);
    const studentVal = normalizeNumeric(studentAnswer);

    if (correctVal === null || studentVal === null) {
      return { isCorrect: false, score: 0, feedback: lt.grading.invalidNumeric };
    }

    const isCorrect = Math.abs(correctVal - studentVal) <= tolerance;
    return {
      isCorrect,
      score: isCorrect ? 1 : 0,
      feedback: isCorrect
        ? lt.common.correct
        : lt.grading.expectedValue
            .replace("{value}", String(correctVal))
            .replace("{tolerance}", String(tolerance)),
    };
  }

  private gradeMathExpression(
    correctAnswer: unknown,
    studentAnswer: unknown,
    gradingConfig?: Record<string, unknown> | null
  ): GradingOutput {
    const tolerance = (gradingConfig?.tolerance as number) ?? 0.01;

    const correctStr =
      typeof correctAnswer === "object" && correctAnswer && "expression" in correctAnswer
        ? String((correctAnswer as { expression: string }).expression)
        : String(correctAnswer);
    const studentStr =
      typeof studentAnswer === "object" && studentAnswer && "expression" in studentAnswer
        ? String((studentAnswer as { expression: string }).expression)
        : String(studentAnswer);

    const normalizedCorrect = normalizeMathExpression(correctStr);
    const normalizedStudent = normalizeMathExpression(studentStr);

    if (normalizedCorrect === normalizedStudent) {
      return { isCorrect: true, score: 1, feedback: lt.common.correct };
    }

    const correctVal = normalizeNumeric(correctAnswer);
    const studentVal = normalizeNumeric(studentAnswer);
    if (correctVal !== null && studentVal !== null) {
      const isCorrect = Math.abs(correctVal - studentVal) <= tolerance;
      return { isCorrect, score: isCorrect ? 1 : 0 };
    }

    return { isCorrect: false, score: 0, feedback: lt.grading.expressionMismatch };
  }

  private gradeTrueFalse(correctAnswer: unknown, studentAnswer: unknown): GradingOutput {
    const correct =
      typeof correctAnswer === "object" && correctAnswer && "value" in correctAnswer
        ? (correctAnswer as { value: boolean }).value
        : Boolean(correctAnswer);
    const student =
      typeof studentAnswer === "object" && studentAnswer && "value" in studentAnswer
        ? (studentAnswer as { value: boolean }).value
        : Boolean(studentAnswer);

    const isCorrect = correct === student;
    return { isCorrect, score: isCorrect ? 1 : 0 };
  }

  private gradeChoice(correctAnswer: unknown, studentAnswer: unknown): GradingOutput {
    const correctIds =
      typeof correctAnswer === "object" && correctAnswer && "optionIds" in correctAnswer
        ? (correctAnswer as { optionIds: string[] }).optionIds.sort()
        : [String(correctAnswer)];
    const studentIds =
      typeof studentAnswer === "object" && studentAnswer && "optionIds" in studentAnswer
        ? (studentAnswer as { optionIds: string[] }).optionIds.sort()
        : [String(studentAnswer)];

    const isCorrect = JSON.stringify(correctIds) === JSON.stringify(studentIds);
    return { isCorrect, score: isCorrect ? 1 : 0 };
  }

  private gradeMatching(correctAnswer: unknown, studentAnswer: unknown): GradingOutput {
    const correct = correctAnswer as Record<string, string>;
    const student = studentAnswer as Record<string, string>;
    const keys = Object.keys(correct);
    let matches = 0;
    for (const key of keys) {
      if (correct[key] === student[key]) matches++;
    }
    const score = keys.length > 0 ? matches / keys.length : 0;
    return { isCorrect: score === 1, score };
  }
}

export const gradingService = new GradingService();
