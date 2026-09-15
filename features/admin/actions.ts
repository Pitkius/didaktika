"use server";

import { requireSuperAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function toggleSchoolActiveAction(schoolId: string, isActive: boolean) {
  await requireSuperAdmin();

  await db.school.update({
    where: { id: schoolId },
    data: { isActive },
  });

  revalidatePath("/admin/schools");
  return { success: true };
}
