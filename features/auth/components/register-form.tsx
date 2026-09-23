"use client";

import Link from "next/link";
import { useActionState } from "react";
import { registerFormAction } from "@/features/auth/actions";
import { FormMessage } from "@/features/auth/components/form-message";
import { SubmitButton } from "@/features/auth/components/submit-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { lt } from "@/lib/i18n";

type RegisterFormProps = { inviteToken?: string };

export function RegisterForm({ inviteToken }: RegisterFormProps) {
  const [state, formAction] = useActionState(registerFormAction, null);
  const isInvite = Boolean(inviteToken);
  const a = lt.auth;
  const kept = state?.fields;

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl">{isInvite ? a.acceptInvitation : a.signUpTitle}</CardTitle>
        <CardDescription>{isInvite ? a.inviteDesc : a.signUpDesc}</CardDescription>
      </CardHeader>
      <CardContent>
        {isInvite && (
          <div className="mb-4 rounded-md border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-900">
            {a.inviteBanner}
          </div>
        )}
        <form action={formAction} className="space-y-4">
          <FormMessage state={state} />
          {inviteToken && <input type="hidden" name="inviteToken" value={inviteToken} />}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">{a.firstName}</Label>
              <Input
                id="firstName"
                name="firstName"
                autoComplete="given-name"
                defaultValue={kept?.firstName ?? ""}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">{a.lastName}</Label>
              <Input
                id="lastName"
                name="lastName"
                autoComplete="family-name"
                defaultValue={kept?.lastName ?? ""}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{lt.common.email}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="jusu@mokykla.lt"
              defaultValue={kept?.email ?? ""}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gradeLevel">{lt.student.gradeLevel}</Label>
            <select
              id="gradeLevel"
              name="gradeLevel"
              key={kept?.gradeLevel ?? "empty"}
              required={!isInvite}
              defaultValue={kept?.gradeLevel ?? ""}
              className="flex h-10 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              <option value="" disabled>
                {a.selectGrade}
              </option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((g) => (
                <option key={g} value={g}>
                  {lt.student.gradeWithLevel.replace("{level}", String(g))}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{lt.common.password}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              defaultValue={kept?.password ?? ""}
              required
            />
            <p className="text-xs text-neutral-500">{a.passwordHint}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{a.confirmPassword}</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              defaultValue={kept?.confirmPassword ?? ""}
              required
            />
          </div>
          <SubmitButton>{isInvite ? a.joinSchool : a.signUp}</SubmitButton>
        </form>
        <p className="mt-6 text-center text-sm text-neutral-500">
          {a.hasAccount}{" "}
          <Link href="/login" className="font-medium text-brand-600 hover:underline">
            {a.signIn}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
