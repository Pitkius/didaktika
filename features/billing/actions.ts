"use server";

import { redirect } from "next/navigation";
import type { SubscriptionPlan } from "@prisma/client";
import { requireAuth } from "@/lib/auth/session";
import { billingReturnPath, checkoutPlanAllowed } from "@/lib/billing/checkout-policy";

export async function startCheckoutAction(formData: FormData): Promise<void> {
  const session = await requireAuth();
  const plan = String(formData.get("plan") ?? "");
  const path = billingReturnPath(session.user.role);

  if (!checkoutPlanAllowed(session.user.role, plan as SubscriptionPlan)) {
    redirect(`${path}?error=plan`);
  }

  redirect(`${path}?error=payments`);
}
