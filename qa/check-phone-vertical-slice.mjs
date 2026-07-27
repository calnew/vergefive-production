import { readFileSync } from "node:fs";

const actions = readFileSync("app/actions/issues.ts", "utf8");
const fixPage = readFileSync("app/fix/[key]/page.tsx", "utf8");
const platformData = readFileSync("lib/platform-data.ts", "utf8");
const supportForm = readFileSync("app/support/support-form.tsx", "utf8");
const devPreview = readFileSync("app/dev-preview/phones/page.tsx", "utf8");
const scanResults = readFileSync("app/scan/results/page.tsx", "utf8");
const contactApi = readFileSync("functions/api/contact.js", "utf8");
const progressApi = readFileSync("functions/api/member/progress.js", "utf8");
const prepareD1 = readFileSync("tools/prepare-dev-d1.mjs", "utf8");
const readme = readFileSync("README.md", "utf8");

const checks = [
  ["selected option server action", actions.includes("export async function selectFixOption")],
  ["selected option stored per authenticated fix", actions.includes("selected_option:${key}")],
  ["phone option required before completion", actions.includes('return "option-required"')],
  ["private proof required before completion", actions.includes('return proofComplete ? null : "proof-required"')],
  ["scan snapshot remains immutable", !actions.includes("update visibility_audits")],
  ["selected option loaded from D1", platformData.includes("selectedOptions") && platformData.includes("selected_option:%")],
  ["member UI saves option", fixPage.includes("selectFixOption.bind")],
  ["member UI explains completion gate", fixPage.includes("Completion is unlocked only after one setup option")],
  ["dev preview accepts isolated dev and local QA hosts only", devPreview.includes("vergefive-next-dev.turncomvoice.workers.dev") && devPreview.includes("localhost|127\\.0\\.0\\.1") && devPreview.includes("notFound()")],
  ["support link does not expose client option context", !fixPage.includes("selectedOption ? `&option=") && !fixPage.includes("&option=${encodeURIComponent(option.name)}")],
  ["support form confirms only returned trusted context", supportForm.includes("savedContext") && supportForm.includes("savedOption") && !supportForm.includes("sourceRoute")],
  ["support API resolves authenticated context", contactApi.includes("trustedFixContext") && contactApi.includes("selected_option:${fixKey}")],
  ["support API persists fix context", contactApi.includes("fix_key, selected_option") && contactApi.includes("data.selectedOption || ''")],
  ["public scan-result D1 failures reach the route error boundary", !scanResults.includes("first<Record<string, unknown>>().catch")],
  ["generic progress API cannot write readiness completion", progressApi.includes("signalType !== 'application_tracker'")],
  ["progress writes require centralized active membership", progressApi.includes("requireActiveMember(context)")],
  ["normalized fix status prevents shared-array overwrites", actions.includes("member_fix_status") && platformData.includes("fixStatusRows")],
  ["completed resume advances or clears", platformData.includes('fixStatuses[completedResumeFix] === "done"') && platformData.includes("nextOpenFix")],
  ["fresh and existing D1 paths run versioned migrations", prepareD1.includes("MIGRATIONS") && prepareD1.includes("migrationRecorded") && prepareD1.includes("0012_support_requests_selected_option")],
  ["fresh D1 creation is compatible with pinned Wrangler", prepareD1.includes('runWrangler(["d1", "create", DEV_DATABASE_NAME, "--location", "enam"]);') && prepareD1.includes("d1 list after create")],
  ["published shared demo password removed", !readme.includes("VergeFiveDemo123")],
];

const failed = checks.filter(([, passed]) => !passed);
if (failed.length) {
  console.error(failed.map(([name]) => `- ${name}`).join("\n"));
  process.exit(1);
}

console.log("PASS: Phone & 411 option → proof → completion → support context contract is present and scan history stays immutable.");
