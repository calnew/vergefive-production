import Link from "next/link";

import { Button, Card, CardContent } from "@/components/ui";

export function PlatformPaywall({ title = "Unlock the Verge Five platform" }: { title?: string }) {
  return (
    <main className="min-h-screen bg-surface-page px-5 py-10 md:px-8">
      <section className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-vfBorder bg-white shadow-soft">
        <div className="relative bg-[linear-gradient(145deg,#0E1A2B,#183763)] p-8 text-white md:p-12">
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#7FA3E6]">Member platform</p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold tracking-[-0.05em] md:text-6xl">{title}</h1>
          <p className="mt-5 max-w-2xl leading-7 text-[#AEBFD8]">Your free scan shows the score and problem areas. Upgrade to unlock the guided fixes, account matches, full buildout, and downloadable readiness report.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild size="lg"><Link href="/signup?plan=self-serve">Unlock my fixes - $597/yr</Link></Button>
            <Button asChild size="lg" variant="outline" className="bg-white"><Link href="/#pricing">See plans</Link></Button>
          </div>
        </div>
        <Card className="m-6 border-dashed bg-surface-muted md:m-8">
          <CardContent className="grid gap-4 p-6 md:grid-cols-3">
            {[
              ["Fix instructions", "Step-by-step correction path for every issue."],
              ["Account matches", "Ready-now and unlock-next account guidance."],
              ["Readiness report", "Download a summary of what changed and what to do next."],
            ].map(([heading, copy]) => (
              <div key={heading} className="rounded-2xl bg-white p-5 blur-[1px]">
                <p className="font-display text-xl font-bold text-brand-navy">{heading}</p>
                <p className="mt-2 text-sm leading-6 text-vfText-body">{copy}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
