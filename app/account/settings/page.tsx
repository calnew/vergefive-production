import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { Card, CardContent } from "@/components/ui";
import { PortalButton } from "@/app/account/settings/portal-button";
import { prisma } from "@/lib/prisma";

export default async function AccountSettingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/signup?plan=self-serve");
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });

  return (
    <main className="min-h-screen bg-surface-page px-6 py-12">
      <Card className="mx-auto max-w-2xl">
        <CardContent className="p-8">
          <Link href="/dashboard/" className="text-sm font-bold text-brand-blue">Back to dashboard</Link>
          <h1 className="mt-4 font-display text-4xl font-bold tracking-[-0.04em] text-brand-navy">Account settings</h1>
          <p className="mt-3 text-vfText-body">Manage your membership and billing. Verge Five improves readiness; it does not guarantee approvals, funding, or lender decisions.</p>
          <div className="mt-6 rounded-2xl bg-white p-5 text-sm text-vfText-body">
            <p><b>Email:</b> {user?.email ?? "Not logged in"}</p>
            <p className="mt-2"><b>Entitlement:</b> {user?.entitlement ?? "free"}</p>
          </div>
          <div className="mt-6"><PortalButton /></div>
        </CardContent>
      </Card>
    </main>
  );
}
