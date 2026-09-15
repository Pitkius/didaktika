"use client";

import { useActionState } from "react";
import { createSubjectAction } from "@/features/school-admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { lt } from "@/lib/i18n";

export function CreateSubjectForm() {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      const result = await createSubjectAction(formData);
      if (result?.error) return { error: result.error };
      if (result?.success) return { success: true };
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
          {lt.schoolAdmin.subjectCreated}
        </div>
      )}
      <div>
        <Label htmlFor="name">{lt.common.name}</Label>
        <Input id="name" name="name" required className="mt-1" />
      </div>
      <div>
        <Label htmlFor="code">{lt.common.code}</Label>
        <Input id="code" name="code" required placeholder="MATH" className="mt-1" />
      </div>
      <div>
        <Label htmlFor="description">{lt.common.description}</Label>
        <Input id="description" name="description" className="mt-1" />
      </div>
      <div>
        <Label htmlFor="color">{lt.common.color}</Label>
        <Input id="color" name="color" type="color" defaultValue="#2563eb" className="mt-1 h-10 w-16" />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? lt.common.creating : lt.schoolAdmin.addSubject}
      </Button>
    </form>
  );
}
