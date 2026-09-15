import { requireStudent } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/app-sidebar";
import { notificationService } from "@/services/notifications/notification-service";
import { Card, CardContent } from "@/components/ui/card";
import { NotificationsList } from "@/features/students/notifications-list";
import { lt } from "@/lib/i18n";

export default async function StudentNotificationsPage() {
  const session = await requireStudent();
  const { items: notifications } = await notificationService.getAll(session.user.id, 1, 50);

  return (
    <AppShell area="student" userName={`${session.user.firstName} ${session.user.lastName}`}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">{lt.common.notifications}</h1>
          <p className="text-neutral-500">{lt.student.notificationsDesc}</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <NotificationsList notifications={notifications} />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
