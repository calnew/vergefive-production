export const dynamic = "force-dynamic";

import { ApplicationTrackerClient } from "@/components/platform/application-tracker-client";
import { PlatformShell } from "@/components/platform/platform-shell";
import { PlatformPaywall } from "@/components/platform/paywall";
import { Card, CardContent } from "@/components/ui";
import { accountCatalog } from "@/lib/platform-catalog";
import { getPlatformData } from "@/lib/platform-data";

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
}

function pathForGroup(group: string): "vendor" | "cards" | "funding" {
  if (group.includes("Funding")) return "funding";
  if (group.includes("card") || group.includes("Corporate") || group.includes("Store/project")) return "cards";
  return "vendor";
}

export default async function ApplicationTrackerPage() {
  const { user, allowed, scan } = await getPlatformData();
  if (!allowed) return <PlatformPaywall />;

  const allAccounts = accountCatalog.map((account) => ({
    id: slug(`${account.group}-${account.name}`),
    name: account.name,
    group: account.group,
    path: pathForGroup(account.group),
    timing: account.timing,
    why: account.why,
    href: account.applyHref,
  }));
  // Keep this to 20 accounts for now: the current safe progress store caps selected status keys at 100.
  const accounts = [
    ...allAccounts.filter((account) => account.path === "vendor").slice(0, 7),
    ...allAccounts.filter((account) => account.path === "cards").slice(0, 7),
    ...allAccounts.filter((account) => account.path === "funding").slice(0, 6),
  ];

  return (
    <PlatformShell user={user} active="Application Tracker" businessName={scan?.business.name}>
      <section className="relative overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#0E1A2B,#1D3A64)] p-7 text-white shadow-soft md:p-9">
        <div className="pointer-events-none absolute -right-14 -top-24 size-64 rounded-full bg-brand-blue/30 blur-3xl" aria-hidden />
        <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-ondark-blue">Application Tracker</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-[-0.03em] md:text-4xl">Track what you plan, apply for, and save privately.</h1>
        <p className="mt-3 max-w-2xl leading-7 text-ondark-body">This keeps your application process organized without collecting sensitive documents. Use checkmarks only; keep proof in your own private files.</p>
      </section>

      <Card className="mt-5">
        <CardContent className="p-5">
          <p className="text-sm font-bold leading-6 text-vfText-body">Recommended workflow: pick accounts from Account Matches, track each application here, then check "Outcome saved privately" after you save approval, denial, invoice, payment, or reporting proof in your own records.</p>
        </CardContent>
      </Card>

      <div className="mt-5">
        <ApplicationTrackerClient accounts={accounts} />
      </div>
    </PlatformShell>
  );
}

