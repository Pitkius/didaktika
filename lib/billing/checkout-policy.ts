import type { SubscriptionPlan, UserRole } from "@prisma/client";

const STUDENT_PLANS: SubscriptionPlan[] = ["PLUS", "PRO"];
const TEACHER_PLANS: SubscriptionPlan[] = ["TEACHER"];
const SCHOOL_PLANS: SubscriptionPlan[] = ["SMALL_SCHOOL", "SCHOOL", "SCHOOL_PLUS"];

export function checkoutPlanAllowed(role: UserRole, plan: string): plan is SubscriptionPlan {
  if (role === "STUDENT") return STUDENT_PLANS.includes(plan as SubscriptionPlan);
  if (role === "TEACHER") return TEACHER_PLANS.includes(plan as SubscriptionPlan);
  if (role === "SCHOOL_ADMIN") return SCHOOL_PLANS.includes(plan as SubscriptionPlan);
  return false;
}

export function billingReturnPath(role: UserRole): string {
  if (role === "TEACHER") return "/teacher/billing";
  if (role === "SCHOOL_ADMIN") return "/school-admin/billing";
  if (role === "SUPER_ADMIN") return "/admin/subscriptions";
  return "/student/billing";
}

/** Card checkout is intentionally closed until Stripe signature verification exists. */
export function isCheckoutAvailable(): boolean {
  return false;
}
