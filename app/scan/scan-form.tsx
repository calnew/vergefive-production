"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { Button, Card, CardContent } from "@/components/ui";

type ScanInitialValues = {
  name?: string;
  entityType?: string;
  address?: string;
  phone?: string;
  website?: string;
  email?: string;
};

const fields: [keyof ScanInitialValues, string, string][] = [
  ["name", "Business name", "Riverside Hauling LLC"],
  ["entityType", "Entity type", "LLC"],
  ["address", "Business address", "123 Main St, Henderson, NC"],
  ["phone", "Business phone", "252-555-0148"],
  ["website", "Website", "https://example.com"],
  ["email", "Business email", "owner@example.com"],
];

export function ScanForm({ initialValues = {}, paid = false }: { initialValues?: ScanInitialValues; paid?: boolean }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setScanning(true);

    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    const response = await fetch("/api/scan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      setScanning(false);
      setError(data.error ?? "The scan could not run right now.");
      return;
    }

    setTimeout(() => router.push(data.redirectTo ?? (paid ? "/dashboard/" : "/scan/results")), 1200);
  }

  return (
    <Card className="mx-auto max-w-3xl overflow-hidden">
      <CardContent className="p-0">
        <div className="bg-[linear-gradient(160deg,#0E1A2B,#16325A)] p-8 text-white md:p-10">
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#7FA3E6]">Business Visibility Scan</p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-[-0.05em] md:text-5xl">{paid ? "Re-run your scan." : "Run the free scan."}</h1>
          <p className="mt-4 max-w-2xl leading-7 text-[#AEBFD8]">Enter the public business details vendors and lenders usually compare. Verge Five will score the profile, flag problem areas, and update what unlocks next.</p>
        </div>
        <form className="grid gap-5 p-6 md:grid-cols-2 md:p-8" onSubmit={onSubmit}>
          {fields.map(([name, label, placeholder]) => (
            <label key={name} className="grid gap-2 text-sm font-bold text-vfText-strong">
              {label}
              <input className="h-12 rounded-xl border border-vfBorder bg-white px-4 font-normal outline-none focus:border-brand-blue focus:ring-2 focus:ring-blue-100" name={name} placeholder={placeholder} defaultValue={initialValues[name] ?? ""} required />
            </label>
          ))}
          {error ? <p className="rounded-xl bg-flagged-surface px-4 py-3 text-sm font-bold text-flagged md:col-span-2">{error}</p> : null}
          <div className="md:col-span-2">
            <Button type="submit" size="lg" disabled={scanning} className="w-full md:w-auto">
              {scanning ? "Scanning..." : paid ? "Re-run Scan" : "Run my free scan"}
            </Button>
            {scanning ? (
              <div className="mt-5 rounded-2xl bg-blue-50 p-4 text-sm font-bold text-brand-blue">
                Checking business identity, contact signals, website/domain, banking readiness, and account-match unlocks...
              </div>
            ) : null}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
