import Link from "next/link";

import { auth } from "@/auth";
import { ScanForm } from "@/app/scan/scan-form";
import { PlatformShell } from "@/components/platform/platform-shell";
import { PlatformPaywall } from "@/components/platform/paywall";
import { prisma } from "@/lib/prisma";

export default async function ScanPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <main className="min-h-screen bg-surface-page px-5 py-8 md:px-8">
        <nav className="mx-auto mb-10 flex max-w-6xl items-center justify-between">
          <Link href="/" className="font-display text-lg font-bold text-brand-navy">Verge Five</Link>
          <Link href="/login" className="rounded-xl border border-vfBorder bg-white px-4 py-2 text-sm font-bold text-brand-blue">Log in</Link>
        </nav>
        <ScanForm />
      </main>
    );
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || user.entitlement === "free") return <PlatformPaywall title="Upgrade to re-run scans inside the platform" />;

  const latestBusiness = await prisma.business.findFirst({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });

  return (
    <PlatformShell user={user} active="Run Scan">
      <div className="mx-auto max-w-5xl">
        <p className="mb-4 text-xs font-extrabold uppercase tracking-[0.2em] text-vfText-muted">Refresh your readiness</p>
        <ScanForm paid initialValues={latestBusiness ?? {}} />
      </div>
    </PlatformShell>
  );
}
