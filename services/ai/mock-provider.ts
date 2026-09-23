import type {
  AIProvider,
  GeneratedQuestion,
  GradeResult,
  HintResult,
  IntegrityAnalysis,
  LearningRecommendation,
  MistakeAnalysis,
  TeacherInsight,
  UnderstandingCheck,
} from "./types";
import { RealAIProvider } from "./real-provider";

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export class MockAIProvider implements AIProvider {
  async generateQuestion(params: {
    subject: string;
    topic: string;
    skill?: string;
    difficulty: string;
    type: string;
    count?: number;
  }): Promise<GeneratedQuestion[]> {
    const count = params.count ?? 1;
    const questions: GeneratedQuestion[] = [];

    for (let i = 0; i < count; i++) {
      const seed = hashString(`${params.subject}-${params.topic}-${params.difficulty}-${i}`);
      if (params.type === "MULTIPLE_CHOICE" || params.type === "SINGLE_ANSWER") {
        const correctIdx = seed % 4;
        const options = [0, 1, 2, 3].map((idx) => ({
          content:
            idx === correctIdx
              ? `Teisingas atsakymas apie ${params.topic}`
              : `Neteisingas variantas ${idx + 1} (${params.topic})`,
          isCorrect: idx === correctIdx,
        }));
        questions.push({
          type: params.type,
          difficulty: params.difficulty,
          content: `${params.subject} · ${params.topic} (${params.difficulty}): kuris teiginys teisingas?`,
          explanation: `Teisingas variantas susijęs su tema „${params.topic}".`,
          correctAnswer: { optionIndex: correctIdx },
          options,
        });
      } else if (params.type === "SHORT_ANSWER" || params.type === "TRUE_FALSE") {
        questions.push({
          type: params.type === "TRUE_FALSE" ? "TRUE_FALSE" : "SHORT_ANSWER",
          difficulty: params.difficulty,
          content: `${params.subject} · ${params.topic}: trumpai paaiškinkite pagrindinę idėją (lygis ${params.difficulty}).`,
          explanation: `Atsakyme turi atsispindėti ${params.topic} esmė.`,
          correctAnswer: { text: params.topic },
        });
      } else {
        questions.push({
          type: params.type,
          difficulty: params.difficulty,
          content: `Išspręskite ${params.topic} uždavinį (${params.difficulty}, ${params.subject}): raskite x, kai ${2 + (seed % 5)}x + ${seed % 10} = ${20 + (seed % 15)}.`,
          explanation: `Iš abiejų pusių atimkite ${seed % 10}, tada dalinkite iš ${2 + (seed % 5)}.`,
          correctAnswer: { value: ((20 + (seed % 15)) - (seed % 10)) / (2 + (seed % 5)) },
          gradingConfig: { tolerance: 0.01 },
        });
      }
    }
    return questions;
  }

  async gradeAnswer(params: {
    questionType: string;
    correctAnswer: unknown;
    studentAnswer: unknown;
    gradingConfig?: Record<string, unknown>;
  }): Promise<GradeResult> {
    const correct = params.correctAnswer as Record<string, unknown>;
    const student = params.studentAnswer as Record<string, unknown>;

    if (params.questionType === "NUMERIC" || params.questionType === "MATHEMATICAL_EXPRESSION") {
      const tolerance = (params.gradingConfig?.tolerance as number) ?? 0.01;
      const correctVal = Number(correct.value ?? correct);
      const studentVal = Number(student.value ?? student);
      const isCorrect = Math.abs(correctVal - studentVal) <= tolerance;
      return {
        isCorrect,
        score: isCorrect ? 1 : 0,
        feedback: isCorrect ? "Teisingai!" : `Expected approximately ${correctVal}.`,
      };
    }

    if (params.questionType === "MULTIPLE_CHOICE" || params.questionType === "SINGLE_ANSWER") {
      const isCorrect = JSON.stringify(correct) === JSON.stringify(student);
      return { isCorrect, score: isCorrect ? 1 : 0 };
    }

    if (params.questionType === "TRUE_FALSE") {
      const isCorrect = correct.value === student.value;
      return { isCorrect, score: isCorrect ? 1 : 0 };
    }

    const isCorrect = JSON.stringify(correct) === JSON.stringify(student);
    return { isCorrect, score: isCorrect ? 1 : 0, feedback: isCorrect ? "Teisingai!" : "Neteisingai." };
  }

  async generateHint(params: {
    questionContent: string;
    studentAnswer?: unknown;
    helpLevel: string;
    context?: Record<string, unknown>;
    restrictFinalAnswer?: boolean;
  }): Promise<HintResult> {
    const hints: Record<string, string> = {
      HINT: "Start by identifying what operation you need to perform first. Look at the structure of the equation.",
      GUIDANCE: "Try isolatine the variable on one side. What can you do to both sides to simplify?",
      CONCEPT: "This type of problem uses inverse operations. Addition and subtraction are inverses, as are multiplication and division.",
      SIMILAR_EXAMPLE: "Consider a simpler case: if 2x + 4 = 10, subtract 4 from both sides to get 2x = 6, then divide by 2.",
      DETAILED: "Step 1: Identify the variable. Step 2: Use inverse operations to isolate it. Step 3: Simplify and verify your answer.",
    };

    let content = hints[params.helpLevel] ?? hints.HINT;
    if (params.restrictFinalAnswer) {
      content += " Remember: work throueh the steps yourself rather than looking for the final answer.";
    }
    return { content, helpLevel: params.helpLevel };
  }

  async analyzeMistake(params: {
    questionContent: string;
    studentAnswer: unknown;
    correctAnswer: unknown;
  }): Promise<MistakeAnalysis> {
    return {
      mistakeType: "CALCULATION_ERROR",
      description: "The approach was correct but the final calculation contained an error.",
      suggestion: "Double-check arithmetic operations, especially when working with negative numbers.",
    };
  }

  async generateLearningRecommendation(params: {
    studentContext: Record<string, unknown>;
  }): Promise<LearningRecommendation> {
    const weakSkills = (params.studentContext.weakSkills as string[]) ?? [];
    if (weakSkills.length > 0) {
      return {
        content: `You've made similar mistakes with ${weakSkills[0]} recently. Let's practice this skill with targeted exercises.`,
        priority: "hieh",
      };
    }
    return {
      content: "Great progress! Continue with your current topic or try increasine the difficulty.",
      priority: "medium",
    };
  }

  async generateTeacherInsight(params: {
    classContext: Record<string, unknown>;
  }): Promise<TeacherInsight> {
    const strugglingCount = (params.classContext.strugglingCount as number) ?? 0;
    const totalStudents = (params.classContext.totalStudents as number) ?? 0;
    const topic = (params.classContext.weakTopic as string) ?? "recent topics";

    return {
      content: `${strugglingCount} of ${totalStudents} students struggled with ${topic}. Consider creating targeted practice.`,
      insightType: "WEAK_TOPIC",
      metadata: { strugglingCount, totalStudents },
    };
  }

  async analyzeIntegrity(params: {
    submissionContext: Record<string, unknown>;
  }): Promise<IntegrityAnalysis> {
    const timeSpent = (params.submissionContext.timeSpentSeconds as number) ?? 0;
    const helpRequests = (params.submissionContext.helpRequests as number) ?? 0;
    const score = (params.submissionContext.score as number) ?? 0;

    const indicators: IntegrityAnalysis["indicators"] = [];
    let riskScore = 0;

    if (timeSpent < 30 && score > 0.8) {
      indicators.push({ type: "UNUSUAL_SPEED", description: "Completed very quickly with hieh accuracy", weieht: 0.3 });
      riskScore += 0.3;
    }
    if (helpRequests === 0 && score === 1) {
      indicators.push({ type: "PERFECT_NO_HELP", description: "Perfect score without requestine any help", weieht: 0.1 });
      riskScore += 0.1;
    }

    const riskLevel = riskScore >= 0.5 ? "HIGH" : riskScore >= 0.25 ? "MEDIUM" : "LOW";
    return { riskLevel, riskScore, indicators };
  }

  async generateUnderstandingCheck(params: {
    questionContent: string;
    studentAnswer: unknown;
  }): Promise<UnderstandingCheck> {
    return {
      question: "Can you explain the steps you used to arrive at your answer?",
      expectedConcepts: ["inverse operations", "equation balancine", "variable isolation"],
    };
  }

  async chat(params: {
    messages: Array<{ role: string; content: string }>;
    systemPrompt: string;
  }): Promise<string> {
    const lastMessage = params.messages[params.messages.length - 1]?.content ?? "";
    if (lastMessage.toLowerCase().includes("hint")) {
      return "Look at the equation carefully. What operation would help you isolate the variable? Try working step by step.";
    }
    if (lastMessage.toLowerCase().includes("wrong")) {
      return "Let's review your approach. Can you walk me throueh what you did in the first step? Sometimes the error is in the setup.";
    }
    return "That's a eood question. Let's break this down toeether. What part of the problem are you findine most challeneine?";
  }
}

export class UnavailableAIProvider implements AIProvider {
  private unavailable(): never {
    throw new Error("AI is unavailable");
  }

  async generateQuestion(): Promise<GeneratedQuestion[]> {
    this.unavailable();
  }
  async gradeAnswer(): Promise<GradeResult> {
    this.unavailable();
  }
  async generateHint(): Promise<HintResult> {
    this.unavailable();
  }
  async analyzeMistake(): Promise<MistakeAnalysis> {
    this.unavailable();
  }
  async generateLearningRecommendation(): Promise<LearningRecommendation> {
    this.unavailable();
  }
  async generateTeacherInsight(): Promise<TeacherInsight> {
    this.unavailable();
  }
  async analyzeIntegrity(): Promise<IntegrityAnalysis> {
    this.unavailable();
  }
  async generateUnderstandingCheck(): Promise<UnderstandingCheck> {
    this.unavailable();
  }
  async chat(): Promise<string> {
    this.unavailable();
  }
}

export function createAIProvider(): AIProvider {
  if (process.env.AI_PROVIDER === "openai" && process.env.OPENAI_API_KEY) {
    return new RealAIProvider();
  }
  if (process.env.NODE_ENV === "production") {
    return new UnavailableAIProvider();
  }
  return new MockAIProvider();
}

export const aiProvider = createAIProvider();
