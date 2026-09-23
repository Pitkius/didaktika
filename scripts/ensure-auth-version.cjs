/**
 * Production was missing User.authVersion, so login and registration crashed.
 * Adds the column idempotently during deploy, then records the migration.
 */
const { execSync } = require("node:child_process");
const { PrismaClient } = require("@prisma/client");

async function main() {
  if (!process.env.DATABASE_URL) {
    console.warn("DATABASE_URL missing, skipping authVersion column check");
    return;
  }

  const prisma = new PrismaClient();
  try {
    await prisma.$executeRawUnsafe(
      'ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "authVersion" INTEGER NOT NULL DEFAULT 0'
    );
    console.log("User.authVersion is ready");
  } finally {
    await prisma.$disconnect();
  }

  try {
    execSync("npx prisma migrate resolve --applied 20260921180000_auth_version", {
      stdio: "inherit",
    });
  } catch {
    console.warn("auth_version migration was not marked applied; the column is still in place");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
