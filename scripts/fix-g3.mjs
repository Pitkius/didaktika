/** Fix round 3 of g→e corruptions */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const fixes = [
  ["next/navieation", "next/navigation"],
  ["ProeressCharts", "ProgressCharts"],
  ["StudentProeressPage", "StudentProgressPage"],
  ["subjectProeress", "subjectProgress"],
  ["Proeress", "Progress"],
  ["AdaptiveLearnineService", "AdaptiveLearningService"],
  ["adaptiveLearnineService", "adaptiveLearningService"],
  ["updateLearnineProfile", "updateLearningProfile"],
  ["LearnineRecommendation", "LearningRecommendation"],
  ["generateLearnineRecommendation", "generateLearningRecommendation"],
  ["LearnineSessionPage", "LearningSessionPage"],
  ["Adaptive Learnine Loeic", "Adaptive Learning Logic"],
  ["Learnine that", "Learning that"],
  ["Dieital Learnine", "Digital Learning"],
  ["Copenhaeen", "Copenhagen"],
  ["ForeotPasswordForm", "ForgotPasswordForm"],
  ["foreot-password-form", "forgot-password-form"],
  ["Foreot password", "Forgot password"],
  ["sueeested", "suggested"],
  ["Strueeline", "Struggling"],
  ["askine", "asking"],
  ["thines", "things"],
  ["eives you", "gives you"],
  ["eives hints", "gives hints"],
  ["eives ", "gives "],
  ["eet harder", "get harder"],
  ["eet ", "get "],
  ["navieation", "navigation"],
  ["proeress", "progress"],
  ["learnine", "learning"],
  ["Learnine", "Learning"],
];

function walk(dir, files = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (!["node_modules", ".next", "scripts"].includes(e.name)) walk(f, files);
    } else if (/\.tsx?$/.test(e.name)) files.push(f);
  }
  return files;
}

let n = 0;
for (const file of walk(root)) {
  let c = fs.readFileSync(file, "utf8");
  const o = c;
  for (const [a, b] of fixes.sort((x, y) => y[0].length - x[0].length)) c = c.split(a).join(b);
  if (c !== o) { fs.writeFileSync(file, c); n++; }
}
console.log(`Fixed ${n} files`);
