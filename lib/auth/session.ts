import { auth } from "@/lib/auth";
import { getDashboardPath } from "@/lib/auth/roles";
import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";

export async function getSession() {
  return auth();
}

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
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
