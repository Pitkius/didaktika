"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginFormAction } from "@/features/auth/actions";
import { FormMessage } from "@/features/auth/components/form-message";
import { SubmitButton } from "@/features/auth/components/submit-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { lt } from "@/lib/i18n";

export function LoginForm({ registered }: { registered?: boolean }) {
  const [state, formAction] = useActionState(loginFormAction, null);
  const a = lt.auth;

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl">{a.welcomeBack}</CardTitle>
        <CardDescription>{a.signInDesc}</CardDescription>
      </CardHeader>
      <CardContent>
        {registered && (
          <div role="status" className="mb-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {a.registeredSuccess}
          </div>
        )}
        <form action={formAction} className="space-y-4">
          <FormMessage state={state} />
          <div className="space-y-2">
            <Label htmlFor="email">{lt.common.email}</Label>
            <Input id="email" name="email" type="email" autoComplete="email" placeholder="jusu@mokykla.lt" required />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">{lt.common.password}</Label>
              <Link href="/forgot-password" className="text-xs text-brand-600 hover:underline">{a.forgotPassword}</Link>
            </div>
            <Input id="password" name="password" type="password" autoComplete="current-password" required />
          </div>
          <SubmitButton>{a.signIn}</SubmitButton>
        </form>
        <p className="mt-6 text-center text-sm text-neutral-500">
          {a.noAccount}{" "}
          <Link href="/register" className="font-medium text-brand-600 hover:underline">{a.signUp}</Link>
        </p>
      </CardContent>
    </Card>
  );
}
