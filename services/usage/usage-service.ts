import { db } from "@/lib/db";
import type { Prisma, UsageMetric } from "@prisma/client";

function currentPeriod() {
  const now = new Date();
  const periodStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const periodEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  return { periodStart, periodEnd };
}

export class UsageService {
  async getUsage(userId: string, metric: UsageMetric): Promise<number> {
    const { periodStart } = currentPeriod();
    const record = await db.usageRecord.findUnique({
      where: {
        userId_metric_periodStart: { userId, metric, periodStart },
      },
    });
    return record?.quantity ?? 0;
  }

  async increment(
    userId: string,
    metric: UsageMetric,
    quantity = 1,
    schoolId?: string | null
  ): Promise<number> {
    const { periodStart, periodEnd } = currentPeriod();
    const record = await db.usageRecord.upsert({
      where: {
        userId_metric_periodStart: { userId, metric, periodStart },
      },
      update: { quantity: { increment: quantity } },
      create: {
        userId,
        schoolId: schoolId ?? undefined,
        metric,
        quantity,
        periodStart,
        periodEnd,
      },
    });
    return record.quantity;
  }

  async getPeriodBounds() {
    return currentPeriod();
  }

  async consume(
    userId: string,
    metric: UsageMetric,
    quantity: number,
    limit: number,
    schoolId?: string | null
  ): Promise<{ ok: boolean; used: number }> {
    const unlimited = limit >= 1_000_000;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        return await db.$transaction(
          async (tx) => this.consumeOnce(tx, userId, metric, quantity, limit, unlimited, schoolId),
          { isolationLevel: "Serializable" }
        );
      } catch (error) {
        const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
        if (code === "P2034" && attempt < 2) continue;
        throw error;
      }
    }
    return { ok: false, used: await this.getUsage(userId, metric) };
  }

  private async consumeOnce(
    tx: Prisma.TransactionClient,
    userId: string,
    metric: UsageMetric,
    quantity: number,
    limit: number,
    unlimited: boolean,
    schoolId?: string | null
  ) {
    const { periodStart, periodEnd } = currentPeriod();
    const existing = await tx.usageRecord.findUnique({
      where: { userId_metric_periodStart: { userId, metric, periodStart } },
    });
    const used = existing?.quantity ?? 0;
    if (!unlimited && (limit <= 0 || used + quantity > limit)) {
      return { ok: false, used };
    }
    const record = await tx.usageRecord.upsert({
      where: { userId_metric_periodStart: { userId, metric, periodStart } },
      update: { quantity: { increment: quantity } },
      create: {
        userId,
        schoolId: schoolId ?? undefined,
        metric,
        quantity,
        periodStart,
        periodEnd,
      },
    });
    return { ok: true, used: record.quantity };
  }
}

export const usageService = new UsageService();
