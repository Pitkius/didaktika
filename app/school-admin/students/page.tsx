import { requireSchoolAdmin } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/app-sidebar";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { lt, tStatus } from "@/lib/i18n";

export default async function SchoolAdminStudentsPage() {
  const session = await requireSchoolAdmin();
  const sa = lt.schoolAdmin;

  const students = await db.user.findMany({
    where: { schoolId: session.user.schoolId, role: "STUDENT" },
    include: {
      studentProfile: true,
      classMemberships: { include: { class: { select: { name: true } } } },
    },
    orderBy: { lastName: "asc" },
  });

  return (
    <AppShell area="school-admin" userName={`${session.user.firstName} ${session.user.lastName}`}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">{sa.students}</h1>
          <p className="text-neutral-500">{sa.studentsCount.replace("{count}", String(students.length))}</p>
        </div>

        {students.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-neutral-500">{sa.noStudents}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {students.map((student) => (
              <Card key={student.id}>
                <CardContent className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-medium">
                      {student.firstName} {student.lastName}
                    </p>
                    <p className="text-sm text-neutral-500">{student.email}</p>
                    {student.classMemberships.length > 0 && (
                      <p className="text-xs text-neutral-400">
                        {sa.classesList.replace(
                          "{names}",
                          student.classMemberships.map((m) => m.class.name).join(", ")
                        )}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {student.studentProfile?.gradeLevel && (
                      <Badge variant="secondary">
                        {lt.student.gradeWithLevel.replace(
                          "{level}",
                          String(student.studentProfile.gradeLevel)
                        )}
                      </Badge>
                    )}
                    <Badge
                      variant={student.status === "ACTIVE" ? "success" : "secondary"}
                    >
                      {tStatus(student.status)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
