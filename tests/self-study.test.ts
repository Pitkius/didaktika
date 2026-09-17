import { describe, expect, it } from "vitest";
import {
  getCurriculumForGrade,
  filterSelectionsForGrade,
} from "@/config/curriculum";
import {
  getSelfStudyLimits,
  validateSelfStudySelections,
} from "@/config/self-study";

describe("Lithuanian grade curriculum", () => {
  it("shows primary subjects for grade 4, not chemistry/physics/biology", () => {
    const subjects = getCurriculumForGrade(4).map((s) => s.key);
    expect(subjects).toContain("mathematics");
    expect(subjects).toContain("lithuanian");
    expect(subjects).toContain("world-studies");
    expect(subjects).toContain("english");
    expect(subjects).not.toContain("physics");
    expect(subjects).not.toContain("chemistry");
    expect(subjects).not.toContain("biology");
  });

  it("introduces natural science in grades 5–6", () => {
    const g5 = getCurriculumForGrade(5).map((s) => s.key);
    expect(g5).toContain("natural-science");
    expect(g5).not.toContain("world-studies");
    expect(g5).not.toContain("chemistry");
  });

  it("adds biology and physics from grade 7, chemistry from 8", () => {
    expect(getCurriculumForGrade(7).map((s) => s.key)).toContain("biology");
    expect(getCurriculumForGrade(7).map((s) => s.key)).toContain("physics");
    expect(getCurriculumForGrade(7).map((s) => s.key)).not.toContain("chemistry");
    expect(getCurriculumForGrade(8).map((s) => s.key)).toContain("chemistry");
  });

  it("filters math topics by grade", () => {
    const g4Topics = getCurriculumForGrade(4)
      .find((s) => s.key === "mathematics")!
      .topics.map((t) => t.key);
    expect(g4Topics).toContain("multiplication-table");
    expect(g4Topics).not.toContain("quadratic-equations");
    expect(g4Topics).not.toContain("functions");
  });
});

describe("self-study limits", () => {
  it("gives Free plan 3 subjects and 3 topics", () => {
    expect(getSelfStudyLimits("FREE")).toEqual({
      maxSubjects: 3,
      maxTopicsPerSubject: 3,
    });
  });

  it("accepts valid Free selections for grade 4", () => {
    const result = validateSelfStudySelections(
      [
        {
          subjectKey: "mathematics",
          topicKeys: ["multiplication-table", "division", "fractions"],
        },
        {
          subjectKey: "world-studies",
          topicKeys: ["plants-animals", "lithuania-primary"],
        },
      ],
      getSelfStudyLimits("FREE"),
      4
    );
    expect(result.ok).toBe(true);
  });

  it("rejects physics for grade 4", () => {
    const result = validateSelfStudySelections(
      [{ subjectKey: "physics", topicKeys: ["mechanics"] }],
      getSelfStudyLimits("FREE"),
      4
    );
    expect(result.ok).toBe(false);
  });

  it("rejects more than 3 subjects on Free", () => {
    const result = validateSelfStudySelections(
      [
        { subjectKey: "mathematics", topicKeys: ["geometry-primary"] },
        { subjectKey: "english", topicKeys: ["words-school"] },
        { subjectKey: "lithuanian", topicKeys: ["spelling-primary"] },
        { subjectKey: "world-studies", topicKeys: ["plants-animals"] },
      ],
      getSelfStudyLimits("FREE"),
      4
    );
    expect(result.ok).toBe(false);
  });

  it("filters stale high-school selections when grade is primary", () => {
    const filtered = filterSelectionsForGrade(
      [
        { subjectKey: "physics", topicKeys: ["mechanics"] },
        { subjectKey: "mathematics", topicKeys: ["quadratic-equations", "division"] },
      ],
      4
    );
    expect(filtered).toEqual([
      { subjectKey: "mathematics", topicKeys: ["division"] },
    ]);
  });

  it("rejects unknown curriculum keys", () => {
    const result = validateSelfStudySelections(
      [{ subjectKey: "alchemy", topicKeys: ["gold"] }],
      getSelfStudyLimits("FREE"),
      9
    );
    expect(result.ok).toBe(false);
  });
});
