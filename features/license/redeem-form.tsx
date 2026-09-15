"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { redeemLicenseKeyAction } from "@/features/license/actions";
import { lt } from "@/lib/i18n";

export function RedeemLicenseKeyForm({ returnPath }: { returnPath: string }) {
  const [state, action, pending] = useActionState(redeemLicenseKeyAction, null);

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="returnPath" value={returnPath} />
      <div>
        <label htmlFor="license-code" className="mb-1 block text-sm font-medium">
          {lt.billing.redeemKey}
        </label>
        <Input
          id="license-code"
          name="code"
          placeholder={lt.billing.redeemKeyPlaceholder}
          autoComplete="off"
          required
          className="font-mono uppercase"
        />
        <p className="mt-1 text-xs text-neutral-500">{lt.billing.redeemKeyHint}</p>
      </div>
      {state?.error && (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="text-sm text-green-700" role="status">
          {state.success}
        </p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? lt.common.pleaseWait : lt.billing.activateKey}
      </Button>
    </form>
  );
}
