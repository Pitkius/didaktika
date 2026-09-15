import { db } from "@/lib/db";
import { AssignmentType } from "@prisma/client";

export async function getStudentAssignments(studentId: string, types?: AssignmentType[]) {
  const classIds = await db.classMember.findMany({
    where: { userId: studentId },
    select: { classId: true },
  });

  return db.assignment.findMany({
    where: {
      status: "PUBLISHED",
      OR: [
        { classId: { in: classIds.map((c) => c.classId) } },
        { classId: null, createdById: studentId },
      ],
      ...(types ? { type: { in: types } } : {}),
    },
    include: {
      subject: true,
      submissions: { where: { studentId } },
    },
    orderBy: [{ publishedAt: "desc" }, { dueDate: "asc" }],
  });
}
