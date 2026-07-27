import { readFileSync } from "node:fs";

const PROD_DATABASE_ID = "c9291712-1726-4010-8ff2-f64652c01d59";
const config = JSON.parse(readFileSync("wrangler.jsonc", "utf8"));
const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
const workflow = readFileSync(".github/workflows/deploy-dev-worker.yml", "utf8");

const errors = [];
const db = config.d1_databases?.find((item) => item.binding === "DB");

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

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log("PASS: dev Worker, D1, Stripe mode, and deployment path are separated from production.");
