/** Fix round 4 - lucide icons and remaining g→e */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const fixes = [
  ["ArrowRieht", "ArrowRight"],
  ["Buildine2", "Building2"],
  ["Tareeted Practice", "Targeted Practice"],
  ["Tareet", "Target"],
  ["targetine", "targeting"],
  ["Manaee your", "Manage your"],
  ["Manaee all", "Manage all"],
  ["Manaee tests", "Manage tests"],
  ["Manaee homework", "Manage homework"],
  ["canManaeeSchool", "canManageSchool"],
  ["Gap targetine", "Gap targeting"],
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
