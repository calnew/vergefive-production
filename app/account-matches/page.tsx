export const dynamic = "force-dynamic";

import { PlatformShell } from "@/components/platform/platform-shell";
import { PlatformPaywall } from "@/components/platform/paywall";
import { Card, CardContent } from "@/components/ui";
import { accountBuckets, accountCatalog, accountPathCards, accountStatus, fixPlaybooks } from "@/lib/platform-catalog";
import { getPlatformData } from "@/lib/platform-data";
import { AccountMatchesClient } from "./account-matches-client";

export default async function AccountMatchesPage() {
  const { user, allowed, scan } = await getPlatformData();
  if (!allowed) return <PlatformPaywall />;

  const openIssueKeys = new Set((scan?.issues ?? []).filter((issue) => issue.status !== "done").map((issue) => issue.key));
  const completedKeys = new Set((scan?.issues ?? []).filter((issue) => issue.status === "done").map((issue) => issue.key));
  const readyCount = accountCatalog.filter((item) => accountStatus(item, openIssueKeys, completedKeys).tone === "ready").length;
  const lockedCount = accountCatalog.filter((item) => accountStatus(item, openIssueKeys, completedKeys).tone === "locked").length;
  const groupCount = new Set(accountCatalog.map((item) => item.group)).size;
  const accounts = accountBuckets.flatMap((bucket) => {
    const items = accountCatalog.filter((item) => bucket.groups.includes(item.group));
    return items.map((item) => {
      const status = accountStatus(item, openIssueKeys, completedKeys);
      return {
        bucketKey: bucket.key as "vendor" | "cards" | "funding",
        bucketTitle: bucket.title,
        name: item.name,
        group: item.group,
        type: item.type,
        gradient: item.gradient,
        why: item.why,
        requirements: item.requirements,
        recommended: item.recommended,
        timing: item.timing,
        blockerLinks: status.blockers.map((blockerKey) => ({
          key: blockerKey,
          label: fixPlaybooks[blockerKey]?.shortTitle ?? blockerKey,
        })),
        status,
      };
    });
  });

  return (
    <PlatformShell user={user} active="Account Matches">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-vfText-muted">Account Matches</p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-[-0.05em] text-brand-navy md:text-5xl">Account Matches</h1>
        <p className="mt-3 max-w-3xl text-vfText-body">Choose from the approved category structure: vendors and Net 30, business cards, and funding paths. Each category shows examples, readiness rules, and what must be fixed before applying.</p>

        {!scan ? (
          <Card className="mt-8">
            <CardContent className="p-8">
              <p className="font-bold text-vfText-body">Run a scan first to generate account matches.</p>
              <a className="mt-4 inline-block font-bold text-brand-blue" href="/scan/">Run Scan</a>
            </CardContent>
          </Card>
        ) : null}

        <AccountMatchesClient
          userName={user.name}
          readyCount={readyCount}
          lockedCount={lockedCount}
          groupCount={groupCount}
          pathCards={accountPathCards}
          accounts={accounts}
        />
      </div>
    </PlatformShell>
  );
}
