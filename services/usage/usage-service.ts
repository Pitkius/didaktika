import { db } from "@/lib/db";
import type { UsageMetric } from "@prisma/client";

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
}

export const usageService = new UsageService();
