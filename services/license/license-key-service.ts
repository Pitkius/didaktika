import { createHash, randomBytes } from "crypto";
import type { SubscriptionPlan, UserRole } from "@prisma/client";
import { db } from "@/lib/db";
import { billingService } from "@/services/billing/billing-service";
import { getPlanDefinition } from "@/config/plans";

const PLAN_PREFIX: Record<SubscriptionPlan, string> = {
  FREE: "FREE",
  PLUS: "PLUS",
  PRO: "PRO",
  TEACHER: "TCHR",
  SMALL_SCHOOL: "SMLS",
  SCHOOL: "SCHL",
  SCHOOL_PLUS: "SCHP",
  ENTERPRISE: "ENTR",
};

const SCHOOL_PLANS: SubscriptionPlan[] = [
  "SMALL_SCHOOL",
  "SCHOOL",
  "SCHOOL_PLUS",
  "ENTERPRISE",
];
const TEACHER_PLANS: SubscriptionPlan[] = ["TEACHER"];
const INDIVIDUAL_PLANS: SubscriptionPlan[] = ["PLUS", "PRO", "FREE"];

export function normalizeLicenseCode(raw: string) {
  return raw.trim().toUpperCase().replace(/\s+/g, "");
}

export function generateLicenseCode(plan: SubscriptionPlan) {
  const chunk = () => randomBytes(2).toString("hex").toUpperCase();
  return `DIDAK-${PLAN_PREFIX[plan]}-${chunk()}-${chunk()}`;
}

function endsAtFromDuration(durationDays: number | null | undefined) {
  if (durationDays == null || durationDays <= 0) return null;
  return new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);
}

export class LicenseKeyService {
  async generateKeys(params: {
    plan: SubscriptionPlan;
    count: number;
    durationDays?: number | null;
    maxRedemptions?: number;
    note?: string;
    expiresAt?: Date | null;
    createdById: string;
  }) {
    const count = Math.min(Math.max(params.count, 1), 50);
    const maxRedemptions = Math.min(Math.max(params.maxRedemptions ?? 1, 1), 10000);
    const codes: string[] = [];

    for (let i = 0; i < count; i++) {
      let code = generateLicenseCode(params.plan);
      // rare collision retry
      for (let attempt = 0; attempt < 5; attempt++) {
        const exists = await db.licenseKey.findUnique({ where: { code } });
        if (!exists) break;
        code = generateLicenseCode(params.plan);
      }
      await db.licenseKey.create({
        data: {
          code,
          plan: params.plan,
          durationDays: params.durationDays ?? null,
          maxRedemptions,
          note: params.note || null,
          expiresAt: params.expiresAt ?? null,
          createdById: params.createdById,
        },
      });
      codes.push(code);
    }

    await db.auditLog.create({
      data: {
        actorId: params.createdById,
        action: "LICENSE_KEYS_GENERATED",
        targetType: "LicenseKey",
        metadata: {
          plan: params.plan,
          count,
          maxRedemptions,
          durationDays: params.durationDays ?? null,
        },
      },
    });

    return codes;
  }

  async revokeKey(keyId: string, actorId: string) {
    const key = await db.licenseKey.update({
      where: { id: keyId },
      data: { status: "REVOKED" },
    });
    await db.auditLog.create({
      data: {
        actorId,
        action: "LICENSE_KEY_REVOKED",
        targetType: "LicenseKey",
        targetId: keyId,
        metadata: { code: key.code, plan: key.plan },
      },
    });
    return key;
  }

  assertRoleCanRedeem(plan: SubscriptionPlan, role: UserRole, schoolId?: string | null) {
    if (SCHOOL_PLANS.includes(plan)) {
      if (role !== "SCHOOL_ADMIN" && role !== "SUPER_ADMIN") {
        return "Mokyklos planų raktus gali aktyvuoti tik mokyklos administratorius.";
      }
      if (!schoolId && role === "SCHOOL_ADMIN") {
        return "Paskyra nepriskirta mokyklai.";
      }
      return null;
    }
    if (TEACHER_PLANS.includes(plan)) {
      if (role !== "TEACHER" && role !== "SCHOOL_ADMIN" && role !== "SUPER_ADMIN") {
        return "Mokytojo planų raktus gali aktyvuoti tik mokytojas.";
      }
      return null;
    }
    if (INDIVIDUAL_PLANS.includes(plan)) {
      if (role !== "STUDENT") {
        return "Individualių planų raktus gali aktyvuoti tik mokiniai.";
      }
      return null;
    }
    return "Šio raktų plano negalima aktyvuoti.";
  }

  async redeem(params: {
    code: string;
    userId: string;
    role: UserRole;
    schoolId?: string | null;
  }) {
    const code = normalizeLicenseCode(params.code);
    if (!code) {
      return { error: "Įveskite raktą." as const };
    }

    const key = await db.licenseKey.findUnique({ where: { code } });
    if (!key) return { error: "Raktas nerastas." as const };

    if (key.status === "REVOKED") return { error: "Raktas atšauktas." as const };
    if (key.status === "EXHAUSTED") return { error: "Raktas jau panaudotas." as const };
    if (key.expiresAt && key.expiresAt < new Date()) {
      await db.licenseKey.update({
        where: { id: key.id },
        data: { status: "EXPIRED" },
      });
      return { error: "Raktas nebegalioja." as const };
    }
    if (key.status !== "ACTIVE") return { error: "Raktas nebegalioja." as const };
    if (key.redemptionCount >= key.maxRedemptions) {
      await db.licenseKey.update({
        where: { id: key.id },
        data: { status: "EXHAUSTED" },
      });
      return { error: "Raktas jau panaudotas." as const };
    }

    const already = await db.licenseKeyRedemption.findUnique({
      where: { keyId_userId: { keyId: key.id, userId: params.userId } },
    });
    if (already) return { error: "Šį raktą jau aktyvavote." as const };

    const roleError = this.assertRoleCanRedeem(key.plan, params.role, params.schoolId);
    if (roleError) return { error: roleError };

    const applyToSchool = SCHOOL_PLANS.includes(key.plan);
    const schoolId = applyToSchool ? params.schoolId ?? undefined : undefined;
    const userId = applyToSchool ? undefined : params.userId;
    const endsAt = endsAtFromDuration(key.durationDays);

    try {
      return await db.$transaction(async (tx) => {
        const claimed = await tx.licenseKey.updateMany({
          where: {
            id: key.id,
            status: "ACTIVE",
            redemptionCount: { lt: key.maxRedemptions },
          },
          data: { redemptionCount: { increment: 1 } },
        });
        if (claimed.count !== 1) return { error: "Raktas jau panaudotas." as const };

        const fresh = await tx.licenseKey.findUnique({ where: { id: key.id } });
        if (fresh && fresh.redemptionCount >= fresh.maxRedemptions) {
          await tx.licenseKey.update({ where: { id: key.id }, data: { status: "EXHAUSTED" } });
        }

        const subscription = await billingService.applyPlanChange(
          {
            plan: key.plan,
            userId,
            schoolId,
            eventType: "LICENSE_KEY_REDEEMED",
            endsAt,
            metadata: {
              licenseKeyId: key.id,
              codeHash: createHash("sha256").update(code).digest("hex").slice(0, 16),
            },
          },
          tx
        );

        const redemption = await tx.licenseKeyRedemption.create({
          data: {
            keyId: key.id,
            userId: params.userId,
            schoolId: schoolId ?? params.schoolId ?? null,
            subscriptionId: subscription.id,
          },
        });

        await tx.auditLog.create({
          data: {
            actorId: params.userId,
            action: "LICENSE_KEY_REDEEMED",
            targetType: "LicenseKey",
            targetId: key.id,
            schoolId: schoolId ?? params.schoolId ?? null,
            metadata: {
              plan: key.plan,
              subscriptionId: subscription.id,
              redemptionId: redemption.id,
            },
          },
        });

        const plan = getPlanDefinition(key.plan);
        return {
          success: true as const,
          plan: key.plan,
          planName: plan.name,
          endsAt,
          subscriptionId: subscription.id,
        };
      }, { isolationLevel: "Serializable" });
    } catch (error) {
      const codeName = typeof error === "object" && error && "code" in error ? String(error.code) : "";
      if (codeName === "P2002") return { error: "Šį raktą jau aktyvavote." as const };
      if (codeName === "P2034") return { error: "Raktas jau panaudotas." as const };
      throw error;
    }
  }

  async listKeys(take = 100) {
    return db.licenseKey.findMany({
      include: {
        createdBy: { select: { firstName: true, lastName: true, email: true } },
        _count: { select: { redemptions: true } },
      },
      orderBy: { createdAt: "desc" },
      take,
    });
  }
}

export const licenseKeyService = new LicenseKeyService();
