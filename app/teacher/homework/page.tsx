import { requireTeacher } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/app-sidebar";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { lt, tStatus } from "@/lib/i18n";

export default async function TeacherHomeworkPage() {
  const session = await requireTeacher();

  const assignments = await db.assignment.findMany({
    where: { createdById: session.user.id, type: "HOMEWORK" },
    include: {
      class: true,
      subject: true,
      _count: { select: { submissions: true } },
    },
    orderBy: { dueDate: "asc" },
  });

  return (
    <AppShell area="teacher" userName={`${session.user.firstName} ${session.user.lastName}`}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">{lt.teacher.homeworkTitle}</h1>
          <p className="text-neutral-500">{lt.teacher.manageHomeworkDesc}</p>
        </div>

        {assignments.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-neutral-500">{lt.teacher.noHomework}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {assignments.map((a) => (
              <Card key={a.id}>
                <CardContent className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-medium">{a.title}</p>
                    <p className="text-sm text-neutral-500">
                      {a.class?.name ?? lt.common.noClass} · {a.subject?.name ?? lt.common.noSubject} ·{" "}
                      {lt.teacher.nSubmissions.replace("{count}", String(a._count.submissions))}
                      {a.dueDate && ` · ${lt.common.due} ${new Date(a.dueDate).toLocaleDateString()}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={a.status === "PUBLISHED" ? "success" : "secondary"}>
                      {tStatus(a.status)}
                    </Badge>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/teacher/assignments/${a.id}`}>{lt.common.open}</Link>
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
