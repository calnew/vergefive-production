export const dynamic = "force-dynamic";

import Link from "next/link";

import { PlatformShell } from "@/components/platform/platform-shell";
import { PlatformPaywall } from "@/components/platform/paywall";
import { Badge, Button, Card, CardContent } from "@/components/ui";
import { getLessonSection, programModules } from "@/lib/platform-catalog";
import { getPlatformData } from "@/lib/platform-data";

export default async function FixListPage() {
  const { user, allowed, scan } = await getPlatformData();
  if (!allowed) return <PlatformPaywall />;

  const issuesByKey = new Map((scan?.issues ?? []).map((issue) => [issue.key, issue]));
  const openCount = scan?.issues.filter((issue) => issue.status !== "done").length ?? 0;
  const doneCount = scan?.issues.filter((issue) => issue.status === "done").length ?? 0;

  return (
    <PlatformShell user={user} active="Fix List">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-vfText-muted">Action Center</p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-[-0.05em] text-brand-navy md:text-5xl">Fix List</h1>
        <p className="mt-3 max-w-3xl text-vfText-body">This is the approved 7-module program path: each module keeps the lesson-style layout, proof checklist, and category/vendor choices instead of a simplified repair page.</p>

        {!scan ? (
          <Card className="mt-8">
            <CardContent className="p-8">
              <p className="font-bold text-vfText-body">Run a scan first to generate your fix list.</p>
              <Button asChild className="mt-4"><Link href="/scan/">Run Scan</Link></Button>
            </CardContent>
          </Card>
        ) : (
          <div className="mt-8 grid gap-6">
            <section className="grid gap-4 md:grid-cols-3">
              <Card><CardContent className="p-6"><Badge variant="flagged">Open scan blockers</Badge><p className="mt-4 font-display text-4xl font-bold text-brand-navy">{openCount}</p><p className="mt-2 text-sm text-vfText-body">Items the latest scan says should be fixed before stronger applications.</p></CardContent></Card>
              <Card><CardContent className="p-6"><Badge variant="ready">Completed fixes</Badge><p className="mt-4 font-display text-4xl font-bold text-brand-navy">{doneCount}</p><p className="mt-2 text-sm text-vfText-body">Completed items raise readiness and can unlock better-fit account paths.</p></CardContent></Card>
              <Card><CardContent className="p-6"><Badge variant="info">Module path</Badge><p className="mt-4 font-display text-4xl font-bold text-brand-navy">7</p><p className="mt-2 text-sm text-vfText-body">Modules inside the approved Verge Five flow, ending with funding as Module 7.</p></CardContent></Card>
            </section>

            <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
              <aside className="grid gap-4 content-start">
                <Card className="overflow-hidden border-0 bg-[linear-gradient(160deg,#0E1A2B,#17345F)] text-white">
                  <CardContent className="p-6">
                    <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#8FB4F5]">Program Path</p>
                    <h2 className="mt-3 font-display text-2xl font-bold">7 modules</h2>
                    <p className="mt-3 text-sm leading-6 text-[#AEBFD8]">Work from identity to legal, banking, readiness, vendors, cards, and funding.</p>
                  </CardContent>
                </Card>
                {programModules.map((module) => (
                  <Card key={`rail-${module.phase}`}>
                    <CardContent className="p-4">
                      <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-brand-blue">{module.phase}</p>
                      <h3 className="mt-1 font-display text-lg font-bold text-brand-navy">{module.module}</h3>
                      <p className="mt-2 text-xs leading-5 text-vfText-body">{module.sections.length} sections</p>
                    </CardContent>
                  </Card>
                ))}
              </aside>

              <div className="grid gap-6">
                {programModules.map((module) => (
                  <Card key={module.module}>
                    <CardContent className="p-6">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <Badge variant="info">{module.phase}</Badge>
                          <h2 className="mt-3 font-display text-2xl font-bold text-brand-navy">{module.module}</h2>
                          <p className="mt-2 max-w-3xl text-sm leading-6 text-vfText-body">{module.summary}</p>
                        </div>
                        <Badge variant="outline">{module.sections.length} sections</Badge>
                      </div>
                      <div className="mt-5 grid gap-3">
                        {module.sections.map((sectionLink) => {
                          const section = getLessonSection(sectionLink.key);
                          if (!section) return null;
                          const issueKeys = [sectionLink.key, ...(sectionLink.issueKeys ?? [])];
                          const issue = issueKeys.map((issueKey) => issuesByKey.get(issueKey)).find(Boolean);
                          const isDone = issue?.status === "done";
                          const isOpen = Boolean(issue && !isDone);
                          return (
                            <div key={section.key} className="grid gap-4 rounded-2xl border border-vfBorder bg-white p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <Badge variant={isDone ? "ready" : isOpen ? "flagged" : "outline"}>{isDone ? "done" : isOpen ? "scan blocker" : "program section"}</Badge>
                                  <Badge variant={isOpen && issue?.severity === "high" ? "flagged" : "unlock"}>{issue?.severity ? `${issue.severity} impact` : "lesson + checklist"}</Badge>
                                </div>
                                <h3 className="mt-2 font-display text-xl font-bold text-brand-navy">{section.title}</h3>
                                <p className="mt-1 text-sm leading-6 text-vfText-body">{issue?.detail ?? section.description}</p>
                                <p className="mt-2 text-xs font-bold uppercase tracking-[0.16em] text-vfText-muted">Includes video, guide, proof, checklist, and account-path links.</p>
                              </div>
                              <div className="flex flex-wrap gap-2 md:justify-end">
                                <Button asChild variant="outline"><Link href={`/support?topic=fix&from=${encodeURIComponent(section.key)}`}>Report a problem</Link></Button>
                                <Button asChild><Link href={`/fix/${section.key}/`}>Open section</Link></Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </PlatformShell>
  );
}
