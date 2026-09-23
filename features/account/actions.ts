"use server";

import { requireAuth } from "@/lib/auth/session";
import { verifyPassword } from "@/lib/auth/password";
import { db } from "@/lib/db";
import { lt } from "@/lib/i18n";
import { eraseAccount } from "@/services/account/account-data-service";
import { signOut } from "@/lib/auth";

export async function deleteOwnAccountAction(
  _prev: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string }> {
  const session = await requireAuth();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (confirm !== lt.account.deletePhrase) {
    return { error: lt.account.confirmMismatch };
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { passwordHash: true },
  });
  if (!user?.passwordHash || !(await verifyPassword(password, user.passwordHash))) {
    return { error: lt.auth.invalidCredentials };
  }

  await eraseAccount(session.user.id);
  await signOut({ redirectTo: "/" });
  return {};
}
