import Link from "next/link";

import { ReportDownloadButton } from "@/app/report-card/report-download-button";
import { PlatformShell } from "@/components/platform/platform-shell";
import { PlatformPaywall } from "@/components/platform/paywall";
import { Badge, Button, Card, CardContent, ReadinessRing } from "@/components/ui";
import { getPlatformData, matchIsReady } from "@/lib/platform-data";

export default async function ReportCardPage() {
  const { user, allowed, scan } = await getPlatformData();
  if (!allowed) return <PlatformPaywall />;

  const report = scan ? [
    "Verge Five Readiness Report",
    `Business: ${scan.business.name}`,
    `Generated: ${new Date().toISOString()}`,
    `Score: ${scan.readinessScore}/100`,
    `Grade: ${scan.grade}`,
    `Signals: ${scan.signalsClean} of ${scan.signalsTotal} clean`,
    "",
    "Issues:",
    ...scan.issues.map((issue) => `- ${issue.title} [${issue.status}] ${issue.detail}`),
    "",
    "Ready accounts:",
    ...scan.accountMatches.filter((match) => matchIsReady(match, scan.issues)).map((match) => `- ${match.name}: ${match.reason}`),
    "",
    "Disclaimer: Verge Five improves readiness. It does not guarantee approvals, funding, account terms, or lender decisions.",
  ].join("\n") : "Run a scan first to generate a report.";

  return (
    <PlatformShell user={user} active="Report Card">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-vfText-muted">Readiness summary</p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-[-0.05em] text-brand-navy md:text-5xl">Report Card</h1>
        {!scan ? (
          <Card className="mt-8"><CardContent className="p-8"><p className="font-bold text-vfText-body">Run a scan first to create your readiness report.</p><Button asChild className="mt-4"><Link href="/scan/">Run Scan</Link></Button></CardContent></Card>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
            <Card><CardContent className="grid place-items-center p-8 text-center"><ReadinessRing value={scan.readinessScore} size={160} /><h2 className="mt-5 font-display text-3xl font-bold text-brand-navy">{scan.grade}</h2><p className="mt-2 text-vfText-body">{scan.signalsClean} of {scan.signalsTotal} signals clean.</p><div className="mt-6"><ReportDownloadButton report={report} /></div></CardContent></Card>
            <Card><CardContent className="p-7"><h2 className="font-display text-2xl font-bold text-brand-navy">Latest findings</h2><div className="mt-5 grid gap-3">{scan.issues.map((issue) => <div key={issue.id} className="rounded-2xl border border-vfBorder bg-white p-4"><div className="flex flex-wrap items-center gap-2"><Badge variant={issue.status === "done" ? "ready" : "outline"}>{issue.status}</Badge><Badge variant={issue.severity === "high" ? "flagged" : "unlock"}>{issue.severity}</Badge></div><h3 className="mt-2 font-display text-lg font-bold text-brand-navy">{issue.title}</h3><p className="mt-1 text-sm leading-6 text-vfText-body">{issue.detail}</p></div>)}</div><p className="mt-6 rounded-2xl bg-surface-muted p-4 text-sm leading-6 text-vfText-body">Verge Five improves readiness. It does not guarantee approvals, funding, account terms, or lender decisions.</p></CardContent></Card>
          </div>
        )}
      </div>
    </PlatformShell>
  );
}
