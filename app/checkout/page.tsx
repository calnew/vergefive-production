import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { CheckoutStart } from "@/app/checkout/checkout-start";
import { normalizeBilling, normalizePlan } from "@/lib/stripe";

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const session = await auth();
  const params = await searchParams;
  const plan = normalizePlan(typeof params.plan === "string" ? params.plan : undefined);
  const billing = normalizeBilling(typeof params.billing === "string" ? params.billing : undefined);

  if (!session?.user?.id) redirect(`/signup?plan=${plan}&billing=${billing}`);

  return (
    <main className="grid min-h-screen place-items-center bg-surface-page px-6 py-12">
      <CheckoutStart plan={plan} billing={billing} />
    </main>
  );
}