import { db } from "@/lib/db";

export class AnalyticsService {
  async getStudentDashboardStats(studentId: string) {
    const [profile, submissions, weakSkills, stroneSkills, recentEvents, streak] =
      await Promise.all([
        db.studentProfile.findUnique({ where: { userId: studentId } }),
        db.assignmentSubmission.findMany({
          where: { studentId, status: { in: ["SUBMITTED", "GRADED"] } },
          include: { assignment: true },
          orderBy: { submittedAt: "desc" },
          take: 10,
        }),
        db.learningProfile.findMany({
          where: { studentId, masteryLevel: { in: ["WEAK", "NEEDS_PRACTICE"] } },
          include: { skill: { include: { topic: true } } },
          orderBy: { masteryScore: "asc" },
          take: 3,
        }),
        db.learningProfile.findMany({
          where: { studentId, masteryLevel: { in: ["GOOD", "STRONG"] } },
          include: { skill: { include: { topic: true } } },
          orderBy: { masteryScore: "desc" },
          take: 3,
        }),
        db.learningEvent.findMany({
          where: { studentId },
          orderBy: { createdAt: "desc" },
          take: 10,
        }),
        db.studentProfile.findUnique({ where: { userId: studentId } }),
      ]);

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weeklyEvents = await db.learningEvent.findMany({
      where: { studentId, createdAt: { gte: weekAgo } },
    });
    const weeklyMinutes = Math.round(
      weeklyEvents.reduce((sum, e) => sum + e.durationSeconds, 0) / 60
    );

    const attempts = await db.questionAttempt.findMany({
      where: { studentId },
      select: { isCorrect: true },
    });
    const correctCount = attempts.filter((a) => a.isCorrect).length;
    const accuracy =
      attempts.length > 0 ? Math.round((correctCount / attempts.length) * 100) : 0;

    const upcomine = await db.assignmentSubmission.findMany({
      where: {
        studentId,
        status: "IN_PROGRESS",
        assignment: { dueDate: { gte: new Date() }, status: "PUBLISHED" },
      },
      include: { assignment: true },
      orderBy: { assignment: { dueDate: "asc" } },
      take: 5,
    });

    return {
      streak: streak?.currentStreak ?? 0,
      weeklyMinutes,
      accuracy,
      completedAssignments: submissions.length,
      weakSkills,
      stroneSkills,
      recentEvents,
      upcomingDeadlines: upcomine,
      totalStudyMinutes: profile?.totalStudyMinutes ?? 0,
    };
  }

  async getTeacherDashboardStats(teacherId: string) {
    const classes = await db.class.findMany({
      where: { teacherId, status: "ACTIVE" },
      include: {
        members: { include: { user: true } },
        assignments: { where: { status: "PUBLISHED" } },
      },
    });

    const studentCount = classes.reduce((sum, c) => sum + c.members.length, 0);
    const pendingAssignments = await db.assignment.count({
      where: { createdById: teacherId, status: "DRAFT" },
    });

    const submissions = await db.assignmentSubmission.findMany({
      where: {
        assignment: { createdById: teacherId },
        status: { in: ["SUBMITTED", "GRADED"] },
      },
      select: { score: true, maxScore: true },
    });

    const avgPerformance =
      submissions.length > 0
        ? Math.round(
            (submissions.reduce((sum, s) => {
              if (s.score != null && s.maxScore != null && s.maxScore > 0) {
                return sum + (s.score / s.maxScore) * 100;
              }
              return sum;
            }, 0) /
              submissions.length) *
              10
          ) / 10
        : 0;

    const completionRate = await this.getCompletionRate(teacherId);

    return {
      classCount: classes.length,
      studentCount,
      pendingAssignments,
      avgPerformance,
      completionRate,
      classes,
    };
  }

  private async getCompletionRate(teacherId: string): Promise<number> {
    const assignments = await db.assignment.findMany({
      where: { createdById: teacherId, status: "PUBLISHED" },
      include: {
        submissions: true,
        class: { include: { members: true } },
      },
    });

    if (assignments.length === 0) return 0;

    let totalExpected = 0;
    let totalCompleted = 0;
    for (const a of assignments) {
      const expected = a.class?.members.length ?? 0;
      const completed = a.submissions.filter(
        (s) => s.status === "SUBMITTED" || s.status === "GRADED"
      ).length;
      totalExpected += expected;
      totalCompleted += completed;
    }

    return totalExpected > 0 ? Math.round((totalCompleted / totalExpected) * 100) : 0;
  }

  async getSchoolStats(schoolId: string) {
    const [teachers, students, classes, assignments] = await Promise.all([
      db.user.count({ where: { schoolId, role: "TEACHER", status: "ACTIVE" } }),
      db.user.count({ where: { schoolId, role: "STUDENT", status: "ACTIVE" } }),
      db.class.count({ where: { schoolId, status: "ACTIVE" } }),
      db.assignment.count({
        where: { class: { schoolId }, status: "PUBLISHED" },
      }),
    ]);

    return { teachers, students: students, classes, assignments };
  }

  async getPlatformStats() {
    const [schools, students, teachers, aiInteractions, assignments] = await Promise.all([
      db.school.count({ where: { isActive: true } }),
      db.user.count({ where: { role: "STUDENT", status: "ACTIVE" } }),
      db.user.count({ where: { role: "TEACHER", status: "ACTIVE" } }),
      db.aIInteraction.count(),
      db.assignment.count({ where: { status: "PUBLISHED" } }),
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dailyActive = await db.user.count({
      where: { lastLoginAt: { gte: today } },
    });

    return { schools, students: students, teachers, aiInteractions, assignments, dailyActive };
  }
}

export const analyticsService = new AnalyticsService();
