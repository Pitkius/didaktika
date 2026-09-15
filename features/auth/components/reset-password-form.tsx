"use client";

import Link from "next/link";
import { useActionState } from "react";
import { resetPasswordFormAction } from "@/features/auth/actions";
import { FormMessage } from "@/features/auth/components/form-message";
import { SubmitButton } from "@/features/auth/components/submit-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { lt } from "@/lib/i18n";

type ResetPasswordFormProps = { token: string };

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [state, formAction] = useActionState(resetPasswordFormAction, null);
  const a = lt.auth;

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl">{a.resetPasswordTitle}</CardTitle>
        <CardDescription>{a.resetPasswordDesc}</CardDescription>
      </CardHeader>
      <CardContent>
        {state?.success ? (
          <div className="space-y-4">
            <div role="status" className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {state.message ?? a.passwordResetSuccess}
            </div>
            <Link href="/login" className="inline-flex h-10 w-full items-center justify-center rounded-md bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700">
              {a.signIn}
            </Link>
          </div>
        ) : (
          <>
            <form action={formAction} className="space-y-4">
              <FormMessage state={state} />
              <input type="hidden" name="token" value={token} />
              <div className="space-y-2">
                <Label htmlFor="password">{a.newPassword}</Label>
                <Input id="password" name="password" type="password" autoComplete="new-password" required />
                <p className="text-xs text-neutral-500">{a.passwordHint}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{a.confirmNewPassword}</Label>
                <Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required />
              </div>
              <SubmitButton>{a.resetPassword}</SubmitButton>
            </form>
            <p className="mt-6 text-center text-sm text-neutral-500">
              <Link href="/login" className="font-medium text-brand-600 hover:underline">{a.backToLogin}</Link>
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
