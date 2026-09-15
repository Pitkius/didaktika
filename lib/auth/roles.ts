import { lt, tRole } from "@/lib/i18n";
import { UserRole } from "@prisma/client";

export const roleDashboardPaths: Record<UserRole, string> = {
  STUDENT: "/student",
  TEACHER: "/teacher",
  SCHOOL_ADMIN: "/school-admin",
  SUPER_ADMIN: "/admin",
};

export const roleLabels: Record<UserRole, string> = {
  STUDENT: lt.roles.STUDENT,
  TEACHER: lt.roles.TEACHER,
  SCHOOL_ADMIN: lt.roles.SCHOOL_ADMIN,
  SUPER_ADMIN: lt.roles.SUPER_ADMIN,
};

export function getDashboardPath(role: UserRole): string {
  return roleDashboardPaths[role];
}

export function canAccessRole(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  return requiredRoles.includes(userRole);
}

export function isAdminRole(role: UserRole): boolean {
  return role === "SCHOOL_ADMIN" || role === "SUPER_ADMIN";
}

export function canManageSchool(role: UserRole): boolean {
  return role === "SCHOOL_ADMIN" || role === "SUPER_ADMIN";
}

export function canTeach(role: UserRole): boolean {
  return role === "TEACHER" || role === "SCHOOL_ADMIN" || role === "SUPER_ADMIN";
}

export { tRole };
