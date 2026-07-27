import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import process from "node:process";

const CONFIG_PATH = "wrangler.jsonc";
const DEV_DATABASE_NAME = "vergefive-members-dev";
const DEV_WORKER_NAME = "vergefive-next-dev";
const PLACEHOLDER_ID = "__DEV_D1_ID_INJECTED_BY_CI__";
const PRODUCTION_DATABASE_ID = "c9291712-1726-4010-8ff2-f64652c01d59";
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MIGRATIONS = [
  { id: "0001_memberships_stripe_price_id", file: "schema/migrations/0001_memberships_stripe_price_id.sql", ready: "select count(*) = 1 as ready from pragma_table_info('memberships') where name = 'stripe_price_id'" },
  { id: "0002_memberships_plan", file: "schema/migrations/0002_memberships_plan.sql", ready: "select count(*) = 1 as ready from pragma_table_info('memberships') where name = 'plan'" },
  { id: "0003_webhook_status", file: "schema/migrations/0003_webhook_status.sql", ready: "select count(*) = 1 as ready from pragma_table_info('stripe_webhook_events') where name = 'status'" },
  { id: "0004_webhook_attempts", file: "schema/migrations/0004_webhook_attempts.sql", ready: "select count(*) = 1 as ready from pragma_table_info('stripe_webhook_events') where name = 'attempts'" },
  { id: "0005_webhook_updated_at", file: "schema/migrations/0005_webhook_updated_at.sql", ready: "select count(*) = 1 as ready from pragma_table_info('stripe_webhook_events') where name = 'updated_at'" },
  { id: "0006_webhook_completed_at", file: "schema/migrations/0006_webhook_completed_at.sql", ready: "select count(*) = 1 as ready from pragma_table_info('stripe_webhook_events') where name = 'completed_at'" },
  { id: "0007_webhook_last_error", file: "schema/migrations/0007_webhook_last_error.sql", ready: "select count(*) = 1 as ready from pragma_table_info('stripe_webhook_events') where name = 'last_error'" },
  { id: "0008_checkout_access_events", file: "schema/migrations/0008_checkout_access_events.sql", ready: "select count(*) = 1 as ready from sqlite_master where type = 'table' and name = 'checkout_access_events'" },
  { id: "0009_guest_scan_age_index", file: "schema/migrations/0009_guest_scan_age_index.sql", ready: "select count(*) = 1 as ready from sqlite_master where type = 'index' and name = 'idx_users_guest_scan_age'" },
  { id: "0010_member_fix_status", file: "schema/migrations/0010_member_fix_status.sql", ready: "select count(*) = 1 as ready from sqlite_master where type = 'table' and name = 'member_fix_status'" },
  { id: "0011_support_requests_fix_key", file: "schema/migrations/0011_support_requests_fix_key.sql", ready: "select count(*) = 1 as ready from pragma_table_info('support_requests') where name = 'fix_key'" },
  { id: "0012_support_requests_selected_option", file: "schema/migrations/0012_support_requests_selected_option.sql", ready: "select count(*) = 1 as ready from pragma_table_info('support_requests') where name = 'selected_option'" },
];

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

function executeD1Json(command, label) {
  return parseJsonOutput(runWrangler([
    "d1",
    "execute",
    DEV_DATABASE_NAME,
    "--remote",
    `--command=${command}`,
    "--json",
    "--config",
    CONFIG_PATH,
  ]), label);
}

function firstResult(output) {
  return output?.[0]?.results?.[0] || {};
}

function migrationRecorded(id) {
  const output = executeD1Json(
    `select count(*) as applied from schema_migrations where id = '${id}'`,
    `migration ledger check ${id}`,
  );
  return Number(firstResult(output).applied || 0) === 1;
}

function migrationShapeReady(migration) {
  const output = executeD1Json(migration.ready, `migration shape check ${migration.id}`);
  return Number(firstResult(output).ready || 0) === 1;
}

function recordMigration(id) {
  executeD1Json(
    `insert or ignore into schema_migrations (id, applied_at) values ('${id}', datetime('now'))`,
    `migration ledger write ${id}`,
  );
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

for (const migration of MIGRATIONS) {
  if (!/^[a-z0-9_]+$/.test(migration.id)) throw new Error(`Invalid migration id: ${migration.id}`);
  const recorded = migrationRecorded(migration.id);
  if (recorded && migrationShapeReady(migration)) continue;
  if (!migrationShapeReady(migration)) {
    runWrangler([
      "d1",
      "execute",
      DEV_DATABASE_NAME,
      "--remote",
      `--file=${migration.file}`,
      "--yes",
      "--config",
      CONFIG_PATH,
    ]);
  }
  if (!migrationShapeReady(migration)) {
    throw new Error(`Migration ${migration.id} did not produce its required schema shape.`);
  }
  if (!recorded) recordMigration(migration.id);
}

const shapeQuery = [
  "select",
  "(select count(*) from pragma_table_info('support_requests') where name in ('fix_key','selected_option')) +",
  "(select count(*) from pragma_table_info('memberships') where name in ('plan','stripe_price_id')) +",
  "(select count(*) from pragma_table_info('legacy_leads') where name in ('business_name','email_last_provider_id','email_last_result')) +",
  "(select count(*) from pragma_table_info('member_preferences') where name in ('user_id','preference_key','preference_value')) +",
  "(select count(*) from pragma_table_info('stripe_webhook_events') where name in ('status','attempts','updated_at','completed_at','last_error')) +",
  "(select count(*) from pragma_table_info('checkout_access_events') where name in ('session_id','user_id','status','attempts','updated_at','completed_at')) +",
  "(select count(*) from pragma_table_info('schema_migrations') where name in ('id','applied_at'))",
  "+ (select count(*) from pragma_table_info('member_fix_status') where name in ('user_id','fix_key','status','updated_at'))",
  "as matched_columns",
].join(" ");
const shapeOutput = executeD1Json(shapeQuery, "wrangler D1 schema-shape check");
const matchedColumns = Number(shapeOutput?.[0]?.results?.[0]?.matched_columns || 0);
if (matchedColumns !== 27) {
  throw new Error(`Refusing deployment: dev D1 schema is stale (${matchedColumns}/27 required columns found).`);
}

console.log(`Prepared isolated dev D1 ${DEV_DATABASE_NAME} (${databaseId}).`);
