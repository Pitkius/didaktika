import { requireSuperAdmin } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/app-sidebar";
import { db } from "@/lib/db";
import { billingService } from "@/services/billing/billing-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { lt, tStatus } from "@/lib/i18n";

export default async function AdminSubscriptionsPage() {
  const session = await requireSuperAdmin();
  const billingConfigured = billingService.isConfigured();
  const a = lt.admin;

  const subscriptions = await db.subscription.findMany({
    include: { school: { select: { name: true, slug: true } } },
    orderBy: { createdAt: "desc" },
  });

  const byPlan = await db.subscription.groupBy({ by: ["plan"], _count: true });

  return (
    <AppShell area="admin" userName={`${session.user.firstName} ${session.user.lastName}`}>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold">{a.subscriptions}</h1>
          <p className="text-neutral-500">{a.subscriptionsDesc}</p>
          {!billingConfigured && (
            <Badge variant="secondary" className="mt-2">{a.billingNotConfigured}</Badge>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-4">
          {byPlan.map((entry) => (
            <Card key={entry.plan}>
              <CardContent className="pt-6">
                <p className="text-sm text-neutral-500">{tStatus(entry.plan)}</p>
                <p className="text-2xl font-semibold">{entry._count}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base">{a.allSubscriptions}</CardTitle></CardHeader>
          <CardContent>
            {subscriptions.length === 0 ? (
              <p className="text-sm text-neutral-500">{a.noSubscriptions}</p>
            ) : (
              <ul className="divide-y divide-neutral-200">
                {subscriptions.map((sub) => (
                  <li key={sub.id} className="flex items-center justify-between py-3 text-sm">
                    <div>
                      <p className="font-medium">{sub.school?.name ?? sub.userId ?? sub.id}</p>
                      <p className="text-neutral-500">
                        {a.seatsLine
                          .replace("{plan}", tStatus(sub.plan))
                          .replace("{count}", String(sub.seatsLimit))}
                      </p>
                    </div>
                    <Badge variant={sub.status === "ACTIVE" ? "success" : "secondary"}>
                      {tStatus(sub.status)}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
