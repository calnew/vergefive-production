export const dynamic = "force-dynamic";

import Link from "next/link";

import { PlatformShell } from "@/components/platform/platform-shell";
import { PlatformPaywall } from "@/components/platform/paywall";
import { StatusPill } from "@/components/platform/pills";
import { Button, Card, CardContent } from "@/components/ui";
import { getPlatformData } from "@/lib/platform-data";
import { buildoutModules, fixPlaybooks, type BuildoutSection } from "@/lib/platform-catalog";
import type { FixStatus } from "@/lib/readiness";

function sectionStatus(section: BuildoutSection, fixStatuses: Record<string, FixStatus>): FixStatus | null {
  if (!section.fixKeys.length) return null;
  const statuses = section.fixKeys.map((key) => fixStatuses[key] ?? "todo");
  if (statuses.every((status) => status === "done")) return "done";
  if (statuses.some((status) => status !== "todo")) return "progress";
  return "todo";
}

function moduleStatus(sections: BuildoutSection[], fixStatuses: Record<string, FixStatus>): FixStatus {
  const statuses = sections.map((section) => sectionStatus(section, fixStatuses)).filter(Boolean) as FixStatus[];
  if (statuses.length && statuses.every((status) => status === "done")) return "done";
  if (statuses.some((status) => status !== "todo")) return "progress";
  return "todo";
}

export default async function BuildoutPage() {
  const { user, allowed, scan, fixStatuses } = await getPlatformData();
  if (!allowed) return <PlatformPaywall />;

  const openIssues = new Map((scan?.issues ?? []).filter((issue) => issue.status !== "done").map((issue) => [issue.key === "email" ? "website" : issue.key, issue]));

  return (
    <PlatformShell user={user} active="Full Buildout" businessName={scan?.business.name}>
      <section className="relative overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#0E1A2B,#1D3A64)] p-7 text-white shadow-soft md:p-9">
        <div className="pointer-events-none absolute -right-14 -top-24 size-64 rounded-full bg-brand-blue/30 blur-3xl" aria-hidden />
        <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-ondark-blue">Guided program</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-[-0.03em] md:text-4xl">Explore the complete business credit buildout</h1>
        <p className="mt-3 max-w-2xl leading-7 text-ondark-body">Five modules from identity to approval readiness. Every section maps to a fix page with lessons, checklists, and proof — the scan decides where to start, this is the whole map.</p>
      </section>

      <div className="mt-5 grid gap-6">
        {buildoutModules.map((module, index) => (
          <section key={module.module}>
            <div className="flex flex-wrap items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-brand-navy font-display text-base font-bold text-white">{index + 1}</span>
              <div className="min-w-0">
                <h2 className="font-display text-lg font-bold text-vfText-strong">{module.module} · {module.title}</h2>
                <p className="text-sm text-vfText-body">{module.subtitle}</p>
              </div>
              <StatusPill status={moduleStatus(module.sections, fixStatuses)} className="ml-auto" />
            </div>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              {module.sections.map((section, sectionIndex) => {
                const status = sectionStatus(section, fixStatuses);
                const relatedIssue = section.fixKeys.map((key) => openIssues.get(key === "email" ? "website" : key)).find(Boolean);
                const chips = section.fixKeys.map((key) => fixPlaybooks[key]?.shortTitle).filter(Boolean) as string[];
                const href = section.href ?? `/fix/${section.key}/`;
                return (
                  <Card key={section.key}>
                    <CardContent className="flex h-full flex-col p-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-lg bg-blue-50 px-2 py-1 font-display text-xs font-bold text-brand-blue">§{sectionIndex + 1}</span>
                        <h3 className="font-display text-base font-bold text-vfText-strong">{section.title}</h3>
                        {status ? <StatusPill status={status} className="ml-auto" /> : null}
                      </div>
                      <p className="mt-2 text-sm leading-6 text-vfText-body">{section.purpose}</p>
                      {chips.length ? (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {chips.map((chip) => <span key={chip} className="rounded-full bg-surface-muted px-2.5 py-1 text-xs font-bold text-vfText-body">{chip}</span>)}
                        </div>
                      ) : null}
                      {relatedIssue ? (
                        <p className="mt-3 rounded-xl bg-unlock-surface px-3 py-2 text-xs font-bold leading-5 text-unlock">Related scan issue: {relatedIssue.title}</p>
                      ) : null}
                      <div className="mt-auto pt-4">
                        <Button asChild size="sm" variant={status === "done" ? "outline" : "default"}>
                          <Link href={href}>{section.href ? "Open" : status === "done" ? "Review section" : "Start section"}</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </PlatformShell>
  );
}
