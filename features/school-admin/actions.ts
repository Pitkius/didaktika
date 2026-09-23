"use server";

import { requireSchoolAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { entitlementService } from "@/services/entitlements/entitlement-service";
import { isRequiredEmailOperational } from "@/services/email/email-service";
import { revalidatePath } from "next/cache";
import { UserStatus } from "@prisma/client";
import { lt } from "@/lib/i18n";

export async function createUserAction(formData: FormData) {
  const session = await requireSchoolAdmin();
  if (!session.user.schoolId) return { error: lt.schoolAdmin.allFieldsRequired };

  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const roleRaw = String(formData.get("role") ?? "");
  const password = String(formData.get("password") ?? "");
  const role = roleRaw === "TEACHER" || roleRaw === "STUDENT" ? roleRaw : null;

  if (!firstName || !lastName || !email || !role || !password) {
    return { error: lt.schoolAdmin.allFieldsRequired };
  }

  if (role === "STUDENT") {
    const seats = await entitlementService.canAddStudent({
      userId: session.user.id,
      role: session.user.role,
      schoolId: session.user.schoolId,
    });
    if (!seats.allowed) return { error: seats.reason ?? lt.auth.seatsFull };
  }

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return { error: lt.schoolAdmin.emailInUse };

  const passwordHash = await hashPassword(password);

  await db.user.create({
    data: {
      firstName,
      lastName,
      email,
      role,
      passwordHash,
      schoolId: session.user.schoolId,
      status: UserStatus.ACTIVE,
      ...(role === "STUDENT"
        ? { studentProfile: { create: {} } }
        : { teacherProfile: { create: {} } }),
    },
  });

  await db.auditLog.create({
    data: {
      actorId: session.user.id,
      action: "USER_CREATED",
      targetType: "User",
      schoolId: session.user.schoolId,
      metadata: { email, role },
    },
  });

  revalidatePath("/school-admin/users");
  return { success: true };
}

export async function deactivateUserAction(userId: string) {
  const session = await requireSchoolAdmin();

  await db.user.updateMany({
    where: { id: userId, schoolId: session.user.schoolId, role: { not: "SUPER_ADMIN" } },
    data: { status: UserStatus.INACTIVE, authVersion: { increment: 1 } },
  });

  await db.auditLog.create({
    data: {
      actorId: session.user.id,
      action: "USER_DEACTIVATED",
      targetType: "User",
      targetId: userId,
      schoolId: session.user.schoolId,
    },
  });

  revalidatePath("/school-admin/users");
  return { success: true };
}

export async function createSubjectAction(formData: FormData) {
  const session = await requireSchoolAdmin();

  const name = formData.get("name") as string;
  const code = formData.get("code") as string;
  const description = formData.get("description") as string;
  const color = formData.get("color") as string;

  if (!name || !code) return { error: lt.schoolAdmin.nameCodeRequired };

  await db.subject.create({
    data: {
      name,
      code: code.toUpperCase(),
      description: description || null,
      color: color || "#2563eb",
      schoolId: session.user.schoolId!,
    },
  });

  await db.auditLog.create({
    data: {
      actorId: session.user.id,
      action: "SUBJECT_CREATED",
      targetType: "Subject",
      schoolId: session.user.schoolId,
      metadata: { name, code },
    },
  });

  revalidatePath("/school-admin/subjects");
  return { success: true };
}

export async function revokeInvitationAction(invitationId: string) {
  const session = await requireSchoolAdmin();

  await db.invitation.updateMany({
    where: { id: invitationId, schoolId: session.user.schoolId!, status: "PENDING" },
    data: { status: "REVOKED" },
  });

  revalidatePath("/school-admin/invitations");
  return { success: true };
}

export async function createInvitationAction(formData: FormData) {
  const session = await requireSchoolAdmin();
  if (!session.user.schoolId) return { error: lt.schoolAdmin.allFieldsRequired };
  if (!isRequiredEmailOperational()) return { error: lt.auth.emailUnavailable };

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const roleRaw = String(formData.get("role") ?? "STUDENT");
  const role = roleRaw === "TEACHER" ? "TEACHER" : "STUDENT";
  if (!email.includes("@")) return { error: lt.validation.invalidEmail };

  if (role === "STUDENT") {
    const seats = await entitlementService.canAddStudent({
      userId: session.user.id,
      role: session.user.role,
      schoolId: session.user.schoolId,
    });
    if (!seats.allowed) return { error: seats.reason ?? lt.auth.seatsFull };
  }

  const invitation = await db.invitation.create({
    data: {
      email,
      role,
      schoolId: session.user.schoolId,
      sentById: session.user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const { emailService } = await import("@/services/email/email-service");
  try {
    await emailService.sendInvitation(email, `${appUrl}/register?token=${invitation.token}`);
  } catch (error) {
    console.error("Invitation email failed:", error);
    await db.invitation.delete({ where: { id: invitation.id } });
    return { error: lt.auth.emailUnavailable };
  }

  revalidatePath("/school-admin/invitations");
  return { success: true };
}
