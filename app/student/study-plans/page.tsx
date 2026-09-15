import Link from "next/link";
import { requireStudent } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/app-sidebar";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { entitlementService } from "@/services/entitlements/entitlement-service";
import { lt } from "@/lib/i18n";

export default async function StudentStudyPlansPage() {
  const session = await requireStudent();
  const access = await entitlementService.canUseStudyPlans({
    userId: session.user.id,
    role: "STUDENT",
    schoolId: session.user.schoolId,
  });

  if (!access.allowed) {
    return (
      <AppShell area="student" userName={`${session.user.firstName} ${session.user.lastName}`}>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-semibold">{lt.student.studyPlansTitle}</h1>
            <p className="text-neutral-500">{lt.student.studyPlansUpgrade}</p>
          </div>
          <Button asChild>
            <Link href="/student/billing">{lt.billing.upgrade}</Link>
          </Button>
        </div>
      </AppShell>
    );
  }

  const focusSkills = await db.learningProfile.findMany({
    where: {
      studentId: session.user.id,
      OR: [
        { masteryLevel: { in: ["WEAK", "NEEDS_PRACTICE"] } },
        { masteryScore: { lt: 60 } },
      ],
    },
    include: { skill: { include: { topic: { include: { subject: true } } } } },
    orderBy: { masteryScore: "asc" },
    take: 5,
  });

  const skills =
    focusSkills.length > 0
      ? focusSkills
      : await db.learningProfile.findMany({
          where: { studentId: session.user.id },
          include: { skill: { include: { topic: { include: { subject: true } } } } },
          orderBy: { masteryScore: "asc" },
          take: 3,
        });

  const actions = [
    "15–20 min. praktika silpniausiam įgūdžiui",
    "Peržiūrėkite klaidų sąrašą ir pakartokite 3 klausimus",
    "Paprašykite DI mokytojo paaiškinimo prieš kitą testą",
  ];

  return (
    <AppShell area="student" userName={`${session.user.firstName} ${session.user.lastName}`}>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">{lt.student.studyPlansTitle}</h1>
            <p className="text-neutral-500">{lt.student.studyPlansDesc}</p>
          </div>
          <Button asChild>
            <Link href="/student/learn/session">{lt.student.startLearning}</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{lt.student.studyPlanFocus}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {skills.length === 0 ? (
              <p className="text-neutral-500">{lt.student.startLearningProfiles}</p>
            ) : (
              skills.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{p.skill.name}</p>
                    <p className="text-sm text-neutral-500">
                      {p.skill.topic.subject.name} · {Math.round(p.masteryScore)}%
                    </p>
                  </div>
                  <Badge variant="secondary">{p.masteryLevel}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{lt.student.studyPlanActions}</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal space-y-2 pl-5 text-sm text-neutral-700">
              {actions.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
