import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { exportAccountData } from "@/services/account/account-data-service";
import { UserStatus } from "@prisma/client";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { status: true, authVersion: true },
  });
  if (!user || user.status !== UserStatus.ACTIVE || user.authVersion !== session.user.authVersion) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await exportAccountData(session.user.id);
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": 'attachment; filename="didaktika-duomenys.json"',
    },
  });
}
