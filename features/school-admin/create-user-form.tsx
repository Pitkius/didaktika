"use client";

import { useActionState } from "react";
import { createUserAction } from "@/features/school-admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { lt } from "@/lib/i18n";

export function CreateUserForm() {
  const [state, action, pending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      const result = await createUserAction(formData);
      if (result.error) return { error: result.error };
      return { success: true };
    },
    null
  );

  return (
    <form action={action} className="grid gap-3 sm:grid-cols-2">
      {state?.error && <p className="text-sm text-red-700 sm:col-span-2">{state.error}</p>}
      {state?.success && <p className="text-sm text-green-700 sm:col-span-2">{lt.common.save}</p>}
      <div>
        <Label htmlFor="firstName">{lt.auth.firstName}</Label>
        <Input id="firstName" name="firstName" required className="mt-1" />
      </div>
      <div>
        <Label htmlFor="lastName">{lt.auth.lastName}</Label>
        <Input id="lastName" name="lastName" required className="mt-1" />
      </div>
      <div>
        <Label htmlFor="email">{lt.common.email}</Label>
        <Input id="email" name="email" type="email" required className="mt-1" />
      </div>
      <div>
        <Label htmlFor="password">{lt.common.password}</Label>
        <Input id="password" name="password" type="password" required className="mt-1" />
      </div>
      <div>
        <Label htmlFor="role">{lt.auth.role}</Label>
        <select id="role" name="role" className="mt-1 flex h-10 w-full rounded-md border border-neutral-300 px-3 text-sm" defaultValue="STUDENT">
          <option value="STUDENT">{lt.auth.roleStudent}</option>
          <option value="TEACHER">{lt.auth.roleTeacher}</option>
        </select>
      </div>
      <div className="flex items-end">
        <Button type="submit" disabled={pending}>{lt.common.create}</Button>
      </div>
    </form>
  );
}
