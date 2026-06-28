"use client";

import { useState } from "react";

import { Button } from "@/components/ui";

export function PortalButton() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function openPortal() {
    setError("");
    setLoading(true);
    const response = await fetch("/api/billing/create-portal-session", { method: "POST" });
    const data = await response.json();
    setLoading(false);
    if (!response.ok || !data.url) {
      setError(data.error ?? "Could not open billing portal.");
      return;
    }
    window.location.href = data.url;
  }

  return (
    <div>
      <Button onClick={openPortal} disabled={loading}>{loading ? "Opening..." : "Manage billing in Stripe"}</Button>
      {error ? <p className="mt-4 rounded-xl bg-flagged-surface p-3 text-sm font-bold text-flagged">{error}</p> : null}
    </div>
  );
}
