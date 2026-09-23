import type { NextAuthConfig } from "next-auth";
import type { UserRole } from "@prisma/client";
import { roleDashboardPaths } from "@/lib/auth/roles";

const rolePrefixes: { prefix: string; roles: UserRole[] }[] = [
  { prefix: "/student", roles: ["STUDENT"] },
  { prefix: "/teacher", roles: ["TEACHER"] },
  { prefix: "/school-admin", roles: ["SCHOOL_ADMIN"] },
  { prefix: "/admin", roles: ["SUPER_ADMIN"] },
];

export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const path = nextUrl.pathname;

      const match = rolePrefixes.find((entry) => path.startsWith(entry.prefix));
      if (!match) return true;

      if (!isLoggedIn) return false;

      const role = auth.user.role as UserRole | undefined;
      if (!role || !match.roles.includes(role)) {
        const home = role ? roleDashboardPaths[role] : "/login";
        return Response.redirect(new URL(home, nextUrl));
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.schoolId = user.schoolId;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.authVersion = user.authVersion ?? 0;
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.schoolId = token.schoolId as string | null;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
        session.user.authVersion = Number(token.authVersion ?? 0);
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
