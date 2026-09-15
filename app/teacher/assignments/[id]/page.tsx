import Link from "next/link";
import { notFound } from "next/navigation";
import { requireTeacher } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/app-sidebar";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { publishAssignmentAction } from "@/features/teachers/actions";
import { lt, tStatus } from "@/lib/i18n";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TeacherAssignmentDetailPage({ params }: PageProps) {
  const session = await requireTeacher();
  const { id } = await params;

  const assignment = await db.assignment.findFirst({
    where: { id, createdById: session.user.id },
    include: {
      class: true,
      subject: true,
      questions: { include: { question: true }, orderBy: { orderIndex: "asc" } },
      submissions: {
        include: {
          student: { select: { firstName: true, lastName: true, email: true } },
        },
        orderBy: { submittedAt: "desc" },
      },
      _count: { select: { questions: true, submissions: true } },
    },
  });

  if (!assignment) notFound();

  return (
    <AppShell area="teacher" userName={`${session.user.firstName} ${session.user.lastName}`}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Button asChild variant="outline" size="sm" className="mb-3">
              <Link href="/teacher/assignments">{lt.common.back}</Link>
            </Button>
            <h1 className="text-2xl font-semibold">{assignment.title}</h1>
            <p className="mt-1 text-neutral-500">
              {assignment.subject?.name ?? lt.common.noSubject} · {assignment.class?.name ?? lt.common.noClass}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={assignment.status === "PUBLISHED" ? "success" : "secondary"}>
              {tStatus(assignment.status)}
            </Badge>
            {assignment.status === "DRAFT" && (
              <form
                action={async () => {
                  "use server";
                  await publishAssignmentAction(id);
                }}
              >
                <Button type="submit" size="sm">
                  Paskelbti
                </Button>
              </form>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-neutral-500">{lt.teacher.questions}</p>
              <p className="text-2xl font-semibold">{assignment._count.questions}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-neutral-500">{lt.teacher.submissions}</p>
              <p className="text-2xl font-semibold">{assignment._count.submissions}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-neutral-500">{lt.common.type}</p>
              <p className="text-2xl font-semibold">{tStatus(assignment.type)}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{lt.teacher.submissions}</CardTitle>
          </CardHeader>
          <CardContent>
            {assignment.submissions.length === 0 ? (
              <p className="text-sm text-neutral-500">{lt.common.noData}</p>
            ) : (
              <ul className="divide-y divide-neutral-200">
                {assignment.submissions.map((sub) => (
                  <li key={sub.id} className="flex items-center justify-between py-3 text-sm">
                    <div>
                      <p className="font-medium">
                        {sub.student.firstName} {sub.student.lastName}
                      </p>
                      <p className="text-neutral-500">{sub.student.email}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {sub.score != null && sub.maxScore != null && (
                        <span>
                          {Math.round(sub.score)}/{Math.round(sub.maxScore)}
                        </span>
                      )}
                      <Badge variant={sub.status === "GRADED" ? "success" : "secondary"}>
                        {tStatus(sub.status)}
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{lt.teacher.questions}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {assignment.questions.map((aq, i) => (
              <div key={aq.id} className="rounded-md border border-neutral-200 p-3 text-sm">
                <p className="font-medium">
                  {i + 1}. {aq.question.content}
                </p>
                <p className="mt-1 text-neutral-500">
                  {tStatus(aq.question.type)} · {aq.points} tšk.
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
