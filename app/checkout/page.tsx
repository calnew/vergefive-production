export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";

import { CheckoutStart } from "@/app/checkout/checkout-start";
import { PublicHeader } from "@/components/marketing/public-header";
import { getD1RequestAuth } from "@/lib/d1-auth";
import { normalizeBilling, normalizePlan } from "@/lib/stripe";

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { auth } = await getD1RequestAuth();
  const params = await searchParams;
  const plan = normalizePlan(typeof params.plan === "string" ? params.plan : undefined);
  const billing = normalizeBilling(typeof params.billing === "string" ? params.billing : undefined);

  if (!auth?.user?.id) redirect(`/signup?plan=${plan}&billing=${billing}`);

  return (
    <main className="min-h-screen bg-surface-page">
      <PublicHeader />
      <section className="grid min-h-[calc(100vh-74px)] place-items-center px-6 py-12">
        <CheckoutStart plan={plan} billing={billing} />
      </section>
    </main>
  );
}
