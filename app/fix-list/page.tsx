export const dynamic = "force-dynamic";

import Link from "next/link";

import { PlatformShell } from "@/components/platform/platform-shell";
import { PlatformPaywall } from "@/components/platform/paywall";
import { ImpactPill, StatusPill } from "@/components/platform/pills";
import { Button, Card, CardContent } from "@/components/ui";
import { getPlatformData } from "@/lib/platform-data";
import { fixListPhases } from "@/lib/platform-catalog";
import type { FixStatus } from "@/lib/readiness";

function rowStatus(key: string, fixStatuses: Record<string, FixStatus>): FixStatus {
  if (key === "website") {
    const parts = [fixStatuses.website ?? "todo", fixStatuses.email ?? "todo"];
    if (parts.every((status) => status === "done")) return "done";
    if (parts.some((status) => status !== "todo")) return "progress";
    return "todo";
  }
  return fixStatuses[key] ?? "todo";
}

export default async function FixListPage() {
  const { user, allowed, scan, fixStatuses } = await getPlatformData();
  if (!allowed) return <PlatformPaywall />;

  const issueSeverity: Record<string, string> = {};
  for (const issue of scan?.issues ?? []) {
    if (issue.status !== "done") issueSeverity[issue.key === "email" ? "website" : issue.key] = issue.severity;
  }

  const allItems = fixListPhases.flatMap((phase) => phase.items);
  const doneCount = allItems.filter((item) => rowStatus(item.key, fixStatuses) === "done").length;
  const openCount = allItems.length - doneCount;

  return (
    <PlatformShell user={user} active="Fix List" businessName={scan?.business.name}>
      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-6 md:p-7">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-[-0.02em] text-vfText-strong">Your fix list</h1>
            <p className="mt-1 text-sm leading-6 text-vfText-body">Work top to bottom — each phase builds the records the next one depends on.</p>
          </div>
          <div className="flex gap-3">
            <div className="rounded-2xl bg-ready-surface px-5 py-3 text-center">
              <b className="font-display text-2xl text-ready">{doneCount}</b>
              <p className="text-xs font-bold text-ready">Done</p>
            </div>
            <div className="rounded-2xl bg-unlock-surface px-5 py-3 text-center">
              <b className="font-display text-2xl text-unlock">{openCount}</b>
              <p className="text-xs font-bold text-unlock">Open</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-5 grid gap-5">
        {fixListPhases.map((phase, phaseIndex) => (
          <Card key={phase.phase}>
            <CardContent className="p-6 md:p-7">
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-xl bg-brand-navy font-display text-sm font-bold text-white">{phaseIndex + 1}</span>
                <h2 className="font-display text-lg font-bold text-vfText-strong">{phase.phase} · {phase.title}</h2>
              </div>
              <div className="mt-4 grid gap-3">
                {phase.items.map((item) => {
                  const status = rowStatus(item.key, fixStatuses);
                  const severity = issueSeverity[item.key] ?? item.defaultSeverity;
                  return (
                    <div key={item.key} className="grid gap-3 rounded-2xl border border-vfBorder bg-white p-4 md:grid-cols-[auto_minmax(0,1fr)_auto_auto] md:items-center">
                      <StatusPill status={status} className="justify-self-start md:w-28 md:justify-center" />
                      <div className="min-w-0">
                        <h3 className="font-display text-base font-bold text-vfText-strong">{item.title}</h3>
                        <p className="mt-0.5 text-sm leading-6 text-vfText-body">{item.tagline}</p>
                      </div>
                      <ImpactPill severity={status === "done" ? "low" : severity} className="justify-self-start" />
                      <Button asChild size="sm" variant={status === "done" ? "outline" : "default"}>
                        <Link href={`/fix/${item.key}/`}>Open</Link>
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </PlatformShell>
  );
}
