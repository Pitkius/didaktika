import { requireTeacher } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/app-sidebar";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { lt, tStatus } from "@/lib/i18n";
import { PrivacyPanel } from "@/features/account/privacy-panel";

export default async function TeacherSettingsPage() {
  const session = await requireTeacher();
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: { teacherProfile: true, school: { include: { settings: true } } },
  });

  if (!user) return null;

  return (
    <AppShell area="teacher" userName={`${session.user.firstName} ${session.user.lastName}`}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">{lt.common.settings}</h1>
          <p className="text-neutral-500">{lt.teacher.settingsDesc}</p>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base">{lt.teacher.account}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label>{lt.auth.firstName}</Label><Input value={user.firstName} readOnly className="mt-1 bg-neutral-50" /></div>
              <div><Label>{lt.auth.lastName}</Label><Input value={user.lastName} readOnly className="mt-1 bg-neutral-50" /></div>
            </div>
            <div><Label>{lt.common.email}</Label><Input value={user.email} readOnly className="mt-1 bg-neutral-50" /></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">{lt.teacher.schoolDefaults}</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-500">{lt.teacher.defaultAiAssistance}</span>
              <Badge variant="secondary">{tStatus(user.school?.settings?.aiAssistanceDefault ?? "GUIDANCE")}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">{lt.teacher.integrityMonitoring}</span>
              <Badge variant={user.school?.settings?.integrityMonitoring ? "success" : "secondary"}>
                {user.school?.settings?.integrityMonitoring ? lt.common.enabled : lt.common.disabled}
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <PrivacyPanel />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
