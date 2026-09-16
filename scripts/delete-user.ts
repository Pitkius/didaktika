import { PrismaClient } from "@prisma/client";

const email = process.argv[2] ?? "pytka4101@gmail.com";
const action = process.argv[3] ?? "find";

const db = new PrismaClient();

async function main() {
  const user = await db.user.findUnique({
    where: { email },
    include: { studentProfile: true },
  });

  if (!user) {
    console.log("NOT_FOUND");
    return;
  }

  console.log(
    JSON.stringify(
      {
        id: user.id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        role: user.role,
        grade: user.studentProfile?.gradeLevel ?? null,
      },
      null,
      2
    )
  );

  if (action !== "delete") return;

  const conversations = await db.aIConversation.findMany({
    where: { studentId: user.id },
    select: { id: true },
  });
  const conversationIds = conversations.map((c) => c.id);

  await db.$transaction(async (tx) => {
    if (conversationIds.length) {
      await tx.aIConversationMessage.deleteMany({
        where: { conversationId: { in: conversationIds } },
      });
    }
    await tx.aIIntegrityFlag.deleteMany({
      where: { OR: [{ studentId: user.id }, { reviewedById: user.id }] },
    });
    await tx.integrityEvent.deleteMany({ where: { studentId: user.id } });
    await tx.mistake.deleteMany({ where: { studentId: user.id } });
    await tx.questionAttempt.deleteMany({ where: { studentId: user.id } });
    await tx.assignmentSubmission.deleteMany({ where: { studentId: user.id } });
    await tx.learningProfile.deleteMany({ where: { studentId: user.id } });
    await tx.learningEvent.deleteMany({ where: { studentId: user.id } });
    await tx.aIInteraction.deleteMany({ where: { userId: user.id } });
    await tx.aIConversation.deleteMany({ where: { studentId: user.id } });
    await tx.notification.deleteMany({ where: { userId: user.id } });
    await tx.verificationToken.deleteMany({ where: { userId: user.id } });
    await tx.passwordResetToken.deleteMany({ where: { userId: user.id } });
    await tx.usageRecord.deleteMany({ where: { userId: user.id } });
    await tx.licenseKeyRedemption.deleteMany({ where: { userId: user.id } });
    await tx.subscription.deleteMany({ where: { userId: user.id } });
    await tx.classMember.deleteMany({ where: { userId: user.id } });
    await tx.invitation.updateMany({
      where: { acceptedById: user.id },
      data: { acceptedById: null },
    });
    await tx.session.deleteMany({ where: { userId: user.id } });
    await tx.account.deleteMany({ where: { userId: user.id } });
    await tx.auditLog.deleteMany({ where: { actorId: user.id } });
    await tx.studentProfile.deleteMany({ where: { userId: user.id } });
    await tx.teacherProfile.deleteMany({ where: { userId: user.id } });
    await tx.user.delete({ where: { id: user.id } });
  });

  console.log("DELETED");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
