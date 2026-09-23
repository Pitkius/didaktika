"use client";

import { useActionState } from "react";
import { generateQuestionsAction } from "@/features/teachers/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Difficulty, QuestionType } from "@prisma/client";
import { lt, tStatus } from "@/lib/i18n";

interface AIGeneratorFormProps {
  subjects: Array<{ id: string; name: string; topics: Array<{ id: string; name: string }> }>;
}

export function AIGeneratorForm({ subjects }: AIGeneratorFormProps) {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string; success?: boolean; count?: number } | null, formData: FormData) => {
      const result = await generateQuestionsAction({
        subject: formData.get("subject") as string,
        topic: formData.get("topic") as string,
        difficulty: formData.get("difficulty") as Difficulty,
        type: formData.get("type") as QuestionType,
        count: parseInt(formData.get("count") as string, 10) || 5,
        subjectId: (formData.get("subjectId") as string) || undefined,
        topicId: (formData.get("topicId") as string) || undefined,
      });
      if (result.success) {
        return { success: true, count: result.questions.length };
      }
      return { error: result.error ?? lt.teacher.generateFailed };
    },
    null
  );

  return (
    <form action={action} className="max-w-le space-y-4">
      {state?.error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{state.error}</div>
      )}
      {state?.success && (
        <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">
          {lt.teacher.generateSuccess.replace("{count}", String(state.count))}
        </div>
      )}
      <div>
        <Label htmlFor="subjectId">{lt.common.subject}</Label>
        <select
          id="subjectId"
          name="subjectId"
          className="mt-1 flex h-10 w-full rounded-md border border-neutral-300 px-3 text-sm"
        >
          <option value="">{lt.teacher.selectSubject}</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="subject">{lt.teacher.subjectNameAi}</Label>
        <Input id="subject" name="subject" required placeholder={lt.teacher.mathPlaceholder} className="mt-1" />
      </div>
      <div>
        <Label htmlFor="topic">{lt.teacher.topic}</Label>
        <Input id="topic" name="topic" required placeholder={lt.teacher.topicPlaceholder} className="mt-1" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="difficulty">{lt.teacher.difficulty}</Label>
          <select
            id="difficulty"
            name="difficulty"
            className="mt-1 flex h-10 w-full rounded-md border border-neutral-300 px-3 text-sm"
          >
            <option value="EASY">{tStatus("EASY")}</option>
            <option value="MEDIUM">{tStatus("MEDIUM")}</option>
            <option value="HARD">{tStatus("HARD")}</option>
            <option value="EXPERT">{tStatus("EXPERT")}</option>
          </select>
        </div>
        <div>
          <Label htmlFor="type">{lt.teacher.questionType}</Label>
          <select
            id="type"
            name="type"
            className="mt-1 flex h-10 w-full rounded-md border border-neutral-300 px-3 text-sm"
          >
            <option value="MULTIPLE_CHOICE">{tStatus("MULTIPLE_CHOICE")}</option>
            <option value="SINGLE_ANSWER">{tStatus("SINGLE_ANSWER")}</option>
            <option value="SHORT_ANSWER">{tStatus("SHORT_ANSWER")}</option>
            <option value="TRUE_FALSE">{tStatus("TRUE_FALSE")}</option>
            <option value="NUMERIC">{tStatus("NUMERIC")}</option>
          </select>
        </div>
      </div>
      <div>
        <Label htmlFor="count">{lt.teacher.numberOfQuestions}</Label>
        <Input id="count" name="count" type="number" min={1} max={10} defaultValue={5} className="mt-1" />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? lt.common.generating : lt.teacher.generateQuestions}
      </Button>
    </form>
  );
}
