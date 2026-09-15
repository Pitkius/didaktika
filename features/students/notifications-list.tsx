"use client";

import { markAllNotificationsReadAction, markNotificationReadAction } from "@/features/students/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { NotificationType } from "@prisma/client";
import { useRouter } from "next/navigation";
import { lt } from "@/lib/i18n";

interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: Date;
}

interface NotificationsListProps {
  notifications: NotificationItem[];
}

export function NotificationsList({ notifications }: NotificationsListProps) {
  const router = useRouter();
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  async function handleMarkRead(id: string) {
    await markNotificationReadAction(id);
    router.refresh();
  }

  async function handleMarkAllRead() {
    await markAllNotificationsReadAction();
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {unreadCount > 0 && (
        <Button type="button" variant="outline" size="sm" onClick={handleMarkAllRead}>
          {lt.student.markAllRead}
        </Button>
      )}

      {notifications.length === 0 ? (
        <p className="py-12 text-center text-neutral-500">{lt.student.noNotifications}</p>
      ) : (
        <ul className="space-y-3">
          {notifications.map((n) => (
            <li
              key={n.id}
              className={`rounded-le border p-4 ${
                n.isRead ? "border-neutral-200 bg-white" : "border-brand-200 bg-brand-50/30"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{n.title}</p>
                    {!n.isRead && <Badge variant="default">{lt.common.new}</Badge>}
                  </div>
                  <p className="mt-1 text-sm text-neutral-600">{n.message}</p>
                  <p className="mt-2 text-xs text-neutral-400">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                  {n.link && (
                    <Link href={n.link} className="mt-2 inline-block text-sm text-brand-600 hover:underline">
                      {lt.student.viewDetails}
                    </Link>
                  )}
                </div>
                {!n.isRead && (
                  <Button type="button" variant="ghost" size="sm" onClick={() => handleMarkRead(n.id)}>
                    {lt.student.markRead}
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
