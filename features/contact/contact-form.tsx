"use client";

import { useActionState } from "react";
import { submitContactForm, type ContactFormState } from "@/features/contact/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/components/ui/utils";
import { lt } from "@/lib/i18n";

const initialState: ContactFormState = {};

export function ContactForm() {
  const [state, formAction, pending] = useActionState(submitContactForm, initialState);
  const p = lt.public;

  if (state.success) {
    return (
      <div className="rounded-le border border-green-200 bg-green-50 p-6 text-center">
        <p className="font-medium text-green-800">{p.thankYou}</p>
        <p className="mt-2 text-sm text-green-700">{p.thankYouDesc}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      {state.error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">{p.fullName}</Label>
          <Input id="name" name="name" required placeholder={p.namePlaceholder} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">{lt.common.email}</Label>
          <Input id="email" name="email" type="email" required placeholder={p.emailPlaceholder} />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="organization">{p.organization}</Label>
          <Input id="organization" name="organization" placeholder={p.orgPlaceholder} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">{p.yourRole}</Label>
          <select
            id="role"
            name="role"
            className={cn(
              "flex h-10 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1"
            )}
          >
            <option value="">{p.selectRole}</option>
            <option value="student">{p.roleStudent}</option>
            <option value="teacher">{p.roleTeacher}</option>
            <option value="school_admin">{p.roleSchoolAdmin}</option>
            <option value="other">{p.roleOther}</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">{p.message}</Label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          placeholder={p.messagePlaceholder}
          className={cn(
            "flex w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm",
            "placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2",
            "focus-visible:ring-brand-500 focus-visible:ring-offset-1"
          )}
        />
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? lt.common.sending : p.sendMessage}
      </Button>
    </form>
  );
}
