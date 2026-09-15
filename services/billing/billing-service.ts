import { db } from "@/lib/db";
import { getPlanDefinition } from "@/config/plans";
import { getBillingProvider } from "@/services/billing/providers";
import { featureFlags } from "@/config/feature-flags";
import type { SubscriptionPlan } from "@prisma/client";

export class BillingService {
  private provider = getBillingProvider();

  isConfigured(): boolean {
    return featureFlags.BILLING_ENABLED && this.provider.name === "stripe"
      ? this.provider.isConfigured()
      : featureFlags.BILLING_ENABLED;
  }

  usesMockProvider() {
    return this.provider.name === "mock";
  }

  async getSchoolSubscription(schoolId: string) {
    return db.subscription.findFirst({
      where: { schoolId, status: { in: ["ACTIVE", "TRIALING"] } },
      include: { events: { orderBy: { createdAt: "desc" }, take: 5 } },
    });
  }

  async getUserSubscription(userId: string) {
    return db.subscription.findFirst({
      where: { userId, status: { in: ["ACTIVE", "TRIALING"] } },
      include: { events: { orderBy: { createdAt: "desc" }, take: 5 } },
    });
  }

  async createSubscription(params: {
    plan: SubscriptionPlan;
    schoolId?: string;
    userId?: string;
    endsAt?: Date | null;
    eventType?: string;
    metadata?: Record<string, unknown>;
  }) {
    const def = getPlanDefinition(params.plan);
    const now = new Date();
    return db.subscription.create({
      data: {
        schoolId: params.schoolId,
        userId: params.userId,
        plan: params.plan,
        seatsLimit: def.seatsLimit ?? 10000,
        status: "ACTIVE",
        startsAt: now,
        currentPeriodStart: now,
        currentPeriodEnd: params.endsAt ?? null,
        endsAt: params.endsAt ?? null,
        events: {
          create: {
            eventType: params.eventType ?? "SUBSCRIPTION_CREATED",
            metadata: { plan: params.plan, ...(params.metadata ?? {}) },
          },
        },
      },
    });
  }

  async startCheckout(params: {
    plan: SubscriptionPlan;
    email: string;
    userId?: string;
    schoolId?: string;
    successUrl: string;
    cancelUrl: string;
  }) {
    const session = await this.provider.createCheckoutSession({
      plan: params.plan,
      customerEmail: params.email,
      successUrl: params.successUrl,
      cancelUrl: params.cancelUrl,
      metadata: {
        userId: params.userId ?? "",
        schoolId: params.schoolId ?? "",
        plan: params.plan,
      },
    });

    if (this.provider.name === "mock") {
      await this.applyPlanChange({
        plan: params.plan,
        userId: params.userId,
        schoolId: params.schoolId,
        eventType: "MOCK_CHECKOUT_COMPLETED",
      });
    }

    return session;
  }

  async applyPlanChange(params: {
    plan: SubscriptionPlan;
    userId?: string;
    schoolId?: string;
    eventType?: string;
    endsAt?: Date | null;
    metadata?: Record<string, unknown>;
  }) {
    const def = getPlanDefinition(params.plan);
    const existing = params.schoolId
      ? await this.getSchoolSubscription(params.schoolId)
      : params.userId
        ? await this.getUserSubscription(params.userId)
        : null;

    const now = new Date();

    if (existing) {
      return db.subscription.update({
        where: { id: existing.id },
        data: {
          plan: params.plan,
          seatsLimit: def.seatsLimit ?? existing.seatsLimit,
          status: "ACTIVE",
          currentPeriodStart: now,
          currentPeriodEnd: params.endsAt === undefined ? existing.currentPeriodEnd : params.endsAt,
          endsAt: params.endsAt === undefined ? existing.endsAt : params.endsAt,
          events: {
            create: {
              eventType: params.eventType ?? "PLAN_CHANGED",
              metadata: { plan: params.plan, ...(params.metadata ?? {}) },
            },
          },
        },
      });
    }

    return this.createSubscription({
      plan: params.plan,
      userId: params.userId,
      schoolId: params.schoolId,
      endsAt: params.endsAt,
      eventType: params.eventType,
      metadata: params.metadata,
    });
  }

  getPlanFeatures(plan: SubscriptionPlan) {
    return getPlanDefinition(plan);
  }
}

export const billingService = new BillingService();
