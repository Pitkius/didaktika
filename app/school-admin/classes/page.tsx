import { requireSchoolAdmin } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/app-sidebar";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { lt, tStatus } from "@/lib/i18n";

export default async function SchoolAdminClassesPage() {
  const session = await requireSchoolAdmin();
  const sa = lt.schoolAdmin;

  const classes = await db.class.findMany({
    where: { schoolId: session.user.schoolId! },
    include: {
      teacher: { select: { firstName: true, lastName: true } },
      subject: true,
      _count: { select: { members: true, assignments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <AppShell area="school-admin" userName={`${session.user.firstName} ${session.user.lastName}`}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">{sa.classes}</h1>
          <p className="text-neutral-500">{sa.classesCount.replace("{count}", String(classes.length))}</p>
        </div>

        {classes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-neutral-500">{sa.noClasses}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {classes.map((cls) => (
              <Card key={cls.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{cls.name}</p>
                      <p className="text-sm text-neutral-500">
                        {cls.teacher.firstName} {cls.teacher.lastName} ·{" "}
                        {cls.subject?.name ?? lt.common.noSubject}
                      </p>
                    </div>
                    <Badge variant={cls.status === "ACTIVE" ? "success" : "secondary"}>
                      {tStatus(cls.status)}
                    </Badge>
                  </div>
                  <p className="mt-3 text-sm text-neutral-500">
                    {sa.classMeta
                      .replace("{students}", String(cls._count.members))
                      .replace("{assignments}", String(cls._count.assignments))}
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
