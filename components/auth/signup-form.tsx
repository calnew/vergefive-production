"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

import { Button, Card, CardContent } from "@/components/ui";

export function SignupForm({ plan = "self-serve", billing = "yearly", canceled = false }: { plan?: string; billing?: string; canceled?: boolean }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedBilling, setSelectedBilling] = useState(billing === "monthly" ? "monthly" : "yearly");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: String(formData.get("name") ?? ""),
        email,
        password,
      }),
    });

    const payload = await response.json();
    if (!response.ok) {
      setLoading(false);
      setError(payload.error ?? "Could not create your account.");
      return;
    }

    const result = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);

    if (result?.error) {
      window.location.href = "/login";
      return;
    }

    window.location.href = `/checkout?plan=${encodeURIComponent(plan)}&billing=${encodeURIComponent(selectedBilling)}`;
  }

  const planLabel = plan === "done-with-you" ? "Done-With-You" : "Self-Serve";

  return (
    <Card className="w-full max-w-md">
      <CardContent className="p-8">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-vfText-muted">Create account</p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-[-0.04em] text-brand-navy">Start Verge Five</h1>
        <div className="mt-5 rounded-2xl bg-blue-50 p-4 text-sm text-vfText-body">
          <b className="text-brand-blue">Selected plan:</b> {planLabel}. Verge Five helps you improve readiness. It does not guarantee approvals, funding, or lender decisions.
        </div>
        {canceled ? <p className="mt-4 rounded-xl bg-unlock-surface px-4 py-3 text-sm font-bold text-unlock">Checkout was canceled. You can restart when ready.</p> : null}
        <form className="mt-8 grid gap-4" onSubmit={onSubmit}>
          <label className="grid gap-2 text-sm font-bold text-vfText-strong">
            Name
            <input className="h-12 rounded-xl border border-vfBorder bg-white px-4 font-normal outline-none focus:border-brand-blue focus:ring-2 focus:ring-blue-100" name="name" required />
          </label>
          <label className="grid gap-2 text-sm font-bold text-vfText-strong">
            Email
            <input className="h-12 rounded-xl border border-vfBorder bg-white px-4 font-normal outline-none focus:border-brand-blue focus:ring-2 focus:ring-blue-100" name="email" type="email" required />
          </label>
          <label className="grid gap-2 text-sm font-bold text-vfText-strong">
            Password
            <input className="h-12 rounded-xl border border-vfBorder bg-white px-4 font-normal outline-none focus:border-brand-blue focus:ring-2 focus:ring-blue-100" name="password" type="password" minLength={8} required />
          </label>
          {plan !== "done-with-you" ? (
            <label className="grid gap-2 text-sm font-bold text-vfText-strong">
              Billing period
              <select value={selectedBilling} onChange={(event) => setSelectedBilling(event.target.value)} className="h-12 rounded-xl border border-vfBorder bg-white px-4 font-normal outline-none focus:border-brand-blue focus:ring-2 focus:ring-blue-100">
                <option value="yearly">Yearly - $297/year</option>
                <option value="monthly">Monthly - $29/month</option>
              </select>
            </label>
          ) : null}
          {error ? <p className="rounded-xl bg-flagged-surface px-4 py-3 text-sm font-bold text-flagged">{error}</p> : null}
          <Button type="submit" disabled={loading}>{loading ? "Creating account..." : "Continue to secure checkout"}</Button>
        </form>
        <p className="mt-6 text-sm text-vfText-body">
          Already have an account? <Link className="font-bold text-brand-blue" href={`/checkout?plan=${plan}&billing=${selectedBilling}`}>Log in and checkout</Link>
        </p>
      </CardContent>
    </Card>
  );
}