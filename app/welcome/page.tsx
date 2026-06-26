import Link from "next/link";

import { auth } from "@/auth";
import { PublicHeader } from "@/components/marketing/public-header";
import { Button, Card, CardContent } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import { entitlementForPlan, normalizePlan, stripeClient } from "@/lib/stripe";

export default async function WelcomePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const session = await auth();
  const params = await searchParams;
  const sessionId = typeof params.session_id === "string" ? params.session_id : undefined;

  if (sessionId && process.env.STRIPE_SECRET_KEY) {
    const stripe = stripeClient();
    const checkout = await stripe.checkout.sessions.retrieve(sessionId);
    const userId = checkout.metadata?.userId || checkout.client_reference_id || session?.user?.id;
    const customerId = typeof checkout.customer === "string" ? checkout.customer : undefined;
    const subscriptionId = typeof checkout.subscription === "string" ? checkout.subscription : undefined;
    if (userId && checkout.status === "complete") {
      await prisma.user.updateMany({
        where: { id: userId },
        data: {
          entitlement: entitlementForPlan(normalizePlan(checkout.metadata?.plan)),
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
        },
      });
    }
  }

  const user = session?.user?.id ? await prisma.user.findUnique({ where: { id: session.user.id } }) : null;

  return (
    <main className="min-h-screen bg-surface-page">
      <PublicHeader />
      <section className="grid min-h-[calc(100vh-74px)] place-items-center px-6 py-12">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-8 text-center md:p-10">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-ready">Access confirmed</p>
            <h1 className="mt-3 font-display text-5xl font-bold tracking-[-0.05em] text-brand-navy">Welcome to Verge Five.</h1>
            <p className="mx-auto mt-5 max-w-xl leading-7 text-vfText-body">Your platform access is ready. Use Verge Five to improve business-credit readiness and fix the issues that can slow account reviews.</p>
            <p className="mt-4 text-sm font-bold text-vfText-muted">Current entitlement: {user?.entitlement ?? session?.user?.entitlement ?? "pending"}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg"><Link href="/dashboard/">Open dashboard</Link></Button>
              <Button asChild size="lg" variant="outline"><Link href="/account/settings">Billing settings</Link></Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
