import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const databaseName = "vergefive-migration-check";
const tempRoot = mkdtempSync(join(tmpdir(), "vergefive-d1-migration-"));
const configPath = join(tempRoot, "wrangler.jsonc");
const persistPath = join(tempRoot, "state");
const wranglerCli = resolve("node_modules/wrangler/bin/wrangler.js");
const migrationFiles = [
  "0001_memberships_stripe_price_id.sql",
  "0002_memberships_plan.sql",
  "0003_webhook_status.sql",
  "0004_webhook_attempts.sql",
  "0005_webhook_updated_at.sql",
  "0006_webhook_completed_at.sql",
  "0007_webhook_last_error.sql",
  "0008_checkout_access_events.sql",
  "0009_guest_scan_age_index.sql",
  "0010_member_fix_status.sql",
  "0011_support_requests_fix_key.sql",
  "0012_support_requests_selected_option.sql",
];

const migrationReadiness = {
  "0001_memberships_stripe_price_id.sql": "(select count(*) from pragma_table_info('memberships') where name = 'stripe_price_id')",
  "0002_memberships_plan.sql": "(select count(*) from pragma_table_info('memberships') where name = 'plan')",
  "0003_webhook_status.sql": "(select count(*) from pragma_table_info('stripe_webhook_events') where name = 'status')",
  "0004_webhook_attempts.sql": "(select count(*) from pragma_table_info('stripe_webhook_events') where name = 'attempts')",
  "0005_webhook_updated_at.sql": "(select count(*) from pragma_table_info('stripe_webhook_events') where name = 'updated_at')",
  "0006_webhook_completed_at.sql": "(select count(*) from pragma_table_info('stripe_webhook_events') where name = 'completed_at')",
  "0007_webhook_last_error.sql": "(select count(*) from pragma_table_info('stripe_webhook_events') where name = 'last_error')",
  "0008_checkout_access_events.sql": "(select count(*) from sqlite_master where type = 'table' and name = 'checkout_access_events')",
  "0009_guest_scan_age_index.sql": "(select count(*) from sqlite_master where type = 'index' and name = 'idx_users_guest_scan_age')",
  "0010_member_fix_status.sql": "(select count(*) from sqlite_master where type = 'table' and name = 'member_fix_status')",
  "0011_support_requests_fix_key.sql": "(select count(*) from pragma_table_info('support_requests') where name = 'fix_key')",
  "0012_support_requests_selected_option.sql": "(select count(*) from pragma_table_info('support_requests') where name = 'selected_option')",
};

writeFileSync(configPath, JSON.stringify({
  name: "vergefive-migration-check",
  compatibility_date: "2026-06-25",
  d1_databases: [{
    binding: "DB",
    database_name: databaseName,
    database_id: "00000000-0000-4000-8000-000000000001",
  }],
}, null, 2));

function wrangler(args) {
  return execFileSync(process.execPath, [wranglerCli, ...args], {
    cwd: process.cwd(),
    encoding: "utf8",
    env: { ...process.env, WRANGLER_LOG_PATH: join(tempRoot, "wrangler.log") },
    stdio: ["ignore", "pipe", "inherit"],
  });
}

function executeFile(file) {
  wrangler([
    "d1", "execute", databaseName,
    "--local",
    `--persist-to=${persistPath}`,
    `--file=${resolve(file)}`,
    "--yes",
    `--config=${configPath}`,
  ]);
}

function query(command) {
  const output = wrangler([
    "d1", "execute", databaseName,
    "--local",
    `--persist-to=${persistPath}`,
    `--command=${command}`,
    "--json",
    `--config=${configPath}`,
  ]);
  return JSON.parse(output)?.[0]?.results?.[0] || {};
}

function readinessSnapshot() {
  const command = `select ${migrationFiles.map((file, index) => `${migrationReadiness[file]} as m${index}`).join(", ")}`;
  const row = query(command);
  return Object.fromEntries(migrationFiles.map((file, index) => [file, Number(row[`m${index}`] || 0) === 1]));
}

function runConditionalMigrations() {
  const before = readinessSnapshot();
  for (const file of migrationFiles.filter((candidate) => !before[candidate])) {
    executeFile(join("schema", "migrations", file));
  }
  const after = readinessSnapshot();
  for (const file of migrationFiles) {
    if (!after[file]) throw new Error(`${file} did not produce its required shape.`);
  }
}

try {
  executeFile("schema/test-fixtures/pre-migration-core.sql");
  executeFile("schema/member-progress.sql");
  runConditionalMigrations();
  runConditionalMigrations();

  const shapeQuery = [
    "select",
    "(select count(*) from pragma_table_info('support_requests') where name in ('fix_key','selected_option')) +",
    "(select count(*) from pragma_table_info('memberships') where name in ('plan','stripe_price_id')) +",
    "(select count(*) from pragma_table_info('legacy_leads') where name in ('business_name','email_last_provider_id','email_last_result')) +",
    "(select count(*) from pragma_table_info('member_preferences') where name in ('user_id','preference_key','preference_value')) +",
    "(select count(*) from pragma_table_info('stripe_webhook_events') where name in ('status','attempts','updated_at','completed_at','last_error')) +",
    "(select count(*) from pragma_table_info('checkout_access_events') where name in ('session_id','user_id','status','attempts','updated_at','completed_at')) +",
    "(select count(*) from pragma_table_info('schema_migrations') where name in ('id','applied_at')) +",
    "(select count(*) from pragma_table_info('member_fix_status') where name in ('user_id','fix_key','status','updated_at'))",
    "as matched_columns",
  ].join(" ");
  const matchedColumns = Number(query(shapeQuery).matched_columns || 0);
  if (matchedColumns !== 27) {
    throw new Error(`Pre-migration D1 upgrade produced ${matchedColumns}/27 required columns.`);
  }

  const webhookLegacyDefault = query(
    "select dflt_value from pragma_table_info('stripe_webhook_events') where name = 'status'",
  );
  if (!String(webhookLegacyDefault.dflt_value || "").includes("completed")) {
    throw new Error("Webhook status migration did not establish a valid status default.");
  }

  const source = readFileSync("tools/prepare-dev-d1.mjs", "utf8");
  for (const file of migrationFiles) {
    if (!source.includes(file)) throw new Error(`Dev D1 preparation does not include ${file}.`);
  }

  console.log("PASS: real legacy D1 upgrades idempotently through every versioned migration to the required 27-column shape.");
} finally {
  const resolvedTemp = resolve(tempRoot);
  if (!resolvedTemp.startsWith(resolve(tmpdir()))) throw new Error(`Refusing to remove unexpected path: ${resolvedTemp}`);
  rmSync(resolvedTemp, { recursive: true, force: true });
}
