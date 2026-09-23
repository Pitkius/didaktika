import { auth } from "@/lib/auth";
import { getDashboardPath } from "@/lib/auth/roles";
import { db } from "@/lib/db";
import { UserRole, UserStatus } from "@prisma/client";
import { redirect } from "next/navigation";

export async function getSession() {
  return auth();
}

export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      status: true,
      authVersion: true,
      role: true,
      schoolId: true,
      firstName: true,
      lastName: true,
      email: true,
    },
  });

  if (!user || user.status !== UserStatus.ACTIVE || user.authVersion !== session.user.authVersion) {
    redirect("/login");
  }

  session.user.role = user.role;
  session.user.schoolId = user.schoolId;
  session.user.firstName = user.firstName;
  session.user.lastName = user.lastName;
  session.user.email = user.email;
  return session;
}

export async function requireRole(allowedRoles: UserRole[]) {
  const session = await requireAuth();
  const role = session.user.role as UserRole;
  if (!allowedRoles.includes(role)) {
    redirect(getDashboardPath(role));
  }
  return session;
}

export async function requireStudent() {
  return requireRole(["STUDENT"]);
}

export async function requireTeacher() {
  return requireRole(["TEACHER", "SCHOOL_ADMIN", "SUPER_ADMIN"]);
}

export async function requireSchoolAdmin() {
  return requireRole(["SCHOOL_ADMIN", "SUPER_ADMIN"]);
}

export async function requireSuperAdmin() {
  return requireRole(["SUPER_ADMIN"]);
}
