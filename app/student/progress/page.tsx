import { requireStudent } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/app-sidebar";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ProgressCharts } from "@/features/students/progress-charts";
import { lt, tStatus } from "@/lib/i18n";

export default async function StudentProgressPage() {
  const session = await requireStudent();

  const [profiles, attempts, profile] = await Promise.all([
    db.learningProfile.findMany({
      where: { studentId: session.user.id },
      include: { skill: { include: { topic: { include: { subject: true } } } } },
      orderBy: { masteryScore: "desc" },
    }),
    db.questionAttempt.findMany({
      where: { studentId: session.user.id },
      orderBy: { createdAt: "asc" },
      select: { isCorrect: true, createdAt: true },
    }),
    db.studentProfile.findUnique({ where: { userId: session.user.id } }),
  ]);

  const accuracyByDate = new Map<string, { correct: number; total: number }>();
  for (const attempt of attempts) {
    const date = attempt.createdAt.toLocaleDateString();
    const entry = accuracyByDate.get(date) ?? { correct: 0, total: 0 };
    entry.total += 1;
    if (attempt.isCorrect) entry.correct += 1;
    accuracyByDate.set(date, entry);
  }

  const accuracyTrend = Array.from(accuracyByDate.entries()).map(([date, { correct, total }]) => ({
    date,
    accuracy: Math.round((correct / total) * 100),
  }));

  const skillData = profiles.slice(0, 8).map((p) => ({
    name: p.skill.name.length > 12 ? `${p.skill.name.slice(0, 12)}…` : p.skill.name,
    accuracy: Math.round(p.accuracy),
    mastery: Math.round(p.masteryScore),
  }));

  const correctCount = attempts.filter((a) => a.isCorrect).length;
  const overallAccuracy =
    attempts.length > 0 ? Math.round((correctCount / attempts.length) * 100) : 0;

  return (
    <AppShell area="student" userName={`${session.user.firstName} ${session.user.lastName}`}>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold">{lt.student.progress}</h1>
          <p className="text-neutral-500">{lt.student.progressDesc}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-neutral-500">{lt.student.overallAccuracy}</p>
              <p className="text-2xl font-semibold">{overallAccuracy}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-neutral-500">{lt.student.skillsTracked}</p>
              <p className="text-2xl font-semibold">{profiles.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-neutral-500">{lt.student.studyTime}</p>
              <p className="text-2xl font-semibold">{profile?.totalStudyMinutes ?? 0} {lt.common.min}</p>
            </CardContent>
          </Card>
        </div>

        <ProgressCharts accuracyTrend={accuracyTrend} skillData={skillData} />

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{lt.student.learningProfiles}</CardTitle>
          </CardHeader>
          <CardContent>
            {profiles.length === 0 ? (
              <p className="py-8 text-center text-sm text-neutral-500">
                {lt.student.startLearningProfiles}
              </p>
            ) : (
              <ul className="space-y-4">
                {profiles.map((p) => (
                  <li key={p.id}>
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <span className="font-medium">{p.skill.name}</span>
                        <span className="ml-2 text-neutral-400">
                          {p.skill.topic.subject.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            p.masteryLevel === "STRONG" || p.masteryLevel === "GOOD"
                              ? "success"
                              : p.masteryLevel === "NEEDS_PRACTICE"
                                ? "warning"
                                : "secondary"
                          }
                        >
                          {tStatus(p.masteryLevel)}
                        </Badge>
                        <span className="font-medium">{Math.round(p.accuracy)}%</span>
                      </div>
                    </div>
                    <Progress value={p.masteryScore} className="mt-2" />
                    <p className="mt-1 text-xs text-neutral-400">
                      {lt.student.attemptsMistakes
                        .replace("{attempts}", String(p.attemptCount))
                        .replace("{mistakes}", String(p.mistakeCount))}
                    </p>
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
