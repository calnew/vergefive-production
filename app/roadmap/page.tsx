export const dynamic = "force-dynamic";

import Link from "next/link";

import { PlatformShell } from "@/components/platform/platform-shell";
import { PlatformPaywall } from "@/components/platform/paywall";
import { StatusPill } from "@/components/platform/pills";
import { Button, Card, CardContent, ProgressBar } from "@/components/ui";
import { getLessonSection, programModules } from "@/lib/platform-catalog";
import { getPlatformData } from "@/lib/platform-data";
import type { FixStatus } from "@/lib/readiness";

function statusFor(keys: string[], fixStatuses: Record<string, FixStatus>): FixStatus {
  const statuses = keys.map((key) => fixStatuses[key] ?? "todo");
  if (statuses.length && statuses.every((status) => status === "done")) return "done";
  if (statuses.some((status) => status !== "todo")) return "progress";
  return "todo";
}

export default async function RoadmapPage() {
  const { user, allowed, scan, fixStatuses, readiness, lessonProgress } = await getPlatformData();
  if (!allowed) return <PlatformPaywall />;

  const sections = programModules.flatMap((module) => module.sections.map((section) => ({ ...section, phase: module.phase, module: module.module })));
  const proofRows = sections.map((section) => {
    const content = getLessonSection(section.key);
    const pagePath = `/fix/${section.key}/`;
    const checked = lessonProgress[pagePath] ?? [];
    const proofTotal = content?.proof.length ?? 0;
    const proofSaved = content ? content.proof.filter((_, index) => checked.includes(content.checklist.length + index)).length : 0;
    const keys = [section.key, ...(section.issueKeys ?? [])];
    return { section, content, proofTotal, proofSaved, status: statusFor(keys, fixStatuses) };
  });
  const proofSavedTotal = proofRows.reduce((sum, row) => sum + row.proofSaved, 0);
  const proofTotal = proofRows.reduce((sum, row) => sum + row.proofTotal, 0);
  const proofPercent = proofTotal ? Math.round((proofSavedTotal / proofTotal) * 100) : 0;

  return (
    <PlatformShell user={user} active="Roadmap" businessName={scan?.business.name}>
      <section className="relative overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#0E1A2B,#1D3A64)] p-7 text-white shadow-soft md:p-9">
        <div className="pointer-events-none absolute -right-14 -top-24 size-64 rounded-full bg-brand-blue/30 blur-3xl" aria-hidden />
        <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-ondark-blue">Business Credit Roadmap</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-[-0.03em] md:text-4xl">Build your business credit file step by step.</h1>
        <p className="mt-3 max-w-2xl leading-7 text-ondark-body">Use this roadmap to see what is complete, what proof you saved privately, and where to go next. Verge Five stores progress only, not documents.</p>
      </section>

      <section className="mt-5 grid gap-4 md:grid-cols-3">
        <Card><CardContent className="p-6"><p className="text-xs font-extrabold uppercase tracking-[0.18em] text-vfText-muted">Readiness</p><p className="mt-2 font-display text-4xl font-bold text-brand-navy">{readiness.score}%</p><p className="mt-1 text-sm font-bold" style={{ color: readiness.color }}>{readiness.label}</p></CardContent></Card>
        <Card><CardContent className="p-6"><p className="text-xs font-extrabold uppercase tracking-[0.18em] text-vfText-muted">Private proof</p><p className="mt-2 font-display text-4xl font-bold text-brand-navy">{proofSavedTotal}/{proofTotal}</p><ProgressBar value={proofPercent} className="mt-3" /></CardContent></Card>
        <Card><CardContent className="p-6"><p className="text-xs font-extrabold uppercase tracking-[0.18em] text-vfText-muted">Privacy safe</p><p className="mt-2 text-sm font-bold leading-6 text-vfText-body">No EIN letters, bank statements, PDFs, screenshots, or private files are uploaded to Verge Five.</p></CardContent></Card>
      </section>

      <div className="mt-6 grid gap-6">
        {programModules.map((module) => {
          const rows = proofRows.filter((row) => row.section.module === module.module);
          const moduleDone = rows.every((row) => row.status === "done");
          const moduleProgress = rows.some((row) => row.status !== "todo");
          return (
            <section key={module.module}>
              <div className="flex flex-wrap items-center gap-3">
                <StatusPill status={moduleDone ? "done" : moduleProgress ? "progress" : "todo"} />
                <div>
                  <h2 className="font-display text-xl font-bold text-vfText-strong">{module.phase} - {module.module}</h2>
                  <p className="text-sm leading-6 text-vfText-body">{module.summary}</p>
                </div>
              </div>
              <div className="mt-3 grid gap-4 md:grid-cols-2">
                {rows.map(({ section, content, proofTotal, proofSaved, status }) => (
                  <Card key={section.key}>
                    <CardContent className="p-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusPill status={status} />
                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-brand-blue">{proofSaved}/{proofTotal} private proof</span>
                      </div>
                      <h3 className="mt-3 font-display text-lg font-bold text-vfText-strong">{content?.title ?? section.label}</h3>
                      <p className="mt-2 text-sm leading-6 text-vfText-body">{content?.description ?? module.summary}</p>
                      <Button asChild size="sm" className="mt-4"><Link href={`/fix/${section.key}/`}>{status === "done" ? "Review section" : "Continue section"}</Link></Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </PlatformShell>
  );
}
