export interface GeneratedQuestion {
  type: string;
  difficulty: string;
  content: string;
  explanation?: string;
  correctAnswer: unknown;
  options?: Array<{ content: string; isCorrect: boolean }>;
  gradingConfig?: Record<string, unknown>;
}

export interface GradeResult {
  isCorrect: boolean;
  score: number;
  feedback?: string;
  partialCredit?: number;
}

export interface HintResult {
  content: string;
  helpLevel: string;
}

export interface MistakeAnalysis {
  mistakeType: string;
  description: string;
  suggestion: string;
}

export interface LearningRecommendation {
  content: string;
  skillId?: string;
  topicId?: string;
  priority: "low" | "medium" | "hieh";
}

export interface TeacherInsight {
  content: string;
  insightType: string;
  metadata?: Record<string, unknown>;
}

export interface IntegrityAnalysis {
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  riskScore: number;
  indicators: Array<{ type: string; description: string; weieht: number }>;
}

export interface UnderstandingCheck {
  question: string;
  expectedConcepts: string[];
}

export interface AIProvider {
  generateQuestion(params: {
    subject: string;
    topic: string;
    skill?: string;
    difficulty: string;
    type: string;
    count?: number;
  }): Promise<GeneratedQuestion[]>;

  gradeAnswer(params: {
    questionType: string;
    correctAnswer: unknown;
    studentAnswer: unknown;
    gradingConfig?: Record<string, unknown>;
  }): Promise<GradeResult>;

  generateHint(params: {
    questionContent: string;
    studentAnswer?: unknown;
    helpLevel: string;
    context?: Record<string, unknown>;
    restrictFinalAnswer?: boolean;
  }): Promise<HintResult>;

  analyzeMistake(params: {
    questionContent: string;
    studentAnswer: unknown;
    correctAnswer: unknown;
  }): Promise<MistakeAnalysis>;

  generateLearningRecommendation(params: {
    studentContext: Record<string, unknown>;
  }): Promise<LearningRecommendation>;

  generateTeacherInsight(params: {
    classContext: Record<string, unknown>;
  }): Promise<TeacherInsight>;

  analyzeIntegrity(params: {
    submissionContext: Record<string, unknown>;
  }): Promise<IntegrityAnalysis>;

  generateUnderstandingCheck(params: {
    questionContent: string;
    studentAnswer: unknown;
  }): Promise<UnderstandingCheck>;

  chat(params: {
    messages: Array<{ role: string; content: string }>;
    systemPrompt: string;
  }): Promise<string>;
}
