import { describe, expect, it } from "vitest";
import { isTimeExpired, secondsRemaining } from "@/lib/assignments/deadline";
import { billingReturnPath, checkoutPlanAllowed, isCheckoutAvailable } from "@/lib/billing/checkout-policy";
import { toPublicQuestion } from "@/lib/learning/question-access";
import { isRequiredEmailOperational } from "@/services/email/email-service";
import { securityHeaders } from "@/lib/security/headers";
import { rateLimit, resetRateLimits } from "@/lib/security/rate-limit";
import { hashToken } from "@/lib/security/tokens";
import { createAIProvider } from "@/services/ai/mock-provider";

function setNodeEnv(value: string | undefined) {
  (process.env as { NODE_ENV?: string }).NODE_ENV = value;
}

describe("launch hardening", () => {
  it("hashes tokens with sha256", () => {
    expect(hashToken("abc")).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
    expect(hashToken("abc")).not.toBe("abc");
  });

  it("expires an exam from the server start time", () => {
    const started = new Date("2026-09-21T10:00:00.000Z");
    const later = new Date("2026-09-21T10:11:00.000Z");
    expect(secondsRemaining(started, 10, new Date("2026-09-21T10:04:00.000Z"))).toBe(360);
    expect(isTimeExpired(started, 10, later)).toBe(true);
    expect(secondsRemaining(started, null, later)).toBeNull();
  });

  it("blocks checkout plans outside the role allowlist", () => {
    expect(checkoutPlanAllowed("STUDENT", "PLUS")).toBe(true);
    expect(checkoutPlanAllowed("STUDENT", "TEACHER")).toBe(false);
    expect(checkoutPlanAllowed("TEACHER", "ENTERPRISE")).toBe(false);
    expect(checkoutPlanAllowed("SCHOOL_ADMIN", "SCHOOL")).toBe(true);
    expect(checkoutPlanAllowed("SUPER_ADMIN", "SCHOOL")).toBe(false);
    expect(billingReturnPath("TEACHER")).toBe("/teacher/billing");
    expect(isCheckoutAvailable()).toBe(false);
  });

  it("strips answer keys from public questions", () => {
    const publicQuestion = toPublicQuestion({
      id: "q1",
      content: "2+2",
      type: "MULTIPLE_CHOICE",
      difficulty: "EASY",
      options: [{ id: "o1", content: "4", isCorrect: true }],
    });
    expect(publicQuestion.options[0]).toEqual({ id: "o1", content: "4" });
    expect("isCorrect" in publicQuestion.options[0]).toBe(false);
  });

  it("rate-limits a key inside the window", () => {
    resetRateLimits();
    const now = 1_000_000;
    expect(rateLimit("login:test", 2, 60_000, now).ok).toBe(true);
    expect(rateLimit("login:test", 2, 60_000, now + 1).ok).toBe(true);
    expect(rateLimit("login:test", 2, 60_000, now + 2).ok).toBe(false);
  });

  it("requires Resend in production and stays open in development", () => {
    const prevEnv = process.env.NODE_ENV;
    const prevProvider = process.env.EMAIL_PROVIDER;
    const prevKey = process.env.RESEND_API_KEY;
    setNodeEnv("development");
    expect(isRequiredEmailOperational()).toBe(true);
    setNodeEnv("production");
    process.env.EMAIL_PROVIDER = "console";
    delete process.env.RESEND_API_KEY;
    expect(isRequiredEmailOperational()).toBe(false);
    process.env.EMAIL_PROVIDER = "resend";
    process.env.RESEND_API_KEY = "re_test";
    expect(isRequiredEmailOperational()).toBe(true);
    setNodeEnv(prevEnv);
    process.env.EMAIL_PROVIDER = prevProvider;
    process.env.RESEND_API_KEY = prevKey;
  });

  it("sets frame protections and HSTS only for https", () => {
    const local = securityHeaders("http://localhost:3000");
    expect(local.some((header) => header.key === "X-Frame-Options" && header.value === "DENY")).toBe(true);
    expect(local.some((header) => header.key === "Strict-Transport-Security")).toBe(false);
    const secure = securityHeaders("https://didaktika.lt");
    expect(secure.some((header) => header.key === "Strict-Transport-Security")).toBe(true);
  });

  it("keeps mock AI outside production and closes it in production without a key", () => {
    const prevEnv = process.env.NODE_ENV;
    const prevProvider = process.env.AI_PROVIDER;
    const prevKey = process.env.OPENAI_API_KEY;
    setNodeEnv("test");
    process.env.AI_PROVIDER = "mock";
    delete process.env.OPENAI_API_KEY;
    expect(createAIProvider().constructor.name).toBe("MockAIProvider");
    setNodeEnv("production");
    expect(createAIProvider().constructor.name).toBe("UnavailableAIProvider");
    setNodeEnv(prevEnv);
    process.env.AI_PROVIDER = prevProvider;
    if (prevKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = prevKey;
  });
});
