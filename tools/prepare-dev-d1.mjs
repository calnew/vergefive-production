import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import process from "node:process";

const CONFIG_PATH = "wrangler.jsonc";
const DEV_DATABASE_NAME = "vergefive-members-dev";
const DEV_WORKER_NAME = "vergefive-next-dev";
const PLACEHOLDER_ID = "__DEV_D1_ID_INJECTED_BY_CI__";
const PRODUCTION_DATABASE_ID = "c9291712-1726-4010-8ff2-f64652c01d59";
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

if (process.env.GITHUB_ACTIONS !== "true") {
  throw new Error("Dev D1 preparation is CI-only. Deployments must run through GitHub Actions.");
}

const npx = process.platform === "win32" ? "npx.cmd" : "npx";
const runWrangler = (args) => execFileSync(npx, ["wrangler", ...args], {
  encoding: "utf8",
  env: process.env,
  stdio: ["ignore", "pipe", "inherit"],
});

function parseJsonOutput(raw, label) {
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error(`${label} did not return valid JSON.`);
  }
}

function databaseIdFrom(record) {
  return String(record?.uuid || record?.id || record?.database_id || "").trim();
}

const config = JSON.parse(readFileSync(CONFIG_PATH, "utf8"));
if (config.name !== DEV_WORKER_NAME) {
  throw new Error(`Refusing deployment: expected Worker ${DEV_WORKER_NAME}, found ${String(config.name)}.`);
}

const binding = config.d1_databases?.find((item) => item.binding === "DB");
if (!binding || binding.database_name !== DEV_DATABASE_NAME) {
  throw new Error(`Refusing deployment: DB must target ${DEV_DATABASE_NAME}.`);
}
if (binding.database_id !== PLACEHOLDER_ID) {
  throw new Error("Refusing deployment: the committed dev config must keep the CI-only D1 placeholder.");
}

const listed = parseJsonOutput(runWrangler(["d1", "list", "--json"]), "wrangler d1 list");
let database = Array.isArray(listed) ? listed.find((item) => item.name === DEV_DATABASE_NAME) : null;
if (!database) {
  runWrangler(["d1", "create", DEV_DATABASE_NAME, "--location", "enam"]);
  const refreshed = parseJsonOutput(runWrangler(["d1", "list", "--json"]), "wrangler d1 list after create");
  database = Array.isArray(refreshed) ? refreshed.find((item) => item.name === DEV_DATABASE_NAME) : null;
}

const databaseId = databaseIdFrom(database);
if (!UUID_PATTERN.test(databaseId) || databaseId === PRODUCTION_DATABASE_ID) {
  throw new Error("Refusing deployment: resolved D1 ID is missing, invalid, or belongs to production.");
}

binding.database_id = databaseId;
writeFileSync(CONFIG_PATH, `${JSON.stringify(config, null, 2)}\n`, "utf8");

runWrangler([
  "d1",
  "execute",
  DEV_DATABASE_NAME,
  "--remote",
  "--file=schema/member-progress.sql",
  "--yes",
  "--config",
  CONFIG_PATH,
]);

const shapeQuery = [
  "select",
  "(select count(*) from pragma_table_info('support_requests') where name in ('fix_key','selected_option')) +",
  "(select count(*) from pragma_table_info('memberships') where name in ('plan','stripe_price_id')) +",
  "(select count(*) from pragma_table_info('legacy_leads') where name in ('business_name','email_last_provider_id','email_last_result')) +",
  "(select count(*) from pragma_table_info('member_preferences') where name in ('user_id','preference_key','preference_value'))",
  "as matched_columns",
].join(" ");
const shapeOutput = parseJsonOutput(runWrangler([
  "d1",
  "execute",
  DEV_DATABASE_NAME,
  "--remote",
  `--command=${shapeQuery}`,
  "--json",
  "--config",
  CONFIG_PATH,
]), "wrangler D1 schema-shape check");
const matchedColumns = Number(shapeOutput?.[0]?.results?.[0]?.matched_columns || 0);
if (matchedColumns !== 10) {
  throw new Error(`Refusing deployment: dev D1 schema is stale (${matchedColumns}/10 required columns found).`);
}

console.log(`Prepared isolated dev D1 ${DEV_DATABASE_NAME} (${databaseId}).`);
