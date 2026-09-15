import { notFound } from "next/navigation";
import { requireStudent } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/app-sidebar";
import { db } from "@/lib/db";
import { AssignmentTakeClient } from "@/features/students/assignment-take";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function StudentAssignmentDetailPage({ params }: PageProps) {
  const session = await requireStudent();
  const { id } = await params;

  const memberships = await db.classMember.findMany({
    where: { userId: session.user.id },
    select: { classId: true },
  });
  const classIds = memberships.map((m) => m.classId);

  const assignment = await db.assignment.findFirst({
    where: {
      id,
      status: "PUBLISHED",
      OR: [{ classId: { in: classIds } }, { classId: null, createdById: session.user.id }],
    },
    include: {
      questions: {
        include: {
          question: {
            include: { options: { orderBy: { orderIndex: "asc" } } },
          },
        },
        orderBy: { orderIndex: "asc" },
      },
    },
  });

  if (!assignment) notFound();

  return (
    <AppShell area="student" userName={`${session.user.firstName} ${session.user.lastName}`}>
      <AssignmentTakeClient
        assignmentId={assignment.id}
        title={assignment.title}
        description={assignment.description}
        aiAssistance={assignment.aiAssistance}
        questions={assignment.questions.map((aq) => ({
          id: aq.id,
          points: aq.points,
          question: {
            id: aq.question.id,
            content: aq.question.content,
            type: aq.question.type,
            difficulty: aq.question.difficulty,
            options: aq.question.options.map((o) => ({ id: o.id, content: o.content })),
          },
        }))}
      />
    </AppShell>
  );
}
