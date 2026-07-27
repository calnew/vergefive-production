import { readFileSync } from "node:fs";

const source = readFileSync("lib/platform-catalog.ts", "utf8");

function between(start, end) {
  const startIndex = source.indexOf(start);
  const endIndex = source.indexOf(end, startIndex);
  if (startIndex < 0 || endIndex < 0) throw new Error(`Catalog marker missing: ${start} -> ${end}`);
  return source.slice(startIndex, endIndex);
}

function keys(block) {
  return [...block.matchAll(/\{\s*key:\s*"([^"]+)"/g)].map((match) => match[1]);
}

const buildoutKeys = new Set(keys(between("export const buildoutModules", "export const accountGroups")));
const programKeys = new Set(keys(between("export const programModules", "const defaultTags")));
const missing = [...programKeys].filter((key) => !buildoutKeys.has(key));
const untracked = [...programKeys].filter((key) => {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return !new RegExp(`\\{\\s*key:\\s*"${escaped}"[^\\n]*fixKeys:\\s*\\[[^\\]]*"${escaped}"`).test(
    between("export const buildoutModules", "export const accountGroups"),
  );
});

if (missing.length) {
  throw new Error(`Full Buildout omits canonical program lessons: ${missing.join(", ")}`);
}
if (buildoutKeys.has("cards-funding")) {
  throw new Error("Full Buildout still collapses the distinct cards and funding lessons.");
}
if (untracked.length) {
  throw new Error(`Canonical Buildout lessons do not track their own completion keys: ${untracked.join(", ")}`);
}

console.log(`PASS: Full Buildout covers and tracks all ${programKeys.size} canonical program lessons without collapsing cards and funding.`);
