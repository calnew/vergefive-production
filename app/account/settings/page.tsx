export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";

import { PortalButton } from "@/app/account/settings/portal-button";
import { PlatformPaywall } from "@/components/platform/paywall";
import { Card, CardContent } from "@/components/ui";
import { entitlementFromD1, getD1RequestAuth } from "@/lib/d1-auth";

export default async function AccountSettingsPage() {
  const { auth } = await getD1RequestAuth();
  if (!auth) redirect("/login?callbackUrl=/account/settings");

  if (!auth.active) return <PlatformPaywall title="Reactivate Verge Five access" />;

  return (
    <main className="min-h-screen bg-surface-page px-6 py-12">
      <Card className="mx-auto max-w-2xl">
        <CardContent className="p-8">
          <Link href="/dashboard/" className="text-sm font-bold text-brand-blue">Back to dashboard</Link>
          <h1 className="mt-4 font-display text-4xl font-bold tracking-[-0.04em] text-brand-navy">Account settings</h1>
          <p className="mt-3 text-vfText-body">Manage your membership and billing. Verge Five improves readiness; it does not guarantee approvals, funding, or lender decisions.</p>
          <div className="mt-6 rounded-2xl bg-white p-5 text-sm text-vfText-body">
            <p><b>Email:</b> {auth.user.email}</p>
            <p className="mt-2"><b>Access:</b> {entitlementFromD1(auth.membership.status, auth.active).replace("_", " ")}</p>
            <p className="mt-2"><b>Billing status:</b> {auth.membership.status || "none"}</p>
          </div>
          <div className="mt-6"><PortalButton /></div>
        </CardContent>
      </Card>
    </main>
  );
}
