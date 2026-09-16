import { describe, it, expect } from "vitest";
import {
  assignmentSecurityDefaults,
  scoreIntegrityEvents,
} from "@/config/assignment-security";

describe("assignment security defaults", () => {
  it("locks down TEST and EXAM", () => {
    const test = assignmentSecurityDefaults("TEST");
    expect(test.aiAssistance).toBe("OFF");
    expect(test.integrityMonitoring).toBe(true);
    expect(test.showResultsImmediately).toBe(false);
    expect(test.attemptsAllowed).toBe(1);
    expect(test.timeLimitMinutes).toBe(45);

    const exam = assignmentSecurityDefaults("EXAM");
    expect(exam.timeLimitMinutes).toBe(90);
    expect(exam.aiAssistance).toBe("OFF");
  });

  it("keeps PRACTICE open for learning", () => {
    const practice = assignmentSecurityDefaults("PRACTICE");
    expect(practice.aiAssistance).toBe("GUIDANCE");
    expect(practice.integrityMonitoring).toBe(false);
    expect(practice.showResultsImmediately).toBe(true);
    expect(practice.attemptsAllowed).toBe(99);
  });

  it("uses hints-only for homework", () => {
    const hw = assignmentSecurityDefaults("HOMEWORK");
    expect(hw.aiAssistance).toBe("HINTS_ONLY");
    expect(hw.integrityMonitoring).toBe(false);
  });
});

describe("integrity event scoring", () => {
  it("scores low with no events", () => {
    const result = scoreIntegrityEvents([]);
    expect(result.riskLevel).toBe("LOW");
    expect(result.riskScore).toBe(0);
  });

  it("flags leave-and-paste pattern as elevated risk", () => {
    const result = scoreIntegrityEvents([
      { type: "TAB_HIDDEN" },
      { type: "TAB_HIDDEN" },
      { type: "PASTE" },
      { type: "WINDOW_BLUR" },
    ]);
    expect(result.indicators).toContain("leave_and_paste_pattern");
    expect(result.riskScore).toBeGreaterThanOrEqual(0.35);
    expect(["MEDIUM", "HIGH"]).toContain(result.riskLevel);
  });

  it("escalates with many pastes", () => {
    const result = scoreIntegrityEvents([
      { type: "PASTE" },
      { type: "PASTE" },
      { type: "PASTE" },
      { type: "PASTE" },
    ]);
    expect(result.indicators).toContain("multiple_pastes");
    expect(result.riskLevel).not.toBe("LOW");
  });
});
