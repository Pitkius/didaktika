import { requireSuperAdmin } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/app-sidebar";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { lt, tStatus } from "@/lib/i18n";

export default async function AdminIntegrityPage() {
  const session = await requireSuperAdmin();
  const a = lt.admin;

  const [flags, byLevel] = await Promise.all([
    db.aIIntegrityFlag.findMany({
      include: {
        student: { select: { firstName: true, lastName: true, email: true } },
        submission: { include: { assignment: { select: { title: true } } } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    db.aIIntegrityFlag.groupBy({ by: ["riskLevel"], _count: true }),
  ]);

  const riskLabel = (level: string) => {
    if (level === "HIGH") return a.riskHigh;
    if (level === "MEDIUM") return a.riskMedium;
    return a.riskLow;
  };

  return (
    <AppShell area="admin" userName={`${session.user.firstName} ${session.user.lastName}`}>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold">{a.integrityOverview}</h1>
          <p className="text-neutral-500">{a.integrityDesc}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {byLevel.map((entry) => (
            <Card key={entry.riskLevel}>
              <CardContent className="pt-6">
                <p className="text-sm text-neutral-500">{riskLabel(entry.riskLevel)}</p>
                <p className="text-2xl font-semibold">{entry._count}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base">{a.recentFlags}</CardTitle></CardHeader>
          <CardContent>
            {flags.length === 0 ? (
              <p className="text-sm text-neutral-500">{a.noFlags}</p>
            ) : (
              <ul className="divide-y divide-neutral-200">
                {flags.map((flag) => (
                  <li key={flag.id} className="flex items-center justify-between py-3 text-sm">
                    <div>
                      <p className="font-medium">{flag.student.firstName} {flag.student.lastName}</p>
                      <p className="text-neutral-500">{flag.submission?.assignment.title ?? a.learningSession}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={flag.riskLevel === "HIGH" ? "danger" : flag.riskLevel === "MEDIUM" ? "warning" : "secondary"}>
                        {tStatus(flag.riskLevel)}
                      </Badge>
                      {flag.isResolved && <Badge variant="success">{lt.common.resolved}</Badge>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
