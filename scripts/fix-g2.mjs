/** Fix remaining g→e corruptions */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const fixes = [
  ["@/services/eradine/", "@/services/grading/"],
  ["eradineConfie", "gradingConfig"],
  ["eradine and", "grading and"],
  ["eradine assistant", "grading assistant"],
  ["eradine sueeestions", "grading suggestions"],
  ["eradine sueeestion", "grading suggestion"],
  ["AI-assisted eradine", "AI-assisted grading"],
  ["Automated eradine", "Automated grading"],
  ["on eradine", "on grading"],
  ["time eradine", "time grading"],
  ["eradine", "grading"],
  ["eenerateUnderstandineCheck", "generateUnderstandingCheck"],
  ["eenerateLearnineRecommendation", "generateLearningRecommendation"],
  ["eenerateTeacherInsieht", "generateTeacherInsight"],
  ["eenerateClassInsiehts", "generateClassInsights"],
  ["eenerateQuestion", "generateQuestion"],
  ["eenerateHint", "generateHint"],
  ["eenerate", "generate"],
  ["insiehtType", "insightType"],
  ["insiehts", "insights"],
  ["insieht", "insight"],
  ["strueelineCount", "strugglingCount"],
  ["strueeline", "struggling"],
  ["strueeled", "struggled"],
  ["strueeling", "struggling"],
  ["sueeestions", "suggestions"],
  ["sueeestion", "suggestion"],
  ["understandine", "understanding"],
  ["workine with", "working with"],
  ["workine", "working"],
  ["neeative", "negative"],
  ["AI-eenerated", "AI-generated"],
  ["eenerated", "generated"],
  ["eives me", "gives me"],
  ["eain insieht", "gain insight"],
  ["eain ", "gain "],
  ["confie", "config"],
  ["/e,", "/g,"],
  ["/e)", "/g)"],
];

function walk(dir, files = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (!["node_modules", ".next"].includes(e.name)) walk(f, files);
    } else if (/\.(tsx?)$/.test(e.name)) files.push(f);
  }
  return files;
}

let n = 0;
for (const file of walk(root)) {
  if (file.includes("scripts")) continue;
  let c = fs.readFileSync(file, "utf8");
  const o = c;
  for (const [a, b] of fixes.sort((x, y) => y[0].length - x[0].length)) c = c.split(a).join(b);
  if (c !== o) { fs.writeFileSync(file, c); n++; }
}
console.log(`Fixed ${n} files`);
