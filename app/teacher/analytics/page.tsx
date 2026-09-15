import { requireTeacher } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/app-sidebar";
import { analyticsService } from "@/services/analytics/analytics-service";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { lt } from "@/lib/i18n";

export default async function TeacherAnalyticsPage() {
  const session = await requireTeacher();
  const stats = await analyticsService.getTeacherDashboardStats(session.user.id);

  const classAnalytics = await Promise.all(
    stats.classes.map(async (cls) => {
      const submissions = await db.assignmentSubmission.findMany({
        where: { assignment: { classId: cls.id } },
        select: { status: true, score: true, maxScore: true },
      });
      const expected = cls.members.length * cls.assignments.length;
      const completed = submissions.filter(
        (s) => s.status === "SUBMITTED" || s.status === "GRADED"
      ).length;
      const graded = submissions.filter((s) => s.status === "GRADED");
      const avgScore =
        graded.length > 0
          ? Math.round(
              graded.reduce((sum, s) => {
                if (s.score != null && s.maxScore != null && s.maxScore > 0) {
                  return sum + (s.score / s.maxScore) * 100;
                }
                return sum;
              }, 0) / graded.length
            )
          : 0;

      return {
        id: cls.id,
        name: cls.name,
        studentCount: cls.members.length,
        assignmentCount: cls.assignments.length,
        completionRate: expected > 0 ? Math.round((completed / expected) * 100) : 0,
        avgScore,
      };
    })
  );

  return (
    <AppShell area="teacher" userName={`${session.user.firstName} ${session.user.lastName}`}>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold">{lt.teacher.analyticsTitle}</h1>
          <p className="text-neutral-500">{lt.teacher.analyticsDesc}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-neutral-500">{lt.common.students}</p>
              <p className="text-2xl font-semibold">{stats.studentCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-neutral-500">{lt.teacher.avgPerformance}</p>
              <p className="text-2xl font-semibold">{stats.avgPerformance}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-neutral-500">{lt.teacher.completionRate}</p>
              <p className="text-2xl font-semibold">{stats.completionRate}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-neutral-500">{lt.nav.teacher.classes}</p>
              <p className="text-2xl font-semibold">{stats.classCount}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{lt.teacher.classBreakdown}</CardTitle>
          </CardHeader>
          <CardContent>
            {classAnalytics.length === 0 ? (
              <p className="py-8 text-center text-sm text-neutral-500">
                {lt.teacher.noClassesAnalytics}
              </p>
            ) : (
              <ul className="space-y-6">
                {classAnalytics.map((cls) => (
                  <li key={cls.id}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{cls.name}</p>
                        <p className="text-sm text-neutral-500">
                          {lt.teacher.studentsAssignments
                            .replace("{students}", String(cls.studentCount))
                            .replace("{assignments}", String(cls.assignmentCount))}
                        </p>
                      </div>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/teacher/classes/${cls.id}`}>{lt.teacher.viewClass}</Link>
                      </Button>
                    </div>
                    <div className="mt-3 grid gap-4 sm:grid-cols-2">
                      <div>
                        <div className="flex justify-between text-sm">
                          <span>{lt.teacher.completion}</span>
                          <span>{cls.completionRate}%</span>
                        </div>
                        <Progress value={cls.completionRate} className="mt-1" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm">
                          <span>{lt.teacher.avgScore}</span>
                          <span>{cls.avgScore}%</span>
                        </div>
                        <Progress value={cls.avgScore} className="mt-1" />
                      </div>
                    </div>
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
