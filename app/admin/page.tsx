import { requireSuperAdmin } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/app-sidebar";
import { analyticsService } from "@/services/analytics/analytics-service";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/lib/db";
import { lt, tStatus } from "@/lib/i18n";
import {
  Building2,
  Users,
  GraduationCap,
  Bot,
  Activity,
  ClipboardList,
} from "lucide-react";

export default async function SuperAdminDashboardPage() {
  const session = await requireSuperAdmin();
  const stats = await analyticsService.getPlatformStats();
  const a = lt.admin;

  const subscriptions = await db.subscription.groupBy({
    by: ["plan"],
    _count: true,
  });

  return (
    <AppShell area="admin" userName={`${session.user.firstName} ${session.user.lastName}`}>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold">{a.platformOverview}</h1>
          <p className="text-neutral-500">{a.systemDesc}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <Building2 className="h-5 w-5 text-brand-600" />
              <div>
                <p className="text-sm text-neutral-500">{a.activeSchools}</p>
                <p className="text-2xl font-semibold">{stats.schools}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <Users className="h-5 w-5 text-brand-600" />
              <div>
                <p className="text-sm text-neutral-500">{a.activeStudents}</p>
                <p className="text-2xl font-semibold">{stats.students}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <GraduationCap className="h-5 w-5 text-brand-600" />
              <div>
                <p className="text-sm text-neutral-500">{a.activeTeachers}</p>
                <p className="text-2xl font-semibold">{stats.teachers}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <Bot className="h-5 w-5 text-brand-600" />
              <div>
                <p className="text-sm text-neutral-500">{a.aiInteractions}</p>
                <p className="text-2xl font-semibold">{stats.aiInteractions}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <Activity className="h-5 w-5 text-brand-600" />
              <div>
                <p className="text-sm text-neutral-500">{a.dailyActiveUsers}</p>
                <p className="text-2xl font-semibold">{stats.dailyActive}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <ClipboardList className="h-5 w-5 text-brand-600" />
              <div>
                <p className="text-sm text-neutral-500">{a.publishedAssignments}</p>
                <p className="text-2xl font-semibold">{stats.assignments}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="pt-6">
            <h3 className="font-medium mb-4">{a.subscriptionOverview}</h3>
            <div className="grid gap-3 sm:grid-cols-4">
              {subscriptions.map((sub) => (
                <div key={sub.plan} className="rounded-md border border-neutral-200 p-4">
                  <p className="text-sm text-neutral-500">{tStatus(sub.plan)}</p>
                  <p className="text-xl font-semibold">{sub._count}</p>
                </div>
              ))}
              {subscriptions.length === 0 && (
                <p className="text-sm text-neutral-500 col-span-4">{a.noSubscriptions}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
