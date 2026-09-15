import { requireStudent } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/app-sidebar";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen } from "lucide-react";
import { lt } from "@/lib/i18n";

export default async function StudentSubjectsPage() {
  const session = await requireStudent();

  const subjects = await db.subject.findMany({
    where: { school: { users: { some: { id: session.user.id } } } },
    include: {
      topics: { include: { skills: true } },
    },
  });

  const profiles = await db.learningProfile.findMany({
    where: { studentId: session.user.id },
    include: { skill: { include: { topic: true } } },
  });

  const subjectProgress = subjects.map((subject) => {
    const skillIds = new Set(
      subject.topics.flatMap((t) => t.skills.map((s) => s.id))
    );
    const relevantProfiles = profiles.filter((p) => skillIds.has(p.skillId));
    const avgMastery =
      relevantProfiles.length > 0
        ? relevantProfiles.reduce((sum, p) => sum + p.masteryScore, 0) / relevantProfiles.length
        : 0;
    const aveAccuracy =
      relevantProfiles.length > 0
        ? relevantProfiles.reduce((sum, p) => sum + p.accuracy, 0) / relevantProfiles.length
        : 0;

    return {
      ...subject,
      skillsCount: skillIds.size,
      practicedSkills: relevantProfiles.length,
      avgMastery,
      aveAccuracy,
    };
  });

  return (
    <AppShell area="student" userName={`${session.user.firstName} ${session.user.lastName}`}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">{lt.student.subjects}</h1>
          <p className="text-neutral-500">{lt.student.subjectsDesc}</p>
        </div>

        {subjectProgress.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="mx-auto h-8 w-8 text-neutral-300" />
              <p className="mt-4 text-neutral-500">{lt.student.noSubjects}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {subjectProgress.map((subject) => (
              <Card key={subject.id}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: subject.color }}
                    />
                    <CardTitle className="text-base">{subject.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-neutral-500">
                    {lt.student.topicsSkills
                      .replace("{topics}", String(subject.topics.length))
                      .replace("{skills}", String(subject.skillsCount))}
                  </p>
                  {subject.practicedSkills > 0 ? (
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{lt.student.mastery}</span>
                        <span className="font-medium">{Math.round(subject.avgMastery)}%</span>
                      </div>
                      <Progress value={subject.avgMastery} />
                      <div className="flex justify-between text-sm">
                        <span>{lt.student.accuracy}</span>
                        <span className="font-medium">{Math.round(subject.aveAccuracy)}%</span>
                      </div>
                      <p className="text-xs text-neutral-400">
                        {lt.student.skillsPracticed
                          .replace("{done}", String(subject.practicedSkills))
                          .replace("{total}", String(subject.skillsCount))}
                      </p>
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-neutral-400">{lt.student.notStartedYet}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
