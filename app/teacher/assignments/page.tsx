import { requireTeacher } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/app-sidebar";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { lt, tStatus } from "@/lib/i18n";

export default async function TeacherAssignmentsPage() {
  const session = await requireTeacher();

  const assignments = await db.assignment.findMany({
    where: { createdById: session.user.id },
    include: {
      subject: true,
      class: true,
      _count: { select: { submissions: true, questions: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <AppShell area="teacher" userName={`${session.user.firstName} ${session.user.lastName}`}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">{lt.teacher.assignments}</h1>
            <p className="text-neutral-500">{lt.teacher.manageAssignmentsDesc}</p>
          </div>
          <Button asChild>
            <Link href="/teacher/assignments/new">
              <Plus className="mr-1 h-4 w-4" />
              {lt.teacher.createAssignment}
            </Link>
          </Button>
        </div>

        {assignments.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-neutral-500">{lt.teacher.noAssignments}</p>
              <Button asChild className="mt-4" size="sm">
                <Link href="/teacher/assignments/new">{lt.teacher.createFirstAssignment}</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {assignments.map((a) => (
              <Card key={a.id}>
                <CardContent className="flex items-center justify-between py-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{a.title}</p>
                      <Badge variant="secondary">{tStatus(a.type)}</Badge>
                    </div>
                    <p className="text-sm text-neutral-500">
                      {a.class?.name ?? lt.common.noClass} · {a.subject?.name ?? lt.common.noSubject} ·{" "}
                      {lt.teacher.assignmentListMeta
                        .replace("{questions}", String(a._count.questions))
                        .replace("{submissions}", String(a._count.submissions))}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                  <Badge variant={a.status === "PUBLISHED" ? "success" : "secondary"}>
                    {tStatus(a.status)}
                  </Badge>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/teacher/assignments/${a.id}`}>{lt.common.view}</Link>
                  </Button>
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
