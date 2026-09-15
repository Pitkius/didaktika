import { requireSchoolAdmin } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/app-sidebar";
import { analyticsService } from "@/services/analytics/analytics-service";
import { Card, CardContent } from "@/components/ui/card";
import { Users, BookOpen, GraduationCap, ClipboardList } from "lucide-react";
import { lt } from "@/lib/i18n";

export default async function SchoolAdminDashboardPage() {
  const session = await requireSchoolAdmin();
  const stats = await analyticsService.getSchoolStats(session.user.schoolId!);
  const sa = lt.schoolAdmin;

  return (
    <AppShell area="school-admin" userName={`${session.user.firstName} ${session.user.lastName}`}>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold">{sa.title}</h1>
          <p className="text-neutral-500">{sa.desc}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <GraduationCap className="h-5 w-5 text-brand-600" />
              <div>
                <p className="text-sm text-neutral-500">{sa.teachers}</p>
                <p className="text-2xl font-semibold">{stats.teachers}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <Users className="h-5 w-5 text-brand-600" />
              <div>
                <p className="text-sm text-neutral-500">{sa.students}</p>
                <p className="text-2xl font-semibold">{stats.students}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <BookOpen className="h-5 w-5 text-brand-600" />
              <div>
                <p className="text-sm text-neutral-500">{sa.classes}</p>
                <p className="text-2xl font-semibold">{stats.classes}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <ClipboardList className="h-5 w-5 text-brand-600" />
              <div>
                <p className="text-sm text-neutral-500">{sa.assignments}</p>
                <p className="text-2xl font-semibold">{stats.assignments}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
