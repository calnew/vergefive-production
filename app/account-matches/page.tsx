export const dynamic = "force-dynamic";

import { PlatformShell } from "@/components/platform/platform-shell";
import { PlatformPaywall } from "@/components/platform/paywall";
import { accountBuckets, accountCatalog } from "@/lib/platform-catalog";
import { getPlatformData } from "@/lib/platform-data";
import { CORE_SIGNAL_KEYS } from "@/lib/readiness";
import { AccountMatchesClient, type MatcherAccount } from "./account-matches-client";

// fixKeys from the catalog use lesson keys; the matcher works in signal keys.
const FIX_TO_SIGNAL: Record<string, string> = { email: "website" };

function signalRequirements(fixKeys: string[], group: string, path: "vendor" | "cards" | "funding"): string[] {
  const requires = new Set(fixKeys.map((key) => FIX_TO_SIGNAL[key] ?? key));
  if (group.includes("Secured")) requires.add("deposit");
  else if (group.includes("Corporate")) requires.add("revenue");
  else if (path === "cards") requires.add("goodCredit");
  if (path === "funding") requires.add("reserveOrRevenue");
  return [...requires];
}

export default async function AccountMatchesPage() {
  const { user, allowed, scan, readiness } = await getPlatformData();
  if (!allowed) return <PlatformPaywall />;

  const accounts: MatcherAccount[] = accountBuckets.flatMap((bucket) =>
    accountCatalog
      .filter((item) => bucket.groups.includes(item.group))
      .map((item) => ({
        name: item.name,
        path: bucket.path,
        group: item.group,
        type: item.type,
        requires: signalRequirements(item.fixKeys, item.group, bucket.path),
        recommended: item.recommended,
        why: item.why,
        timing: item.timing,
        gradient: item.gradient,
      }))
  );

  const scanSignals: Record<string, boolean> = {};
  for (const key of CORE_SIGNAL_KEYS) scanSignals[key] = readiness.signalStatuses[key] === "done";

  return (
    <PlatformShell user={user} active="Account Matches" businessName={scan?.business.name}>
      <AccountMatchesClient userName={user.name} hasScan={!!scan} scanSignals={scanSignals} accounts={accounts} />
    </PlatformShell>
  );
}
