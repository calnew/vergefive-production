export const dynamic = "force-dynamic";

import Link from "next/link";

import { PlatformShell } from "@/components/platform/platform-shell";
import { PlatformPaywall } from "@/components/platform/paywall";
import { Badge, Button, Card, CardContent, ProgressBar } from "@/components/ui";
import { buildoutModules, getPlatformData, progressPercent } from "@/lib/platform-data";

export default async function BuildoutPage() {
  const { user, allowed, scan } = await getPlatformData();
  if (!allowed) return <PlatformPaywall />;

  const progress = scan ? progressPercent(scan.issues) : 0;

  return (
    <PlatformShell user={user} active="Full Buildout">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-vfText-muted">Guided path</p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-[-0.05em] text-brand-navy md:text-5xl">Your 5-module business credit buildout.</h1>
        <p className="mt-3 max-w-3xl text-vfText-body">Follow the modules in order. Each module supports readiness before stronger account applications.</p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="grid gap-5 md:grid-cols-2">
            {buildoutModules.map((module, index) => (
              <Card key={module.title} className={index === 0 ? "border-brand-blue" : ""}>
                <CardContent className="p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3"><Badge variant={index === 0 ? "info" : "outline"}>Module {index + 1}</Badge><Badge variant="ready">{module.sections} sections</Badge></div>
                  <h2 className="mt-5 font-display text-2xl font-bold text-brand-navy">{module.title}</h2>
                  <p className="mt-3 leading-7 text-vfText-body">{module.description}</p>
                  <Button asChild variant="outline" className="mt-5"><Link href={index === 0 ? "/fix-list/" : "/account-matches/"}>Start Module</Link></Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="grid gap-5 content-start">
            <Card><CardContent className="p-6"><h2 className="font-display text-2xl font-bold text-brand-navy">Curriculum map</h2><div className="mt-5 font-display text-5xl font-bold text-brand-navy">5</div><ProgressBar value={progress} className="mt-4" /><p className="mt-4 text-sm leading-6 text-vfText-body">Five modules in the paid buildout path. Start with Module 1 and move in order.</p></CardContent></Card>
            <Card className="bg-unlock-surface"><CardContent className="p-6"><h2 className="font-display text-xl font-bold text-unlock">Keep the order.</h2><p className="mt-2 leading-7 text-unlock">Vendor and card applications should wait until the related readiness fixes are complete.</p></CardContent></Card>
          </div>
        </div>
      </div>
    </PlatformShell>
  );
}
