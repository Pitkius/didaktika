"use client";

import { useActionState } from "react";
import { joinClassByCodeAction } from "@/features/students/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { lt } from "@/lib/i18n";

export function JoinClassForm() {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      const result = await joinClassByCodeAction(formData);
      if (result.error) return { error: result.error };
      return { success: true };
    },
    null
  );

  return (
    <form action={action} className="flex flex-wrap items-end gap-3">
      <div className="min-w-[16rem] flex-1">
        <p className="text-sm font-medium">{lt.student.joinClass}</p>
        <p className="mb-2 text-xs text-neutral-500">{lt.student.joinClassHint}</p>
        <Input name="code" required autoComplete="off" />
      </div>
      <Button type="submit" disabled={pending}>
        {lt.student.joinClass}
      </Button>
      {state?.error && <p className="w-full text-sm text-red-700">{state.error}</p>}
      {state?.success && <p className="w-full text-sm text-green-700">{lt.student.classJoined}</p>}
    </form>
  );
}
