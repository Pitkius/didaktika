import { requireStudent } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/app-sidebar";
import { db } from "@/lib/db";
import { AITeacherChat } from "@/features/students/ai-teacher-chat";
import { lt } from "@/lib/i18n";

export default async function StudentAITeacherPage() {
  const session = await requireStudent();

  const conversation = await db.aIConversation.findFirst({
    where: { studentId: session.user.id, contextType: "LEARNING", assignmentId: null },
    include: { messages: { orderBy: { createdAt: "asc" } } },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <AppShell area="student" userName={`${session.user.firstName} ${session.user.lastName}`}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">{lt.nav.student.aiTeacher}</h1>
          <p className="text-neutral-500">
            {lt.student.aiTeacherDesc}
          </p>
        </div>

        <AITeacherChat
          conversationId={conversation?.id ?? null}
          initialMessages={
            conversation?.messages.map((m) => ({
              role: m.role,
              content: m.content,
            })) ?? []
          }
        />
      </div>
    </AppShell>
  );
}
