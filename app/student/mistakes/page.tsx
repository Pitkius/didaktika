import Link from "next/link";
import { requireStudent } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/app-sidebar";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { lt } from "@/lib/i18n";

export default async function StudentMistakesPage() {
  const session = await requireStudent();

  const mistakes = await db.mistake.findMany({
    where: { studentId: session.user.id },
    include: {
      skill: { include: { topic: { include: { subject: true } } } },
    },
    orderBy: [{ frequency: "desc" }, { updatedAt: "desc" }],
    take: 50,
  });

  const weakSkillId = mistakes[0]?.skillId;

  return (
    <AppShell area="student" userName={`${session.user.firstName} ${session.user.lastName}`}>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">{lt.student.mistakesTitle}</h1>
            <p className="text-neutral-500">{lt.student.mistakesDesc}</p>
          </div>
          {weakSkillId && (
            <Button asChild>
              <Link href="/student/learn/session">{lt.student.practiceMistakes}</Link>
            </Button>
          )}
        </div>

        {mistakes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-neutral-500">
              {lt.student.noMistakes}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {mistakes.map((m) => (
              <Card key={m.id}>
                <CardContent className="space-y-2 py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{m.skill.name}</p>
                    <Badge variant="secondary">{m.mistakeType}</Badge>
                    <Badge variant="warning">×{m.frequency}</Badge>
                  </div>
                  <p className="text-sm text-neutral-500">
                    {m.skill.topic.subject.name} · {m.skill.topic.name}
                  </p>
                  <p className="text-sm text-neutral-700">{m.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
