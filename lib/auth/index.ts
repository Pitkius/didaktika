import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/lib/auth/auth.config";
import { verifyPassword } from "@/lib/auth/password";
import { db } from "@/lib/db";
import { loginSchema } from "@/lib/validations/auth";
import { rateLimit } from "@/lib/security/rate-limit";
import { UserStatus } from "@prisma/client";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  trustHost: true,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const limited = rateLimit(`login:${email}`, 5, 15 * 60 * 1000);
        if (!limited.ok) return null;

        const user = await db.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash) return null;
        if (user.status === UserStatus.SUSPENDED) return null;
        if (user.status === UserStatus.INACTIVE) return null;

        const valid = await verifyPassword(password, user.passwordHash);
        if (!valid) return null;

        await db.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        await db.auditLog.create({
          data: {
            actorId: user.id,
            action: "LOGIN",
            targetType: "User",
            targetId: user.id,
            schoolId: user.schoolId,
          },
        });

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          schoolId: user.schoolId,
          authVersion: user.authVersion,
        };
      },
    }),
  ],
});
