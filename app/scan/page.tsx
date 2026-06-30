export const dynamic = "force-dynamic";

import Link from "next/link";

import { ScanForm } from "@/app/scan/scan-form";
import { PlatformShell } from "@/components/platform/platform-shell";
import { PlatformPaywall } from "@/components/platform/paywall";
import { getD1RequestAuth, entitlementFromD1 } from "@/lib/d1-auth";

type ProfileRow = { business_name?: string; trade_name?: string; entity_type?: string; address?: string; phone?: string; website?: string; email?: string };

export default async function ScanPage() {
  const { auth, env } = await getD1RequestAuth();

  if (!auth) {
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

  if (!auth.active) return <PlatformPaywall title="Upgrade to re-run scans inside the platform" />;

  const profile = await env.DB.prepare("select business_name, trade_name, entity_type, address, phone, website, email from business_profiles where user_id = ? limit 1").bind(auth.user.id).first<ProfileRow>().catch(() => null);
  const user = {
    id: auth.user.id,
    email: auth.user.email,
    name: auth.user.name || auth.user.email,
    entitlement: entitlementFromD1(auth.membership.status, auth.active),
  };

  return (
    <PlatformShell user={user} active="Run Scan">
      <div className="mx-auto max-w-6xl">
        <p className="mb-4 text-xs font-extrabold uppercase tracking-[0.2em] text-vfText-muted">Visibility Engine</p>
        <ScanForm paid initialValues={{
          name: profile?.business_name || profile?.trade_name || "",
          entityType: profile?.entity_type || "",
          address: profile?.address || "",
          phone: profile?.phone || "",
          website: profile?.website || "",
          email: profile?.email || "",
        }} />
      </div>
    </PlatformShell>
  );
}
