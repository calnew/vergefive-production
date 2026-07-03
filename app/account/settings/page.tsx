export const dynamic = "force-dynamic";

import Link from "next/link";
import { redirect } from "next/navigation";

import { PlatformShell } from "@/components/platform/platform-shell";
import { PlatformPaywall } from "@/components/platform/paywall";
import { Badge, Button, Card, CardContent } from "@/components/ui";
import { entitlementFromD1, getD1RequestAuth } from "@/lib/d1-auth";

function formatDate(value: unknown) {
  const text = String(value ?? "").trim();
  if (!text) return null;
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function AccountSettingsPage() {
  const { auth, env } = await getD1RequestAuth();
  if (!auth) redirect("/login?callbackUrl=/account/settings");
  if (!auth.active) return <PlatformPaywall title="Reactivate Verge Five access" />;

  const profile = await env.DB.prepare("select business_name from business_profiles where user_id = ? limit 1")
    .bind(auth.user.id)
    .first<{ business_name?: string }>()
    .catch(() => null);

  const user = {
    id: auth.user.id,
    email: auth.user.email,
    name: auth.user.name || auth.user.email,
    entitlement: entitlementFromD1(auth.membership.status, auth.active),
  };
  const membershipStatus = String(auth.membership.status || "none");
  const periodEnd = formatDate(auth.membership.currentPeriodEnd ?? (auth.membership as Record<string, unknown>).current_period_end);

  return (
    <PlatformShell user={user} active="Settings" businessName={profile?.business_name}>
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-2xl font-bold tracking-[-0.02em] text-vfText-strong md:text-[27px]">Account settings</h1>
        <p className="mt-1 text-sm leading-6 text-vfText-body">Manage your membership. Verge Five improves readiness; it does not guarantee approvals, funding, or lender decisions.</p>

        <Card className="mt-5">
          <CardContent className="p-6 md:p-7">
            <h2 className="font-display text-lg font-bold text-vfText-strong">Profile</h2>
            <div className="mt-4 grid gap-2">
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-surface-muted px-4 py-3 text-sm">
                <b className="text-vfText-strong">Name</b>
                <span className="text-vfText-body">{user.name}</span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-surface-muted px-4 py-3 text-sm">
                <b className="text-vfText-strong">Email</b>
                <span className="text-vfText-body">{user.email}</span>
              </div>
              {profile?.business_name ? (
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-surface-muted px-4 py-3 text-sm">
                  <b className="text-vfText-strong">Business</b>
                  <span className="text-vfText-body">{profile.business_name}</span>
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Card className="mt-5">
          <CardContent className="p-6 md:p-7">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-lg font-bold text-vfText-strong">Membership</h2>
              <Badge variant={auth.active ? "ready" : "unlock"} className="capitalize">{membershipStatus}</Badge>
            </div>
            <div className="mt-4 grid gap-2">
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-surface-muted px-4 py-3 text-sm">
                <b className="text-vfText-strong">Access level</b>
                <span className="capitalize text-vfText-body">{user.entitlement.replace("_", " ")}</span>
              </div>
              {periodEnd ? (
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-surface-muted px-4 py-3 text-sm">
                  <b className="text-vfText-strong">{membershipStatus === "trial" ? "Trial ends" : "Current period ends"}</b>
                  <span className="text-vfText-body">{periodEnd}</span>
                </div>
              ) : null}
            </div>
            <p className="mt-4 rounded-xl bg-blue-50 px-4 py-3 text-sm leading-6 text-brand-blue">
              Billing changes, upgrades, and cancellations are handled by the Verge Five team while online billing is being finished.
            </p>
            <Button asChild className="mt-4"><Link href="/support/?topic=billing">Contact support about billing</Link></Button>
          </CardContent>
        </Card>

        <Card className="mt-5">
          <CardContent className="p-6 md:p-7">
            <h2 className="font-display text-lg font-bold text-vfText-strong">Your data</h2>
            <p className="mt-2 text-sm leading-6 text-vfText-body">Your scan history, fix progress, and saved proof checklists live in your member account. Download a member-safe summary any time from the Report Card page.</p>
            <Button asChild variant="outline" className="mt-4"><Link href="/report-card/">Open Report Card</Link></Button>
          </CardContent>
        </Card>
      </div>
    </PlatformShell>
  );
}
