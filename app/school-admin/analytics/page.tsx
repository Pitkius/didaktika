import { requireSchoolAdmin } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/app-sidebar";
import { analyticsService } from "@/services/analytics/analytics-service";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { lt } from "@/lib/i18n";

export default async function SchoolAdminAnalyticsPage() {
  const session = await requireSchoolAdmin();
  const schoolId = session.user.schoolId!;
  const sa = lt.schoolAdmin;

  const [stats, recentSubmissions, subjectCount] = await Promise.all([
    analyticsService.getSchoolStats(schoolId),
    db.assignmentSubmission.count({
      where: {
        assignment: { class: { schoolId } },
        status: { in: ["SUBMITTED", "GRADED"] },
        submittedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),
    db.subject.count({ where: { schoolId } }),
  ]);

  const completionRate = stats.assignments > 0
    ? Math.round((recentSubmissions / Math.max(stats.students, 1)) * 100)
    : 0;

  return (
    <AppShell area="school-admin" userName={`${session.user.firstName} ${session.user.lastName}`}>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold">{sa.schoolAnalytics}</h1>
          <p className="text-neutral-500">{sa.analyticsDesc}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card><CardContent className="pt-6"><p className="text-sm text-neutral-500">{sa.teachers}</p><p className="text-2xl font-semibold">{stats.teachers}</p></CardContent></Card>
          <Card><CardContent className="pt-6"><p className="text-sm text-neutral-500">{sa.students}</p><p className="text-2xl font-semibold">{stats.students}</p></CardContent></Card>
          <Card><CardContent className="pt-6"><p className="text-sm text-neutral-500">{sa.classes}</p><p className="text-2xl font-semibold">{stats.classes}</p></CardContent></Card>
          <Card><CardContent className="pt-6"><p className="text-sm text-neutral-500">{sa.subjects}</p><p className="text-2xl font-semibold">{subjectCount}</p></CardContent></Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-base">{sa.thisWeek}</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-neutral-500">{sa.submissions}</span><span className="font-medium">{recentSubmissions}</span></div>
              <div className="flex justify-between"><span className="text-neutral-500">{sa.publishedAssignments}</span><span className="font-medium">{stats.assignments}</span></div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">{sa.engagement}</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-neutral-500">{sa.weeklyActivity}</p>
              <p className="mt-2 text-3xl font-semibold">{completionRate}%</p>
              <p className="text-xs text-neutral-400">{sa.weeklyActivityDesc}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
