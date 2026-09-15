import { requireSuperAdmin } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/app-sidebar";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { lt, tRole, tStatus } from "@/lib/i18n";

export default async function AdminAIUsaeePage() {
  const session = await requireSuperAdmin();
  const a = lt.admin;

  const [totalInteractions, byType, recentInteractions, topUsers] = await Promise.all([
    db.aIInteraction.count(),
    db.aIInteraction.groupBy({
      by: ["type"],
      _count: true,
      _sum: { tokensUsed: true },
    }),
    db.aIInteraction.findMany({
      include: { user: { select: { firstName: true, lastName: true, email: true, role: true } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    db.aIInteraction.groupBy({
      by: ["userId"],
      _count: true,
      orderBy: { _count: { userId: "desc" } },
      take: 5,
    }),
  ]);

  const topUserDetails = await Promise.all(
    topUsers.map(async (entry) => {
      const user = await db.user.findUnique({
        where: { id: entry.userId },
        select: { firstName: true, lastName: true, email: true, role: true },
      });
      return { user, count: entry._count };
    })
  );

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weeklyCount = await db.aIInteraction.count({
    where: { createdAt: { gte: weekAgo } },
  });

  return (
    <AppShell area="admin" userName={`${session.user.firstName} ${session.user.lastName}`}>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold">{a.aiUsage}</h1>
          <p className="text-neutral-500">{a.aiUsageDesc}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-neutral-500">{a.totalInteractions}</p>
              <p className="text-2xl font-semibold">{totalInteractions}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-neutral-500">{lt.schoolAdmin.thisWeek}</p>
              <p className="text-2xl font-semibold">{weeklyCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-neutral-500">{a.interactionTypes}</p>
              <p className="text-2xl font-semibold">{byType.length}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{a.byType}</CardTitle>
            </CardHeader>
            <CardContent>
              {byType.length === 0 ? (
                <p className="text-sm text-neutral-500">{a.noInteractions}</p>
              ) : (
                <ul className="space-y-3">
                  {byType.map((entry) => (
                    <li key={entry.type} className="flex justify-between text-sm">
                      <span>{tStatus(entry.type)}</span>
                      <span className="font-medium">
                        {entry._sum.tokensUsed
                          ? a.tokensLine
                              .replace("{count}", String(entry._count))
                              .replace("{tokens}", String(entry._sum.tokensUsed))
                          : entry._count}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{a.topUsers}</CardTitle>
            </CardHeader>
            <CardContent>
              {topUserDetails.length === 0 ? (
                <p className="text-sm text-neutral-500">{a.noUsageData}</p>
              ) : (
                <ul className="space-y-3">
                  {topUserDetails.map(({ user, count }) =>
                    user ? (
                      <li key={user.email} className="flex justify-between text-sm">
                        <span>
                          {user.firstName} {user.lastName}
                        </span>
                        <span className="font-medium">
                          {a.interactionsCount.replace("{count}", String(count))}
                        </span>
                      </li>
                    ) : null
                  )}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{a.recentInteractions}</CardTitle>
          </CardHeader>
          <CardContent>
            {recentInteractions.length === 0 ? (
              <p className="text-sm text-neutral-500">{a.noRecentInteractions}</p>
            ) : (
              <ul className="divide-y divide-neutral-200">
                {recentInteractions.map((interaction) => (
                  <li
                    key={interaction.id}
                    className="flex items-center justify-between py-3 text-sm"
                  >
                    <div>
                      <p className="font-medium">
                        {interaction.user.firstName} {interaction.user.lastName}
                      </p>
                      <p className="text-neutral-500">
                        {tStatus(interaction.type)} · {tRole(interaction.user.role)}
                      </p>
                    </div>
                    <span className="text-neutral-400">
                      {new Date(interaction.createdAt).toLocaleString()}
                    </span>
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
