"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  finalizeSubmissionAction,
  requestAIHelpAction,
  startOrResumeSubmissionAction,
  submitAssignmentAnswerAction,
} from "@/features/students/actions";
import { lt, tStatus } from "@/lib/i18n";
import { ArrowLeft, Lightbulb } from "lucide-react";

type QuestionOption = { id: string; content: string };
type AssignmentQuestion = {
  id: string;
  points: number;
  question: {
    id: string;
    content: string;
    type: string;
    difficulty: string;
    options: QuestionOption[];
  };
};

type Props = {
  assignmentId: string;
  title: string;
  description?: string | null;
  aiAssistance: string;
  questions: AssignmentQuestion[];
};

export function AssignmentTakeClient({
  assignmentId,
  title,
  description,
  aiAssistance,
  questions,
}: Props) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [readOnly, setReadOnly] = useState(false);
  const [answered, setAnswered] = useState<Set<string>>(new Set());
  const [answer, setAnswer] = useState("");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [score, setScore] = useState<{ score: number; maxScore: number } | null>(null);
  const [startTime, setStartTime] = useState(Date.now());
  const [hint, setHint] = useState<string | null>(null);

  const current = questions[index];
  const total = questions.length;
  const progress = total > 0 ? ((answered.size) / total) * 100 : 0;

  const init = useCallback(async () => {
    setLoading(true);
    const result = await startOrResumeSubmissionAction(assignmentId);
    if (result.error) {
      toast.error(result.error);
      router.push("/student/assignments");
      return;
    }
    setSubmissionId(result.submissionId ?? null);
    setReadOnly(!!result.readOnly);
    setAnswered(new Set(result.answeredQuestionIds ?? []));
    if (result.score != null && result.maxScore != null) {
      setScore({ score: result.score, maxScore: result.maxScore });
    }
    setLoading(false);
    setStartTime(Date.now());
  }, [assignmentId, router]);

  useEffect(() => {
    void init();
  }, [init]);

  const currentAnswered = useMemo(
    () => (current ? answered.has(current.question.id) : false),
    [answered, current]
  );

  async function handleSubmitAnswer() {
    if (!current || !submissionId || readOnly || currentAnswered) return;
    setSubmitting(true);

    let studentAnswer: unknown;
    const type = current.question.type;
    if (type === "MULTIPLE_CHOICE" || type === "SINGLE_ANSWER") {
      studentAnswer = { optionIds: selectedOption ? [selectedOption] : [] };
    } else if (type === "TRUE_FALSE") {
      studentAnswer = { value: answer === "true" };
    } else if (type === "NUMERIC") {
      studentAnswer = { value: parseFloat(answer) };
    } else {
      studentAnswer = { value: answer };
    }

    const result = await submitAssignmentAnswerAction({
      assignmentId,
      submissionId,
      questionId: current.question.id,
      answer: studentAnswer,
      timeSpentSeconds: Math.round((Date.now() - startTime) / 1000),
    });
    setSubmitting(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    setFeedback(result.feedback ?? lt.student.answerSaved);
    setIsCorrect(result.isCorrect ?? null);
    setAnswered((prev) => new Set(prev).add(current.question.id));
    toast.success(lt.student.answerSaved);
  }

  async function handleHint() {
    if (!current || aiAssistance === "OFF") return;
    const result = await requestAIHelpAction({
      questionId: current.question.id,
      helpLevel: "HINT",
      assignmentId,
    });
    if (result.error) {
      toast.error(result.error);
      return;
    }
    setHint(result.content ?? null);
  }

  async function handleFinalize() {
    if (!submissionId || readOnly) return;
    setFinalizing(true);
    const result = await finalizeSubmissionAction({ assignmentId, submissionId });
    setFinalizing(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    setReadOnly(true);
    if (result.score != null && result.maxScore != null) {
      setScore({ score: result.score, maxScore: result.maxScore });
    }
    toast.success(lt.student.alreadySubmitted);
    router.refresh();
  }

  if (loading) {
    return <p className="text-neutral-500">{lt.common.loading}</p>;
  }

  if (total === 0) {
    return <p className="text-neutral-500">{lt.student.noQuestionsInAssignment}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Button asChild variant="outline" size="sm" className="mb-3">
            <Link href="/student/assignments">
              <ArrowLeft className="mr-1 h-4 w-4" />
              {lt.student.backToAssignments}
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold">{title}</h1>
          {description && <p className="mt-1 text-neutral-500">{description}</p>}
        </div>
        {score && (
          <Badge variant="success">
            {lt.student.submissionScore}: {Math.round(score.score)} / {Math.round(score.maxScore)}
          </Badge>
        )}
      </div>

      <Progress value={progress} />
      <p className="text-sm text-neutral-500">
        {lt.student.questionProgress
          .replace("{current}", String(index + 1))
          .replace("{total}", String(total))}{" "}
        · {answered.size}/{total} {lt.student.completed.toLowerCase()}
      </p>

      {current && (
        <Card>
          <CardContent className="space-y-4 pt-6">
            <div className="flex gap-2">
              <Badge variant="secondary">{tStatus(current.question.difficulty)}</Badge>
              <Badge variant="secondary">{current.points} tšk.</Badge>
              {currentAnswered && <Badge variant="success">{lt.student.completed}</Badge>}
            </div>
            <p className="text-lg text-neutral-900">{current.question.content}</p>

            {(current.question.type === "MULTIPLE_CHOICE" ||
              current.question.type === "SINGLE_ANSWER") && (
              <div className="space-y-2">
                {current.question.options.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={readOnly || currentAnswered}
                    onClick={() => setSelectedOption(opt.id)}
                    className={`block w-full rounded-md border px-3 py-2 text-left text-sm ${
                      selectedOption === opt.id
                        ? "border-brand-500 bg-brand-50"
                        : "border-neutral-200 hover:bg-neutral-50"
                    }`}
                  >
                    {opt.content}
                  </button>
                ))}
              </div>
            )}

            {current.question.type === "TRUE_FALSE" && (
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={answer === "true" ? "default" : "outline"}
                  disabled={readOnly || currentAnswered}
                  onClick={() => setAnswer("true")}
                >
                  {lt.common.trueLabel}
                </Button>
                <Button
                  type="button"
                  variant={answer === "false" ? "default" : "outline"}
                  disabled={readOnly || currentAnswered}
                  onClick={() => setAnswer("false")}
                >
                  {lt.common.falseLabel}
                </Button>
              </div>
            )}

            {!["MULTIPLE_CHOICE", "SINGLE_ANSWER", "TRUE_FALSE"].includes(
              current.question.type
            ) && (
              <Input
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                disabled={readOnly || currentAnswered}
                placeholder={lt.student.yourAnswer}
              />
            )}

            {feedback && (
              <p className={`text-sm ${isCorrect ? "text-green-700" : "text-amber-700"}`}>
                {feedback}
              </p>
            )}
            {hint && <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-900">{hint}</p>}

            <div className="flex flex-wrap gap-2">
              {!readOnly && !currentAnswered && (
                <Button onClick={handleSubmitAnswer} disabled={submitting}>
                  {submitting ? lt.student.checking : lt.student.submitAnswer}
                </Button>
              )}
              {aiAssistance !== "OFF" && !readOnly && (
                <Button variant="outline" onClick={handleHint}>
                  <Lightbulb className="mr-1 h-4 w-4" />
                  {lt.student.hint}
                </Button>
              )}
              <Button
                variant="outline"
                disabled={index === 0}
                onClick={() => {
                  setIndex((i) => i - 1);
                  setFeedback(null);
                  setHint(null);
                  setAnswer("");
                  setSelectedOption(null);
                  setStartTime(Date.now());
                }}
              >
                {lt.common.back}
              </Button>
              <Button
                variant="outline"
                disabled={index >= total - 1}
                onClick={() => {
                  setIndex((i) => i + 1);
                  setFeedback(null);
                  setHint(null);
                  setAnswer("");
                  setSelectedOption(null);
                  setStartTime(Date.now());
                }}
              >
                {lt.common.next}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!readOnly && (
        <Button onClick={handleFinalize} disabled={finalizing || answered.size === 0}>
          {finalizing ? lt.common.loading : lt.student.finalizeSubmission}
        </Button>
      )}
      {readOnly && !score && (
        <p className="text-sm text-neutral-500">{lt.student.alreadySubmitted}</p>
      )}
    </div>
  );
}
