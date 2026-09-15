import { requireStudent } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/app-sidebar";
import { getStudentAssignments } from "@/features/students/queries";
import { entitlementService } from "@/services/entitlements/entitlement-service";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { lt, tStatus } from "@/lib/i18n";

export default async function StudentTestsPage() {
  const session = await requireStudent();
  const independent = entitlementService.isIndependentStudent({
    userId: session.user.id,
    role: "STUDENT",
    schoolId: session.user.schoolId,
  });

  if (independent) {
    return (
      <AppShell area="student" userName={`${session.user.firstName} ${session.user.lastName}`}>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-semibold">{lt.student.testsExams}</h1>
            <p className="text-neutral-500">{lt.student.testsDesc}</p>
          </div>
          <Card>
            <CardContent className="space-y-4 py-12 text-center">
              <p className="text-neutral-500">{lt.student.noTestsIndependent}</p>
              <Button asChild>
                <Link href="/student/assignments">{lt.student.selfStudyGoAssignments}</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    );
  }

  const assignments = await getStudentAssignments(session.user.id, ["TEST", "EXAM"]);

  return (
    <AppShell area="student" userName={`${session.user.firstName} ${session.user.lastName}`}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">{lt.student.testsExams}</h1>
          <p className="text-neutral-500">{lt.student.testsDesc}</p>
        </div>

        {assignments.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-neutral-500">{lt.student.noTests}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {assignments.map((a) => {
              const submission = a.submissions[0];
              return (
                <Card key={a.id}>
                  <CardContent className="flex items-center justify-between py-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{a.title}</p>
                        <Badge variant="secondary">{tStatus(a.type)}</Badge>
                      </div>
                      <p className="text-sm text-neutral-500">
                        {a.subject?.name} ·{" "}
                        {a.dueDate
                          ? `${lt.common.due} ${new Date(a.dueDate).toLocaleDateString()}`
                          : lt.common.noDueDate}
                        {a.timeLimitMinutes &&
                          ` · ${lt.student.timeLimitMin.replace("{min}", String(a.timeLimitMinutes))}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={
                          submission?.status === "GRADED"
                            ? "success"
                            : submission?.status === "SUBMITTED"
                              ? "default"
                              : "secondary"
                        }
                      >
                        {submission?.status ? tStatus(submission.status) : lt.common.notStarted}
                      </Badge>
                      <Button asChild size="sm">
                        <Link href={`/student/assignments/${a.id}`}>
                          {submission ? lt.common.view : lt.common.start}
                        </Link>
                      </Button>
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
