import { requireTeacher } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/app-sidebar";
import { analyticsService } from "@/services/analytics/analytics-service";
import { aiInsightsService } from "@/services/analytics/ai-insights-service";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { createTargetedPracticeAction } from "@/features/teachers/actions";
import {
  Users,
  BookOpen,
  ClipboardList,
  TrendingUp,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { lt, tStatus } from "@/lib/i18n";

export default async function TeacherDashboardPage() {
  const session = await requireTeacher();
  const stats = await analyticsService.getTeacherDashboardStats(session.user.id);

  const insights = stats.classes.length > 0
    ? await aiInsightsService.getClassInsights(stats.classes[0].id)
    : [];

  const recentActivity = await db.auditLog.findMany({
    where: { actorId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const flagsCount = await db.aIIntegrityFlag.count({
    where: {
      submission: { assignment: { createdById: session.user.id } },
      isResolved: false,
    },
  });

  return (
    <AppShell area="teacher" userName={`${session.user.firstName} ${session.user.lastName}`}>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold">{lt.teacher.dashboard}</h1>
          <p className="text-neutral-500">{lt.teacher.dashboardDesc}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <Users className="h-5 w-5 text-brand-600" />
              <div>
                <p className="text-sm text-neutral-500">{lt.common.students}</p>
                <p className="text-2xl font-semibold">{stats.studentCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <BookOpen className="h-5 w-5 text-brand-600" />
              <div>
                <p className="text-sm text-neutral-500">{lt.nav.teacher.classes}</p>
                <p className="text-2xl font-semibold">{stats.classCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <ClipboardList className="h-5 w-5 text-brand-600" />
              <div>
                <p className="text-sm text-neutral-500">{lt.teacher.pendingDrafts}</p>
                <p className="text-2xl font-semibold">{stats.pendingAssignments}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <TrendingUp className="h-5 w-5 text-brand-600" />
              <div>
                <p className="text-sm text-neutral-500">{lt.teacher.avgPerformance}</p>
                <p className="text-2xl font-semibold">{stats.avgPerformance}%</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <Sparkles className="h-4 w-4 text-brand-600" />
              <CardTitle className="text-base">{lt.teacher.aiInsights}</CardTitle>
            </CardHeader>
            <CardContent>
              {insights.length === 0 ? (
                <p className="text-sm text-neutral-500">
                  {lt.teacher.noInsights}
                </p>
              ) : (
                <ul className="space-y-4">
                  {insights.map((insight) => (
                    <li key={insight.id} className="rounded-md border border-neutral-200 p-4">
                      <p className="text-sm text-neutral-700">{insight.content}</p>
                      {insight.insightType === "WEAK_TOPIC" && stats.classes[0] && (
                        <form
                          action={async () => {
                            "use server";
                            await createTargetedPracticeAction({
                              classId: stats.classes[0].id,
                              title: lt.teacher.targetedPractice,
                            });
                          }}
                          className="mt-3"
                        >
                          <Button type="submit" size="sm" variant="outline">
                            {lt.teacher.createTargetedPractice}
                          </Button>
                        </form>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <CardTitle className="text-base">{lt.teacher.needsAttention}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {flagsCount > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span>{lt.teacher.integrityFlagsPending}</span>
                    <Badge variant="warning">{flagsCount}</Badge>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span>{lt.teacher.completionRate}</span>
                  <span className="font-medium">{stats.completionRate}%</span>
                </div>
                <Button asChild variant="outline" size="sm" className="mt-2">
                  <Link href="/teacher/analytics">{lt.teacher.viewAnalytics}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{lt.student.recentActivity}</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <p className="text-sm text-neutral-500">{lt.teacher.noActivity}</p>
            ) : (
              <ul className="space-y-2">
                {recentActivity.map((log) => (
                  <li
                    key={log.id}
                    className="flex items-center justify-between text-sm text-neutral-600"
                  >
                    <span>{tStatus(log.action)}</span>
                    <span className="text-neutral-400">
                      {new Date(log.createdAt).toLocaleDateString()}
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
