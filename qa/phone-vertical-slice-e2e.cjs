/*
 * Dev-only functional check for the first protected vertical slice.
 * Creates a disposable member in the isolated dev D1, then verifies:
 * option selection -> progress -> private proof -> completion -> readiness -> support context.
 */
const { chromium } = require("playwright");

const BASE = String(process.env.VF_QA_URL || "https://vergefive-next-dev.turncomvoice.workers.dev").replace(/\/$/, "");
if (!BASE.includes("localhost") && !BASE.includes("vergefive-next-dev")) {
  throw new Error(`Refusing QA against non-dev URL: ${BASE}`);
}

const email = `qa-phone-slice-${Date.now()}@example.com`;
const password = `QaPhoneSlice-${Date.now()}!`;

async function post(request, route, data) {
  const response = await request.post(`${BASE}${route}`, {
    data,
    headers: { "content-type": "application/json", origin: BASE },
  });
  let json = {};
  try { json = await response.json(); } catch { /* response is not JSON */ }
  if (!response.ok()) throw new Error(`${route} failed: ${response.status()} ${JSON.stringify(json)}`);
  return json;
}

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1365, height: 900 } });
  await post(context.request, "/api/auth/register", { email, password, name: "Phone Slice QA" });
  const scanResult = await post(context.request, "/api/scan", {
    name: "Phone Slice QA LLC",
    entityType: "LLC",
    address: "212 Commerce St, Henderson, NC 27536",
    phone: "555",
    website: "phone-slice.example.com",
    email: "info@phone-slice.example.com",
  });
  if (!scanResult.scanId) throw new Error("Scan did not return a persisted scan id.");

  const auditsBefore = await context.request.get(`${BASE}/api/member/visibility-audits`);
  if (!auditsBefore.ok()) throw new Error(`Audit read failed before slice: ${auditsBefore.status()}`);
  const auditsBeforeJson = await auditsBefore.json();
  const auditSnapshotBefore = JSON.stringify(auditsBeforeJson);
  if (!auditSnapshotBefore.includes('"phones"')) throw new Error("Scan did not produce a Phone & 411 finding.");

  const bypass = await context.request.put(`${BASE}/api/member/progress`, {
    data: { signalType: "fix_done", selectedKeys: ["phones"] },
    headers: { "content-type": "application/json", origin: BASE },
  });
  if (bypass.status() !== 400) throw new Error(`Generic progress API accepted fix_done bypass: ${bypass.status()}`);

  const page = await context.newPage();
  await page.goto(`${BASE}/fix/phones/`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Mark Complete" }).click();
  await page.waitForURL(/completion=option-required/);
  await page.getByText(/Choose and save one Phone/).waitFor();

  await page.getByRole("button", { name: "Select option" }).first().click();
  await page.waitForURL(/selection=saved/);
  await page.getByText(/Setup option saved:/).waitFor();

  await page.getByRole("button", { name: "Mark Complete" }).click();
  await page.waitForURL(/completion=proof-required/);
  await page.getByText(/Save every private-proof item/).waitFor();

  const proofBoxes = page.locator("label", { hasText: "Private proof" }).locator('input[type="checkbox"]');
  const proofCount = await proofBoxes.count();
  if (!proofCount) throw new Error("No private-proof checkboxes found.");
  for (let index = 0; index < proofCount; index += 1) await proofBoxes.nth(index).check();
  await page.getByText("Progress saved").waitFor({ timeout: 10000 });

  await page.getByRole("button", { name: "Mark Complete" }).click();
  await page.waitForURL(/completed=1/);
  await page.getByText(/marked complete/).first().waitFor();

  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("button", { name: /Selected/ }).first().waitFor();
  await page.getByRole("button", { name: /undo/i }).waitFor();

  await page.getByRole("link", { name: "Get Help" }).click();
  await page.getByText("Page:").waitFor();
  await page.getByLabel("Name").fill("Phone Slice QA");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("What do you need help with?").fill("Please verify my saved Phone & 411 setup context.");
  const supportResponsePromise = page.waitForResponse((response) => response.url().includes("/api/contact") && response.request().method() === "POST");
  await page.getByRole("button", { name: "Send support request" }).click();
  const supportResponse = await supportResponsePromise;
  const supportJson = await supportResponse.json();
  if (!supportResponse.ok() || !supportJson.requestId) {
    throw new Error(`Support context was not persisted: ${supportResponse.status()} ${JSON.stringify(supportJson)}`);
  }
  if (supportJson.context?.fixKey !== "phones" || !supportJson.context?.selectedOption) {
    throw new Error(`Support response did not return trusted Phone context: ${JSON.stringify(supportJson.context)}`);
  }
  await page.getByText(/Request received/).waitFor();

  const auditsAfter = await context.request.get(`${BASE}/api/member/visibility-audits`);
  if (!auditsAfter.ok()) throw new Error(`Audit read failed after slice: ${auditsAfter.status()}`);
  const auditSnapshotAfter = JSON.stringify(await auditsAfter.json());
  if (auditSnapshotAfter !== auditSnapshotBefore) throw new Error("Completion mutated the stored visibility-audit snapshot.");

  const progressAfter = await context.request.get(`${BASE}/api/member/progress`);
  const progressJson = await progressAfter.json();
  const doneSignal = (progressJson.signals || []).find((item) => item.signal_type === "fix_done");
  const doneKeys = JSON.parse(doneSignal && doneSignal.selected_keys || "[]");
  if (!doneKeys.includes("phones")) throw new Error("Validated completion did not persist to readiness state.");

  console.log(`PASS: isolated phone vertical slice completed for ${email}.`);
  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
