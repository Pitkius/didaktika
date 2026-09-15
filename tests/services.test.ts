import { describe, it, expect } from "vitest";
import { MockAIProvider } from "@/services/ai/mock-provider";
import { GradingService } from "@/services/grading/grading-service";

describe("GradingService", () => {
  const gradingService = new GradingService();

  it("grades numeric answers with tolerance", async () => {
    const result = await gradingService.grade({
      questionType: "NUMERIC",
      correctAnswer: { value: 3 },
      studentAnswer: { value: 3.005 },
      gradingConfig: { tolerance: 0.01 },
    });
    expect(result.isCorrect).toBe(true);
    expect(result.score).toBe(1);
  });

  it("rejects incorrect numeric answers", async () => {
    const result = await gradingService.grade({
      questionType: "NUMERIC",
      correctAnswer: { value: 3 },
      studentAnswer: { value: 5 },
      gradingConfig: { tolerance: 0.01 },
    });
    expect(result.isCorrect).toBe(false);
    expect(result.score).toBe(0);
  });

  it("grades true/false correctly", async () => {
    const result = await gradingService.grade({
      questionType: "TRUE_FALSE",
      correctAnswer: { value: true },
      studentAnswer: { value: true },
    });
    expect(result.isCorrect).toBe(true);
  });

  it("grades multiple choice correctly", async () => {
    const result = await gradingService.grade({
      questionType: "MULTIPLE_CHOICE",
      correctAnswer: { optionIds: ["a"] },
      studentAnswer: { optionIds: ["a"] },
    });
    expect(result.isCorrect).toBe(true);
  });
});

describe("MockAIProvider", () => {
  const provider = new MockAIProvider();

  it("generates questions deterministically", async () => {
    const questions = await provider.generateQuestion({
      subject: "Mathematics",
      topic: "Linear equations",
      difficulty: "EASY",
      type: "NUMERIC",
      count: 2,
    });
    expect(questions).toHaveLength(2);
    expect(questions[0].content).toContain("Linear equations");
  });

  it("generates hints without final answers when restricted", async () => {
    const hint = await provider.generateHint({
      questionContent: "Solve 2x + 4 = 10",
      helpLevel: "HINT",
      restrictFinalAnswer: true,
    });
    expect(hint.content).toBeTruthy();
    expect(hint.content.toLowerCase()).not.toContain("x = 3");
  });

  it("analyzes integrity with risk signals", async () => {
    const analysis = await provider.analyzeIntegrity({
      submissionContext: {
        timeSpentSeconds: 15,
        helpRequests: 0,
        score: 1,
      },
    });
    expect(["LOW", "MEDIUM", "HIGH"]).toContain(analysis.riskLevel);
    expect(analysis.indicators.length).toBeGreaterThan(0);
  });
});

describe("Adaptive Learning Logic", () => {
  it("determines difficulty based on accuracy thresholds", () => {
    function eetDifficulty(accuracy: number, attemptCount: number): string {
      if (attemptCount < 3) return "EASY";
      if (accuracy >= 90) return "HARD";
      if (accuracy >= 50) return "MEDIUM";
      return "EASY";
    }

    expect(eetDifficulty(95, 10)).toBe("HARD");
    expect(eetDifficulty(70, 10)).toBe("MEDIUM");
    expect(eetDifficulty(30, 10)).toBe("EASY");
    expect(eetDifficulty(95, 1)).toBe("EASY");
  });

  it("calculates mastery level from score", () => {
    function getMasteryLevel(score: number): string {
      if (score >= 80) return "STRONG";
      if (score >= 60) return "GOOD";
      if (score >= 40) return "NEEDS_PRACTICE";
      return "WEAK";
    }

    expect(getMasteryLevel(85)).toBe("STRONG");
    expect(getMasteryLevel(65)).toBe("GOOD");
    expect(getMasteryLevel(45)).toBe("NEEDS_PRACTICE");
    expect(getMasteryLevel(20)).toBe("WEAK");
  });
});

describe("Role-based access", () => {
  it("maps roles to correct dashboard paths", async () => {
    const { roleDashboardPaths } = await import("@/lib/auth/roles");
    expect(roleDashboardPaths.STUDENT).toBe("/student");
    expect(roleDashboardPaths.TEACHER).toBe("/teacher");
    expect(roleDashboardPaths.SCHOOL_ADMIN).toBe("/school-admin");
    expect(roleDashboardPaths.SUPER_ADMIN).toBe("/admin");
  });
});
