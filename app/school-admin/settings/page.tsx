import { requireSchoolAdmin } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/app-sidebar";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { lt, tStatus } from "@/lib/i18n";
import { PrivacyPanel } from "@/features/account/privacy-panel";

export default async function SchoolAdminSettingsPage() {
  const session = await requireSchoolAdmin();
  const sa = lt.schoolAdmin;

  const school = await db.school.findUnique({
    where: { id: session.user.schoolId! },
    include: { settings: true },
  });

  if (!school) return null;

  return (
    <AppShell area="school-admin" userName={`${session.user.firstName} ${session.user.lastName}`}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">{sa.schoolSettings}</h1>
          <p className="text-neutral-500">{sa.settingsFor.replace("{name}", school.name)}</p>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base">{sa.schoolProfile}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>{sa.schoolName}</Label><Input value={school.name} readOnly className="mt-1 bg-neutral-50" /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label>{sa.city}</Label><Input value={school.city ?? ""} readOnly className="mt-1 bg-neutral-50" /></div>
              <div><Label>{sa.country}</Label><Input value={school.country} readOnly className="mt-1 bg-neutral-50" /></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">{sa.platformDefaults}</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-neutral-500">{sa.defaultLanguage}</span><span className="font-medium">{school.settings?.defaultLanguage ?? "lt"}</span></div>
            <div className="flex justify-between"><span className="text-neutral-500">{lt.teacher.defaultAiAssistance}</span><Badge variant="secondary">{tStatus(school.settings?.aiAssistanceDefault ?? "GUIDANCE")}</Badge></div>
            <div className="flex justify-between"><span className="text-neutral-500">{lt.teacher.integrityMonitoring}</span><Badge variant={school.settings?.integrityMonitoring ? "success" : "secondary"}>{school.settings?.integrityMonitoring ? lt.common.on : lt.common.off}</Badge></div>
            <div className="flex justify-between"><span className="text-neutral-500">{sa.maxStudentsPerClass}</span><span className="font-medium">{school.settings?.maxStudentsPerClass ?? 40}</span></div>
            <div className="flex justify-between"><span className="text-neutral-500">{sa.studentSelfRegistration}</span><Badge variant={school.settings?.allowStudentSignup ? "success" : "secondary"}>{school.settings?.allowStudentSignup ? sa.allowed : lt.common.disabled}</Badge></div>
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
