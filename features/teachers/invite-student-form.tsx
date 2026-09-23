"use client";

import { useActionState } from "react";
import { inviteStudentAction } from "@/features/teachers/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { lt } from "@/lib/i18n";

export function InviteStudentForm({ classId }: { classId: string }) {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      const result = await inviteStudentAction({
        email: String(formData.get("email") ?? ""),
        classId,
      });
      if (result.error) return { error: result.error };
      return { success: true };
    },
    null
  );

  return (
    <form action={action} className="mt-4 flex flex-wrap items-end gap-3">
      <div className="min-w-[16rem] flex-1">
        <p className="mb-1 text-sm font-medium">{lt.teacher.inviteEmail}</p>
        <Input name="email" type="email" required />
      </div>
      <Button type="submit" disabled={pending}>
        {lt.teacher.inviteEmail}
      </Button>
      {state?.error && <p className="w-full text-sm text-red-700">{state.error}</p>}
      {state?.success && <p className="w-full text-sm text-green-700">{lt.teacher.inviteSent}</p>}
    </form>
  );
}
