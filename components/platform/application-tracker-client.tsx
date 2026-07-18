"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

type TrackerAccount = {
  id: string;
  name: string;
  group: string;
  path: "vendor" | "cards" | "funding";
  timing: string;
  why: string;
  href: string;
};

const stages = [
  { key: "planned", label: "Plan to apply" },
  { key: "applied", label: "Applied" },
  { key: "approved", label: "Approved" },
  { key: "denied", label: "Denied / needs review" },
  { key: "private-proof", label: "Outcome saved privately" },
];

function trackerKey(accountId: string, stage: string) {
  return `${accountId}:${stage}`;
}

export function ApplicationTrackerClient({ accounts }: { accounts: TrackerAccount[] }) {
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [saveState, setSaveState] = useState<"loading" | "idle" | "saving" | "saved" | "error">("loading");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/member/progress", { headers: { accept: "application/json" } })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("progress load failed")))
      .then((data) => {
        if (!active) return;
        const row = Array.isArray(data.signals) ? data.signals.find((item: { signal_type?: string }) => item.signal_type === "application_tracker") : null;
        const parsed = row?.selected_keys ? JSON.parse(String(row.selected_keys)) : [];
        setSelected(new Set(Array.isArray(parsed) ? parsed.map(String) : []));
        setSaveState("idle");
      })
      .catch(() => {
        if (active) setSaveState("error");
      });
    return () => { active = false; };
  }, []);

  function persist(next: Set<string>) {
    setSaveState("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        const response = await fetch("/api/member/progress", {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ signalType: "application_tracker", selectedKeys: [...next].sort() }),
        });
        setSaveState(response.ok ? "saved" : "error");
      } catch {
        setSaveState("error");
      }
    }, 400);
  }

  function toggle(accountId: string, stage: string) {
    const key = trackerKey(accountId, stage);
    const next = new Set(selected);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setSelected(next);
    persist(next);
  }

  const counts = useMemo(() => {
    return stages.reduce<Record<string, number>>((acc, stage) => {
      acc[stage.key] = accounts.filter((account) => selected.has(trackerKey(account.id, stage.key))).length;
      return acc;
    }, {});
  }, [accounts, selected]);

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 md:grid-cols-5">
        {stages.map((stage) => (
          <div key={stage.key} className="rounded-2xl bg-white p-4 shadow-soft ring-1 ring-vfBorder">
            <p className="font-display text-2xl font-bold text-brand-navy">{counts[stage.key] ?? 0}</p>
            <p className="mt-1 text-xs font-extrabold uppercase tracking-[0.13em] text-vfText-muted">{stage.label}</p>
          </div>
        ))}
      </section>

      <div className="rounded-2xl bg-blue-50 p-4 text-sm font-bold leading-6 text-brand-blue">
        Privacy note: this tracker stores only status checkmarks. Keep applications, approval emails, denial letters, invoices, payment confirmations, and screenshots in your own private records.
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl font-bold text-vfText-strong">Track account outcomes</h2>
        <span className="text-sm font-bold text-vfText-muted" role="status">
          {saveState === "loading" ? "Loading tracker..." : saveState === "saving" ? "Saving..." : saveState === "saved" ? "Tracker saved" : saveState === "error" ? "Could not save tracker" : "Ready"}
        </span>
      </div>

      <div className="grid gap-4">
        {accounts.map((account) => (
          <article key={account.id} className="rounded-2xl border border-vfBorder bg-white p-5 shadow-soft">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-brand-blue">{account.path} / {account.group}</p>
                <h3 className="mt-1 font-display text-lg font-bold text-vfText-strong">{account.name}</h3>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-vfText-body">{account.why}</p>
              </div>
              <Link href={account.href} className="rounded-xl border border-vfBorder px-3 py-2 text-sm font-bold text-brand-blue hover:border-brand-blue">Open category</Link>
            </div>
            <p className="mt-3 rounded-xl bg-surface-muted px-4 py-3 text-sm font-bold leading-6 text-vfText-body">{account.timing}</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
              {stages.map((stage) => {
                const checked = selected.has(trackerKey(account.id, stage.key));
                return (
                  <label key={stage.key} className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold transition ${checked ? "border-ready-border bg-ready-surface text-ready" : "border-vfBorder bg-white text-vfText-body hover:border-brand-blue"}`}>
                    <input type="checkbox" checked={checked} onChange={() => toggle(account.id, stage.key)} className="size-4 accent-[#15803D]" />
                    {stage.label}
                  </label>
                );
              })}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
