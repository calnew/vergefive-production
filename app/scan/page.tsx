export const dynamic = "force-dynamic";

import Link from "next/link";

import { ScanForm } from "@/app/scan/scan-form";
import { PlatformShell } from "@/components/platform/platform-shell";
import { PlatformPaywall } from "@/components/platform/paywall";
import { ImpactPill } from "@/components/platform/pills";
import { Button, Card, CardContent, ReadinessRing } from "@/components/ui";
import { getD1RequestAuth } from "@/lib/d1-auth";
import { getPlatformData } from "@/lib/platform-data";

const severityDot: Record<string, string> = {
  high: "#DC2626",
  med: "#D97706",
  low: "#2563EB",
};

export default async function ScanPage() {
  const { auth } = await getD1RequestAuth();

  if (!auth) {
    return (
      <main className="min-h-screen bg-surface-page px-5 py-8 md:px-8">
        <nav className="mx-auto mb-10 flex max-w-6xl items-center justify-between">
          <Link href="/" className="font-display text-lg font-bold text-brand-navy">Verge Five</Link>
          <Link href="/login" className="rounded-xl border border-vfBorder bg-white px-4 py-2 text-sm font-bold text-brand-blue">Log in</Link>
        </nav>
        <ScanForm />
      </main>
    );
  }

  if (!auth.active) return <PlatformPaywall title="Upgrade to re-run scans inside the platform" />;

  const { user, scan, readiness } = await getPlatformData();
  const sortedIssues = scan ? [...scan.issues].sort((a, b) => a.impactRank - b.impactRank) : [];
  const openCount = sortedIssues.filter((issue) => issue.status !== "done").length;

  return (
    <PlatformShell user={user} active="Run Scan" businessName={scan?.business.name}>
      <section className="relative overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#0E1A2B,#1D3A64)] p-7 text-white shadow-soft md:p-9">
        <div className="pointer-events-none absolute -right-14 -top-24 size-64 rounded-full bg-brand-blue/30 blur-3xl" aria-hidden />
        <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-ondark-blue">The engine of Verge Five</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-[-0.03em] md:text-4xl">Business Visibility Audit</h1>
        <p className="mt-3 max-w-2xl leading-7 text-ondark-body">The scan reads the public signals vendors, card issuers, lenders, and directories compare — then scores readiness, rebuilds the fix list, and routes you to the right account categories.</p>
        <Button asChild size="lg" className="mt-5"><a href="#scan-form">{scan ? "Re-run Scan" : "Run Scan Now"}</a></Button>
      </section>

      {scan ? (
        <section className="mt-5 grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
          <Card>
            <CardContent className="p-6 text-center">
              <h2 className="font-display text-lg font-bold text-vfText-strong">Scan Result</h2>
              <div className="mt-4 flex justify-center">
                <ReadinessRing value={readiness.score} size={160} color={readiness.color} />
              </div>
              <p className="mt-3 font-display text-lg font-bold" style={{ color: readiness.color }}>{readiness.label}</p>
              <p className="mt-1 text-sm text-vfText-body">{readiness.doneCount} of {readiness.total} signals clean</p>
              <div className="mt-4 rounded-xl bg-blue-50 px-3 py-2 text-xs font-bold text-brand-blue">Recommended path: {readiness.assignedPath}</div>
              <p className="mt-3 text-xs leading-5 text-vfText-muted">{scan.business.name}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-display text-lg font-bold text-vfText-strong">Detected issues</h2>
                <span className="text-sm font-bold text-vfText-body">{openCount} open</span>
              </div>
              <div className="mt-4 grid gap-3">
                {sortedIssues.map((issue) => (
                  <div key={issue.id} className="grid gap-3 rounded-2xl border border-vfBorder bg-white p-4 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center">
                    <span className="mt-1.5 size-2.5 rounded-full md:mt-0" style={{ background: severityDot[issue.severity] ?? "#2563EB" }} aria-hidden />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-display text-base font-bold text-vfText-strong">{issue.title}</h3>
                        <ImpactPill severity={issue.severity} />
                      </div>
                      <p className="mt-1 text-sm leading-6 text-vfText-body">{issue.detail}</p>
                    </div>
                    <Button asChild size="sm" variant={issue.status === "done" ? "outline" : "default"}>
                      <Link href={`/fix/${issue.key}/`}>{issue.status === "done" ? "Review fix" : "Fix this →"}</Link>
                    </Button>
                  </div>
                ))}
                {!sortedIssues.length ? (
                  <div className="rounded-2xl bg-ready-surface p-5 text-ready">
                    <p className="font-display text-lg font-bold">No open scan issues.</p>
                    <p className="mt-1 text-sm font-bold">Keep building through the Full Buildout modules and review account matches.</p>
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </section>
      ) : null}

      <div id="scan-form" className="mt-5 scroll-mt-6">
        <ScanForm
          paid
          showHero={false}
          initialValues={{
            name: scan?.business.legalName || scan?.business.tradeName || scan?.business.name || "",
            entityType: scan?.business.entityType || "",
            address: scan?.business.address || "",
            phone: scan?.business.phone || "",
            website: scan?.business.website || "",
            email: scan?.business.email || "",
          }}
        />
      </div>
    </PlatformShell>
  );
}
