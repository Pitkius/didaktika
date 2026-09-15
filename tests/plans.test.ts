import { describe, it, expect } from "vitest";
import {
  PLAN_DEFINITIONS,
  getPlanDefinition,
  formatPlanPrice,
  getIndividualPlans,
  getEducationPlans,
  pricePerSeatCents,
} from "@/config/plans";

describe("Plan engine", () => {
  it("defines the full individual + education ladder", () => {
    const codes = PLAN_DEFINITIONS.map((p) => p.code);
    expect(codes).toEqual([
      "FREE",
      "PLUS",
      "PRO",
      "TEACHER",
      "SMALL_SCHOOL",
      "SCHOOL",
      "SCHOOL_PLUS",
      "ENTERPRISE",
    ]);
  });

  it("separates individual and education audiences", () => {
    expect(getIndividualPlans().map((p) => p.code)).toEqual(["FREE", "PLUS", "PRO"]);
    expect(getEducationPlans().map((p) => p.code)).toEqual([
      "TEACHER",
      "SMALL_SCHOOL",
      "SCHOOL",
      "SCHOOL_PLUS",
      "ENTERPRISE",
    ]);
  });

  it("prices match the education ladder", () => {
    expect(getPlanDefinition("FREE").priceCents).toBe(0);
    expect(getPlanDefinition("PLUS").priceCents).toBe(799);
    expect(getPlanDefinition("PRO").priceCents).toBe(1299);
    expect(getPlanDefinition("TEACHER").priceCents).toBe(1900);
    expect(getPlanDefinition("SMALL_SCHOOL").priceCents).toBe(6900);
    expect(getPlanDefinition("SCHOOL").priceCents).toBe(12900);
    expect(getPlanDefinition("SCHOOL_PLUS").priceCents).toBe(24900);
    expect(formatPlanPrice(getPlanDefinition("ENTERPRISE"))).toBe("Individuali");
  });

  it("education seats scale with plan tier", () => {
    expect(getPlanDefinition("TEACHER").seatsLimit).toBe(50);
    expect(getPlanDefinition("SMALL_SCHOOL").seatsLimit).toBe(150);
    expect(getPlanDefinition("SCHOOL").seatsLimit).toBe(500);
    expect(getPlanDefinition("SCHOOL_PLUS").seatsLimit).toBe(1000);
    expect(getPlanDefinition("ENTERPRISE").seatsLimit).toBeNull();
  });

  it("avoids cheaper plans undercutting per-seat economics vs SCHOOL", () => {
    const teacher = pricePerSeatCents(getPlanDefinition("TEACHER"))!;
    const school = pricePerSeatCents(getPlanDefinition("SCHOOL"))!;
    expect(teacher).toBeGreaterThanOrEqual(school * 0.5);
  });

  it("FREE includes limited AI teacher messages", () => {
    const free = getPlanDefinition("FREE");
    expect(free.features).toContain("AI_TEACHER");
    expect(free.limits.AI_TEACHER_MESSAGES).toBe(50);
  });

  it("PRO unlocks exam simulation and programming", () => {
    const pro = getPlanDefinition("PRO");
    expect(pro.features).toContain("EXAM_SIMULATION");
    expect(pro.features).toContain("PROGRAMMING");
    expect(pro.features).toContain("UNDERSTANDING_CHECK");
  });

  it("SCHOOL unlocks admin + SSO; TEACHER does not", () => {
    const teacher = getPlanDefinition("TEACHER");
    const school = getPlanDefinition("SCHOOL");
    expect(teacher.features).not.toContain("SCHOOL_ADMIN");
    expect(teacher.features).not.toContain("SSO");
    expect(school.features).toContain("SCHOOL_ADMIN");
    expect(school.features).toContain("SSO");
  });
});
