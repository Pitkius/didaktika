import { requireTeacher } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/app-sidebar";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { resolveIntegrityFlagAction } from "@/features/teachers/actions";
import { lt, tStatus } from "@/lib/i18n";

export default async function TeacherIntegrityPage() {
  const session = await requireTeacher();

  const { entitlementService } = await import(
    "@/services/entitlements/entitlement-service"
  );
  const access = await entitlementService.canUseIntegrity({
    userId: session.user.id,
    role: session.user.role,
    schoolId: session.user.schoolId,
  });

  if (!access.allowed) {
    return (
      <AppShell area="teacher" userName={`${session.user.firstName} ${session.user.lastName}`}>
        <div className="space-y-4">
          <h1 className="text-2xl font-semibold">{lt.teacher.integrityTitle}</h1>
          <p className="text-neutral-500">{access.reason}</p>
          <Button asChild>
            <Link href="/teacher/billing">{lt.billing.upgrade}</Link>
          </Button>
        </div>
      </AppShell>
    );
  }

  const flags = await db.aIIntegrityFlag.findMany({
    where: {
      submission: { assignment: { createdById: session.user.id } },
    },
    include: {
      student: { select: { firstName: true, lastName: true, email: true } },
      submission: {
        include: {
          assignment: { select: { title: true, integrityMonitoring: true } },
          integrityEvents: { select: { type: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const pendingCount = flags.filter((f) => !f.isResolved).length;

  return (
    <AppShell area="teacher" userName={`${session.user.firstName} ${session.user.lastName}`}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">{lt.teacher.integrityTitle}</h1>
          <p className="text-neutral-500">
            {lt.teacher.integritySummary
              .replace("{pending}", String(pendingCount))
              .replace("{total}", String(flags.length))}
          </p>
        </div>

        {flags.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-neutral-500">{lt.teacher.noIntegrityFlags}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {flags.map((flag) => (
              <Card key={flag.id}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium">
                        {flag.student.firstName} {flag.student.lastName}
                      </p>
                      <p className="text-sm text-neutral-500">
                        {flag.submission?.assignment.title ?? lt.teacher.unknownAssignment}
                      </p>
                      <p className="mt-1 text-xs text-neutral-400">
                        {lt.teacher.riskScoreLine.replace("{score}", String(Math.round(flag.riskScore * 100)))} ·{" "}
                        {new Date(flag.createdAt).toLocaleDateString()}
                      </p>
                      {Array.isArray(flag.indicators) && (flag.indicators as string[]).length > 0 && (
                        <p className="mt-2 text-xs text-neutral-600">
                          {lt.teacher.integrityIndicators}:{" "}
                          {(flag.indicators as string[]).slice(0, 6).join(" · ")}
                        </p>
                      )}
                      {flag.submission?.integrityEvents && flag.submission.integrityEvents.length > 0 && (
                        <p className="mt-1 text-xs text-neutral-500">
                          {lt.teacher.integrityEventsCount.replace(
                            "{count}",
                            String(flag.submission.integrityEvents.length)
                          )}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge
                        variant={
                          flag.riskLevel === "HIGH"
                            ? "danger"
                            : flag.riskLevel === "MEDIUM"
                              ? "warning"
                              : "secondary"
                        }
                      >
                        {tStatus(flag.riskLevel)}
                      </Badge>
                      <Badge variant={flag.isResolved ? "success" : "warning"}>
                        {flag.isResolved ? lt.common.resolved : lt.common.pending}
                      </Badge>
                    </div>
                  </div>
                  {flag.teacherNotes && (
                    <p className="mt-3 text-sm text-neutral-600">{flag.teacherNotes}</p>
                  )}
                  {!flag.isResolved && (
                    <form
                      action={async (formData) => {
                        "use server";
                        await resolveIntegrityFlagAction(formData);
                      }}
                      className="mt-3 flex gap-2"
                    >
                      <input type="hidden" name="flagId" value={flag.id} />
                      <input
                        name="teacherNotes"
                        placeholder="Mokytojo pastaba"
                        className="flex-1 rounded-md border border-neutral-200 px-3 py-1.5 text-sm"
                      />
                      <Button type="submit" size="sm" variant="outline">
                        {lt.common.resolved}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
