import { lt } from "@/lib/i18n";

const n = lt.nav;

const studentNav = [
  { href: "/student", label: n.student.dashboard },
  { href: "/student/learn", label: n.student.learn },
  { href: "/student/assignments", label: n.student.assignments },
  { href: "/student/homework", label: n.student.homework },
  { href: "/student/tests", label: n.student.tests },
  { href: "/student/ai-teacher", label: n.student.aiTeacher },
  { href: "/student/mistakes", label: n.student.mistakes },
  { href: "/student/mastery", label: n.student.mastery },
  { href: "/student/study-plans", label: n.student.studyPlans },
  { href: "/student/progress", label: n.student.progress },
  { href: "/student/subjects", label: n.student.subjects },
  { href: "/student/notifications", label: n.student.notifications },
  { href: "/student/profile", label: n.student.profile },
  { href: "/student/settings", label: n.student.settings },
  { href: "/student/billing", label: n.student.billing },
];

const teacherNav = [
  { href: "/teacher", label: n.teacher.dashboard },
  { href: "/teacher/classes", label: n.teacher.classes },
  { href: "/teacher/students", label: n.teacher.students },
  { href: "/teacher/assignments", label: n.teacher.assignments },
  { href: "/teacher/homework", label: n.teacher.homework },
  { href: "/teacher/tests", label: n.teacher.tests },
  { href: "/teacher/questions", label: n.teacher.questionBank },
  { href: "/teacher/ai-generator", label: n.teacher.aiGenerator },
  { href: "/teacher/analytics", label: n.teacher.analytics },
  { href: "/teacher/integrity", label: n.teacher.integrity },
  { href: "/teacher/notifications", label: n.teacher.notifications },
  { href: "/teacher/profile", label: n.teacher.profile },
  { href: "/teacher/settings", label: n.teacher.settings },
  { href: "/teacher/billing", label: n.teacher.billing },
];

const schoolAdminNav = [
  { href: "/school-admin", label: n.schoolAdmin.dashboard },
  { href: "/school-admin/users", label: n.schoolAdmin.users },
  { href: "/school-admin/teachers", label: n.schoolAdmin.teachers },
  { href: "/school-admin/students", label: n.schoolAdmin.students },
  { href: "/school-admin/classes", label: n.schoolAdmin.classes },
  { href: "/school-admin/subjects", label: n.schoolAdmin.subjects },
  { href: "/school-admin/analytics", label: n.schoolAdmin.analytics },
  { href: "/school-admin/invitations", label: n.schoolAdmin.invitations },
  { href: "/school-admin/settings", label: n.schoolAdmin.settings },
  { href: "/school-admin/billing", label: n.schoolAdmin.billing },
  { href: "/school-admin/audit-logs", label: n.schoolAdmin.auditLogs },
];

const adminNav = [
  { href: "/admin", label: n.admin.overview },
  { href: "/admin/schools", label: n.admin.schools },
  { href: "/admin/users", label: n.admin.users },
  { href: "/admin/subscriptions", label: n.admin.subscriptions },
  { href: "/admin/keys", label: n.admin.keys },
  { href: "/admin/ai-usage", label: n.admin.aiUsage },
  { href: "/admin/integrity", label: n.admin.integrity },
  { href: "/admin/reports", label: n.admin.reports },
  { href: "/admin/health", label: n.admin.health },
  { href: "/admin/audit-logs", label: n.admin.auditLogs },
  { href: "/admin/settings", label: n.admin.settings },
];

export const navMaps = {
  student: studentNav,
  teacher: teacherNav,
  "school-admin": schoolAdminNav,
  admin: adminNav,
};
