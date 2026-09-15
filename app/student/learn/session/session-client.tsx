"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  submitAnswerAction,
  requestAIHelpAction,
  chatWithAIAction,
  startLearningSessionAction,
} from "@/features/students/actions";
import { toast } from "sonner";
import { Bot, Send, Lightbulb, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { lt, tStatus } from "@/lib/i18n";

interface Question {
  id: string;
  content: string;
  type: string;
  difficulty: string;
  options?: Array<{ id: string; content: string }>;
}

interface Message {
  role: string;
  content: string;
}

export default function LearningSessionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const subjectId = searchParams.get("subjectId") ?? undefined;
  const [question, setQuestion] = useState<Question | null>(null);
  const [answer, setAnswer] = useState("");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [totalQuestions] = useState(10);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [startTime, setStartTime] = useState(Date.now());
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [aiMessages, setAiMessages] = useState<Message[]>([]);
  const [aiInput, setAiInput] = useState("");
  const [aiOpen, setAiOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const loadQuestion = useCallback(async () => {
    setLoading(true);
    setFeedback(null);
    setIsCorrect(null);
    setAnswer("");
    setSelectedOption(null);
    setStartTime(Date.now());

    const result = await startLearningSessionAction(subjectId);
    if (result.error) {
      toast.error(result.error);
      router.push("/student/learn");
      return;
    }
    if (result.question) {
      setQuestion(result.question as Question);
    }
    setLoading(false);
  }, [router, subjectId]);

  useEffect(() => {
    loadQuestion();
  }, [loadQuestion]);

  async function handleSubmit() {
    if (!question) return;
    setSubmitting(true);

    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    let studentAnswer: unknown;

    if (question.type === "MULTIPLE_CHOICE" || question.type === "SINGLE_ANSWER") {
      studentAnswer = { optionIds: selectedOption ? [selectedOption] : [] };
    } else if (question.type === "TRUE_FALSE") {
      studentAnswer = { value: answer === "true" };
    } else if (question.type === "NUMERIC") {
      studentAnswer = { value: parseFloat(answer) };
    } else {
      studentAnswer = { value: answer };
    }

    const result = await submitAnswerAction({
      questionId: question.id,
      answer: studentAnswer,
      timeSpentSeconds: timeSpent,
    });

    setSubmitting(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    setIsCorrect(result.isCorrect ?? null);
    setFeedback(result.feedback ?? (result.isCorrect ? lt.common.correct : lt.common.incorrect));
  }

  async function handleNext() {
    if (questionNumber >= totalQuestions) {
      router.push("/student/progress");
      return;
    }
    setQuestionNumber((n) => n + 1);
    await loadQuestion();
  }

  async function handleHint() {
    if (!question) return;
    setAiLoading(true);
    setAiOpen(true);
    const result = await requestAIHelpAction({
      questionId: question.id,
      helpLevel: "HINT",
      conversationId: conversationId ?? undefined,
    });
    setAiLoading(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    if (result.conversationId) setConversationId(result.conversationId);
    if (result.content) {
      setAiMessages((prev) => [...prev, { role: "assistant", content: result.content as string }]);
    }
  }

  async function handleAiSend() {
    if (!aiInput.trim() || !question) return;
    const msg = aiInput.trim();
    setAiInput("");
    setAiMessages((prev) => [...prev, { role: "user", content: msg }]);
    setAiLoading(true);

    const result = conversationId
      ? await chatWithAIAction({
          message: msg,
          conversationId,
        })
      : await requestAIHelpAction({
          questionId: question.id,
          helpLevel: "GUIDANCE",
          conversationId: conversationId ?? undefined,
        });

    setAiLoading(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    if ("conversationId" in result && result.conversationId) {
      setConversationId(result.conversationId as string);
    }
    const content =
      ("content" in result && result.content) ||
      ("reply" in result && (result as { reply?: string }).reply) ||
      ("message" in result && (result as { message?: string }).message) ||
      "";
    if (content) {
      setAiMessages((prev) => [...prev, { role: "assistant", content: String(content) }]);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-neutral-500">
        {lt.common.loading}
      </div>
    );
  }

  const progress = Math.round((questionNumber / totalQuestions) * 100);

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm">
          <Link href="/student/learn">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {lt.common.back}
          </Link>
        </Button>
        <p className="text-sm text-neutral-500">
          {lt.student.questionOf} {questionNumber} {lt.student.of} {totalQuestions}
        </p>
      </div>

      <Progress value={progress} />

      {question && (
        <Card>
          <CardContent className="space-y-4 pt-6">
            <Badge variant="secondary">{tStatus(question.difficulty)}</Badge>
            <p className="text-lg text-neutral-900">{question.content}</p>

            {(question.type === "MULTIPLE_CHOICE" || question.type === "SINGLE_ANSWER") && (
              <div className="space-y-2">
                {(question.options ?? []).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedOption(opt.id)}
                    disabled={isCorrect !== null}
                    className={`w-full rounded-md border px-4 py-3 text-left text-sm transition-colors ${
                      selectedOption === opt.id
                        ? "border-brand-500 bg-brand-50"
                        : "border-neutral-200 hover:border-neutral-300"
                    }`}
                  >
                    {opt.content}
                  </button>
                ))}
              </div>
            )}

            {question.type === "TRUE_FALSE" && (
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant={answer === "true" ? "default" : "outline"}
                  disabled={isCorrect !== null}
                  onClick={() => setAnswer("true")}
                >
                  {lt.common.trueLabel}
                </Button>
                <Button
                  type="button"
                  variant={answer === "false" ? "default" : "outline"}
                  disabled={isCorrect !== null}
                  onClick={() => setAnswer("false")}
                >
                  {lt.common.falseLabel}
                </Button>
              </div>
            )}

            {(question.type === "NUMERIC" ||
              question.type === "SHORT_ANSWER" ||
              question.type === "OPEN_ENDED") && (
              <Input
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                disabled={isCorrect !== null}
                placeholder={lt.student.yourAnswer}
              />
            )}

            {feedback && (
              <p
                className={`rounded-md px-3 py-2 text-sm ${
                  isCorrect ? "bg-green-50 text-green-800" : "bg-amber-50 text-amber-900"
                }`}
              >
                {feedback}
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              {isCorrect === null ? (
                <>
                  <Button onClick={handleSubmit} disabled={submitting}>
                    {submitting ? lt.common.pleaseWait : lt.student.submitAnswer}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleHint} disabled={aiLoading}>
                    <Lightbulb className="mr-2 h-4 w-4" />
                    {lt.student.hint}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setAiOpen((v) => !v)}>
                    <Bot className="mr-2 h-4 w-4" />
                    {lt.student.aiTeacherHelp}
                  </Button>
                </>
              ) : (
                <Button onClick={handleNext}>{lt.student.nextQuestion}</Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {aiOpen && (
        <Card>
          <CardContent className="space-y-3 pt-6">
            <p className="font-medium">{lt.student.aiTeacherHelp}</p>
            <div className="max-h-56 space-y-2 overflow-y-auto rounded-md bg-neutral-50 p-3 text-sm">
              {aiMessages.length === 0 && (
                <p className="text-neutral-400">{lt.student.aiTeacherEmpty}</p>
              )}
              {aiMessages.map((m, i) => (
                <p key={i} className={m.role === "user" ? "text-brand-800" : "text-neutral-700"}>
                  <span className="font-medium">{m.role === "user" ? "Jūs" : "DI"}: </span>
                  {m.content}
                </p>
              ))}
              {aiLoading && <p className="text-neutral-400">{lt.common.loading}</p>}
            </div>
            <div className="flex gap-2">
              <Input
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                placeholder={lt.student.aiTeacherPlaceholder}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void handleAiSend();
                }}
              />
              <Button type="button" size="icon" onClick={handleAiSend} disabled={aiLoading}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
