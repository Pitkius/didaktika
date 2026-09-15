"use server";

import { revalidatePath } from "next/cache";
import type { SubscriptionPlan } from "@prisma/client";
import { requireAuth, requireSuperAdmin } from "@/lib/auth/session";
import { licenseKeyService } from "@/services/license/license-key-service";
import { PLAN_DEFINITIONS } from "@/config/plans";
import { lt } from "@/lib/i18n";

const redeemablePlans = PLAN_DEFINITIONS.map((p) => p.code).filter(
  (code) => code !== "FREE"
) as SubscriptionPlan[];

export async function generateLicenseKeysAction(formData: FormData): Promise<void> {
  const session = await requireSuperAdmin();
  const plan = String(formData.get("plan") ?? "") as SubscriptionPlan;
  const count = Number(formData.get("count") ?? 1);
  const durationRaw = String(formData.get("durationDays") ?? "").trim();
  const maxRedemptions = Number(formData.get("maxRedemptions") ?? 1);
  const note = String(formData.get("note") ?? "").trim();
  const expiresRaw = String(formData.get("expiresAt") ?? "").trim();

  if (!redeemablePlans.includes(plan)) {
    revalidatePath("/admin/keys");
    return;
  }

  const durationDays = durationRaw ? Number(durationRaw) : null;
  const expiresAt = expiresRaw ? new Date(expiresRaw) : null;

  await licenseKeyService.generateKeys({
    plan,
    count: Number.isFinite(count) ? count : 1,
    durationDays: durationDays && Number.isFinite(durationDays) ? durationDays : null,
    maxRedemptions: Number.isFinite(maxRedemptions) ? maxRedemptions : 1,
    note: note || undefined,
    expiresAt: expiresAt && !Number.isNaN(expiresAt.getTime()) ? expiresAt : null,
    createdById: session.user.id,
  });

  revalidatePath("/admin/keys");
}

export async function revokeLicenseKeyAction(formData: FormData): Promise<void> {
  const session = await requireSuperAdmin();
  const keyId = String(formData.get("keyId") ?? "");
  if (!keyId) return;
  await licenseKeyService.revokeKey(keyId, session.user.id);
  revalidatePath("/admin/keys");
}

export async function redeemLicenseKeyAction(
  _prev: { error?: string; success?: string } | null,
  formData: FormData
): Promise<{ error?: string; success?: string }> {
  const session = await requireAuth();
  const code = String(formData.get("code") ?? "");
  const returnPath = String(formData.get("returnPath") ?? "/student/billing");

  const result = await licenseKeyService.redeem({
    code,
    userId: session.user.id,
    role: session.user.role,
    schoolId: session.user.schoolId,
  });

  if ("error" in result && result.error) {
    return { error: result.error };
  }

  if ("success" in result && result.success) {
    revalidatePath(returnPath);
    revalidatePath("/student/billing");
    revalidatePath("/teacher/billing");
    revalidatePath("/school-admin/billing");
    const until = result.endsAt
      ? ` iki ${result.endsAt.toLocaleDateString("lt-LT")}`
      : "";
    return {
      success: lt.billing.keyRedeemed
        .replace("{plan}", result.planName)
        .replace("{until}", until),
    };
  }

  return { error: lt.common.error };
}
