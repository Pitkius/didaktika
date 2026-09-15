/**
 * Atstatyti kodą po scripts/translate-ui.mjs sugadinimo.
 * Grąžina angliškus kodo identifikatorius; UI vėliau verčiame per lib/i18n/lt.ts
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const translatePairs = [
  ["Welcome back", "Sveiki sugrįžę"],
  ["Teacher Dashboard", "Mokytojo skydelis"],
  ["School Administration", "Mokyklos administravimas"],
  ["Platform Overview", "Platformos apžvalga"],
  ["No upcoming deadlines.", "Artimiausių terminų nėra."],
  ["No assignments yet.", "Užduočių dar nėra."],
  ["No homework assignments yet.", "Namų darbų dar nėra."],
  ["No homework assigned yet.", "Namų darbų dar nėra."],
  ["No tests or exams yet.", "Testų dar nėra."],
  ["No tests or exams scheduled yet.", "Testų nėra."],
  ["No tests scheduled.", "Testų nėra."],
  ["No classes yet. Create your first class above.", "Klasių dar nėra. Sukurkite pirmą klasę aukščiau."],
  ["No classes found.", "Klasių nerasta."],
  ["No students in your classes yet.", "Jūsų klasėse mokinių dar nėra."],
  ["No students found.", "Mokinių nerasta."],
  ["No teachers found.", "Mokytojų nerasta."],
  ["No users found.", "Vartotojų nerasta."],
  ["No subjects yet. Add your first subject above.", "Dalykų dar nėra. Pridėkite pirmą dalyką aukščiau."],
  ["No subjects available yet.", "Dalykų dar nėra."],
  ["No notifications yet.", "Pranešimų nėra."],
  ["No integrity flags detected.", "Sąžiningumo signalų nėra."],
  ["No integrity flags recorded.", "Sąžiningumo signalų nėra."],
  ["No AI interactions yet.", "DI sąveikų dar nėra."],
  ["No usage data yet.", "Naudojimo duomenų nėra."],
  ["No recent interactions.", "Naujausių sąveikų nėra."],
  ["No recent audit events.", "Audito įrašų nėra."],
  ["No audit logs yet.", "Audito žurnalo įrašų nėra."],
  ["No subscriptions yet.", "Prenumeratų dar nėra."],
  ["No schools registered yet.", "Mokyklų dar nėra."],
  ["No questions found.", "Klausimų nerasta."],
  ["No recent activity.", "Naujausios veiklos nėra."],
  ["No insights yet. Publish assignments to generate class analytics.", "Įžvalgų dar nėra. Paskelbkite užduotis, kad generuotų analitiką."],
  ["No weak areas identified yet.", "Silpnų sričių dar nėra."],
  ["Create your first assignment", "Sukurkite pirmą užduotį"],
  ["Create assignment", "Sukurti užduotį"],
  ["Create class", "Sukurti klasę"],
  ["Manage class", "Tvarkyti klasę"],
  ["View analytics", "Peržiūrėti analitiką"],
  ["Continue learning", "Tęsti mokymąsi"],
  ["Start learning", "Pradėti mokytis"],
  ["Let AI choose for me", "Leisti DI pasirinkti"],
  ["Submit answer", "Pateikti atsakymą"],
  ["Next question", "Kitas klausimas"],
  ["Checking...", "Tikrinama..."],
  ["Loading question...", "Kraunamas klausimas..."],
  ["Back", "Atgal"],
  ["Open", "Atidaryti"],
  ["Start", "Pradėti"],
  ["View", "Peržiūrėti"],
  ["Finish", "Baigti"],
  ["Hint", "Užuomina"],
  ["Correct!", "Teisingai!"],
  ["Incorrect.", "Neteisingai."],
  ["Not started", "Nepradėta"],
  ["No due date", "Be termino"],
  ["No date", "Be datos"],
  ["No time limit", "Be laiko limito"],
  ["No class", "Be klasės"],
  ["No subject", "Be dalyko"],
  ["No topic", "Be temos"],
  ["No city", "Be miesto"],
  ["students", "mokiniai"],
  ["questions", "klausimai"],
  ["submissions", "pateikimai"],
  ["Overview of your classes and students.", "Jūsų klasių ir mokinių apžvalga."],
  ["Manage your school&apos;s users, classes, and settings.", "Tvarkykite mokyklos vartotojus, klases ir nustatymus."],
  ["System-wide analytics and health monitoring.", "Sistemos analitika ir stebėjimas."],
  ["Sign in", "Prisijungti"],
  ["Sign in to your", "Prisijunkite prie savo"],
  ["Verify your email", "Patvirtinkite el. paštą"],
  ["Forgot password?", "Pamiršote slaptažodį?"],
  ["Reset password", "Atkurti slaptažodį"],
  ["All rights reserved.", "Visos teisės saugomos."],
  ["Product", "Produktas"],
  ["Company", "Įmonė"],
  ["Legal", "Teisinė informacija"],
  ["Privacy Policy", "Privatumo politika"],
  ["Terms of Service", "Naudojimo sąlygos"],
  ["About", "Apie mus"],
  ["Contact", "Kontaktai"],
  ["Pricing", "Kainos"],
  ["Features", "Funkcijos"],
  ["For Students", "Mokiniams"],
  ["For Teachers", "Mokytojams"],
  ["For Schools", "Mokykloms"],
  ["Get started", "Pradėti nemokamai"],
  ["Log in", "Prisijungti"],
  ["Log out", "Atsijungti"],
  ["Dashboard", "Valdymo skydelis"],
  ["Homework", "Namų darbai"],
  ["Assignments", "Užduotys"],
  ["Tests", "Testai"],
  ["Settings", "Nustatymai"],
  ["Profile", "Profilis"],
  ["Notifications", "Pranešimai"],
  ["Analytics", "Analitika"],
  ["Progress", "Pažanga"],
  ["Subjects", "Dalykai"],
  ["Classes", "Klasės"],
  ["Students", "Mokiniai"],
  ["Teachers", "Mokytojai"],
  ["Users", "Vartotojai"],
  ["Schools", "Mokyklos"],
  ["Invitations", "Kvietimai"],
  ["Audit Logs", "Audito žurnalas"],
  ["Overview", "Apžvalga"],
  ["Subscriptions", "Prenumeratos"],
  ["AI Usage", "DI naudojimas"],
  ["System Health", "Sistemos būklė"],
  ["Reports", "Ataskaitos"],
  ["Integrity", "Sąžiningumas"],
  ["Question Bank", "Klausimų bankas"],
  ["AI Generator", "DI generatorius"],
  ["AI Teacher", "DI mokytojas"],
  ["Learn", "Mokytis"],
  ["Pending drafts", "Juodraščiai"],
  ["Avg. performance", "Vid. rezultatas"],
  ["Completion rate", "Atlikimo rodiklis"],
  ["Needs attention", "Reikia dėmesio"],
  ["AI Insights", "DI įžvalgos"],
  ["Create targeted practice", "Sukurti tikslinę praktiką"],
  ["Recent activity", "Naujausia veikla"],
  ["Strongest areas", "Stipriausios sritys"],
  ["Upcoming deadlines", "Artimiausi terminai"],
  ["AI Recommendation", "DI rekomendacija"],
  ["Current streak", "Dabartinė serija"],
  ["This week", "Šią savaitę"],
  ["Accuracy", "Tikslumas"],
  ["Completed", "Atlikta"],
  ["days", "d."],
  [" min", " min"],
];

// Papildomi g->e ir kiti pažeidimai (ne iš translate-ui.mjs)
const extraFixes = [
  ["aIInteerityFlae", "aIIntegrityFlag"],
  ["AIInteerityFlae", "AIIntegrityFlag"],
  ["Inteerity", "Integrity"],
  ["inteerity", "integrity"],
  ["assienment", "assignment"],
  ["assienments", "assignments"],
  ["settines", "settings"],
  ["monitorine", "monitoring"],
  ["pendine", "pending"],
  ["leneth", "length"],
  ["warnine", "warning"],
  ["daneer", "danger"],
  ["toLocaleDateStrine", "toLocaleDateString"],
  ["toLocaleStrine", "toLocaleString"],
  ["sienals", "signals"],
  ["aveScore", "avgScore"],
  ["eradeLevel", "gradeLevel"],
  ["Badee", "Badge"],
  ["badee", "badge"],
  ["be-ereen", "bg-green"],
  ["be-brand", "bg-brand"],
  ["be-amber", "bg-amber"],
  ["be-red", "bg-red"],
  ["be-neutral", "bg-neutral"],
  ["text-ereen", "text-green"],
  ["ereen-", "green-"],
  ["/_/e,", "/_/g,"],
  ["/_/e)", "/_/g)"],
  ["getValdymo skydelisPath", "getDashboardPath"],
  ["roleValdymo skydelisPaths", "roleDashboardPaths"],
  ["BookAtidaryti", "BookOpen"],
  ["LayoutValdymo skydelis", "LayoutDashboard"],
  ["@/features/mokiniai/", "@/features/students/"],
  ["AdaptiveMokytisingService", "AdaptiveLearningService"],
  ["adaptiveMokytisingService", "adaptiveLearningService"],
  ["generateMokytisingRecommendation", "generateLearningRecommendation"],
  ["MokytisingRecommendation", "LearningRecommendation"],
  ["startMokytisingSessionAction", "startLearningSessionAction"],
  ["MokytisingSessionPage", "LearningSessionPage"],
  ["updateMokytisingProfilis", "updateLearningProfile"],
  ["StudentNustatymaiForm", "StudentSettingsForm"],
  ["StudentNustatymaiFormProps", "StudentSettingsFormProps"],
  ["AnalitikaService", "AnalyticsService"],
  ["studentProfilis", "studentProfile"],
  ["teacherProfilis", "teacherProfile"],
  ["learningProfilis", "learningProfile"],
  ["/for-mokiniai", "/for-students"],
  ["/teacher/mokiniai", "/teacher/students"],
  ["/school-admin/mokiniai", "/school-admin/students"],
  ["/teacher/klausimai", "/teacher/questions"],
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
  ["stats.mokiniai", "stats.students"],
  ["return { teachers, mokiniai,", "return { teachers, students: mokiniai,"],
  ["return { schools, mokiniai,", "return { schools, students: mokiniai,"],
  ["totalAtlikta", "totalCompleted"],
  ["PradėtiTime", "StartTime"],
  ["Atidaryti", "Open"],
  ["PranešimaiList", "NotificationsList"],
  ["PažangaCharts", "ProgressCharts"],
  ["PažangaProps", "ProgressProps"],
  ["export function Pažanga", "export function Progress"],
  ["import { Pažanga }", "import { Progress }"],
  ["<Pažanga ", "<Progress "],
  ["Apie musPage", "AboutPage"],
  ["Namų darbaiPage", "HomeworkPage"],
  ["UžduotysPage", "AssignmentsPage"],
  ["ProfilisPage", "ProfilePage"],
  ["NustatymaiPage", "SettingsPage"],
  ["PranešimaiPage", "NotificationsPage"],
  ["AnalitikaPage", "AnalyticsPage"],
  ["VartotojaiPage", "UsersPage"],
  ["Valdymo skydelisPage", "DashboardPage"],
  ["getStudentUžduotys", "getStudentAssignments"],
  ["completedUžduotys", "completedAssignments"],
  ["pendingUžduotys", "pendingAssignments"],
  ["markAllPranešimaiReadAction", "markAllNotificationsReadAction"],
  ["updateStudentNustatymaiAction", "updateStudentSettingsAction"],
  ["classAnalitika", "classAnalytics"],
  ["subjectPažanga", "subjectProgress"],
  ["relevantProfiliss", "relevantProfiles"],
  ["topVartotojai", "topUsers"],
  ["contactBadee", "contactBadge"],
];

const skipPaths = ["lib/i18n/lt.ts", "scripts/translate-ui.mjs", "scripts/restore-code.mjs"];

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (["node_modules", ".next"].includes(entry.name)) continue;
      walk(full, files);
    } else if (/\.(tsx|ts)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

let count = 0;
for (const file of walk(root)) {
  const rel = path.relative(root, file).replace(/\\/g, "/");
  if (skipPaths.some((s) => rel.includes(s))) continue;

  let content = fs.readFileSync(file, "utf8");
  const original = content;

  // Atvirkštinis vertimas (lt -> en), ilgiausi pirmi
  for (const [en, ltVal] of [...translatePairs].sort((a, b) => b[1].length - a[1].length)) {
    content = content.split(ltVal).join(en);
  }

  for (const [bad, good] of extraFixes) {
    content = content.split(bad).join(good);
  }

  if (content !== original) {
    fs.writeFileSync(file, content);
    count++;
  }
}
console.log(`Restored ${count} files`);
