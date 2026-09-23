import { PrismaClient } from "@prisma/client";
import { eraseAccount } from "../services/account/account-data-service";

const email = process.argv[2]?.trim().toLowerCase();
const action = process.argv[3] ?? "find";

if (!email) {
  console.error("Usage: npx tsx scripts/delete-user.ts <email> [find|delete]");
  process.exit(1);
}

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
  await eraseAccount(user.id);
  console.log("ERASED");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
