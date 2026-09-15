import { requireTeacher } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/app-sidebar";
import { db } from "@/lib/db";
import { ClassDetailTabs } from "@/features/teachers/class-detail-tabs";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { lt } from "@/lib/i18n";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TeacherClassDetailPage({ params }: PageProps) {
  const session = await requireTeacher();
  const { id } = await params;

  const classRecord = await db.class.findFirst({
    where: { id, teacherId: session.user.id },
    include: {
      subject: true,
      members: {
        include: { user: { select: { firstName: true, lastName: true, email: true } } },
      },
      assignments: {
        include: { _count: { select: { submissions: true } } },
        orderBy: { createdAt: "desc" },
      },
      _count: { select: { members: true, assignments: true } },
    },
  });

  if (!classRecord) notFound();

  return (
    <AppShell area="teacher" userName={`${session.user.firstName} ${session.user.lastName}`}>
      <div className="space-y-4">
        <Button asChild variant="outline" size="sm">
          <Link href="/teacher/classes">{lt.teacher.backToClasses}</Link>
        </Button>

        <ClassDetailTabs
          className={classRecord.name}
          description={classRecord.description}
          subjectName={classRecord.subject?.name ?? null}
          joinCode={classRecord.joinCode}
          memberCount={classRecord._count.members}
          assignmentCount={classRecord._count.assignments}
          members={classRecord.members}
          assignments={classRecord.assignments}
        />
      </div>
    </AppShell>
  );
}
