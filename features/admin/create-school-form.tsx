"use client";

import { useActionState } from "react";
import { createSchoolAction } from "@/features/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { lt } from "@/lib/i18n";

export function CreateSchoolForm() {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      const result = await createSchoolAction(formData);
      if (result.error) return { error: result.error };
      return { success: true };
    },
    null
  );

  return (
    <form action={action} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
      {state?.error && <p className="text-sm text-red-700 sm:col-span-3">{state.error}</p>}
      {state?.success && <p className="text-sm text-green-700 sm:col-span-3">{lt.admin.schoolCreated}</p>}
      <div>
        <Label htmlFor="school-name">{lt.admin.schoolName}</Label>
        <Input id="school-name" name="name" required className="mt-1" />
      </div>
      <div>
        <Label htmlFor="school-city">{lt.admin.schoolCity}</Label>
        <Input id="school-city" name="city" className="mt-1" />
      </div>
      <Button type="submit" disabled={pending}>
        {lt.admin.createSchool}
      </Button>
    </form>
  );
}
