import { readdirSync, readFileSync } from "node:fs";
import { extname, join } from "node:path";

const PROD_DATABASE_ID = "c9291712-1726-4010-8ff2-f64652c01d59";
const config = JSON.parse(readFileSync("wrangler.jsonc", "utf8"));
const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
const workflow = readFileSync(".github/workflows/deploy-dev-worker.yml", "utf8");
const prepareD1 = readFileSync("tools/prepare-dev-d1.mjs", "utf8");
const phoneJourney = readFileSync("qa/phone-vertical-slice-e2e.cjs", "utf8");

const errors = [];
const db = config.d1_databases?.find((item) => item.binding === "DB");
const runtimeExtensions = new Set([".js", ".mjs", ".cjs", ".ts", ".tsx"]);

function runtimeFiles(root) {
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const path = join(root, entry.name);
    if (entry.isDirectory()) return runtimeFiles(path);
    return runtimeExtensions.has(extname(entry.name)) ? [path] : [];
  });
}

if (config.name !== "vergefive-next-dev") errors.push("Dev Worker name is not isolated.");
if (!db || db.database_name !== "vergefive-members-dev") errors.push("Dev D1 name is not isolated.");
if (!db || db.database_id === PROD_DATABASE_ID) errors.push("Dev config still references the production D1 ID.");
if (!db || db.database_id !== "__DEV_D1_ID_INJECTED_BY_CI__") errors.push("Committed dev config must use the CI-only D1 placeholder.");
if (config.vars?.APP_ENVIRONMENT !== "development") errors.push("APP_ENVIRONMENT is not development.");
if (config.vars?.DATABASE_ENVIRONMENT !== "development") errors.push("DATABASE_ENVIRONMENT is not development.");
if (config.vars?.STRIPE_MODE_REQUIRED !== "test") errors.push("Dev Stripe mode is not locked to test.");
if (packageJson.scripts?.["cf:deploy"] || packageJson.scripts?.["cf:upload"]) errors.push("Local deploy/upload scripts remain enabled.");
if (!workflow.includes("node tools/prepare-dev-d1.mjs")) errors.push("CI does not prepare and assert the isolated dev D1.");
if (!workflow.includes("environment: vergefive-dev")) errors.push("CI does not use the vergefive-dev GitHub Environment.");
if (!workflow.includes("if: github.event_name != 'pull_request'")) errors.push("PR verification is not separated from deployment.");
const exactTriggerContract = [
  "on:",
  "  pull_request:",
  "    branches:",
  "      - scan-first-platform-redesign",
  "  push:",
  "    branches:",
  "      - scan-first-platform-redesign",
  "  workflow_dispatch:",
].join("\n");
if (!workflow.includes(exactTriggerContract)) errors.push("PR and push triggers are not independently restricted to the dev integration branch.");
if (!workflow.includes("VF_QA_URL: https://vergefive-next-dev.turncomvoice.workers.dev")) errors.push("Deployed journey QA is not pinned to the isolated dev Worker.");
if (!prepareD1.includes('process.env.GITHUB_ACTIONS !== "true"')) errors.push("Dev D1 preparation is not restricted to GitHub Actions.");
if (!prepareD1.includes(PROD_DATABASE_ID)) errors.push("Dev D1 preparation does not explicitly reject the production database.");
if (!prepareD1.includes('"--remote"') || !prepareD1.includes('"--file=schema/member-progress.sql"')) errors.push("Dev D1 preparation does not apply the canonical schema remotely.");
if (!prepareD1.includes("MIGRATIONS") || !prepareD1.includes("schema_migrations") || !prepareD1.includes("matchedColumns !== 27")) errors.push("Dev D1 preparation does not enforce the versioned migration ledger and full schema shape.");
if (!phoneJourney.includes('hostname === "vergefive-next-dev.turncomvoice.workers.dev"')) errors.push("Phone journey QA does not enforce the exact dev hostname.");

const runtimeDdlPattern = /\b(?:create|alter|drop)\s+(?:table|index)\b/i;
for (const file of ["app", "functions", "lib"].flatMap(runtimeFiles)) {
  if (runtimeDdlPattern.test(readFileSync(file, "utf8"))) {
    errors.push(`Runtime DDL is forbidden outside schema ownership: ${file}`);
  }
}

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log("PASS: dev Worker, D1, Stripe mode, and deployment path are separated from production.");
