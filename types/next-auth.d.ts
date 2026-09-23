import { auth } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      firstName: string;
      lastName: string;
      role: UserRole;
      schoolId: string | null;
      authVersion: number;
    };
  }

  interface User {
    firstName: string;
    lastName: string;
    role: UserRole;
    schoolId: string | null;
    authVersion: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    schoolId: string | null;
    firstName: string;
    lastName: string;
    authVersion: number;
  }
}

export type Session = Awaited<ReturnType<typeof auth>>;
