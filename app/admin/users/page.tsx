import { requireSuperAdmin } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/app-sidebar";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { lt, tRole, tStatus } from "@/lib/i18n";

interface PageProps {
  searchParams: Promise<{ page?: string; role?: string }>;
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const session = await requireSuperAdmin();
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const pageSize = 25;
  const a = lt.admin;

  const where = params.role ? { role: params.role as "STUDENT" | "TEACHER" | "SCHOOL_ADMIN" | "SUPER_ADMIN" } : {};

  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      include: { school: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.user.count({ where }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <AppShell area="admin" userName={`${session.user.firstName} ${session.user.lastName}`}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">{a.users}</h1>
          <p className="text-neutral-500">{a.usersCount.replace("{count}", String(total))}</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form method="get" className="flex flex-wrap gap-4 items-end">
              <div>
                <label htmlFor="role" className="text-sm font-medium">{a.filterRole}</label>
                <select
                  id="role"
                  name="role"
                  defaultValue={params.role ?? ""}
                  className="mt-1 flex h-10 rounded-md border border-neutral-300 px-3 text-sm"
                >
                  <option value="">{a.allRoles}</option>
                  <option value="STUDENT">{tRole("STUDENT")}</option>
                  <option value="TEACHER">{tRole("TEACHER")}</option>
                  <option value="SCHOOL_ADMIN">{tRole("SCHOOL_ADMIN")}</option>
                  <option value="SUPER_ADMIN">{tRole("SUPER_ADMIN")}</option>
                </select>
              </div>
              <button
                type="submit"
                className="rounded-md bg-brand-600 px-4 py-2 text-sm text-white hover:bg-brand-700"
              >
                {lt.common.filter}
              </button>
            </form>
          </CardContent>
        </Card>

        {users.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-neutral-500">{a.noUsers}</p>
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
                      {user.school && (
                        <p className="text-xs text-neutral-400">{user.school.name}</p>
                      )}
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
            <Pagination page={page} totalPages={totalPages} basePath="/admin/users" />
          </>
        )}
      </div>
    </AppShell>
  );
}
