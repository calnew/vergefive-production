"use client";

import { useEffect, useState } from "react";

import { Button, Card, CardContent } from "@/components/ui";

export function CheckoutStart({ plan, billing }: { plan: string; billing: string }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function start() {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, billing }),
      });
      const data = await response.json();
      if (!active) return;
      if (!response.ok || !data.url) {
        setError(data.error ?? "Checkout could not start.");
        setLoading(false);
        return;
      }
      window.location.href = data.url;
    }
    start();
    return () => { active = false; };
  }, [plan, billing]);

  return (
    <Card className="w-full max-w-xl">
      <CardContent className="p-8 text-center">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-vfText-muted">Secure checkout</p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-[-0.04em] text-brand-navy">Opening Stripe Checkout</h1>
        <p className="mt-4 text-vfText-body">Verge Five sells readiness tools and guided fixes. It does not guarantee approvals, funding, or lender decisions.</p>
        {loading ? <p className="mt-6 rounded-2xl bg-blue-50 p-4 text-sm font-bold text-brand-blue">Preparing your secure checkout...</p> : null}
        {error ? <p className="mt-6 rounded-2xl bg-flagged-surface p-4 text-sm font-bold text-flagged">{error}</p> : null}
        {error ? <Button className="mt-6" onClick={() => window.location.reload()}>Try again</Button> : null}
      </CardContent>
    </Card>
  );
}