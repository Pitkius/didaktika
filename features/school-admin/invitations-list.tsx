"use client";

import { revokeInvitationAction } from "@/features/school-admin/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InvitationStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import { lt, tRole, tStatus } from "@/lib/i18n";

interface InvitationItem {
  id: string;
  email: string;
  role: string;
  status: InvitationStatus;
  expiresAt: Date;
  createdAt: Date;
  sentBy: { firstName: string; lastName: string };
}

interface InvitationsListProps {
  invitations: InvitationItem[];
}

export function InvitationsList({ invitations }: InvitationsListProps) {
  const router = useRouter();

  async function handleRevoke(id: string) {
    await revokeInvitationAction(id);
    router.refresh();
  }

  if (invitations.length === 0) {
    return (
      <p className="py-12 text-center text-neutral-500">{lt.schoolAdmin.noInvitations}</p>
    );
  }

  return (
    <ul className="space-y-3">
      {invitations.map((inv) => (
        <li
          key={inv.id}
          className="flex items-center justify-between rounded-le border border-neutral-200 p-4"
        >
          <div>
            <p className="font-medium">{inv.email}</p>
            <p className="text-sm text-neutral-500">
              {lt.schoolAdmin.sentByLine
                .replace("{role}", tRole(inv.role))
                .replace("{name}", `${inv.sentBy.firstName} ${inv.sentBy.lastName}`)}
            </p>
            <p className="text-xs text-neutral-400">
              {lt.schoolAdmin.expiresLine.replace(
                "{date}",
                new Date(inv.expiresAt).toLocaleDateString()
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={
                inv.status === "PENDING"
                  ? "warning"
                  : inv.status === "ACCEPTED"
                    ? "success"
                    : "secondary"
              }
            >
              {tStatus(inv.status)}
            </Badge>
            {inv.status === "PENDING" && (
              <Button type="button" variant="outline" size="sm" onClick={() => handleRevoke(inv.id)}>
                {lt.common.revoke}
              </Button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
