"use server";

import type { AuthActionState } from "@/features/auth/types";
import { signIn, signOut } from "@/lib/auth";
import { hashPassword, generateToken } from "@/lib/auth/password";
import { hashToken } from "@/lib/security/tokens";
import { peekRateLimit, rateLimit } from "@/lib/security/rate-limit";
import { isRequiredEmailOperational } from "@/services/email/email-service";
import { getPlanDefinition } from "@/config/plans";
import type { Prisma } from "@prisma/client";
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
import { headers } from "next/headers";
import { redirect } from "next/navigation";

function isRedirectError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    String((error as { digest?: unknown }).digest).startsWith("NEXT_REDIRECT")
  );
}

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: getZodErrorMessage(parsed.error) };
  }

  const limited = peekRateLimit(`login:${parsed.data.email}`, 5);
  if (!limited.ok) {
    return { error: lt.auth.tooManyAttempts };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
  } catch (error) {
    if (isRedirectError(error)) throw error;
    if (error instanceof AuthError) {
      return { error: lt.auth.invalidCredentials };
    }
    console.error(error);
    return { error: lt.common.unexpectedError };
  }

  const user = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (user) {
    redirect(getDashboardPath(user.role));
  }
  redirect("/login");
}

async function schoolHasStudentSeat(tx: Prisma.TransactionClient, schoolId: string) {
  const sub = await tx.subscription.findFirst({
    where: { schoolId, status: { in: ["ACTIVE", "TRIALING"] } },
    orderBy: { createdAt: "desc" },
  });
  const limit = sub?.seatsLimit ?? getPlanDefinition(sub?.plan ?? "FREE").seatsLimit ?? 1;
  if (limit == null) return true;
  const used = await tx.user.count({
    where: { schoolId, role: "STUDENT", status: "ACTIVE" },
  });
  return used < limit;
}

function registerFields(formData: FormData) {
  return {
    firstName: String(formData.get("firstName") ?? ""),
    lastName: String(formData.get("lastName") ?? ""),
    email: String(formData.get("email") ?? ""),
    gradeLevel: String(formData.get("gradeLevel") ?? ""),
    password: String(formData.get("password") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  };
}

export async function registerAction(formData: FormData) {
  const fields = registerFields(formData);
  const parsed = registerSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    role: "STUDENT",
    gradeLevel: formData.get("gradeLevel") || undefined,
    inviteToken: formData.get("inviteToken") || undefined,
  });

  if (!parsed.success) {
    return { error: getZodErrorMessage(parsed.error), fields };
  }

  const passwordHash = await hashPassword(parsed.data.password);

  let user: { id: string; email: string; role: UserRole; schoolId: string | null };
  try {
    const existing = await db.user.findUnique({ where: { email: parsed.data.email } });
    if (existing) {
      return { error: lt.auth.emailExists, fields };
    }

    user = await db.$transaction(async (tx) => {
      let schoolId: string | null = null;
      let role: UserRole = "STUDENT";
      let classId: string | null = null;
      let invitationId: string | null = null;

      if (parsed.data.inviteToken) {
        const invitation = await tx.invitation.findUnique({
          where: { token: parsed.data.inviteToken },
        });
        if (!invitation || invitation.status !== "PENDING" || invitation.expiresAt < new Date()) {
          throw new Error("INVITE");
        }
        if (invitation.email.trim().toLowerCase() !== parsed.data.email) {
          throw new Error("INVITE_EMAIL");
        }
        if (invitation.role === "SUPER_ADMIN") {
          throw new Error("INVITE");
        }
        if (invitation.role === "STUDENT") {
          const open = await schoolHasStudentSeat(tx, invitation.schoolId);
          if (!open) throw new Error("SEATS");
        }
        schoolId = invitation.schoolId;
        role = invitation.role;
        classId = invitation.classId;
        invitationId = invitation.id;
      }

      const created = await tx.user.create({
        data: {
          email: parsed.data.email,
          firstName: parsed.data.firstName,
          lastName: parsed.data.lastName,
          passwordHash,
          role,
          schoolId,
          status: UserStatus.ACTIVE,
          ...(role === "STUDENT"
            ? { studentProfile: { create: { gradeLevel: parsed.data.gradeLevel ?? null } } }
            : { teacherProfile: { create: {} } }),
        },
      });

      if (classId) {
        await tx.classMember.create({ data: { classId, userId: created.id } });
      }
      if (invitationId) {
        await tx.invitation.update({
          where: { id: invitationId },
          data: { status: "ACCEPTED", acceptedById: created.id },
        });
      }
      await tx.auditLog.create({
        data: {
          actorId: created.id,
          action: "USER_REGISTERED",
          targetType: "User",
          targetId: created.id,
          schoolId,
        },
      });
      return created;
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "INVITE_EMAIL") return { error: lt.auth.inviteEmailMismatch, fields };
    if (message === "SEATS") return { error: lt.auth.seatsFull, fields };
    if (message === "INVITE") return { error: lt.auth.invalidInvite, fields };
    if (isRedirectError(error)) throw error;
    console.error(error);
    return { error: lt.common.unexpectedError, fields };
  }

  const verifyToken = generateToken();
  await db.verificationToken.create({
    data: {
      userId: user.id,
      token: hashToken(verifyToken),
      expires: new Date(Date.now() + 24 * 3600000),
    },
  });
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  try {
    const { emailService } = await import("@/services/email/email-service");
    await emailService.sendEmailVerification(
      user.email,
      `${appUrl}/verify-email?token=${verifyToken}`
    );
  } catch (error) {
    console.error("Verification email failed:", error);
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
  } catch {
    redirect("/login?registered=true");
  }

  redirect(getDashboardPath(user.role));
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

  const limited = rateLimit(`reset:${parsed.data.email}`, 3, 60 * 60 * 1000);
  if (!limited.ok) {
    return { error: lt.auth.tooManyAttempts };
  }

  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const ipLimited = rateLimit(`reset-ip:${ip}`, 10, 60 * 60 * 1000);
  if (!ipLimited.ok) {
    return { error: lt.auth.tooManyAttempts };
  }

  const user = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (!user) {
    return {
      success: true,
      message: isRequiredEmailOperational() ? lt.auth.resetLinkSent : lt.auth.resetLinkOnPage,
    };
  }

  const token = generateToken();
  const expires = new Date(Date.now() + 3600000);
  await db.passwordResetToken.deleteMany({ where: { userId: user.id } });
  await db.passwordResetToken.create({
    data: { userId: user.id, token: hashToken(token), expires },
  });
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const resetUrl = `${appUrl}/reset-password?token=${token}`;

  if (!isRequiredEmailOperational()) {
    return { success: true, message: lt.auth.resetLinkOnPage, resetUrl };
  }

  const { emailService } = await import("@/services/email/email-service");
  try {
    await emailService.sendPasswordReset(user.email, resetUrl);
  } catch (error) {
    console.error("Password reset email failed:", error);
    await db.passwordResetToken.deleteMany({ where: { userId: user.id } });
    return { error: lt.auth.emailUnavailable };
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
    where: { token: hashToken(parsed.data.token) },
  });

  if (!resetToken || resetToken.expires < new Date()) {
    return { error: lt.auth.invalidResetToken };
  }

  const passwordHash = await hashPassword(parsed.data.password);
  await db.user.update({
    where: { id: resetToken.userId },
    data: { passwordHash, authVersion: { increment: 1 } },
  });
  await db.passwordResetToken.deleteMany({ where: { userId: resetToken.userId } });

  return { success: true };
}

export async function verifyEmailAction(token: string) {
  if (!token) return { error: lt.auth.invalidResetToken };

  const record = await db.verificationToken.findUnique({ where: { token: hashToken(token) } });
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
