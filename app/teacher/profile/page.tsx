import { requireTeacher } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/app-sidebar";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/utils";
import { lt, tRole } from "@/lib/i18n";

export default async function TeacherProfilePage() {
  const session = await requireTeacher();

  const [user, profile, classCount, assignmentCount] = await Promise.all([
    db.user.findUnique({ where: { id: session.user.id }, include: { school: true } }),
    db.teacherProfile.findUnique({ where: { userId: session.user.id } }),
    db.class.count({ where: { teacherId: session.user.id, status: "ACTIVE" } }),
    db.assignment.count({ where: { createdById: session.user.id } }),
  ]);

  if (!user) return null;

  return (
    <AppShell area="teacher" userName={`${session.user.firstName} ${session.user.lastName}`}>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">{lt.teacher.profile}</h1>
        <Card>
          <CardContent className="flex items-start gap-6 pt-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-xl font-semibold text-brand-700">
              {getInitials(user.firstName, user.lastName)}
            </div>
            <div>
              <h2 className="text-xl font-semibold">{user.firstName} {user.lastName}</h2>
              <p className="text-neutral-500">{user.email}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant="secondary">{tRole(user.role)}</Badge>
                {user.school && <Badge>{user.school.name}</Badge>}
                {profile?.department && <Badge variant="secondary">{profile.department}</Badge>}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">{lt.teacher.teachingOverview}</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-neutral-500">{lt.teacher.activeClasses}</span><span className="font-medium">{classCount}</span></div>
            <div className="flex justify-between"><span className="text-neutral-500">{lt.teacher.assignmentsCreated}</span><span className="font-medium">{assignmentCount}</span></div>
            {profile?.title && <div className="flex justify-between"><span className="text-neutral-500">{lt.teacher.title}</span><span className="font-medium">{profile.title}</span></div>}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
