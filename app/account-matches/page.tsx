export const dynamic = "force-dynamic";

import Link from "next/link";

import { PlatformShell } from "@/components/platform/platform-shell";
import { PlatformPaywall } from "@/components/platform/paywall";
import { Badge, Card, CardContent, CreditCardFace } from "@/components/ui";
import { accountCatalog, accountGroups, accountStatus, fixPlaybooks } from "@/lib/platform-catalog";
import { getPlatformData } from "@/lib/platform-data";

function categoryLabel(category: string) {
  return category.replace("_", " ").replace("net30", "Net 30");
}

export default async function AccountMatchesPage() {
  const { user, allowed, scan } = await getPlatformData();
  if (!allowed) return <PlatformPaywall />;

  const openIssueKeys = new Set((scan?.issues ?? []).filter((issue) => issue.status !== "done").map((issue) => issue.key));
  const completedKeys = new Set((scan?.issues ?? []).filter((issue) => issue.status === "done").map((issue) => issue.key));
  const readyCount = accountCatalog.filter((item) => accountStatus(item, openIssueKeys, completedKeys).tone === "ready").length;
  const lockedCount = accountCatalog.filter((item) => accountStatus(item, openIssueKeys, completedKeys).tone === "locked").length;

  return (
    <PlatformShell user={user} active="Account Matches">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-vfText-muted">Vendor, card, and funding library</p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-[-0.05em] text-brand-navy md:text-5xl">Account Matches</h1>
        <p className="mt-3 max-w-3xl text-vfText-body">This restores the full approved account library instead of the small sample list. Every category uses the same card-frame system and shows why it is available, what is locked, and what must be fixed first.</p>

        {!scan ? <Card className="mt-8"><CardContent className="p-8"><p className="font-bold text-vfText-body">Run a scan first to generate account matches.</p><Link className="mt-4 inline-block font-bold text-brand-blue" href="/scan/">Run Scan</Link></CardContent></Card> : null}

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <Card><CardContent className="p-6"><Badge variant="ready">Ready to review</Badge><p className="mt-4 font-display text-4xl font-bold text-brand-navy">{readyCount}</p><p className="mt-2 text-sm text-vfText-body">No current scan blocker tied to the account requirement.</p></CardContent></Card>
          <Card><CardContent className="p-6"><Badge variant="flagged">Fix first</Badge><p className="mt-4 font-display text-4xl font-bold text-brand-navy">{lockedCount}</p><p className="mt-2 text-sm text-vfText-body">Current scan blockers should be handled before applying.</p></CardContent></Card>
          <Card><CardContent className="p-6"><Badge variant="info">Categories</Badge><p className="mt-4 font-display text-4xl font-bold text-brand-navy">{accountGroups.length}</p><p className="mt-2 text-sm text-vfText-body">Starter vendors, operational vendors, cards, fleet, tech, and funding paths.</p></CardContent></Card>
        </section>

        <div className="mt-10 grid gap-10">
          {accountGroups.map((group) => {
            const items = accountCatalog.filter((item) => item.group === group);
            return (
              <section key={group}>
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h2 className="font-display text-2xl font-bold text-brand-navy">{group}</h2>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-vfText-body">Choose accounts from this category only when the requirements and timing fit the current business profile.</p>
                  </div>
                  <Badge variant="outline">{items.length} options</Badge>
                </div>
                <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {items.map((item) => {
                    const status = accountStatus(item, openIssueKeys, completedKeys);
                    return (
                      <Card key={`${group}-${item.name}`}>
                        <CardContent className="p-5">
                          <CreditCardFace memberName={user.name} cardTypeLabel={item.type} gradient={item.gradient} locked={status.tone === "locked"} />
                          <div className="mt-4 flex flex-wrap items-center gap-2">
                            <Badge variant={status.tone === "ready" ? "ready" : status.tone === "review" ? "info" : "flagged"}>{status.label}</Badge>
                            <Badge variant="outline">{categoryLabel(item.type)}</Badge>
                          </div>
                          <h3 className="mt-3 font-display text-xl font-bold text-brand-navy">{item.name}</h3>
                          <p className="mt-2 text-sm leading-6 text-vfText-body">{item.why}</p>
                          <div className="mt-4 rounded-2xl bg-surface-muted p-3">
                            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-vfText-muted">Requirements</p>
                            <p className="mt-2 text-sm font-bold text-vfText-body">{item.requirements.join(" / ")}</p>
                          </div>
                          {status.blockers.length ? (
                            <div className="mt-3 rounded-2xl bg-unlock-surface p-3 text-sm font-bold text-unlock">
                              Fix first: {status.blockers.map((key, index) => <span key={key}>{index ? ", " : ""}<Link href={`/fix/${key}/`} className="underline">{fixPlaybooks[key]?.shortTitle ?? key}</Link></span>)}
                            </div>
                          ) : (
                            <div className="mt-3 rounded-2xl bg-ready-surface p-3 text-sm font-bold text-ready">{item.timing}</div>
                          )}
                          <div className="mt-4 flex flex-wrap gap-2">
                            <Link href={item.applyHref} className="rounded-xl bg-brand-blue px-4 py-2 text-sm font-extrabold text-white">Open category</Link>
                            <Link href={`/support?topic=account&from=${encodeURIComponent(item.name)}`} className="rounded-xl border border-vfBorder px-4 py-2 text-sm font-extrabold text-brand-blue">Get help</Link>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </PlatformShell>
  );
}
