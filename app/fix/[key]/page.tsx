export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import Link from "next/link";

import { updateIssueStatus } from "@/app/actions/issues";
import { PlatformShell } from "@/components/platform/platform-shell";
import { PlatformPaywall } from "@/components/platform/paywall";
import { Badge, Button, Card, CardContent } from "@/components/ui";
import { accountPathCards, beforeYouLeaveText, getLessonNavigation, getLessonSection, programModules, proofHelperText } from "@/lib/platform-catalog";
import { getPlatformData, issuePointMap } from "@/lib/platform-data";

export default async function FixPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const { user, allowed, scan } = await getPlatformData();
  if (!allowed) return <PlatformPaywall />;
  if (!scan) redirect("/scan/");

  const content = getLessonSection(key);
  if (!content) redirect("/fix-list/");

  const issueKeys = Array.from(new Set([key, content.key, ...(key === "website" || content.key === "website" ? ["email"] : [])]));
  const issue = scan.issues.find((item) => issueKeys.includes(item.key));
  const status = issue?.status ?? "review";
  const severity = issue?.severity ?? "module";
  const navigation = getLessonNavigation(key);
  const selectedPath = content.accountPath ? accountPathCards.find((item) => item.key === content.accountPath) : undefined;

  return (
    <PlatformShell user={user} active="Fix List">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {navigation.previous ? <Button asChild variant="outline"><Link href={`/fix/${navigation.previous.key}/`}>Previous</Link></Button> : <Button asChild variant="outline"><Link href="/fix-list/">Fix list</Link></Button>}
            {navigation.next ? <Button asChild><Link href={`/fix/${navigation.next.key}/`}>Next section</Link></Button> : <Button asChild><Link href="/account-matches/">Account matches</Link></Button>}
          </div>
          <Link className="rounded-xl border border-vfBorder bg-white px-4 py-2 text-sm font-extrabold text-brand-blue" href={`/support?topic=problem&from=${encodeURIComponent(content.key)}`}>Report a problem</Link>
        </div>

        <div className="mb-6 overflow-hidden rounded-full bg-white ring-1 ring-vfBorder">
          <div className="h-3 bg-[linear-gradient(90deg,#2563EB,#22C55E)]" style={{ width: `${navigation.percent}%` }} />
        </div>

        <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="grid gap-4 content-start">
            <Card className="overflow-hidden border-0 bg-[linear-gradient(160deg,#0E1A2B,#17345F)] text-white">
              <CardContent className="p-6">
                <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#8FB4F5]">Program Path</p>
                <h2 className="mt-3 font-display text-2xl font-bold">5-module path</h2>
                <p className="mt-2 text-sm leading-6 text-[#AEBFD8]">Section {navigation.index + 1} of {navigation.total}. Complete each foundation item in order.</p>
              </CardContent>
            </Card>

            {programModules.map((module) => (
              <Card key={module.phase}>
                <CardContent className="p-4">
                  <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-brand-blue">{module.phase}</p>
                  <h3 className="mt-1 font-display text-lg font-bold text-brand-navy">{module.module}</h3>
                  <div className="mt-3 grid gap-2">
                    {module.sections.map((section) => {
                      const active = section.key === content.key || section.issueKeys?.includes(key);
                      return (
                        <Link key={section.key} href={`/fix/${section.key}/`} className={`rounded-xl px-3 py-2 text-sm font-bold ${active ? "bg-brand-blue text-white" : "bg-surface-muted text-vfText-body"}`}>
                          {section.label}
                        </Link>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}

            <Card className="border-0 bg-[linear-gradient(160deg,#0E1A2B,#111827)] text-white">
              <CardContent className="p-5">
                <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#8FB4F5]">Current section</p>
                <h3 className="mt-3 font-display text-xl font-bold">{content.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#AEBFD8]">{content.phase} / {content.module}</p>
              </CardContent>
            </Card>
          </aside>

          <main className="grid gap-6">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-white p-7 md:p-9">
                  <div className="flex flex-wrap items-center gap-2">
                    {content.tags.map((tag) => <Badge key={tag} variant="outline">{tag}</Badge>)}
                    <Badge variant={status === "done" ? "ready" : issue ? "flagged" : "info"}>{status}</Badge>
                    <Badge variant={issue?.severity === "high" ? "flagged" : "unlock"}>{severity} impact</Badge>
                  </div>
                  <h1 className="mt-4 font-display text-4xl font-bold tracking-[-0.05em] text-brand-navy md:text-5xl">{content.title}</h1>
                  <p className="mt-3 max-w-3xl text-lg leading-8 text-vfText-body">{issue?.detail ?? content.description}</p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Button asChild variant="outline"><Link href="/dashboard/">Back to Dashboard</Link></Button>
                    {issue ? <form action={updateIssueStatus.bind(null, issue.id, "done", "/dashboard/")}><Button type="submit">Mark Complete</Button></form> : null}
                    <Button asChild variant="outline"><Link href={selectedPath?.href ?? "/account-matches/"}>Choose Provider</Link></Button>
                    <Button asChild><Link href={`/support?topic=fix&from=${encodeURIComponent(content.key)}`}>Get Help</Link></Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <section className="grid gap-4 md:grid-cols-2">
              {content.videos.map((video) => (
                <Card key={video.src} className="overflow-hidden">
                  <CardContent className="p-0">
                    <video className="aspect-video w-full bg-black object-cover" controls preload="metadata" poster={video.poster}>
                      <source src={video.src} type="video/webm" />
                    </video>
                    <div className="p-4">
                      <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-vfText-muted">Guide video</p>
                      <h2 className="mt-1 font-display text-xl font-bold text-brand-navy">{video.title}</h2>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </section>

            <Card>
              <CardContent className="p-6">
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-blue">Why this matters</p>
                <h2 className="mt-2 font-display text-2xl font-bold text-brand-navy">This section supports the scan-first approval path.</h2>
                <div className="mt-5 grid gap-3">
                  {content.why.map((item) => <p key={item} className="rounded-2xl bg-surface-muted p-4 text-sm leading-6 text-vfText-body">{item}</p>)}
                </div>
                <p className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-vfText-muted">Readiness impact: {issuePointMap[issue?.key ?? content.key] ?? 4} points when this maps to a scan blocker.</p>
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-flagged/20 bg-flagged-surface">
                <CardContent className="p-6">
                  <Badge variant="flagged">Warning</Badge>
                  <h2 className="mt-3 font-display text-2xl font-bold text-brand-navy">{content.warningTitle}</h2>
                  <p className="mt-3 leading-7 text-vfText-body">{content.warning}</p>
                </CardContent>
              </Card>
              <Card className="bg-ready-surface">
                <CardContent className="p-6">
                  <Badge variant="ready">Guide</Badge>
                  <h2 className="mt-3 font-display text-2xl font-bold text-brand-navy">{content.guideTitle}</h2>
                  <p className="mt-3 leading-7 text-vfText-body">{content.guide}</p>
                </CardContent>
              </Card>
            </div>

            {content.matcherSignals?.length ? (
              <Card>
                <CardContent className="p-6">
                  <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-blue">Interactive matcher signals</p>
                  <h2 className="mt-2 font-display text-2xl font-bold text-brand-navy">{content.matcherSignals.length} readiness signals for this category</h2>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {content.matcherSignals.map((signal) => (
                      <label key={signal} className="flex items-center gap-3 rounded-2xl border border-vfBorder bg-white p-4 text-sm font-bold text-vfText-body">
                        <input type="checkbox" className="size-5 rounded border-vfBorder" />
                        {signal}
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {selectedPath ? (
              <Card>
                <CardContent className="p-6">
                  <Badge variant="unlock">{selectedPath.eyebrow}</Badge>
                  <h2 className="mt-3 font-display text-2xl font-bold text-brand-navy">{selectedPath.title}</h2>
                  <p className="mt-2 leading-7 text-vfText-body">{selectedPath.description}</p>
                  <div className="mt-5 grid gap-3 md:grid-cols-2">
                    <div className="rounded-2xl bg-surface-muted p-4">
                      <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-vfText-muted">Examples</p>
                      <p className="mt-2 text-sm font-bold leading-6 text-vfText-body">{selectedPath.examples.join(" / ")}</p>
                    </div>
                    <div className="rounded-2xl bg-ready-surface p-4">
                      <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-ready">Ready when</p>
                      <p className="mt-2 text-sm font-bold leading-6 text-ready">{selectedPath.readiness.join(" / ")}</p>
                    </div>
                  </div>
                  <Button asChild className="mt-5"><Link href={selectedPath.href}>Open category choices</Link></Button>
                </CardContent>
              </Card>
            ) : null}

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_0.8fr]">
              <Card>
                <CardContent className="p-6">
                  <h2 className="font-display text-2xl font-bold text-brand-navy">Action checklist</h2>
                  <div className="mt-5 grid gap-3">
                    {content.checklist.map((item) => (
                      <label key={item} className="flex gap-3 rounded-2xl bg-white p-4 ring-1 ring-vfBorder">
                        <input type="checkbox" className="mt-1 size-5 shrink-0 rounded border-vfBorder" />
                        <span className="text-sm font-bold leading-6 text-vfText-body">{item}</span>
                      </label>
                    ))}
                  </div>
                  <div className="mt-5 rounded-2xl bg-blue-50 p-4 text-sm font-bold leading-6 text-brand-blue">{proofHelperText}</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h2 className="font-display text-2xl font-bold text-brand-navy">Proof to save</h2>
                  <div className="mt-4 grid gap-3">
                    {content.proof.map((item) => <div key={item} className="rounded-2xl bg-ready-surface p-3 text-sm font-bold text-ready">Save: {item}</div>)}
                  </div>
                  <h3 className="mt-6 font-display text-xl font-bold text-brand-navy">Resources</h3>
                  <div className="mt-3 grid gap-2">
                    {content.resources.map((resource) => <Link key={resource.href} className="rounded-xl border border-vfBorder bg-white px-4 py-3 text-sm font-extrabold text-brand-blue" href={resource.href}>{resource.label}</Link>)}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="p-6">
                <Badge variant="info">Before you leave</Badge>
                <p className="mt-3 text-base font-bold leading-7 text-vfText-body">{beforeYouLeaveText}</p>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </PlatformShell>
  );
}
