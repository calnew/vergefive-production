export const dynamic = "force-dynamic";

import Link from "next/link";

import { PlatformShell } from "@/components/platform/platform-shell";
import { PlatformPaywall } from "@/components/platform/paywall";
import { Badge, Card, CardContent, CreditCardFace } from "@/components/ui";
import { getPlatformData, matchIsReady, unlockKeyForMatch } from "@/lib/platform-data";

function categoryLabel(category: string) {
  return category.replace("_", " ").replace("net30", "Net 30");
}

export default async function AccountMatchesPage() {
  const { user, allowed, scan } = await getPlatformData();
  if (!allowed) return <PlatformPaywall />;

  const ready = scan?.accountMatches.filter((match) => matchIsReady(match, scan.issues)) ?? [];
  const locked = scan?.accountMatches.filter((match) => !matchIsReady(match, scan.issues)) ?? [];

  return (
    <PlatformShell user={user} active="Account Matches">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-vfText-muted">Account access</p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-[-0.05em] text-brand-navy md:text-5xl">Account Matches</h1>
        <p className="mt-3 max-w-3xl text-vfText-body">Ready-now accounts fit the current profile. Unlock-next accounts show the exact fix that should be completed before applying. Readiness is not approval or funding.</p>

        {!scan ? <Card className="mt-8"><CardContent className="p-8"><p className="font-bold text-vfText-body">Run a scan first to generate account matches.</p><Link className="mt-4 inline-block font-bold text-brand-blue" href="/scan/">Run Scan</Link></CardContent></Card> : null}

        <section className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-display text-2xl font-bold text-ready">Ready now</h2><Badge variant="ready">{ready.length} accounts</Badge></div>
          <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {ready.map((match) => (
              <Card key={match.id}><CardContent className="p-5"><CreditCardFace memberName={user.name} cardTypeLabel={categoryLabel(match.category)} gradient={match.faceBg} /><h3 className="mt-4 font-display text-xl font-bold text-brand-navy">{match.name}</h3><p className="mt-2 text-sm leading-6 text-vfText-body">{match.reason}</p></CardContent></Card>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-display text-2xl font-bold text-unlock">Unlock next</h2><Badge variant="unlock">{locked.length} accounts</Badge></div>
          <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {locked.map((match) => {
              const unlockKey = unlockKeyForMatch(match.name);
              return <Card key={match.id}><CardContent className="p-5"><CreditCardFace memberName={user.name} cardTypeLabel={categoryLabel(match.category)} gradient={match.faceBg} locked /><h3 className="mt-4 font-display text-xl font-bold text-brand-navy">{match.name}</h3><p className="mt-2 text-sm leading-6 text-vfText-body">{match.reason}</p><div className="mt-4 rounded-2xl bg-unlock-surface p-3 text-sm font-bold text-unlock">Unlock by completing: {unlockKey ? <Link href={`/fix/${unlockKey}/`} className="underline">{unlockKey}</Link> : match.unlockReason}</div></CardContent></Card>;
            })}
          </div>
        </section>
      </div>
    </PlatformShell>
  );
}
