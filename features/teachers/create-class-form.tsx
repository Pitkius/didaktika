"use client";

import { useActionState } from "react";
import { createClassAction } from "@/features/teachers/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { lt } from "@/lib/i18n";

interface CreateClassFormProps {
  subjects: Array<{ id: string; name: string }>;
}

export function CreateClassForm({ subjects }: CreateClassFormProps) {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      const result = await createClassAction(formData);
      if (result?.error) return { error: result.error };
      if (result?.success) {
        return { success: true };
      }
      return null;
    },
    null
  );

  return (
    <form action={action} className="flex flex-wrap gap-4 items-end">
      {state?.error && (
        <div className="w-full rounded-md bg-red-50 p-3 text-sm text-red-700">{state.error}</div>
      )}
      {state?.success && (
        <div className="w-full rounded-md bg-green-50 p-3 text-sm text-green-700">
          {lt.teacher.classCreated}
        </div>
      )}
      <div>
        <Label htmlFor="name">{lt.teacher.className}</Label>
        <Input id="name" name="name" required className="mt-1" />
      </div>
      <div>
        <Label htmlFor="description">{lt.common.description}</Label>
        <Input id="description" name="description" className="mt-1" />
      </div>
      <div>
        <Label htmlFor="subjectId">{lt.common.subject}</Label>
        <select
          id="subjectId"
          name="subjectId"
          className="mt-1 flex h-10 rounded-md border border-neutral-300 px-3 text-sm"
        >
          <option value="">{lt.teacher.selectSubject}</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? lt.common.creating : lt.teacher.createClass}
      </Button>
    </form>
  );
}
