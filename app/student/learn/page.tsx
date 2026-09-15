import { requireStudent } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/app-sidebar";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { lt } from "@/lib/i18n";
import { entitlementService } from "@/services/entitlements/entitlement-service";
import { getSelfStudyContext } from "@/services/learning/self-study-service";

export default async function StudentLearnPage() {
  const session = await requireStudent();
  const independent = entitlementService.isIndependentStudent({
    userId: session.user.id,
    role: "STUDENT",
    schoolId: session.user.schoolId,
  });

  if (independent) {
    const selfStudy = await getSelfStudyContext(session.user.id, session.user.schoolId);
    return (
      <AppShell area="student" userName={`${session.user.firstName} ${session.user.lastName}`}>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-semibold">{lt.nav.student.learn}</h1>
            <p className="text-neutral-500">{lt.student.selfStudyDesc}</p>
          </div>
          {selfStudy.independent && selfStudy.labeled.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {selfStudy.labeled.map((subject) => (
                <Card key={subject.subjectKey}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: subject.color }}
                      />
                      <CardTitle className="text-base">{subject.subjectName}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-neutral-500">
                      {subject.topics.map((t) => t.name).join(" · ")}
                    </p>
                    <Button asChild variant="outline" size="sm" className="mt-4">
                      <Link href="/student/assignments">{lt.student.selfStudyGoAssignments}</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="space-y-4 py-12 text-center">
                <BookOpen className="mx-auto h-8 w-8 text-neutral-300" />
                <p className="text-neutral-500">{lt.student.noSubjectsIndependent}</p>
                <Button asChild>
                  <Link href="/student/assignments">{lt.student.selfStudyGoAssignments}</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </AppShell>
    );
  }

  const subjects = await db.subject.findMany({
    where: { school: { users: { some: { id: session.user.id } } } },
    include: { topics: { include: { skills: true } } },
  });

  return (
    <AppShell area="student" userName={`${session.user.firstName} ${session.user.lastName}`}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">{lt.nav.student.learn}</h1>
            <p className="text-neutral-500">{lt.student.learnDesc}</p>
          </div>
          <Button asChild>
            <Link href="/student/learn/session">{lt.student.letAiChoose}</Link>
          </Button>
        </div>

        {subjects.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="mx-auto h-8 w-8 text-neutral-300" />
              <p className="mt-4 text-neutral-500">{lt.student.noSubjects}</p>
              <p className="text-sm text-neutral-400">
                {lt.student.noSubjectsHint}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {subjects.map((subject) => (
              <Card key={subject.id} className="hover:border-brand-200 transition-colors">
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
                      .replace(
                        "{skills}",
                        String(subject.topics.reduce((s, t) => s + t.skills.length, 0))
                      )}
                  </p>
                  <Button asChild variant="outline" size="sm" className="mt-4">
                    <Link href={`/student/learn/session?subjectId=${subject.id}`}>
                      {lt.student.startLearning}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
