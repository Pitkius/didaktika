import { requireTeacher } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/app-sidebar";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AIGeneratorForm } from "@/features/teachers/ai-generator-form";
import { lt } from "@/lib/i18n";

export default async function TeacherAIGeneratorPage() {
  const session = await requireTeacher();

  const subjects = await db.subject.findMany({
    where: { schoolId: session.user.schoolId! },
    include: { topics: { select: { id: true, name: true } } },
  });

  return (
    <AppShell area="teacher" userName={`${session.user.firstName} ${session.user.lastName}`}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">{lt.teacher.aiGeneratorTitle}</h1>
          <p className="text-neutral-500">
            {lt.teacher.aiGeneratorDesc}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{lt.teacher.generationSettings}</CardTitle>
          </CardHeader>
          <CardContent>
            <AIGeneratorForm subjects={subjects} />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
