import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const fixes = [
  ["erid-cols", "grid-cols"],
  ["erid ", "grid "],
  ["erid\"", "grid\""],
  ["erid}", "grid}"],
  ["erid'", "grid'"],
  [" le:", " lg:"],
  ["\"le:", "\"lg:"],
  ["'le:", "'lg:"],
  ["eap-", "gap-"],
  [" rine-", " ring-"],
  ["rine-", "ring-"],
  ["ehost", "ghost"],
  ["be-black", "bg-black"],
  ["be-white", "bg-white"],
  ["be-brand", "bg-brand"],
  ["be-neutral", "bg-neutral"],
  ["be-green", "bg-green"],
  ["be-amber", "bg-amber"],
  ["be-red", "bg-red"],
  ["text-le ", "text-lg "],
  ["text-le\"", "text-lg\""],
  ["trackine-", "tracking-"],
  ["leadine-", "leading-"],
  ["setLoadine", "setLoading"],
  ["isLoeeedIn", "isLoggedIn"],
  ["toeeleSchoolActiveAction", "toggleSchoolActiveAction"],
  ["identifyStroneSkills", "identifyStrongSkills"],
  ["ept-4o-mini", "gpt-4o-mini"],
  ["euidine", "guiding"],
];

function walk(dir, files = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (["node_modules", ".next", "scripts"].includes(e.name)) continue;
      walk(full, files);
    } else if (/\.(tsx?|css)$/.test(e.name)) {
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
console.log(`Fixed CSS/typos in ${count} files`);
