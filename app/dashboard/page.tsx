import Link from "next/link";

import { PlatformShell } from "@/components/platform/platform-shell";
import { PlatformPaywall } from "@/components/platform/paywall";
import { Badge, Button, Card, CardContent, ProgressBar, ReadinessRing } from "@/components/ui";
import { getPlatformData, issuePointMap, progressPercent } from "@/lib/platform-data";

export default async function DashboardPage() {
  const { user, allowed, scan } = await getPlatformData();
  if (!allowed) return <PlatformPaywall />;

  const done = scan?.issues.filter((issue) => issue.status === "done").length ?? 0;
  const progress = scan ? progressPercent(scan.issues) : 0;
  const nextActions = scan?.issues.filter((issue) => issue.status !== "done").slice(0, 3) ?? [];

  return (
    <PlatformShell user={user} active="Dashboard">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-vfBorder pb-6">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-vfText-muted">Member dashboard</p>
            <h1 className="mt-2 font-display text-4xl font-bold tracking-[-0.05em] text-brand-navy md:text-5xl">Welcome back, {user.name.split(" ")[0]}.</h1>
            <p className="mt-2 text-vfText-body">{scan?.business.name ?? "Run your first scan"} - readiness, fixes, and account unlocks in one place.</p>
          </div>
          <Button asChild><Link href="/scan/">Run Scan</Link></Button>
        </div>

        {!scan ? (
          <Card className="mt-8">
            <CardContent className="p-8 text-center">
              <h2 className="font-display text-3xl font-bold text-brand-navy">Start with a Business Visibility Scan.</h2>
              <p className="mx-auto mt-3 max-w-xl text-vfText-body">Enter the business profile so Verge Five can build your readiness score, issue list, and account-match path.</p>
              <Button asChild className="mt-6"><Link href="/scan/">Run Scan</Link></Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_1fr]">
              <Card>
                <CardContent className="grid gap-6 p-7 md:grid-cols-[150px_minmax(0,1fr)] md:items-center">
                  <ReadinessRing value={scan.readinessScore} size={142} />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-vfText-muted">Business readiness</p>
                      <Badge variant="info">{scan.grade}</Badge>
                    </div>
                    <h2 className="mt-3 font-display text-3xl font-bold text-brand-navy">{scan.readinessScore}/100</h2>
                    <p className="mt-2 leading-7 text-vfText-body">{scan.signalsClean} of {scan.signalsTotal} signals clean. Completed fixes raise the score and unlock better-fit account paths.</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-7">
                  <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-vfText-muted">Page progress</p>
                  <div className="mt-3 flex items-end gap-2"><span className="font-display text-4xl font-bold text-brand-navy">{progress}%</span><span className="pb-1 text-vfText-body">of platform fixes completed</span></div>
                  <ProgressBar value={progress} className="mt-5" />
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-surface-muted p-4"><b className="text-brand-blue">{scan.issues.length}</b><p className="text-sm text-vfText-body">Detected issues</p></div>
                    <div className="rounded-2xl bg-surface-muted p-4"><b className="text-ready">{done}</b><p className="text-sm text-vfText-body">Fixes done</p></div>
                  </div>
                </CardContent>
              </Card>
            </section>

            <section className="mt-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <Card>
                <CardContent className="p-7">
                  <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <h2 className="font-display text-2xl font-bold text-brand-navy">Detected Issues</h2>
                    <Link href="/fix-list/" className="text-sm font-bold text-brand-blue">View full fix list</Link>
                  </div>
                  <div className="grid gap-3">
                    {scan.issues.map((issue) => (
                      <div key={issue.id} className="grid gap-4 rounded-2xl border border-vfBorder bg-white p-4 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center">
                        <div className="grid size-10 place-items-center rounded-xl bg-blue-50 font-display font-bold text-brand-blue">{issue.impactRank}</div>
                        <div>
                          <h3 className="font-display text-lg font-bold text-brand-navy">{issue.title}</h3>
                          <p className="text-sm text-vfText-body">{issue.detail}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant={issue.status === "done" ? "ready" : issue.severity === "high" ? "flagged" : "unlock"}>{issue.status}</Badge>
                          <Button asChild size="sm"><Link href={`/fix/${issue.key}/`}>Fix this</Link></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-7">
                  <h2 className="font-display text-2xl font-bold text-brand-navy">Your Next 3 Actions</h2>
                  <div className="mt-5 grid gap-3">
                    {nextActions.map((issue) => (
                      <Link key={issue.id} href={`/fix/${issue.key}/`} className="rounded-2xl border border-vfBorder bg-white p-4 transition hover:border-brand-blue hover:bg-blue-50">
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-unlock">+{issuePointMap[issue.key] ?? 4} points possible</p>
                        <h3 className="mt-2 font-display text-lg font-bold text-brand-navy">{issue.title}</h3>
                      </Link>
                    ))}
                    {!nextActions.length ? <div className="rounded-2xl bg-ready-surface p-5 text-ready"><p className="font-display text-xl font-bold">All current fixes are complete.</p><p className="mt-2 text-sm font-bold">Nice work. Review the ready-now accounts, save your report, and only apply when the account fits your current readiness profile.</p><Button asChild className="mt-4"><Link href="/account-matches/">Review ready accounts</Link></Button></div> : null}
                  </div>
                </CardContent>
              </Card>
            </section>
          </>
        )}
      </div>
    </PlatformShell>
  );
}
