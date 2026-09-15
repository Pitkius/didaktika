import { requireStudent } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/app-sidebar";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StudentSettingsForm } from "@/features/students/settings-form";
import { lt } from "@/lib/i18n";

export default async function StudentSettingsPage() {
  const session = await requireStudent();

  const [user, profile] = await Promise.all([
    db.user.findUnique({ where: { id: session.user.id } }),
    db.studentProfile.findUnique({ where: { userId: session.user.id } }),
  ]);

  if (!user) return null;

  return (
    <AppShell area="student" userName={`${session.user.firstName} ${session.user.lastName}`}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">{lt.common.settings}</h1>
          <p className="text-neutral-500">{lt.student.settingsDesc}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{lt.student.personalInfo}</CardTitle>
          </CardHeader>
          <CardContent>
            <StudentSettingsForm
              firstName={user.firstName}
              lastName={user.lastName}
              email={user.email}
              gradeLevel={profile?.gradeLevel ?? null}
            />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
