"use client";

import Link from "next/link";
import { useActionState } from "react";
import { forgotPasswordFormAction } from "@/features/auth/actions";
import { FormMessage } from "@/features/auth/components/form-message";
import { SubmitButton } from "@/features/auth/components/submit-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { lt } from "@/lib/i18n";

export function ForgotPasswordForm() {
  const [state, formAction] = useActionState(forgotPasswordFormAction, null);
  const a = lt.auth;

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl">{a.forgotPasswordTitle}</CardTitle>
        <CardDescription>{a.forgotPasswordDesc}</CardDescription>
      </CardHeader>
      <CardContent>
        {state?.success ? (
          <div className="space-y-4">
            <FormMessage state={state} />
            <Link href="/login" className="inline-flex h-10 w-full items-center justify-center rounded-md border border-neutral-300 bg-white px-4 text-sm font-medium hover:bg-neutral-50">
              {a.backToLogin}
            </Link>
          </div>
        ) : (
          <>
            <form action={formAction} className="space-y-4">
              <FormMessage state={state} />
              <div className="space-y-2">
                <Label htmlFor="email">{lt.common.email}</Label>
                <Input id="email" name="email" type="email" autoComplete="email" placeholder="jusu@mokykla.lt" required />
              </div>
              <SubmitButton>{a.sendResetLink}</SubmitButton>
            </form>
            <p className="mt-6 text-center text-sm text-neutral-500">
              {a.rememberPassword}{" "}
              <Link href="/login" className="font-medium text-brand-600 hover:underline">{a.signIn}</Link>
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
