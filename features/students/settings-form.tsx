"use client";

import { useActionState } from "react";
import { updateStudentSettingsAction } from "@/features/students/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { lt } from "@/lib/i18n";

interface StudentSettingsFormProps {
  firstName: string;
  lastName: string;
  email: string;
  gradeLevel: number | null;
}

export function StudentSettingsForm({
  firstName,
  lastName,
  email,
  gradeLevel,
}: StudentSettingsFormProps) {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      const result = await updateStudentSettingsAction(formData);
      if (result?.error) return { error: result.error };
      if (result?.success) return { success: true };
      return null;
    },
    null
  );

  return (
    <form action={action} className="max-w-md space-y-4">
      {state?.error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{state.error}</div>
      )}
      {state?.success && (
        <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">
          {lt.student.settingsSaved}
        </div>
      )}
      <div>
        <Label htmlFor="firstName">{lt.auth.firstName}</Label>
        <Input id="firstName" name="firstName" defaultValue={firstName} required className="mt-1" />
      </div>
      <div>
        <Label htmlFor="lastName">{lt.auth.lastName}</Label>
        <Input id="lastName" name="lastName" defaultValue={lastName} required className="mt-1" />
      </div>
      <div>
        <Label htmlFor="email">{lt.common.email}</Label>
        <Input id="email" value={email} disabled className="mt-1 bg-neutral-50" />
      </div>
      <div>
        <Label htmlFor="gradeLevel">{lt.student.gradeLevel}</Label>
        <Input
          id="gradeLevel"
          name="gradeLevel"
          type="number"
          min={1}
          max={12}
          defaultValue={gradeLevel ?? ""}
          className="mt-1"
        />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? lt.common.saving : lt.student.saveChanges}
      </Button>
    </form>
  );
}
