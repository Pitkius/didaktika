import type {
  AIProvider,
  GeneratedQuestion,
  GradeResult,
  IntegrityAnalysis,
  LearningRecommendation,
  MistakeAnalysis,
  TeacherInsight,
  UnderstandingCheck,
} from "./types";

export class RealAIProvider implements AIProvider {
  private apiKey: string;
  private model: string;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY ?? "";
    this.model = process.env.AI_MODEL ?? "gpt-4o-mini";
    if (!this.apiKey) {
      throw new Error("OPENAI_API_KEY is required for RealAIProvider");
    }
  }

  private async callAPI(systemPrompt: string, userPrompt: string): Promise<string> {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content ?? "";
  }

  private parseJson<T>(raw: string, label: string): T {
    try {
      return JSON.parse(raw) as T;
    } catch {
      throw new Error(`Failed to parse AI ${label}`);
    }
  }

  async generateQuestion(params: {
    subject: string;
    topic: string;
    skill?: string;
    difficulty: string;
    type: string;
    count?: number;
  }): Promise<GeneratedQuestion[]> {
    const systemPrompt = `You are an expert ${params.subject} teacher. Generate educational questions in JSON format.`;
    const userPrompt = `Generate ${params.count ?? 1} ${params.difficulty} ${params.type} question(s) about ${params.topic}. Return JSON array.`;
    const result = await this.callAPI(systemPrompt, userPrompt);
    return this.parseJson<GeneratedQuestion[]>(result, "questions");
  }

  async gradeAnswer(params: {
    questionType: string;
    correctAnswer: unknown;
    studentAnswer: unknown;
    gradingConfig?: Record<string, unknown>;
  }): Promise<GradeResult> {
    const systemPrompt = "You are a grading assistant. Return JSON with isCorrect, score, feedback.";
    const userPrompt = `Grade this ${params.questionType} answer. Correct: ${JSON.stringify(params.correctAnswer)}. Student: ${JSON.stringify(params.studentAnswer)}.`;
    const result = await this.callAPI(systemPrompt, userPrompt);
    return this.parseJson<GradeResult>(result, "grade");
  }

  async generateHint(params: {
    questionContent: string;
    studentAnswer?: unknown;
    helpLevel: string;
    context?: Record<string, unknown>;
    restrictFinalAnswer?: boolean;
  }) {
    const restriction = params.restrictFinalAnswer
      ? "Do NOT reveal the final answer. Use Socratic method."
      : "";
    const systemPrompt = `You are a patient tutor. Help level: ${params.helpLevel}. ${restriction}`;
    const userPrompt = `Question: ${params.questionContent}\nStudent answer: ${JSON.stringify(params.studentAnswer ?? "none")}`;
    const content = await this.callAPI(systemPrompt, userPrompt);
    return { content, helpLevel: params.helpLevel };
  }

  async analyzeMistake(params: {
    questionContent: string;
    studentAnswer: unknown;
    correctAnswer: unknown;
  }): Promise<MistakeAnalysis> {
    const result = await this.callAPI(
      "Analyze the student's mistake. Return JSON with mistakeType, description, suggestion.",
      `Question: ${params.questionContent}\nCorrect: ${JSON.stringify(params.correctAnswer)}\nStudent: ${JSON.stringify(params.studentAnswer)}`
    );
    return this.parseJson<MistakeAnalysis>(result, "mistake analysis");
  }

  async generateLearningRecommendation(params: { studentContext: Record<string, unknown> }): Promise<LearningRecommendation> {
    const result = await this.callAPI(
      "Generate a personalized learning recommendation. Return JSON with content, priority.",
      JSON.stringify(params.studentContext)
    );
    return this.parseJson<LearningRecommendation>(result, "recommendation");
  }

  async generateTeacherInsight(params: { classContext: Record<string, unknown> }): Promise<TeacherInsight> {
    const result = await this.callAPI(
      "Analyze class performance data. Return JSON with content, insightType, metadata.",
      JSON.stringify(params.classContext)
    );
    return this.parseJson<TeacherInsight>(result, "insight");
  }

  async analyzeIntegrity(params: { submissionContext: Record<string, unknown> }): Promise<IntegrityAnalysis> {
    const result = await this.callAPI(
      "Analyze submission for integrity risk signals. Return JSON with riskLevel, riskScore, indicators. Never accuse — only flag signals.",
      JSON.stringify(params.submissionContext)
    );
    return this.parseJson<IntegrityAnalysis>(result, "integrity analysis");
  }

  async generateUnderstandingCheck(params: {
    questionContent: string;
    studentAnswer: unknown;
  }): Promise<UnderstandingCheck> {
    const result = await this.callAPI(
      "Generate an understanding check question. Return JSON with question, expectedConcepts.",
      `Question: ${params.questionContent}\nAnswer: ${JSON.stringify(params.studentAnswer)}`
    );
    return this.parseJson<UnderstandingCheck>(result, "understanding check");
  }

  async chat(params: {
    messages: Array<{ role: string; content: string }>;
    systemPrompt: string;
  }) {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: "system", content: params.systemPrompt },
          ...params.messages,
        ],
        temperature: 0.7,
      }),
    });
    if (!response.ok) {
      throw new Error(`AI API error: ${response.statusText}`);
    }
    const data = await response.json();
    return data.choices?.[0]?.message?.content ?? "";
  }
}
