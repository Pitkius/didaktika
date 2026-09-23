/**
 * Production was missing User.authVersion, so login and registration crashed.
 * Adds the column idempotently during deploy, then records the migration.
 */
const { execSync } = require("node:child_process");
const { PrismaClient } = require("@prisma/client");

async function wipeUsers(prisma) {
  if (process.env.WIPE_USERS !== "1") return;

  const before = await prisma.user.count();
  await prisma.$transaction(
    async (tx) => {
      await tx.mistake.deleteMany();
      await tx.questionAttempt.deleteMany();
      await tx.integrityEvent.deleteMany();
      await tx.aIIntegrityFlag.deleteMany();
      await tx.assignmentSubmission.deleteMany();
      await tx.assignmentQuestion.deleteMany();
      await tx.assignment.deleteMany();
      await tx.aIConversationMessage.deleteMany();
      await tx.aIConversation.deleteMany();
      await tx.learningProfile.deleteMany();
      await tx.learningEvent.deleteMany();
      await tx.aIInteraction.deleteMany();
      await tx.notification.deleteMany();
      await tx.invitation.deleteMany();
      await tx.licenseKeyRedemption.deleteMany();
      await tx.licenseKey.deleteMany();
      await tx.usageRecord.deleteMany();
      await tx.subscription.updateMany({ where: { userId: { not: null } }, data: { userId: null } });
      await tx.session.deleteMany();
      await tx.account.deleteMany();
      await tx.classMember.deleteMany();
      await tx.class.deleteMany();
      await tx.question.updateMany({ where: { createdById: { not: null } }, data: { createdById: null } });
      await tx.auditLog.updateMany({ where: { actorId: { not: null } }, data: { actorId: null } });
      await tx.verificationToken.deleteMany();
      await tx.passwordResetToken.deleteMany();
      await tx.studentProfile.deleteMany();
      await tx.teacherProfile.deleteMany();
      await tx.user.deleteMany();
    },
    { timeout: 120000 }
  );
  const after = await prisma.user.count();
  console.log(`WIPED_USERS before=${before} after=${after}`);
}

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
    await wipeUsers(prisma);
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
