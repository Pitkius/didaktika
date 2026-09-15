import { requireSchoolAdmin } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/app-sidebar";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { CreateSubjectForm } from "@/features/school-admin/create-subject-form";
import { lt } from "@/lib/i18n";

export default async function SchoolAdminSubjectsPage() {
  const session = await requireSchoolAdmin();
  const sa = lt.schoolAdmin;

  const subjects = await db.subject.findMany({
    where: { schoolId: session.user.schoolId! },
    include: { _count: { select: { topics: true, classes: true, questions: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <AppShell area="school-admin" userName={`${session.user.firstName} ${session.user.lastName}`}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">{sa.subjects}</h1>
          <p className="text-neutral-500">{sa.subjectsCount.replace("{count}", String(subjects.length))}</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <h3 className="font-medium mb-4">{sa.addNewSubject}</h3>
            <CreateSubjectForm />
          </CardContent>
        </Card>

        {subjects.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-neutral-500">{sa.noSubjects}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {subjects.map((subject) => (
              <Card key={subject.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: subject.color }}
                    />
                    <div>
                      <p className="font-medium">{subject.name}</p>
                      <p className="text-sm text-neutral-500">
                        {sa.codeLine.replace("{code}", subject.code)}
                      </p>
                    </div>
                  </div>
                  {subject.description && (
                    <p className="mt-2 text-sm text-neutral-600">{subject.description}</p>
                  )}
                  <p className="mt-3 text-xs text-neutral-400">
                    {sa.topicsClassesQuestions
                      .replace("{topics}", String(subject._count.topics))
                      .replace("{classes}", String(subject._count.classes))
                      .replace("{questions}", String(subject._count.questions))}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
