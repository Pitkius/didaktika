import { requireSuperAdmin } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/app-sidebar";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { lt, tStatus } from "@/lib/i18n";

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function AdminAuditLoesPage({ searchParams }: PageProps) {
  const session = await requireSuperAdmin();
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const pageSize = 40;
  const a = lt.admin;

  const [logs, total] = await Promise.all([
    db.auditLog.findMany({
      include: {
        actor: { select: { firstName: true, lastName: true, email: true } },
        school: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.auditLog.count(),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <AppShell area="admin" userName={`${session.user.firstName} ${session.user.lastName}`}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">{lt.nav.admin.auditLogs}</h1>
          <p className="text-neutral-500">{a.eventsCount.replace("{count}", String(total))}</p>
        </div>

        {logs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-neutral-500">{a.noAuditEvents}</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardContent className="p-0">
                <ul className="divide-y divide-neutral-200">
                  {logs.map((log) => (
                    <li key={log.id} className="flex items-center justify-between px-4 py-3 text-sm">
                      <div>
                        <p className="font-medium">{tStatus(log.action)}</p>
                        <p className="text-neutral-500">
                          {log.actor
                            ? `${log.actor.firstName} ${log.actor.lastName}`
                            : lt.common.system}
                          {log.school && ` · ${log.school.name}`}
                          {log.targetType && ` · ${log.targetType}`}
                        </p>
                      </div>
                      <span className="text-neutral-400">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Pagination page={page} totalPages={totalPages} basePath="/admin/audit-logs" />
          </>
        )}
      </div>
    </AppShell>
  );
}
