import { requireTeacher } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/app-sidebar";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateAssignmentForm } from "@/features/teachers/create-assignment-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { lt } from "@/lib/i18n";

export default async function TeacherNewAssignmentPage() {
  const session = await requireTeacher();

  const [classes, subjects] = await Promise.all([
    db.class.findMany({
      where: { teacherId: session.user.id, status: "ACTIVE" },
      select: { id: true, name: true },
    }),
    db.subject.findMany({
      where: { schoolId: session.user.schoolId! },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <AppShell area="teacher" userName={`${session.user.firstName} ${session.user.lastName}`}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">{lt.teacher.createAssignmentTitle}</h1>
            <p className="text-neutral-500">{lt.teacher.createAssignmentDesc}</p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/teacher/assignments">{lt.teacher.backToAssignments}</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{lt.teacher.assignmentDetails}</CardTitle>
          </CardHeader>
          <CardContent>
            <CreateAssignmentForm classes={classes} subjects={subjects} />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
