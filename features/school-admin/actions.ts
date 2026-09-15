"use server";

import { requireSchoolAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { revalidatePath } from "next/cache";
import { UserRole, UserStatus } from "@prisma/client";
import { lt } from "@/lib/i18n";

export async function createUserAction(formData: FormData) {
  const session = await requireSchoolAdmin();

  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;
  const role = formData.get("role") as UserRole;
  const password = formData.get("password") as string;

  if (!firstName || !lastName || !email || !role || !password) {
    return { error: lt.schoolAdmin.allFieldsRequired };
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
    where: { id: userId, schoolId: session.user.schoolId },
    data: { status: UserStatus.INACTIVE },
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
