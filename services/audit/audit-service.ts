import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export class AuditService {
  async log(params: {
    actorId?: string | null;
    action: string;
    targetType?: string;
    targetId?: string;
    schoolId?: string | null;
    metadata?: Record<string, unknown>;
    ipAddress?: string;
  }) {
    return db.auditLog.create({
      data: {
        ...params,
        metadata: params.metadata as Prisma.InputJsonValue | undefined,
        schoolId: params.schoolId ?? undefined,
      },
    });
  }

  async getLogs(params: {
    schoolId?: string;
    page?: number;
    pageSize?: number;
    action?: string;
  }) {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 20;
    const where: Record<string, unknown> = {};
    if (params.schoolId) where.schoolId = params.schoolId;
    if (params.action) where.action = params.action;

    const [items, total] = await Promise.all([
      db.auditLog.findMany({
        where,
        include: { actor: { select: { firstName: true, lastName: true, email: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.auditLog.count({ where }),
    ]);

    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }
}

export const auditService = new AuditService();
