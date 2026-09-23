import { requireStudent } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/app-sidebar";
import { getStudentAssignments } from "@/features/students/queries";
import { getSelfStudyContext } from "@/services/learning/self-study-service";
import { SelfStudyAssignments } from "@/features/students/self-study-assignments";
import { getPlanDefinition } from "@/config/plans";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { lt, tStatus } from "@/lib/i18n";
import { JoinClassForm } from "@/features/students/join-class-form";

export default async function StudentAssignmentsPage() {
  const session = await requireStudent();
  const selfStudy = await getSelfStudyContext(session.user.id, session.user.schoolId);

  if (selfStudy.independent) {
    const practices = await getStudentAssignments(session.user.id, ["PRACTICE"]);
    const plan = getPlanDefinition(selfStudy.plan);

    return (
      <AppShell area="student" userName={`${session.user.firstName} ${session.user.lastName}`}>
        <div className="space-y-6">
          <JoinClassForm />
          <SelfStudyAssignments
          limits={selfStudy.limits}
          planName={plan.name}
          gradeLevel={selfStudy.gradeLevel}
          initialSelections={selfStudy.selections}
          labeled={selfStudy.labeled}
          practices={practices.map((a) => {
            const submission = a.submissions[0];
            return {
              id: a.id,
              title: a.title,
              href: `/student/assignments/${a.id}`,
              statusLabel: submission?.status
                ? tStatus(submission.status)
                : lt.common.notStarted,
            };
          })}
        />
        </div>
      </AppShell>
    );
  }

  const assignments = await getStudentAssignments(session.user.id, [
    "ASSIGNMENT",
    "PRACTICE",
  ]);

  return (
    <AppShell area="student" userName={`${session.user.firstName} ${session.user.lastName}`}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">{lt.nav.student.assignments}</h1>
          <p className="mt-1 text-neutral-500">{lt.student.assignmentsDesc}</p>
        </div>
        <JoinClassForm />

        {assignments.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-neutral-500">{lt.student.noAssignmentsSchool}</p>
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
                      <p className="font-medium">{a.title}</p>
                      <p className="text-sm text-neutral-500">
                        {a.subject?.name} ·{" "}
                        {a.dueDate
                          ? `${lt.common.due} ${new Date(a.dueDate).toLocaleDateString()}`
                          : lt.common.noDueDate}
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
