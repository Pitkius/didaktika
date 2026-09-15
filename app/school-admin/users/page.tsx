import { requireSchoolAdmin } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/app-sidebar";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { lt, tRole, tStatus } from "@/lib/i18n";

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function SchoolAdminUsersPage({ searchParams }: PageProps) {
  const session = await requireSchoolAdmin();
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const pageSize = 20;
  const sa = lt.schoolAdmin;

  const [users, total] = await Promise.all([
    db.user.findMany({
      where: { schoolId: session.user.schoolId },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.user.count({ where: { schoolId: session.user.schoolId } }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <AppShell area="school-admin" userName={`${session.user.firstName} ${session.user.lastName}`}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">{sa.users}</h1>
          <p className="text-neutral-500">{sa.usersCount.replace("{count}", String(total))}</p>
        </div>

        {users.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-neutral-500">{sa.noUsers}</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="space-y-3">
              {users.map((user) => (
                <Card key={user.id}>
                  <CardContent className="flex items-center justify-between py-4">
                    <div>
                      <p className="font-medium">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-sm text-neutral-500">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{tRole(user.role)}</Badge>
                      <Badge
                        variant={
                          user.status === "ACTIVE"
                            ? "success"
                            : user.status === "SUSPENDED"
                              ? "danger"
                              : "secondary"
                        }
                      >
                        {tStatus(user.status)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Pagination page={page} totalPages={totalPages} basePath="/school-admin/users" />
          </>
        )}
      </div>
    </AppShell>
  );
}
