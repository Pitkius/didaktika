import { requireSuperAdmin } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/app-sidebar";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { featureFlags } from "@/config/feature-flags";
import { lt, tStatus } from "@/lib/i18n";

export default async function AdminHealthPage() {
  const session = await requireSuperAdmin();
  const a = lt.admin;

  const [userCount, errorLogs, recentAudit] = await Promise.all([
    db.user.count(),
    db.auditLog.count({ where: { action: { contains: "ERROR" } } }),
    db.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
  ]);

  let dbHealthy = false;
  try {
    await db.$queryRaw`SELECT 1`;
    dbHealthy = true;
  } catch {
    dbHealthy = false;
  }

  const checks = [
    {
      name: a.database,
      status: dbHealthy ? "healthy" : "missing",
      label: dbHealthy ? a.healthy : a.missing,
      detail: a.usersInDatabase.replace("{count}", String(userCount)),
    },
    {
      name: a.aiProvider,
      status: process.env.AI_PROVIDER === "openai" ? "openai" : "mock",
      label: process.env.AI_PROVIDER === "openai" ? "openai" : a.mock,
      detail: process.env.AI_PROVIDER ?? "mock",
    },
    {
      name: a.authentication,
      status: process.env.AUTH_SECRET ? "configured" : "missing",
      label: process.env.AUTH_SECRET ? a.configured : a.missing,
      detail: process.env.AUTH_SECRET ? a.authSecretSet : a.authSecretMissing,
    },
    {
      name: a.billing,
      status: featureFlags.BILLING_ENABLED ? "enabled" : "disabled",
      label: featureFlags.BILLING_ENABLED ? lt.common.enabled : lt.common.disabled,
      detail: featureFlags.BILLING_ENABLED ? a.stripeExpected : a.notConfigured,
    },
  ];

  return (
    <AppShell area="admin" userName={`${session.user.firstName} ${session.user.lastName}`}>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold">{a.systemHealth}</h1>
          <p className="text-neutral-500">{a.healthDesc}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {checks.map((check) => (
            <Card key={check.name}>
              <CardContent className="flex items-center justify-between pt-6">
                <div>
                  <p className="font-medium">{check.name}</p>
                  <p className="text-sm text-neutral-500">{check.detail}</p>
                </div>
                <Badge variant={check.status === "healthy" || check.status === "configured" || check.status === "mock" ? "success" : check.status === "missing" ? "danger" : "secondary"}>
                  {check.label}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base">{a.recentActivity}</CardTitle></CardHeader>
          <CardContent>
            {recentAudit.length === 0 ? (
              <p className="text-sm text-neutral-500">{a.noAuditEvents}</p>
            ) : (
              <ul className="divide-y divide-neutral-200 text-sm">
                {recentAudit.map((log) => (
                  <li key={log.id} className="flex justify-between py-2">
                    <span>{tStatus(log.action)}</span>
                    <span className="text-neutral-400">{new Date(log.createdAt).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-4 text-xs text-neutral-400">
              {a.errorLogLine.replace("{count}", String(errorLogs))}
            </p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
