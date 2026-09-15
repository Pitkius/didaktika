import { requireTeacher } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/app-sidebar";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CreateClassForm } from "@/features/teachers/create-class-form";
import { lt } from "@/lib/i18n";

export default async function TeacherClassesPage() {
  const session = await requireTeacher();

  const classes = await db.class.findMany({
    where: { teacherId: session.user.id, status: "ACTIVE" },
    include: {
      members: true,
      subject: true,
      _count: { select: { assignments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const subjects = await db.subject.findMany({
    where: { schoolId: session.user.schoolId! },
  });

  return (
    <AppShell area="teacher" userName={`${session.user.firstName} ${session.user.lastName}`}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">{lt.teacher.classesTitle}</h1>
        </div>

        <Card>
          <CardContent className="pt-6">
            <h3 className="font-medium mb-4">{lt.teacher.createNewClass}</h3>
            <CreateClassForm subjects={subjects} />
          </CardContent>
        </Card>

        {classes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-neutral-500">{lt.teacher.noClasses}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {classes.map((c) => (
              <Card key={c.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{c.name}</p>
                      <p className="text-sm text-neutral-500">
                        {lt.teacher.classCardMeta
                          .replace("{subject}", c.subject?.name ?? lt.common.noSubject)
                          .replace("{students}", String(c.members.length))}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {lt.teacher.nAssignments.replace("{count}", String(c._count.assignments))}
                    </Badge>
                  </div>
                  <Button asChild variant="outline" size="sm" className="mt-4">
                    <Link href={`/teacher/classes/${c.id}`}>{lt.teacher.manageClass}</Link>
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
