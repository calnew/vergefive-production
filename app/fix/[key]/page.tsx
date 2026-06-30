export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import Link from "next/link";

import { updateIssueStatus } from "@/app/actions/issues";
import { PlatformShell } from "@/components/platform/platform-shell";
import { PlatformPaywall } from "@/components/platform/paywall";
import { Badge, Button, Card, CardContent } from "@/components/ui";
import { fixPlaybooks } from "@/lib/platform-catalog";
import { getPlatformData, issuePointMap } from "@/lib/platform-data";

export default async function FixPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const { user, allowed, scan } = await getPlatformData();
  if (!allowed) return <PlatformPaywall />;
  if (!scan) redirect("/scan/");

  const issue = scan.issues.find((item) => item.key === key);
  const content = fixPlaybooks[key];
  if (!content) redirect("/fix-list/");
  const status = issue?.status ?? "review";
  const severity = issue?.severity ?? "module";

  return (
    <PlatformShell user={user} active="Fix List">
      <div className="mx-auto max-w-6xl">
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="bg-white p-7 md:p-9">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={status === "done" ? "ready" : issue ? "flagged" : "outline"}>{status}</Badge>
                <Badge variant={issue?.severity === "high" ? "flagged" : "unlock"}>{severity} impact</Badge>
                <span className="text-sm font-bold text-vfText-muted">{content.phase} / {content.module}</span>
              </div>
              <h1 className="mt-4 font-display text-4xl font-bold tracking-[-0.05em] text-brand-navy md:text-5xl">{content.title}</h1>
              <p className="mt-3 max-w-3xl text-lg leading-8 text-vfText-body">{issue?.detail ?? content.scanFinding}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild variant="outline"><Link href="/dashboard/">Back to Dashboard</Link></Button>
                {issue ? <form action={updateIssueStatus.bind(null, issue.id, "done", "/dashboard/")}><Button type="submit">Mark Complete</Button></form> : null}
                {issue ? <form action={updateIssueStatus.bind(null, issue.id, "progress", `/fix/${key}/`)}><Button type="submit" variant="outline">Mark Progress</Button></form> : null}
                <Button asChild variant="outline"><Link href={`/support?topic=fix&from=${encodeURIComponent(key)}`}>Get Help</Link></Button>
                <Button asChild><Link href="/account-matches/">View related accounts</Link></Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.85fr]">
          <div className="grid gap-6">
            <Card><CardContent className="p-6"><p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-blue">Scan finding</p><h2 className="mt-2 font-display text-2xl font-bold text-brand-navy">This can add {issuePointMap[key] ?? 4} readiness points.</h2><p className="mt-3 leading-7 text-vfText-body">{content.scanFinding}</p></CardContent></Card>
            <Card><CardContent className="p-6"><h2 className="font-display text-2xl font-bold text-brand-navy">What to fix checklist</h2><div className="mt-5 grid gap-3">{content.whatToFix.map((item) => <div key={item} className="rounded-2xl bg-surface-muted p-4 text-sm font-bold text-vfText-body">{item}</div>)}</div></CardContent></Card>
            <Card><CardContent className="p-6"><h2 className="font-display text-2xl font-bold text-brand-navy">Do this first</h2><div className="mt-5 grid gap-3">{content.doFirst.map((step, index) => <div key={step} className="flex gap-3 rounded-2xl bg-white p-4 ring-1 ring-vfBorder"><span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand-blue text-sm font-bold text-white">{index + 1}</span><p className="text-vfText-body">{step}</p></div>)}</div></CardContent></Card>
            <Card><CardContent className="p-6"><h2 className="font-display text-2xl font-bold text-brand-navy">Recommended setup options</h2><p className="mt-2 text-sm leading-6 text-vfText-body">These are the category choices from the approved markup. Pick the one that matches how much help the member wants.</p><div className="mt-5 grid gap-3 sm:grid-cols-2">{content.setupOptions.map((option) => <div key={option} className="rounded-2xl border border-vfBorder bg-white p-4 transition hover:border-brand-blue"><p className="font-display text-lg font-bold text-brand-navy">{option}</p><p className="mt-2 text-sm leading-6 text-vfText-body">Use this path if it solves the specific blocker above.</p><Link className="mt-3 inline-block text-sm font-bold text-brand-blue" href={`/support?topic=fix&from=${encodeURIComponent(key)}&option=${encodeURIComponent(option)}`}>Get help with this</Link></div>)}</div></CardContent></Card>
          </div>
          <div className="grid gap-6 content-start">
            <Card><CardContent className="p-6"><h2 className="font-display text-2xl font-bold text-brand-navy">Proof to save</h2><div className="mt-4 grid gap-3">{content.proof.map((item) => <div key={item} className="rounded-2xl bg-ready-surface p-3 text-sm font-bold text-ready">Save: {item}</div>)}</div></CardContent></Card>
            <Card><CardContent className="p-6"><h2 className="font-display text-2xl font-bold text-brand-navy">What this unlocks</h2><div className="mt-4 grid gap-3">{content.unlocks.map((item) => <div key={item} className="rounded-2xl bg-unlock-surface p-3 text-sm font-bold text-unlock">{item}</div>)}</div><Button asChild className="mt-5"><Link href="/account-matches/">View account matches</Link></Button></CardContent></Card>
            <Card><CardContent className="p-6"><Badge variant="info">Compact training</Badge><h2 className="mt-3 font-display text-2xl font-bold text-brand-navy">Training stays secondary</h2><p className="mt-3 text-sm leading-6 text-vfText-body">{content.training}</p></CardContent></Card>
          </div>
        </div>
      </div>
    </PlatformShell>
  );
}
