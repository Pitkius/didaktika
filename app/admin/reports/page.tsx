import { requireSuperAdmin } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/app-sidebar";
import { analyticsService } from "@/services/analytics/analytics-service";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { lt, tStatus } from "@/lib/i18n";

export default async function AdminReportsPage() {
  const session = await requireSuperAdmin();
  const a = lt.admin;

  const [platformStats, assignmentStats, topSchools] = await Promise.all([
    analyticsService.getPlatformStats(),
    db.assignment.groupBy({ by: ["status"], _count: true }),
    db.school.findMany({
      where: { isActive: true },
      include: { _count: { select: { users: true, classes: true } } },
      orderBy: { users: { _count: "desc" } },
      take: 5,
    }),
  ]);

  return (
    <AppShell area="admin" userName={`${session.user.firstName} ${session.user.lastName}`}>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold">{a.reports}</h1>
          <p className="text-neutral-500">{a.reportsDesc}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card><CardContent className="pt-6"><p className="text-sm text-neutral-500">{a.activeSchools}</p><p className="text-2xl font-semibold">{platformStats.schools}</p></CardContent></Card>
          <Card><CardContent className="pt-6"><p className="text-sm text-neutral-500">{a.dailyActiveUsers}</p><p className="text-2xl font-semibold">{platformStats.dailyActive}</p></CardContent></Card>
          <Card><CardContent className="pt-6"><p className="text-sm text-neutral-500">{a.aiInteractions}</p><p className="text-2xl font-semibold">{platformStats.aiInteractions}</p></CardContent></Card>
          <Card><CardContent className="pt-6"><p className="text-sm text-neutral-500">{a.publishedAssignments}</p><p className="text-2xl font-semibold">{platformStats.assignments}</p></CardContent></Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-base">{a.assignmentsByStatus}</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {assignmentStats.map((s) => (
                  <li key={s.status} className="flex justify-between">
                    <span>{tStatus(s.status)}</span><span className="font-medium">{s._count}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">{a.topSchools}</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {topSchools.map((school) => (
                  <li key={school.id} className="flex justify-between">
                    <span>{school.name}</span>
                    <span className="font-medium">
                      {a.usersClasses
                        .replace("{users}", String(school._count.users))
                        .replace("{classes}", String(school._count.classes))}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
