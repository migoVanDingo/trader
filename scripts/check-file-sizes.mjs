#!/usr/bin/env node
// Enforces the repo's modularity rule: no source file may exceed MAX_LINES.
// See CLAUDE.md → "Code organization & modularity". Run via `npm run check:size`.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const MAX_LINES = 600;
const WARN_LINES = 500;
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "src");
const EXTS = new Set([".ts", ".tsx", ".css"]);

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (EXTS.has(extname(entry))) out.push(full);
  }
  return out;
}

const offenders = [];
const warnings = [];
for (const file of walk(ROOT)) {
  const lines = readFileSync(file, "utf8").split("\n").length;
  const rel = file.slice(file.indexOf("src"));
  if (lines > MAX_LINES) offenders.push({ rel, lines });
  else if (lines >= WARN_LINES) warnings.push({ rel, lines });
}

for (const { rel, lines } of warnings) {
  console.warn(
    `⚠️  ${rel} is ${lines} lines (approaching ${MAX_LINES}); plan a split.`,
  );
}

if (offenders.length > 0) {
  console.error(
    `\n✖ ${offenders.length} file(s) exceed the ${MAX_LINES}-line cap:`,
  );
  for (const { rel, lines } of offenders) {
    console.error(`  ${rel}: ${lines} lines`);
  }
  console.error("\nSplit these into modular chunks (see CLAUDE.md).");
  process.exit(1);
}

console.log(`✓ All source files within the ${MAX_LINES}-line cap.`);
