import Link from "next/link";

import { PlatformShell } from "@/components/platform/platform-shell";
import { PlatformPaywall } from "@/components/platform/paywall";
import { Badge, Button, Card, CardContent } from "@/components/ui";
import { getPlatformData, issueFixContent, issuePointMap } from "@/lib/platform-data";

export default async function FixListPage() {
  const { user, allowed, scan } = await getPlatformData();
  if (!allowed) return <PlatformPaywall />;

  const grouped = scan?.issues.reduce<Record<string, typeof scan.issues>>((acc, issue) => {
    const phase = issueFixContent[issue.key]?.phase ?? "Approval Readiness";
    acc[phase] = acc[phase] ?? [];
    acc[phase].push(issue);
    return acc;
  }, {});

  return (
    <PlatformShell user={user} active="Fix List">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-vfText-muted">Ordered by impact</p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-[-0.05em] text-brand-navy md:text-5xl">Fix List</h1>
        <p className="mt-3 max-w-2xl text-vfText-body">Work from the highest-impact fixes first. Status chips persist and completed fixes raise readiness.</p>

        {!scan ? (
          <Card className="mt-8"><CardContent className="p-8"><p className="font-bold text-vfText-body">Run a scan first to generate your fix list.</p><Button asChild className="mt-4"><Link href="/scan/">Run Scan</Link></Button></CardContent></Card>
        ) : (
          <div className="mt-8 grid gap-6">
            {Object.entries(grouped ?? {}).map(([phase, issues]) => (
              <Card key={phase}>
                <CardContent className="p-6">
                  <h2 className="font-display text-2xl font-bold text-brand-navy">{phase}</h2>
                  <div className="mt-5 grid gap-3">
                    {issues.map((issue) => (
                      <Link key={issue.id} href={`/fix/${issue.key}/`} className="grid gap-4 rounded-2xl border border-vfBorder bg-white p-4 transition hover:border-brand-blue md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                        <div>
                          <div className="flex flex-wrap items-center gap-2"><Badge variant={issue.status === "done" ? "ready" : issue.status === "progress" ? "info" : "outline"}>{issue.status}</Badge><Badge variant={issue.severity === "high" ? "flagged" : "unlock"}>{issue.severity}</Badge></div>
                          <h3 className="mt-2 font-display text-xl font-bold text-brand-navy">{issue.title}</h3>
                          <p className="mt-1 text-sm leading-6 text-vfText-body">{issue.detail}</p>
                        </div>
                        <div className="text-sm font-bold text-brand-blue">+{issuePointMap[issue.key] ?? 4} pts - Open fix</div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PlatformShell>
  );
}
