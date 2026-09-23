"use client";

import { useActionState } from "react";
import { createInvitationAction } from "@/features/school-admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { lt } from "@/lib/i18n";

export function CreateInvitationForm() {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      const result = await createInvitationAction(formData);
      if (result.error) return { error: result.error };
      return { success: true };
    },
    null
  );

  return (
    <form action={action} className="mb-6 grid gap-3 sm:grid-cols-[1fr_12rem_auto] sm:items-end">
      {state?.error && <p className="text-sm text-red-700 sm:col-span-3">{state.error}</p>}
      {state?.success && <p className="text-sm text-green-700 sm:col-span-3">{lt.teacher.inviteSent}</p>}
      <div>
        <Label htmlFor="invite-email">{lt.common.email}</Label>
        <Input id="invite-email" name="email" type="email" required className="mt-1" />
      </div>
      <div>
        <Label htmlFor="invite-role">{lt.auth.role}</Label>
        <select
          id="invite-role"
          name="role"
          className="mt-1 flex h-10 w-full rounded-md border border-neutral-300 px-3 text-sm"
          defaultValue="STUDENT"
        >
          <option value="STUDENT">{lt.auth.roleStudent}</option>
          <option value="TEACHER">{lt.auth.roleTeacher}</option>
        </select>
      </div>
      <Button type="submit" disabled={pending}>
        {lt.teacher.inviteEmail}
      </Button>
    </form>
  );
}
