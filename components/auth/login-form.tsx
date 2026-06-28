"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { Button, Card, CardContent } from "@/components/ui";

export function LoginForm() {
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
      }),
    });
    const payload = await response.json().catch(() => ({}));
    setLoading(false);

    if (!response.ok) {
      setError(payload.error ?? "That email and password did not match.");
      return;
    }

    window.location.href = searchParams.get("callbackUrl") || "/dashboard/";
  }

  return (
    <Card className="w-full max-w-md">
      <CardContent className="p-8">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-vfText-muted">Member login</p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-[-0.04em] text-brand-navy">Log in to Verge Five</h1>
        <form className="mt-8 grid gap-4" onSubmit={onSubmit}>
          <label className="grid gap-2 text-sm font-bold text-vfText-strong">
            Email
            <input className="h-12 rounded-xl border border-vfBorder bg-white px-4 font-normal outline-none focus:border-brand-blue focus:ring-2 focus:ring-blue-100" name="email" type="email" required />
          </label>
          <label className="grid gap-2 text-sm font-bold text-vfText-strong">
            Password
            <input className="h-12 rounded-xl border border-vfBorder bg-white px-4 font-normal outline-none focus:border-brand-blue focus:ring-2 focus:ring-blue-100" name="password" type="password" required />
          </label>
          {error ? <p className="rounded-xl bg-flagged-surface px-4 py-3 text-sm font-bold text-flagged">{error}</p> : null}
          <Button type="submit" disabled={loading}>{loading ? "Logging in..." : "Log in"}</Button>
        </form>
        <p className="mt-6 text-sm text-vfText-body">
          Need an account? <Link className="font-bold text-brand-blue" href="/signup">Sign up</Link>
        </p>
      </CardContent>
    </Card>
  );
}
