import { requireSuperAdmin } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/app-sidebar";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { lt, tStatus } from "@/lib/i18n";

export default async function AdminSchoolsPage() {
  const session = await requireSuperAdmin();
  const a = lt.admin;

  const schools = await db.school.findMany({
    include: {
      _count: { select: { users: true, classes: true } },
      subscriptions: { where: { status: "ACTIVE" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <AppShell area="admin" userName={`${session.user.firstName} ${session.user.lastName}`}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">{a.schools}</h1>
          <p className="text-neutral-500">{a.schoolsCount.replace("{count}", String(schools.length))}</p>
        </div>

        {schools.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-neutral-500">{a.noSchools}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {schools.map((school) => (
              <Card key={school.id}>
                <CardContent className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-medium">{school.name}</p>
                    <p className="text-sm text-neutral-500">
                      {school.city ?? a.noCity} · {school.country} · {school.slug}
                    </p>
                    <p className="mt-1 text-xs text-neutral-400">
                      {a.usersClasses
                        .replace("{users}", String(school._count.users))
                        .replace("{classes}", String(school._count.classes))}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {school.subscriptions[0] && (
                      <Badge variant="secondary">{tStatus(school.subscriptions[0].plan)}</Badge>
                    )}
                    <Badge variant={school.isActive ? "success" : "danger"}>
                      {school.isActive ? tStatus("ACTIVE") : tStatus("INACTIVE")}
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
