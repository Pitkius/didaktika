import { requireStudent } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/app-sidebar";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/utils";
import { Flame, Clock, Target } from "lucide-react";
import { lt, tRole } from "@/lib/i18n";

export default async function StudentProfilePage() {
  const session = await requireStudent();

  const [user, profile, classCount, submissionCount] = await Promise.all([
    db.user.findUnique({
      where: { id: session.user.id },
      include: { school: true },
    }),
    db.studentProfile.findUnique({ where: { userId: session.user.id } }),
    db.classMember.count({ where: { userId: session.user.id } }),
    db.assignmentSubmission.count({
      where: { studentId: session.user.id, status: { in: ["SUBMITTED", "GRADED"] } },
    }),
  ]);

  if (!user) return null;

  return (
    <AppShell area="student" userName={`${session.user.firstName} ${session.user.lastName}`}>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">{lt.common.profile}</h1>

        <Card>
          <CardContent className="flex items-start gap-6 pt-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-xl font-semibold text-brand-700">
              {getInitials(user.firstName, user.lastName)}
            </div>
            <div>
              <h2 className="text-xl font-semibold">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-neutral-500">{user.email}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant="secondary">{tRole(user.role)}</Badge>
                {user.school && <Badge variant="default">{user.school.name}</Badge>}
                {profile?.gradeLevel && (
                  <Badge variant="secondary">
                    {lt.student.gradeWithLevel.replace("{level}", String(profile.gradeLevel))}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <Flame className="h-5 w-5 text-amber-600" />
              <div>
                <p className="text-sm text-neutral-500">{lt.student.currentStreak}</p>
                <p className="text-2xl font-semibold">{profile?.currentStreak ?? 0} {lt.student.days}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <Clock className="h-5 w-5 text-brand-600" />
              <div>
                <p className="text-sm text-neutral-500">{lt.student.totalStudyTime}</p>
                <p className="text-2xl font-semibold">{profile?.totalStudyMinutes ?? 0} {lt.common.min}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <Target className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-neutral-500">{lt.student.completed}</p>
                <p className="text-2xl font-semibold">{submissionCount}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{lt.student.accountDetails}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-500">{lt.student.classesEnrolled}</span>
              <span className="font-medium">{classCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">{lt.student.longestStreak}</span>
              <span className="font-medium">{profile?.longestStreak ?? 0} {lt.student.days}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">{lt.common.memberSince}</span>
              <span className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
            {profile?.studentCode && (
              <div className="flex justify-between">
                <span className="text-neutral-500">{lt.student.studentCode}</span>
                <span className="font-medium">{profile.studentCode}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
