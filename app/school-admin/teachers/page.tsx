import { requireSchoolAdmin } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/app-sidebar";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { lt, tStatus } from "@/lib/i18n";

export default async function SchoolAdminTeachersPage() {
  const session = await requireSchoolAdmin();
  const sa = lt.schoolAdmin;

  const teachers = await db.user.findMany({
    where: { schoolId: session.user.schoolId, role: "TEACHER" },
    include: {
      teacherProfile: true,
      taughtClasses: { where: { status: "ACTIVE" }, include: { _count: { select: { members: true } } } },
    },
    orderBy: { lastName: "asc" },
  });

  return (
    <AppShell area="school-admin" userName={`${session.user.firstName} ${session.user.lastName}`}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">{sa.teachers}</h1>
          <p className="text-neutral-500">{sa.teachersCount.replace("{count}", String(teachers.length))}</p>
        </div>

        {teachers.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-neutral-500">{sa.noTeachers}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {teachers.map((teacher) => {
              const studentCount = teacher.taughtClasses.reduce(
                (sum, c) => sum + c._count.members,
                0
              );
              return (
                <Card key={teacher.id}>
                  <CardContent className="flex items-center justify-between py-4">
                    <div>
                      <p className="font-medium">
                        {teacher.firstName} {teacher.lastName}
                      </p>
                      <p className="text-sm text-neutral-500">{teacher.email}</p>
                      {teacher.teacherProfile?.department && (
                        <p className="text-xs text-neutral-400">
                          {teacher.teacherProfile.department}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {sa.nClasses.replace("{count}", String(teacher.taughtClasses.length))}
                      </Badge>
                      <Badge variant="default">
                        {sa.nStudents.replace("{count}", String(studentCount))}
                      </Badge>
                      <Badge
                        variant={teacher.status === "ACTIVE" ? "success" : "secondary"}
                      >
                        {tStatus(teacher.status)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
