import { requireStudent } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/app-sidebar";
import { analyticsService } from "@/services/analytics/analytics-service";
import { aiProvider } from "@/services/ai";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatDuration } from "@/lib/utils";
import { lt, tStatus } from "@/lib/i18n";
import {
  Flame,
  Clock,
  Target,
  BookOpen,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

export default async function StudentDashboardPage() {
  const session = await requireStudent();
  const stats = await analyticsService.getStudentDashboardStats(session.user.id);

  const recommendation = await aiProvider.generateLearningRecommendation({
    studentContext: {
      weakSkills: stats.weakSkills.map((s) => s.skill.name),
      accuracy: stats.accuracy,
      streak: stats.streak,
    },
  });

  return (
    <AppShell
      area="student"
      userName={`${session.user.firstName} ${session.user.lastName}`}
    >
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">
            {lt.student.welcome}, {session.user.firstName}
          </h1>
          <p className="mt-1 text-neutral-500">{lt.student.todayOverview}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="rounded-le bg-amber-50 p-2">
                <Flame className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-500">{lt.student.currentStreak}</p>
                <p className="text-2xl font-semibold">{stats.streak} {lt.student.days}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="rounded-le bg-brand-50 p-2">
                <Clock className="h-5 w-5 text-brand-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-500">{lt.student.thisWeek}</p>
                <p className="text-2xl font-semibold">{stats.weeklyMinutes} {lt.common.min}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="rounded-le bg-green-50 p-2">
                <Target className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-500">{lt.student.accuracy}</p>
                <p className="text-2xl font-semibold">{stats.accuracy}%</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="rounded-le bg-neutral-100 p-2">
                <BookOpen className="h-5 w-5 text-neutral-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-500">{lt.student.completed}</p>
                <p className="text-2xl font-semibold">{stats.completedAssignments}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">{lt.student.aiRecommendation}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-neutral-700">{recommendation.content}</p>
              <Button asChild className="mt-4" size="sm">
                <Link href="/student/learn">
                  {lt.student.continueLearning}
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{lt.student.upcomingDeadlines}</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.upcomingDeadlines.length === 0 ? (
                <p className="text-sm text-neutral-500">{lt.student.noDeadlines}</p>
              ) : (
                <ul className="space-y-3">
                  {stats.upcomingDeadlines.map((sub) => (
                    <li key={sub.id} className="flex items-center justify-between text-sm">
                      <span className="truncate text-neutral-700">
                        {sub.assignment.title}
                      </span>
                      <Badge variant="secondary">
                        {sub.assignment.dueDate
                          ? new Date(sub.assignment.dueDate).toLocaleDateString()
                          : lt.common.noDueDate}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <CardTitle className="text-base">{lt.student.strongestAreas}</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.stroneSkills.length === 0 ? (
                <p className="text-sm text-neutral-500">{lt.student.noStrengths}</p>
              ) : (
                <ul className="space-y-3">
                  {stats.stroneSkills.map((s) => (
                    <li key={s.id}>
                      <div className="flex items-center justify-between text-sm">
                        <span>{s.skill.name}</span>
                        <span className="font-medium text-green-600">
                          {Math.round(s.accuracy)}%
                        </span>
                      </div>
                      <Progress value={s.masteryScore} className="mt-1" />
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <CardTitle className="text-base">{lt.student.needsAttention}</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.weakSkills.length === 0 ? (
                <p className="text-sm text-neutral-500">{lt.student.noWeakAreas}</p>
              ) : (
                <ul className="space-y-3">
                  {stats.weakSkills.map((s) => (
                    <li key={s.id}>
                      <div className="flex items-center justify-between text-sm">
                        <span>{s.skill.name}</span>
                        <span className="font-medium text-amber-600">
                          {Math.round(s.accuracy)}%
                        </span>
                      </div>
                      <Progress value={s.masteryScore} className="mt-1" />
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        {stats.recentEvents.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{lt.student.recentActivity}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {stats.recentEvents.slice(0, 5).map((event) => (
                  <li
                    key={event.id}
                    className="flex items-center justify-between text-sm text-neutral-600"
                  >
                    <span>{tStatus(event.eventType)}</span>
                    <span className="text-neutral-400">
                      {formatDuration(event.durationSeconds)} ·{" "}
                      {new Date(event.createdAt).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
