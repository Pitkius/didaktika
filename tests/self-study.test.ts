import { describe, expect, it } from "vitest";
import {
  getSelfStudyLimits,
  validateSelfStudySelections,
} from "@/config/self-study";

describe("self-study limits", () => {
  it("gives Free plan 3 subjects and 3 topics", () => {
    expect(getSelfStudyLimits("FREE")).toEqual({
      maxSubjects: 3,
      maxTopicsPerSubject: 3,
    });
  });

  it("accepts valid Free selections", () => {
    const result = validateSelfStudySelections(
      [
        {
          subjectKey: "mathematics",
          topicKeys: ["quadratic-equations", "functions", "geometry"],
        },
        {
          subjectKey: "english",
          topicKeys: ["grammar", "vocabulary"],
        },
      ],
      getSelfStudyLimits("FREE")
    );
    expect(result.ok).toBe(true);
  });

  it("rejects more than 3 subjects on Free", () => {
    const result = validateSelfStudySelections(
      [
        { subjectKey: "mathematics", topicKeys: ["geometry"] },
        { subjectKey: "english", topicKeys: ["grammar"] },
        { subjectKey: "physics", topicKeys: ["mechanics"] },
        { subjectKey: "biology", topicKeys: ["cell"] },
      ],
      getSelfStudyLimits("FREE")
    );
    expect(result.ok).toBe(false);
  });

  it("rejects more than 3 topics per subject on Free", () => {
    const result = validateSelfStudySelections(
      [
        {
          subjectKey: "mathematics",
          topicKeys: [
            "quadratic-equations",
            "functions",
            "geometry",
            "linear-equations",
          ],
        },
      ],
      getSelfStudyLimits("FREE")
    );
    expect(result.ok).toBe(false);
  });

  it("rejects unknown curriculum keys", () => {
    const result = validateSelfStudySelections(
      [{ subjectKey: "alchemy", topicKeys: ["gold"] }],
      getSelfStudyLimits("FREE")
    );
    expect(result.ok).toBe(false);
  });
});
