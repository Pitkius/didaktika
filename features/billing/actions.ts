"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { SubscriptionPlan } from "@prisma/client";
import { requireAuth } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { billingService } from "@/services/billing/billing-service";
import { PLAN_DEFINITIONS } from "@/config/plans";

export async function startCheckoutAction(formData: FormData): Promise<void> {
  const session = await requireAuth();
  const plan = String(formData.get("plan") ?? "") as SubscriptionPlan;
  const returnPath = String(formData.get("returnPath") ?? "/student/billing");

  if (!PLAN_DEFINITIONS.some((p) => p.code === plan)) {
    redirect(`${returnPath}?error=plan`);
  }

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user?.email) {
    redirect(`${returnPath}?error=email`);
  }

  const role = session.user.role;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const checkout = await billingService.startCheckout({
    plan,
    email: user.email,
    userId: role === "SCHOOL_ADMIN" ? undefined : session.user.id,
    schoolId: session.user.schoolId ?? undefined,
    successUrl: `${appUrl}${returnPath}?upgraded=1`,
    cancelUrl: `${appUrl}${returnPath}?canceled=1`,
  });

  revalidatePath(returnPath);
  redirect(checkout.url);
}
