"use client";

import { useEffect, useState } from "react";

import { Button, Card, CardContent } from "@/components/ui";

export function CheckoutStart({ plan, billing }: { plan: string; billing: string }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let canceled = false;

    async function start() {
      try {
        const canonicalBillingPlan = billing === "monthly" ? "monthly" : "annual";
        const response = await fetch("/api/billing/create-checkout-session", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            plan: canonicalBillingPlan,
            productPlan: plan,
            billing,
          }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.url) {
          throw new Error(data.error ?? "Checkout could not start.");
        }
        if (!canceled) window.location.href = data.url;
      } catch (err) {
        if (!canceled) {
          setError(err instanceof Error ? err.message : "Checkout could not start. Please try again.");
          setLoading(false);
        }
      }
    }

    start();
    return () => {
      canceled = true;
    };
  }, [plan, billing]);

  return (
    <Card className="mx-auto max-w-xl">
      <CardContent className="p-8 text-center">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-vfText-muted">Secure checkout</p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-[-0.04em] text-brand-navy">Opening Stripe Checkout</h1>
        <p className="mt-3 text-vfText-body">Checkout is handled by the canonical Cloudflare billing backend to prevent duplicate subscriptions.</p>
        {loading ? <p className="mt-6 rounded-2xl bg-blue-50 p-4 text-sm font-bold text-brand-blue">Preparing your secure checkout...</p> : null}
        {error ? <p className="mt-6 rounded-2xl bg-flagged-surface p-4 text-sm font-bold text-flagged">{error}</p> : null}
        {error ? <Button className="mt-5" onClick={() => window.location.reload()}>Try again</Button> : null}
      </CardContent>
    </Card>
  );
}
