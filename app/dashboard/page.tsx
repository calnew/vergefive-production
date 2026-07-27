export const dynamic = "force-dynamic";

import Link from "next/link";

import { PlatformShell } from "@/components/platform/platform-shell";
import { PlatformPaywall } from "@/components/platform/paywall";
import { ImpactPill } from "@/components/platform/pills";
import { Button, Card, CardContent, CreditCardFace, ProgressBar, ReadinessRing } from "@/components/ui";
import { getPlatformData } from "@/lib/platform-data";
import { canonicalFixOrder, fixPlaybooks } from "@/lib/platform-catalog";

const matchTypeLabels: Record<string, string> = {
  vendor_net30: "Vendor · Net 30",
  secured_card: "Secured card",
  credit_card: "Credit card",
};

export default async function DashboardPage() {
  const { user, allowed, scan, fixStatuses, readiness, pageProgress } = await getPlatformData();
  if (!allowed) return <PlatformPaywall />;

  const firstName = (user.name || user.email).split(/[\s@]/)[0];
  const businessName = scan?.business.name;

  const openIssues = scan?.issues.filter((issue) => issue.status !== "done") ?? [];
  const openCatalogKeys = canonicalFixOrder.filter(
    (key) => (fixStatuses[key] ?? "todo") !== "done" && !openIssues.some((issue) => issue.key === key)
  );
  const nextActions = [
    ...openIssues.map((issue) => ({ key: issue.key, title: issue.title, reason: issue.detail, severity: issue.severity })),
    ...openCatalogKeys.map((key) => ({ key, title: fixPlaybooks[key]?.title ?? key, reason: fixPlaybooks[key]?.scanFinding ?? "", severity: "med" })),
  ].slice(0, 3);

  const availableAccounts = scan?.accountMatches.filter((match) => match.tier === "ready").slice(0, 3) ?? [];
  const lockedAccounts = scan?.accountMatches.filter((match) => match.tier !== "ready").slice(0, 3) ?? [];

  return (
    <PlatformShell user={user} active="Dashboard" businessName={businessName}>
      <header>
        <h1 className="font-display text-2xl font-bold tracking-[-0.02em] text-vfText-strong md:text-[27px]">Welcome back, {firstName}</h1>
        <p className="mt-1 text-sm text-vfText-body">
          {businessName ? `${businessName} · ` : ""}Assigned path: <b className="text-vfText-strong">{readiness.assignedPath}</b>
        </p>
      </header>

      {!scan ? (
        <Card className="mt-6">
          <CardContent className="p-8 text-center md:p-12">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand-blue">Start here</p>
            <h2 className="mt-3 font-display text-3xl font-bold text-vfText-strong">Run your Business Visibility Scan.</h2>
            <p className="mx-auto mt-3 max-w-xl leading-7 text-vfText-body">Enter the business profile so Verge Five can build your readiness score, fix list, and account-match path.</p>
            <Button asChild size="lg" className="mt-6"><Link href="/scan/">Run My Scan</Link></Button>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-6 grid gap-5">
          <section className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
            <div className="relative overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#0E1A2B,#1D3A64)] p-7 text-white shadow-soft">
              <div className="pointer-events-none absolute -right-16 -top-24 size-64 rounded-full bg-brand-blue/30 blur-3xl" aria-hidden />
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-ondark-blue">Start here</p>
              <h2 className="mt-2 font-display text-2xl font-bold">Run My Scan</h2>
              <p className="mt-2 max-w-md leading-7 text-ondark-body">The scan reads the business profile signals vendors compare first, scores readiness, and rebuilds your fix list.</p>
              <Button asChild size="lg" className="mt-5"><Link href="/scan/">{scan ? "Re-run Scan" : "Run Scan Now"}</Link></Button>
            </div>
            <Card>
              <CardContent className="flex h-full flex-col p-7">
                <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-vfText-muted">Guided program</p>
                <h2 className="mt-2 font-display text-2xl font-bold text-vfText-strong">Explore Full Buildout</h2>
                <p className="mt-2 leading-7 text-vfText-body">Seven modules across five phases, covering identity, legal setup, banking, planning, credit readiness, vendors, cards, and funding.</p>
                <div className="mt-auto pt-5"><Button asChild variant="outline"><Link href="/buildout/">Open the buildout</Link></Button></div>
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-5 lg:grid-cols-2">
            <Card>
              <CardContent className="p-7">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="font-display text-lg font-bold text-vfText-strong">Business Readiness</h2>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-brand-blue">Scan signals</span>
                </div>
                <div className="mt-5 flex flex-wrap items-center gap-6">
                  <ReadinessRing value={readiness.score} size={128} color={readiness.color} />
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-xl font-bold" style={{ color: readiness.color }}>{readiness.label}</p>
                    <p className="mt-2 leading-7 text-vfText-body">{readiness.doneCount} of {readiness.total} signals clean. Completed fixes raise the score and unlock better-fit accounts.</p>
                    <Button asChild variant="outline" size="sm" className="mt-4"><Link href="/report-card/">Download Report Card</Link></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-7">
                <h2 className="font-display text-lg font-bold text-vfText-strong">Page Progress</h2>
                <div className="mt-4 flex items-end gap-2">
                  <span className="font-display text-4xl font-bold text-vfText-strong">{pageProgress.percent}%</span>
                  <span className="pb-1 text-sm text-vfText-body">of the platform explored</span>
                </div>
                <ProgressBar value={pageProgress.percent} className="mt-4" />
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-surface-muted p-4">
                    <b className="font-display text-xl text-brand-blue">{pageProgress.visitedCount}</b>
                    <p className="text-sm text-vfText-body">Pages explored</p>
                  </div>
                  <div className="rounded-2xl bg-surface-muted p-4">
                    <b className="font-display text-xl text-ready">{readiness.doneCount}</b>
                    <p className="text-sm text-vfText-body">Signals clean</p>
                  </div>
                </div>
                <p className="mt-4 text-xs leading-5 text-vfText-muted">Progress tracks activity. The readiness score only moves when scan signals are actually fixed — activity is not readiness.</p>
              </CardContent>
            </Card>
          </section>

          <Card>
            <CardContent className="p-7">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-display text-lg font-bold text-vfText-strong">Your Next 3 Actions</h2>
                <Link href="/fix-list/" className="text-sm font-bold text-brand-blue hover:underline">View full fix list →</Link>
              </div>
              <div className="mt-5 grid gap-3">
                {nextActions.map((action, index) => (
                  <div key={action.key} className="grid gap-4 rounded-2xl border border-vfBorder bg-white p-4 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center">
                    <div className="grid size-10 place-items-center rounded-xl bg-blue-50 font-display font-bold text-brand-blue">{index + 1}</div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-display text-base font-bold text-vfText-strong">{action.title}</h3>
                        <ImpactPill severity={action.severity} />
                      </div>
                      <p className="mt-1 text-sm leading-6 text-vfText-body">{action.reason}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button asChild size="sm"><Link href={`/fix/${action.key}/`}>Do It Myself</Link></Button>
                      <Button asChild size="sm" variant="outline"><Link href={`/support/?topic=${action.key}`}>Get Help</Link></Button>
                    </div>
                  </div>
                ))}
                {!nextActions.length ? (
                  <div className="rounded-2xl bg-ready-surface p-5 text-ready">
                    <p className="font-display text-xl font-bold">All current fixes are complete.</p>
                    <p className="mt-2 text-sm font-bold">Review the ready-now accounts, save your report card, and only apply when an account fits your readiness profile.</p>
                    <Button asChild className="mt-4"><Link href="/account-matches/">Review ready accounts</Link></Button>
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-7">
              <h2 className="font-display text-lg font-bold text-vfText-strong">Account Access</h2>
              <p className="mt-1 text-sm text-vfText-body">Matches are readiness guidance, not approval promises.</p>
              <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.18em] text-ready">Currently available to you</p>
              <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {availableAccounts.map((match) => (
                  <div key={match.id}>
                    <CreditCardFace memberName={match.name} cardTypeLabel={matchTypeLabels[match.category] ?? match.category} gradient={match.faceBg} />
                    <p className="mt-2 text-sm leading-6 text-vfText-body">{match.reason}</p>
                  </div>
                ))}
              </div>
              <p className="mt-7 text-xs font-extrabold uppercase tracking-[0.18em] text-unlock">Unlock next</p>
              <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {lockedAccounts.map((match) => (
                  <div key={match.id}>
                    <CreditCardFace memberName={match.name} cardTypeLabel={matchTypeLabels[match.category] ?? match.category} gradient={match.faceBg} locked />
                    {match.unlockReason ? <p className="mt-2 rounded-xl bg-unlock-surface px-3 py-2 text-xs font-bold leading-5 text-unlock">{match.unlockReason}</p> : null}
                    <Link href="/account-matches/" className="mt-2 inline-block text-sm font-bold text-brand-blue hover:underline">See requirements →</Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-[linear-gradient(135deg,#EEF3FE,#E3ECFD)] p-6">
            <div>
              <h2 className="font-display text-lg font-bold text-vfText-strong">Want this handled for you?</h2>
              <p className="mt-1 text-sm text-vfText-body">Request done-for-you help with any fix on your list.</p>
            </div>
            <Button asChild><Link href="/support/">Get Help</Link></Button>
          </div>
        </div>
      )}
    </PlatformShell>
  );
}
