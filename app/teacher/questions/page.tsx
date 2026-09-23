import { requireTeacher } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/app-sidebar";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { lt, tStatus } from "@/lib/i18n";

interface PageProps {
  searchParams: Promise<{ type?: string; difficulty?: string; subjectId?: string }>;
}

export default async function TeacherQuestionsPage({ searchParams }: PageProps) {
  const session = await requireTeacher();
  const params = await searchParams;

  const subjects = await db.subject.findMany({
    where: { schoolId: session.user.schoolId! },
  });

  const where: Record<string, unknown> = {
    isArchived: false,
    OR: [{ createdById: session.user.id }, { schoolId: session.user.schoolId }],
  };
  if (params.type) where.type = params.type;
  if (params.difficulty) where.difficulty = params.difficulty;
  if (params.subjectId) where.subjectId = params.subjectId;

  const questions = await db.question.findMany({
    where,
    include: { subject: true, topic: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <AppShell area="teacher" userName={`${session.user.firstName} ${session.user.lastName}`}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">{lt.teacher.questionBank}</h1>
            <p className="text-neutral-500">
              {lt.teacher.questionsFound.replace("{count}", String(questions.length))}
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/teacher/ai-generator">{lt.teacher.generateWithAi}</Link>
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form method="get" className="flex flex-wrap gap-4 items-end">
              <div>
                <label htmlFor="subjectId" className="text-sm font-medium">{lt.common.subject}</label>
                <select
                  id="subjectId"
                  name="subjectId"
                  defaultValue={params.subjectId ?? ""}
                  className="mt-1 flex h-10 rounded-md border border-neutral-300 px-3 text-sm"
                >
                  <option value="">{lt.teacher.allSubjects}</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="type" className="text-sm font-medium">{lt.common.type}</label>
                <select
                  id="type"
                  name="type"
                  defaultValue={params.type ?? ""}
                  className="mt-1 flex h-10 rounded-md border border-neutral-300 px-3 text-sm"
                >
                  <option value="">{lt.teacher.allTypes}</option>
                  <option value="MULTIPLE_CHOICE">{tStatus("MULTIPLE_CHOICE")}</option>
                  <option value="SINGLE_ANSWER">{tStatus("SINGLE_ANSWER")}</option>
                  <option value="SHORT_ANSWER">{tStatus("SHORT_ANSWER")}</option>
                  <option value="TRUE_FALSE">{tStatus("TRUE_FALSE")}</option>
                  <option value="NUMERIC">{tStatus("NUMERIC")}</option>
                </select>
              </div>
              <div>
                <label htmlFor="difficulty" className="text-sm font-medium">{lt.teacher.difficulty}</label>
                <select
                  id="difficulty"
                  name="difficulty"
                  defaultValue={params.difficulty ?? ""}
                  className="mt-1 flex h-10 rounded-md border border-neutral-300 px-3 text-sm"
                >
                  <option value="">{lt.teacher.allDifficulties}</option>
                  <option value="EASY">{tStatus("EASY")}</option>
                  <option value="MEDIUM">{tStatus("MEDIUM")}</option>
                  <option value="HARD">{tStatus("HARD")}</option>
                  <option value="EXPERT">{tStatus("EXPERT")}</option>
                </select>
              </div>
              <Button type="submit" size="sm">{lt.teacher.filter}</Button>
            </form>
          </CardContent>
        </Card>

        {questions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-neutral-500">{lt.teacher.noQuestionsFound}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {questions.map((q) => (
              <Card key={q.id}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm">{q.content}</p>
                      <p className="mt-2 text-xs text-neutral-500">
                        {q.subject?.name ?? lt.common.noSubject} · {q.topic?.name ?? lt.teacher.noTopic}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <Badge variant="secondary">{tStatus(q.type)}</Badge>
                      <Badge variant="secondary">{tStatus(q.difficulty)}</Badge>
                      {q.isAIGenerated && <Badge variant="default">{lt.common.ai}</Badge>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
