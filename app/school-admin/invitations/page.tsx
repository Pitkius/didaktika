import { requireSchoolAdmin } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/app-sidebar";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { InvitationsList } from "@/features/school-admin/invitations-list";
import { CreateInvitationForm } from "@/features/school-admin/create-invitation-form";
import { lt } from "@/lib/i18n";

export default async function SchoolAdminInvitationsPage() {
  const session = await requireSchoolAdmin();
  const sa = lt.schoolAdmin;

  const invitations = await db.invitation.findMany({
    where: { schoolId: session.user.schoolId! },
    include: { sentBy: { select: { firstName: true, lastName: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <AppShell area="school-admin" userName={`${session.user.firstName} ${session.user.lastName}`}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">{sa.invitations}</h1>
          <p className="text-neutral-500">{sa.invitationsCount.replace("{count}", String(invitations.length))}</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <CreateInvitationForm />
            <InvitationsList invitations={invitations} />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
