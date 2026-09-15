/**
 * Atstatyti visus sugadintus kodo identifikatorius po per agresyvaus vertimo.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const fixes = [
  // Prisma relation names
  ["_count: { select: { pateikimai: true, klausimai: true } }", "_count: { select: { submissions: true, questions: true } }"],
  ["_count: { select: { pateikimai: true } }", "_count: { select: { submissions: true } }"],
  ["_count: { select: { topics: true, classes: true, klausimai: true } }", "_count: { select: { topics: true, classes: true, questions: true } }"],
  ["_count: { pateikimai: number }", "_count: { submissions: number }"],
  ["assignment.pateikimai", "assignment.submissions"],
  ["assignment.klausimai", "assignment.questions"],
  ["user.pateikimai", "user.submissions"],
  ["a.pateikimai[0]", "a.submissions[0]"],
  ["pateikimai: { where:", "submissions: { where:"],
  ["pateikimai: {", "submissions: {"],
  ["klausimai: { include:", "questions: { include:"],
  ["klausimai: params.questionIds", "questions: params.questionIds"],
  ["pateikimai: true", "submissions: true"],
  ["const pateikimai =", "const submissions ="],
  ["const klausimai =", "const questions ="],
  ["const klausimai:", "const questions:"],
  ["let totalAtlikta", "let totalCompleted"],
  ["totalAtlikta +=", "totalCompleted +="],
  ["totalAtlikta /", "totalCompleted /"],
  ["a.pateikimai.filter", "a.submissions.filter"],
  ["pateikimai.filter", "submissions.filter"],
  ["pateikimai.reduce", "submissions.reduce"],
  ["pateikimai.flatMap", "submissions.flatMap"],
  ["pateikimai.length", "submissions.length"],
  ["pateikimai[0]", "submissions[0]"],
  ["pateikimai.map", "submissions.map"],
  ["klausimai.length", "questions.length"],
  ["klausimai.filter", "questions.filter"],
  ["klausimai.map", "questions.map"],
  ["klausimai.push", "questions.push"],
  ["unattempted : klausimai", "unattempted : questions"],
  ["result.klausimai", "result.questions"],
  ["return { success: true, klausimai }", "return { success: true, questions }"],
  ["a._count.klausimai", "a._count.questions"],
  ["a._count.pateikimai", "a._count.submissions"],
  ["subject._count.klausimai", "subject._count.questions"],
  ["a._count.pateikimai} pateikimai", "a._count.submissions} pateikimai"],
  ["a._count.klausimai} klausimai", "a._count.questions} klausimai"],

  // Learning service identifiers
  ["AdaptiveMokytisingService", "AdaptiveLearningService"],
  ["adaptiveMokytisingService", "adaptiveLearningService"],
  ["startMokytisingSessionAction", "startLearningSessionAction"],
  ["generateMokytisingRecommendation", "generateLearningRecommendation"],
  ["MokytisingRecommendation", "LearningRecommendation"],
  ["MokytisingSessionPage", "LearningSessionPage"],

  // UI state identifiers
  ["setPradėtiTime", "setStartTime"],
  ["setMobileAtidaryti", "setMobileOpen"],
  ["mobileAtidaryti", "mobileOpen"],
  ["setAiAtidaryti", "setAiOpen"],
  ["aiAtidaryti", "aiOpen"],

  // Lucide / component names
  ["import { Vartotojai,", "import { Users,"],
  ["import { Vartotojai }", "import { Users }"],
  [", Vartotojai,", ", Users,"],
  [", Vartotojai }", ", Users }"],
  ["  Vartotojai,", "  Users,"],
  ["icon: Vartotojai", "icon: Users"],
  ["<Vartotojai ", "<Users "],
  [", User, Nustatymai]", ", User, Settings]"],
  [", FileText, Nustatymai]", ", FileText, Settings]"],
  ["<Pažanga ", "<Progress "],

  // Function/component names
  ["StudentNustatymaiForm", "StudentSettingsForm"],
  ["StudentNustatymaiFormProps", "StudentSettingsFormProps"],
  ["TeacherNustatymaiPage", "TeacherSettingsPage"],
  ["SchoolAdminNustatymaiPage", "SchoolAdminSettingsPage"],
  ["AdminNustatymaiPage", "AdminSettingsPage"],
  ["SchoolAdminVartotojaiPage", "SchoolAdminUsersPage"],
  ["AdminVartotojaiPage", "AdminUsersPage"],
  ["SchoolAdminAnalitikaPage", "SchoolAdminAnalyticsPage"],
  ["StudentUžduotysPage", "StudentAssignmentsPage"],
  ["TeacherPranešimaiPage", "TeacherNotificationsPage"],
  ["classAnalitika", "classAnalytics"],
  ["subjectPažanga", "subjectProgress"],
  ["relevantProfiliss", "relevantProfiles"],
  ["topVartotojai", "topUsers"],

  // Analytics return values
  ["return { teachers, mokiniai, classes, assignments }", "return { teachers, students: mokiniai, classes, assignments }"],
  ["return { schools, mokiniai, teachers,", "return { schools, students: mokiniai, teachers,"],
  ["stats.mokiniai", "stats.students"],

  // Routes
  ["/for-mokiniai", "/for-students"],
  ["/teacher/mokiniai", "/teacher/students"],
  ["/school-admin/mokiniai", "/school-admin/students"],
  ["/teacher/klausimai", "/teacher/questions"],
  ['revalidatePath("/teacher/klausimai")', 'revalidatePath("/teacher/questions")'],

  // i18n key references
  ["lt.nav.public.forMokiniai", "lt.nav.public.forStudents"],
  ["lt.nav.public.forMokytojai", "lt.nav.public.forTeachers"],
  ["lt.nav.public.forMokyklos", "lt.nav.public.forSchools"],
  ["lt.common.getPradėtied", "lt.common.getStarted"],
  ["p.footerProduktas", "p.footerProduct"],
  ["p.footerĮmonė", "p.footerCompany"],
  ["p.footerTeisinė informacija", "p.footerLegal"],
  ["lt.student.todayApžvalga", "lt.student.todayOverview"],
  ["lt.student.continueMokytising", "lt.student.continueLearning"],
  ["lt.student.d.", "lt.student.days"],
  ["n.teacher.mokiniai", "n.teacher.students"],
  ["n.schoolAdmin.mokiniai", "n.schoolAdmin.students"],
];

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (["node_modules", ".next", "scripts"].includes(entry.name)) continue;
      walk(full, files);
    } else if (/\.(tsx|ts)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

let count = 0;
for (const file of walk(root)) {
  let content = fs.readFileSync(file, "utf8");
  const original = content;
  for (const [bad, good] of fixes) {
    content = content.split(bad).join(good);
  }
  if (content !== original) {
    fs.writeFileSync(file, content);
    count++;
  }
}
console.log(`Fixed ${count} files`);
