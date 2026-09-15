import { requireTeacher } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/app-sidebar";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { lt } from "@/lib/i18n";

export default async function TeacherStudentsPage() {
  const session = await requireTeacher();

  const classes = await db.class.findMany({
    where: { teacherId: session.user.id, status: "ACTIVE" },
    include: {
      members: {
        include: {
          user: {
            include: {
              studentProfile: true,
              submissions: {
                where: { assignment: { createdById: session.user.id } },
                select: { status: true, score: true, maxScore: true },
              },
            },
          },
        },
      },
      subject: true,
    },
  });

  const studentMap = new Map<
    string,
    {
      user: (typeof classes)[0]["members"][0]["user"];
      classes: string[];
    }
  >();

  for (const cls of classes) {
    for (const member of cls.members) {
      const existing = studentMap.get(member.userId);
      if (existing) {
        existing.classes.push(cls.name);
      } else {
        studentMap.set(member.userId, {
          user: member.user,
          classes: [cls.name],
        });
      }
    }
  }

  const students = Array.from(studentMap.values());

  return (
    <AppShell area="teacher" userName={`${session.user.firstName} ${session.user.lastName}`}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">{lt.teacher.studentsTitle}</h1>
          <p className="text-neutral-500">
            {lt.teacher.studentsEnrolledDesc.replace("{count}", String(students.length))}
          </p>
        </div>

        {students.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-neutral-500">{lt.teacher.noStudents}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {students.map(({ user, classes: classNames }) => {
              const completed = user.submissions.filter(
                (s) => s.status === "SUBMITTED" || s.status === "GRADED"
              ).length;
              const graded = user.submissions.filter((s) => s.status === "GRADED");
              const avgScore =
                graded.length > 0
                  ? Math.round(
                      graded.reduce((sum, s) => {
                        if (s.score != null && s.maxScore != null && s.maxScore > 0) {
                          return sum + (s.score / s.maxScore) * 100;
                        }
                        return sum;
                      }, 0) / graded.length
                    )
                  : null;

              return (
                <Card key={user.id}>
                  <CardContent className="flex items-center justify-between py-4">
                    <div>
                      <p className="font-medium">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-sm text-neutral-500">{user.email}</p>
                      <p className="mt-1 text-xs text-neutral-400">
                        {lt.teacher.classesLabel}: {classNames.join(", ")}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-neutral-500">
                        {lt.teacher.completedCount.replace("{count}", String(completed))}
                      </span>
                      {avgScore != null && (
                        <Badge variant={avgScore >= 70 ? "success" : "warning"}>
                          {lt.teacher.avgPercent.replace("{percent}", String(avgScore))}
                        </Badge>
                      )}
                      {user.studentProfile?.gradeLevel && (
                        <Badge variant="secondary">
                          {lt.teacher.gradeLabel.replace("{level}", String(user.studentProfile.gradeLevel))}
                        </Badge>
                      )}
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
