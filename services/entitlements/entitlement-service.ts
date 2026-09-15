import { db } from "@/lib/db";
import {
  getPlanDefinition,
  type PlanFeatureKey,
  PLAN_DEFINITIONS,
} from "@/config/plans";
import { usageService } from "@/services/usage/usage-service";
import type { SubscriptionPlan, UsageMetric, UserRole } from "@prisma/client";

export type EntitlementContext = {
  userId: string;
  role: UserRole;
  schoolId?: string | null;
};

export type EntitlementResult = {
  allowed: boolean;
  reason?: string;
  plan: SubscriptionPlan;
  limit?: number;
  used?: number;
  remaining?: number;
};

export class EntitlementService {
  async resolvePlan(ctx: EntitlementContext): Promise<SubscriptionPlan> {
    if (ctx.role === "SUPER_ADMIN") return "ENTERPRISE";

    if (ctx.role === "STUDENT" && !ctx.schoolId) {
      const personal = await db.subscription.findFirst({
        where: { userId: ctx.userId, status: { in: ["ACTIVE", "TRIALING"] } },
        orderBy: { createdAt: "desc" },
      });
      return personal?.plan ?? "FREE";
    }

    if (ctx.schoolId) {
      const schoolSub = await db.subscription.findFirst({
        where: { schoolId: ctx.schoolId, status: { in: ["ACTIVE", "TRIALING"] } },
        orderBy: { createdAt: "desc" },
      });
      if (schoolSub) return schoolSub.plan;
    }

    if (ctx.role === "TEACHER") {
      const teacherSub = await db.subscription.findFirst({
        where: { userId: ctx.userId, status: { in: ["ACTIVE", "TRIALING"] } },
        orderBy: { createdAt: "desc" },
      });
      return teacherSub?.plan ?? "TEACHER";
    }

    return ctx.role === "STUDENT" ? "FREE" : "TEACHER";
  }

  async hasFeature(ctx: EntitlementContext, feature: PlanFeatureKey): Promise<boolean> {
    const plan = await this.resolvePlan(ctx);
    const fromDb = await db.planFeature.findFirst({
      where: { plan: { code: plan }, featureKey: feature },
    });
    if (fromDb) return fromDb.enabled;
    return getPlanDefinition(plan).features.includes(feature);
  }

  async getLimit(ctx: EntitlementContext, metric: UsageMetric): Promise<number> {
    const plan = await this.resolvePlan(ctx);
    const fromDb = await db.planLimit.findFirst({
      where: { plan: { code: plan }, metric },
    });
    if (fromDb) return fromDb.limitValue;
    return getPlanDefinition(plan).limits[metric] ?? 0;
  }

  async checkUsage(
    ctx: EntitlementContext,
    metric: UsageMetric
  ): Promise<EntitlementResult> {
    const plan = await this.resolvePlan(ctx);
    const limit = await this.getLimit(ctx, metric);
    const used = await usageService.getUsage(ctx.userId, metric);
    const remaining = Math.max(0, limit - used);
    const allowed = limit === 0 ? false : used < limit || limit >= 1_000_000;

    return {
      allowed: limit >= 1_000_000 ? true : used < limit,
      reason: allowed
        ? undefined
        : limit === 0
          ? "Ši funkcija neįtraukta į jūsų planą."
          : "Pasiekėte šio mėnesio limitą.",
      plan,
      limit,
      used,
      remaining,
    };
  }

  async canUseAI(ctx: EntitlementContext) {
    if (!(await this.hasFeature(ctx, "AI_TEACHER"))) {
      return {
        allowed: false,
        reason: "DI mokytojas neįtrauktas į jūsų planą.",
        plan: await this.resolvePlan(ctx),
      } satisfies EntitlementResult;
    }
    return this.checkUsage(ctx, "AI_TEACHER_MESSAGES");
  }

  async canGenerateQuestions(ctx: EntitlementContext) {
    if (!(await this.hasFeature(ctx, "AI_GENERATOR")) && ctx.role !== "STUDENT") {
      const plan = await this.resolvePlan(ctx);
      if (!getPlanDefinition(plan).features.includes("AI_GENERATOR")) {
        return {
          allowed: false,
          reason: "DI klausimų generatorius neįtrauktas į jūsų planą.",
          plan,
        } satisfies EntitlementResult;
      }
    }
    return this.checkUsage(ctx, "AI_QUESTION_GENERATION");
  }

  async canCreateClass(ctx: EntitlementContext) {
    const allowed = await this.hasFeature(ctx, "CLASS_MANAGEMENT");
    return {
      allowed,
      reason: allowed ? undefined : "Klasių valdymas neįtrauktas į jūsų planą.",
      plan: await this.resolvePlan(ctx),
    } satisfies EntitlementResult;
  }

  async canAddStudent(ctx: EntitlementContext) {
    const plan = await this.resolvePlan(ctx);
    const def = getPlanDefinition(plan);
    if (def.seatsLimit == null) {
      return { allowed: true, plan } satisfies EntitlementResult;
    }

    const sub = ctx.schoolId
      ? await db.subscription.findFirst({
          where: { schoolId: ctx.schoolId, status: { in: ["ACTIVE", "TRIALING"] } },
        })
      : await db.subscription.findFirst({
          where: { userId: ctx.userId, status: { in: ["ACTIVE", "TRIALING"] } },
        });

    const seatsLimit = sub?.seatsLimit ?? def.seatsLimit;
    let seatsUsed = sub?.seatsUsed ?? 0;

    if (ctx.schoolId) {
      seatsUsed = await db.user.count({
        where: { schoolId: ctx.schoolId, role: "STUDENT", status: "ACTIVE" },
      });
    }

    const allowed = seatsUsed < seatsLimit;
    return {
      allowed,
      reason: allowed ? undefined : "Pasiektas mokinių vietų limitas. Atnaujinkite planą.",
      plan,
      limit: seatsLimit,
      used: seatsUsed,
      remaining: Math.max(0, seatsLimit - seatsUsed),
    } satisfies EntitlementResult;
  }

  async canUseAdvancedAnalytics(ctx: EntitlementContext) {
    const allowed = await this.hasFeature(ctx, "ADVANCED_ANALYTICS");
    return {
      allowed,
      reason: allowed ? undefined : "Išplėstinė analitika prieinama Plus / Pro / Education planuose.",
      plan: await this.resolvePlan(ctx),
    } satisfies EntitlementResult;
  }

  async canUseIntegrity(ctx: EntitlementContext) {
    const allowed = await this.hasFeature(ctx, "INTEGRITY");
    return {
      allowed,
      reason: allowed ? undefined : "Sąžiningumo stebėjimas prieinamas Education planuose.",
      plan: await this.resolvePlan(ctx),
    } satisfies EntitlementResult;
  }

  async canUseMasteryMap(ctx: EntitlementContext) {
    const allowed = await this.hasFeature(ctx, "MASTERY_MAP");
    return {
      allowed,
      reason: allowed ? undefined : "Įgūdžių žemėlapis prieinamas Plus / Pro planuose.",
      plan: await this.resolvePlan(ctx),
    } satisfies EntitlementResult;
  }

  async canUseStudyPlans(ctx: EntitlementContext) {
    if (!(await this.hasFeature(ctx, "STUDY_PLANS"))) {
      return {
        allowed: false,
        reason: "Studijų planai prieinami Plus / Pro planuose.",
        plan: await this.resolvePlan(ctx),
      } satisfies EntitlementResult;
    }
    return this.checkUsage(ctx, "AI_STUDY_PLANS");
  }

  /** Independent students (no school) use AI curriculum instead of teacher assignments. */
  isIndependentStudent(ctx: EntitlementContext): boolean {
    return ctx.role === "STUDENT" && !ctx.schoolId;
  }

  async getSelfStudyLimitsFor(ctx: EntitlementContext) {
    const { getSelfStudyLimits } = await import("@/config/self-study");
    const plan = await this.resolvePlan(ctx);
    return { plan, limits: getSelfStudyLimits(plan) };
  }

  async canUseExamSimulation(ctx: EntitlementContext) {
    const allowed = await this.hasFeature(ctx, "EXAM_SIMULATION");
    return {
      allowed,
      reason: allowed ? undefined : "Egzaminų simuliacijos prieinamos Pro plane.",
      plan: await this.resolvePlan(ctx),
    } satisfies EntitlementResult;
  }

  async canUseSSO(ctx: EntitlementContext) {
    const allowed = await this.hasFeature(ctx, "SSO");
    return {
      allowed,
      reason: allowed ? undefined : "SSO prieinamas Mokykla / Įstaiga planuose.",
      plan: await this.resolvePlan(ctx),
    } satisfies EntitlementResult;
  }

  async getUsageSummary(ctx: EntitlementContext) {
    const plan = await this.resolvePlan(ctx);
    const metrics: UsageMetric[] = [
      "AI_TEACHER_MESSAGES",
      "AI_QUESTION_GENERATION",
      "AI_STUDY_PLANS",
    ];
    const items = await Promise.all(
      metrics.map(async (metric) => {
        const limit = await this.getLimit(ctx, metric);
        const used = await usageService.getUsage(ctx.userId, metric);
        return { metric, used, limit, remaining: Math.max(0, limit - used) };
      })
    );
    return { plan, items };
  }
}

export async function ensurePlansSeeded() {
  for (const def of PLAN_DEFINITIONS) {
    const plan = await db.plan.upsert({
      where: { code: def.code },
      update: {
        name: def.name,
        audience: def.audience,
        priceCents: def.priceCents,
        seatsLimit: def.seatsLimit,
        description: def.description,
        sortOrder: def.sortOrder,
      },
      create: {
        code: def.code,
        name: def.name,
        audience: def.audience,
        priceCents: def.priceCents,
        seatsLimit: def.seatsLimit,
        description: def.description,
        sortOrder: def.sortOrder,
      },
    });

    for (const featureKey of def.features) {
      await db.planFeature.upsert({
        where: { planId_featureKey: { planId: plan.id, featureKey } },
        update: { enabled: true },
        create: { planId: plan.id, featureKey, enabled: true },
      });
    }

    for (const [metric, limitValue] of Object.entries(def.limits) as [UsageMetric, number][]) {
      await db.planLimit.upsert({
        where: { planId_metric: { planId: plan.id, metric } },
        update: { limitValue },
        create: { planId: plan.id, metric, limitValue },
      });
    }
  }
}

export const entitlementService = new EntitlementService();
