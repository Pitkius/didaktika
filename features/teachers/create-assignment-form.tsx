"use client";

import { useActionState } from "react";
import { createAssignmentAction } from "@/features/teachers/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AssignmentType, AIAssistanceLevel } from "@prisma/client";
import { useRouter } from "next/navigation";
import { lt, tStatus } from "@/lib/i18n";

interface CreateAssignmentFormProps {
  classes: Array<{ id: string; name: string }>;
  subjects: Array<{ id: string; name: string }>;
}

export function CreateAssignmentForm({ classes, subjects }: CreateAssignmentFormProps) {
  const router = useRouter();
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      const result = await createAssignmentAction({
        title: formData.get("title") as string,
        description: (formData.get("description") as string) || undefined,
        type: formData.get("type") as AssignmentType,
        classId: (formData.get("classId") as string) || undefined,
        subjectId: (formData.get("subjectId") as string) || undefined,
        dueDate: (formData.get("dueDate") as string) || undefined,
        timeLimitMinutes: formData.get("timeLimitMinutes")
          ? parseInt(formData.get("timeLimitMinutes") as string, 10)
          : undefined,
        attemptsAllowed: formData.get("attemptsAllowed")
          ? parseInt(formData.get("attemptsAllowed") as string, 10)
          : 1,
        aiAssistance: (formData.get("aiAssistance") as AIAssistanceLevel) || "GUIDANCE",
      });
      if (result.success) {
        router.push("/teacher/assignments");
        return { success: true };
      }
      return { error: lt.teacher.createAssignmentFailed };
    },
    null
  );

  return (
    <form action={action} className="max-w-le space-y-4">
      {state?.error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{state.error}</div>
      )}
      <div>
        <Label htmlFor="title">{lt.teacher.titleLabel}</Label>
        <Input id="title" name="title" required className="mt-1" />
      </div>
      <div>
        <Label htmlFor="description">{lt.common.description}</Label>
        <Input id="description" name="description" className="mt-1" />
      </div>
      <div>
        <Label htmlFor="type">{lt.common.type}</Label>
        <select
          id="type"
          name="type"
          required
          className="mt-1 flex h-10 w-full rounded-md border border-neutral-300 px-3 text-sm"
        >
          <option value="HOMEWORK">{tStatus("HOMEWORK")}</option>
          <option value="ASSIGNMENT">{tStatus("ASSIGNMENT")}</option>
          <option value="TEST">{tStatus("TEST")}</option>
          <option value="EXAM">{tStatus("EXAM")}</option>
          <option value="PRACTICE">{tStatus("PRACTICE")}</option>
        </select>
      </div>
      <div>
        <Label htmlFor="classId">{lt.common.class}</Label>
        <select
          id="classId"
          name="classId"
          className="mt-1 flex h-10 w-full rounded-md border border-neutral-300 px-3 text-sm"
        >
          <option value="">{lt.common.noClass}</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="subjectId">{lt.common.subject}</Label>
        <select
          id="subjectId"
          name="subjectId"
          className="mt-1 flex h-10 w-full rounded-md border border-neutral-300 px-3 text-sm"
        >
          <option value="">{lt.common.noSubject}</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="dueDate">{lt.teacher.dueDate}</Label>
        <Input id="dueDate" name="dueDate" type="datetime-local" className="mt-1" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="timeLimitMinutes">{lt.teacher.timeLimit}</Label>
          <Input id="timeLimitMinutes" name="timeLimitMinutes" type="number" min={1} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="attemptsAllowed">{lt.teacher.attemptsAllowed}</Label>
          <Input id="attemptsAllowed" name="attemptsAllowed" type="number" min={1} defaultValue={1} className="mt-1" />
        </div>
      </div>
      <div>
        <Label htmlFor="aiAssistance">{lt.teacher.aiAssistance}</Label>
        <select
          id="aiAssistance"
          name="aiAssistance"
          className="mt-1 flex h-10 w-full rounded-md border border-neutral-300 px-3 text-sm"
        >
          <option value="OFF">{tStatus("OFF")}</option>
          <option value="HINTS_ONLY">{tStatus("HINTS_ONLY")}</option>
          <option value="GUIDANCE">{tStatus("GUIDANCE")}</option>
          <option value="FULL_TUTORING">{tStatus("FULL_TUTORING")}</option>
        </select>
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? lt.common.creating : lt.teacher.createAssignment}
      </Button>
    </form>
  );
}
