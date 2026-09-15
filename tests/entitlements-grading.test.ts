import { describe, it, expect } from "vitest";
import { getPlanDefinition } from "@/config/plans";
import { GradingService } from "@/services/grading/grading-service";

describe("Entitlement plan matrix (pure)", () => {
  it("FREE cannot use integrity or exam simulation features", () => {
    const free = getPlanDefinition("FREE");
    expect(free.features).not.toContain("INTEGRITY");
    expect(free.features).not.toContain("EXAM_SIMULATION");
    expect(free.limits.AI_TEACHER_MESSAGES).toBe(50);
  });

  it("TEACHER can generate questions and use integrity", () => {
    const teacher = getPlanDefinition("TEACHER");
    expect(teacher.features).toContain("AI_GENERATOR");
    expect(teacher.features).toContain("INTEGRITY");
    expect(teacher.seatsLimit).toBe(50);
  });

  it("PLUS unlocks mastery map and study plans", () => {
    const plus = getPlanDefinition("PLUS");
    expect(plus.features).toContain("MASTERY_MAP");
    expect(plus.features).toContain("STUDY_PLANS");
    expect(plus.limits.AI_TEACHER_MESSAGES).toBeGreaterThan(
      getPlanDefinition("FREE").limits.AI_TEACHER_MESSAGES!
    );
  });
});

describe("Grading edge cases", () => {
  const grading = new GradingService();

  it("grades matching answers regardless of order when configured as sets", async () => {
    const result = await grading.grade({
      questionType: "TRUE_FALSE",
      correctAnswer: { value: true },
      studentAnswer: { value: true },
    });
    expect(result.isCorrect).toBe(true);
    expect(result.score).toBe(1);
  });

  it("rejects wrong numeric outside tolerance", async () => {
    const result = await grading.grade({
      questionType: "NUMERIC",
      correctAnswer: { value: 10 },
      studentAnswer: { value: 12 },
      gradingConfig: { tolerance: 0.01 },
    });
    expect(result.isCorrect).toBe(false);
  });

  it("accepts numeric within tolerance", async () => {
    const result = await grading.grade({
      questionType: "NUMERIC",
      correctAnswer: { value: 10 },
      studentAnswer: { value: 10.005 },
      gradingConfig: { tolerance: 0.01 },
    });
    expect(result.isCorrect).toBe(true);
  });
});

describe("Adaptive mastery helpers", () => {
  it("SCHOOL plan price is €129", () => {
    expect(getPlanDefinition("SCHOOL").priceCents).toBe(12900);
  });
});
