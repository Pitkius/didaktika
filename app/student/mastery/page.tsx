import Link from "next/link";
import { requireStudent } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/app-sidebar";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { entitlementService } from "@/services/entitlements/entitlement-service";
import { lt, tStatus } from "@/lib/i18n";

const levels = ["WEAK", "NEEDS_PRACTICE", "GOOD", "STRONG"] as const;

export default async function StudentMasteryPage() {
  const session = await requireStudent();
  const access = await entitlementService.canUseMasteryMap({
    userId: session.user.id,
    role: "STUDENT",
    schoolId: session.user.schoolId,
  });

  if (!access.allowed) {
    return (
      <AppShell area="student" userName={`${session.user.firstName} ${session.user.lastName}`}>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-semibold">{lt.student.masteryMapTitle}</h1>
            <p className="text-neutral-500">{lt.student.masteryUpgrade}</p>
          </div>
          <Button asChild>
            <Link href="/student/billing">{lt.billing.upgrade}</Link>
          </Button>
        </div>
      </AppShell>
    );
  }

  const profiles = await db.learningProfile.findMany({
    where: { studentId: session.user.id },
    include: { skill: { include: { topic: { include: { subject: true } } } } },
    orderBy: { masteryScore: "asc" },
  });

  return (
    <AppShell area="student" userName={`${session.user.firstName} ${session.user.lastName}`}>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold">{lt.student.masteryMapTitle}</h1>
          <p className="text-neutral-500">{lt.student.masteryMapDesc}</p>
        </div>

        {levels.map((level) => {
          const items = profiles.filter((p) => p.masteryLevel === level);
          if (items.length === 0) return null;
          return (
            <div key={level} className="space-y-3">
              <h2 className="text-lg font-medium">{tStatus(level)}</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {items.map((p) => (
                  <Card key={p.id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{p.skill.name}</CardTitle>
                      <p className="text-sm text-neutral-500">
                        {p.skill.topic.subject.name} · {p.skill.topic.name}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{lt.student.mastery}</span>
                        <span>{Math.round(p.masteryScore)}%</span>
                      </div>
                      <Progress value={Math.round(p.masteryScore)} />
                      <Badge variant="secondary">
                        {lt.student.attemptsMistakes
                          .replace("{attempts}", String(p.attemptCount))
                          .replace("{mistakes}", String(p.mistakeCount))}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}

        {profiles.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-neutral-500">
              {lt.student.startLearningProfiles}
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
