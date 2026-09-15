import { PrismaClient } from "@prisma/client";

const elobalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  elobalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") elobalForPrisma.prisma = db;
