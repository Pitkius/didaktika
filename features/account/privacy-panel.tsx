"use client";

import { useActionState } from "react";
import { deleteOwnAccountAction } from "@/features/account/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { lt } from "@/lib/i18n";

export function PrivacyPanel() {
  const [state, action, pending] = useActionState(deleteOwnAccountAction, null);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold">{lt.account.privacyTitle}</h2>
        <p className="text-sm text-neutral-500">{lt.account.privacyDesc}</p>
      </div>
      <Button asChild variant="outline">
        <a href="/api/account/export">{lt.account.export}</a>
      </Button>
      <form action={action} className="max-w-md space-y-3">
        {state?.error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{state.error}</div>
        )}
        <p className="text-sm text-neutral-600">{lt.account.deleteHint}</p>
        <div>
          <Label htmlFor="account-password">{lt.common.password}</Label>
          <Input id="account-password" name="password" type="password" required className="mt-1" />
        </div>
        <div>
          <Label htmlFor="account-confirm">{lt.account.confirmPhrase}</Label>
          <Input id="account-confirm" name="confirm" required className="mt-1" />
        </div>
        <Button type="submit" variant="outline" disabled={pending}>
          {lt.account.deleteButton}
        </Button>
      </form>
    </div>
  );
}
