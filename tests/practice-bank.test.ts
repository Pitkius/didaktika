import { describe, expect, it } from "vitest";
import { getCurriculumSubject, getCurriculumTopic } from "@/config/curriculum";
import { PRACTICE_BANK, pickPracticeItems } from "@/content/practice-bank";

const UPPER_SUBJECTS = [
  "mathematics",
  "lithuanian",
  "english",
  "history",
  "geography",
  "biology",
  "physics",
  "chemistry",
] as const;

describe("9–12 practice bank", () => {
  it("points every item at a real topic inside that topic's grades", () => {
    expect(PRACTICE_BANK.length).toBeGreaterThan(80);
    for (const item of PRACTICE_BANK) {
      const topic = getCurriculumTopic(item.subjectKey, item.topicKey);
      expect(topic, item.id).toBeTruthy();
      expect(item.minGrade).toBeGreaterThanOrEqual(topic!.minGrade);
      expect(item.maxGrade).toBeLessThanOrEqual(topic!.maxGrade);
      if (item.type === "MULTIPLE_CHOICE") {
        expect(item.options?.filter((o) => o.isCorrect)).toHaveLength(1);
        expect(item.options!.length).toBeGreaterThanOrEqual(2);
      } else {
        expect(Number.isFinite(item.correctAnswer?.value)).toBe(true);
      }
    }
  });

  it("gives each upper-secondary exam topic at least three tasks", () => {
    for (const subjectKey of UPPER_SUBJECTS) {
      const subject = getCurriculumSubject(subjectKey)!;
      const examTopics = subject.topics.filter(
        (topic) => topic.maxGrade >= 9 && topic.minGrade <= 12 && topic.key.startsWith("exam-")
      );
      expect(examTopics.length).toBeGreaterThan(0);
      for (const topic of examTopics) {
        const grade = Math.max(topic.minGrade, 11);
        const visible = PRACTICE_BANK.filter(
          (item) =>
            item.subjectKey === subjectKey &&
            item.topicKey === topic.key &&
            grade >= item.minGrade &&
            grade <= item.maxGrade
        );
        expect(visible.length, `${subjectKey}/${topic.key}`).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it("covers grade 11–12 mathematics topics with a full practice set", () => {
    const math = getCurriculumSubject("mathematics")!;
    for (const topic of math.topics) {
      if (topic.maxGrade < 11 || topic.minGrade > 12) continue;
      const grade = Math.max(topic.minGrade, 11);
      const picked = pickPracticeItems({
        subjectKey: "mathematics",
        topicKey: topic.key,
        grade,
        count: 5,
        seed: "grade-check",
      });
      expect(picked.length, topic.key).toBeGreaterThanOrEqual(3);
    }
  });

  it("keeps A-course derivatives for grade 12 and exam items for grade 11", () => {
    expect(
      pickPracticeItems({
        subjectKey: "mathematics",
        topicKey: "derivatives",
        grade: 11,
        count: 5,
      })
    ).toHaveLength(0);
    expect(
      pickPracticeItems({
        subjectKey: "mathematics",
        topicKey: "derivatives",
        grade: 12,
        count: 5,
        seed: "a",
      }).length
    ).toBeGreaterThanOrEqual(3);
    expect(
      pickPracticeItems({
        subjectKey: "mathematics",
        topicKey: "exam-math",
        grade: 12,
        count: 5,
        seed: "b",
      })
    ).toHaveLength(5);
  });
});
