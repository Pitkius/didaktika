"use server";

import { requireSuperAdmin } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { lt } from "@/lib/i18n";
import { revalidatePath } from "next/cache";

function slugify(name: string) {
  const base = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  return base || "mokykla";
}

export async function createSchoolAction(formData: FormData) {
  await requireSuperAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  if (name.length < 2) return { error: lt.schoolAdmin.allFieldsRequired };

  const root = slugify(name);
  let slug = root;
  for (let i = 2; i < 50; i++) {
    const existing = await db.school.findUnique({ where: { slug }, select: { id: true } });
    if (!existing) break;
    slug = `${root}-${i}`;
  }

  await db.school.create({
    data: {
      name,
      slug,
      city: city || null,
      settings: { create: {} },
    },
  });

  revalidatePath("/admin/schools");
  return { success: true };
}

export async function toggleSchoolActiveAction(schoolId: string, isActive: boolean) {
  await requireSuperAdmin();

  await db.school.update({
    where: { id: schoolId },
    data: { isActive },
  });

  revalidatePath("/admin/schools");
  return { success: true };
}
