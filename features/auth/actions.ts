"use server";

import type { AuthActionState } from "@/features/auth/types";
import { signIn, signOut } from "@/lib/auth";
import { hashPassword, generateToken } from "@/lib/auth/password";
import { getDashboardPath } from "@/lib/auth/roles";
import { db } from "@/lib/db";
import { lt } from "@/lib/i18n";
import { getZodErrorMessage } from "@/lib/validations/utils";
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/lib/validations/auth";
import { UserRole, UserStatus } from "@prisma/client";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: getZodErrorMessage(parsed.error) };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: lt.auth.invalidCredentials };
    }
    throw error;
  }

  const user = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (user) {
    redirect(getDashboardPath(user.role));
  }
  redirect("/login");
}

export async function registerAction(formData: FormData) {
  const parsed = registerSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    role: formData.get("role") ?? "STUDENT",
    inviteToken: formData.get("inviteToken") || undefined,
  });

  if (!parsed.success) {
    return { error: getZodErrorMessage(parsed.error) };
  }

  const existing = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return { error: lt.auth.emailExists };
  }

  let schoolId: string | null = null;
  let role: UserRole = parsed.data.role as UserRole;
  let classId: string | null = null;

  if (parsed.data.inviteToken) {
    const invitation = await db.invitation.findUnique({
      where: { token: parsed.data.inviteToken, status: "PENDING" },
    });
    if (!invitation || invitation.expiresAt < new Date()) {
      return { error: lt.auth.invalidInvite };
    }
    schoolId = invitation.schoolId;
    role = invitation.role;
    classId = invitation.classId;
  }

  const passwordHash = await hashPassword(parsed.data.password);

  const user = await db.user.create({
    data: {
      email: parsed.data.email,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      passwordHash,
      role,
      schoolId,
      status: UserStatus.ACTIVE,
      ...(role === "STUDENT"
        ? { studentProfile: { create: {} } }
        : { teacherProfile: { create: {} } }),
    },
  });

  if (classId) {
    await db.classMember.create({
      data: { classId, userId: user.id },
    });
  }

  if (parsed.data.inviteToken) {
    await db.invitation.update({
      where: { token: parsed.data.inviteToken },
      data: { status: "ACCEPTED", acceptedById: user.id },
    });
  }

  await db.auditLog.create({
    data: {
      actorId: user.id,
      action: "USER_REGISTERED",
      targetType: "User",
      targetId: user.id,
      schoolId,
    },
  });

  const verifyToken = generateToken();
  await db.verificationToken.create({
    data: {
      userId: user.id,
      token: verifyToken,
      expires: new Date(Date.now() + 24 * 3600000),
    },
  });
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const { emailService } = await import("@/services/email/email-service");
  await emailService.sendEmailVerification(
    user.email,
    `${appUrl}/verify-email?token=${verifyToken}`
  );

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
  } catch {
    redirect("/login?registered=true");
  }

  redirect(getDashboardPath(role));
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}

export async function forgotPasswordAction(formData: FormData) {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { error: getZodErrorMessage(parsed.error, lt.validation.invalidEmail) };
  }

  const user = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (user) {
    const token = generateToken();
    const expires = new Date(Date.now() + 3600000);
    await db.passwordResetToken.create({
      data: { userId: user.id, token, expires },
    });
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const { emailService } = await import("@/services/email/email-service");
    await emailService.sendPasswordReset(
      user.email,
      `${appUrl}/reset-password?token=${token}`
    );
  }

  return { success: true, message: lt.auth.resetLinkSent };
}

export async function resetPasswordAction(formData: FormData) {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: getZodErrorMessage(parsed.error) };
  }

  const resetToken = await db.passwordResetToken.findUnique({
    where: { token: parsed.data.token },
  });

  if (!resetToken || resetToken.expires < new Date()) {
    return { error: lt.auth.invalidResetToken };
  }

  const passwordHash = await hashPassword(parsed.data.password);
  await db.user.update({
    where: { id: resetToken.userId },
    data: { passwordHash },
  });
  await db.passwordResetToken.delete({ where: { id: resetToken.id } });

  return { success: true };
}

export async function verifyEmailAction(token: string) {
  if (!token) return { error: lt.auth.invalidResetToken };

  const record = await db.verificationToken.findUnique({ where: { token } });
  if (!record || record.expires < new Date()) {
    return { error: lt.auth.invalidResetToken };
  }

  await db.user.update({
    where: { id: record.userId },
    data: { emailVerified: new Date() },
  });
  await db.verificationToken.delete({ where: { id: record.id } });

  return { success: true };
}

export async function loginFormAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  return (await loginAction(formData)) ?? null;
}

export async function registerFormAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  return (await registerAction(formData)) ?? null;
}

export async function forgotPasswordFormAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  return (await forgotPasswordAction(formData)) ?? null;
}

export async function resetPasswordFormAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const result = await resetPasswordAction(formData);
  if (result?.success) {
    return {
      success: true,
      message: lt.auth.passwordResetSuccess,
    };
  }
  return result ?? null;
}
