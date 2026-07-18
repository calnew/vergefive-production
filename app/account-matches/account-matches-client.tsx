"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { CreditCardFace } from "@/components/ui";

export type MatcherAccount = {
  name: string;
  path: "vendor" | "cards" | "funding";
  group: string;
  type: string;
  requires: string[];
  recommended: string[];
  why: string;
  timing: string;
  gradient: string;
};

type Tab = "all" | "vendor" | "cards" | "funding";
type Tier = "ready" | "almost" | "build";

const CORE_TOGGLES: { key: string; label: string }[] = [
  { key: "llc", label: "Legal entity formed" },
  { key: "ein", label: "EIN issued by IRS" },
  { key: "phones", label: "Business phone number" },
  { key: "address", label: "Valid business address" },
  { key: "website", label: "Website + domain email" },
  { key: "bank", label: "Business bank account" },
  { key: "bank-rating", label: "Bank rating (Low-5+)" },
  { key: "criteria", label: "12-point criteria met" },
  { key: "net30", label: "Reporting tradelines" },
];

const EXTRA_TOGGLES: { key: string; label: string; scope: "cards" | "funding" | "both" }[] = [
  { key: "deposit", label: "Deposit available (secured)", scope: "cards" },
  { key: "goodCredit", label: "Good personal credit", scope: "cards" },
  { key: "pg", label: "Personal guarantee acceptable", scope: "cards" },
  { key: "revenue", label: "Revenue / cash flow showing", scope: "both" },
  { key: "reserve", label: "Cash reserve / CD funds", scope: "funding" },
  { key: "collateral", label: "Collateral available", scope: "funding" },
];

const SHORT_LABELS: Record<string, string> = {
  llc: "entity", ein: "EIN", phones: "phone", address: "address", website: "website/email",
  bank: "bank account", "bank-rating": "bank rating", criteria: "12-point criteria", net30: "tradelines",
  deposit: "deposit", goodCredit: "good personal credit", pg: "personal guarantee",
  revenue: "revenue/cash flow", reserve: "cash reserve / CD", collateral: "collateral",
  reserveOrRevenue: "cash reserve or revenue",
};

const TABS: { key: Tab; label: string; blurb: string }[] = [
  { key: "all", label: "All categories", blurb: "Every account path in one view" },
  { key: "vendor", label: "Vendor & Net 30", blurb: "Starter and operating vendors" },
  { key: "cards", label: "Cards", blurb: "Secured, store, fleet, and traditional" },
  { key: "funding", label: "Funding", blurb: "Secured loans and lender paths" },
];

const TIER_META: Record<Tier, { label: string; className: string }> = {
  ready: { label: "Ready now", className: "bg-ready-surface text-ready" },
  almost: { label: "Almost ready", className: "bg-unlock-surface text-unlock" },
  build: { label: "Build first", className: "bg-[#EEF1F6] text-vfText-body" },
};

export function AccountMatchesClient({ userName, hasScan, scanSignals, accounts }: {
  userName: string;
  hasScan: boolean;
  scanSignals: Record<string, boolean>;
  accounts: MatcherAccount[];
}) {
  const [tab, setTab] = useState<Tab>("all");
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  const [modal, setModal] = useState<MatcherAccount | null>(null);
  const [showBuild, setShowBuild] = useState(false);

  useEffect(() => {
    if (!modal) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setModal(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modal]);

  const effective = useMemo(() => {
    const state: Record<string, boolean> = {};
    for (const { key } of CORE_TOGGLES) state[key] = overrides[key] ?? scanSignals[key] ?? false;
    for (const { key } of EXTRA_TOGGLES) state[key] = overrides[key] ?? false;
    return state;
  }, [overrides, scanSignals]);

  function satisfied(requirement: string) {
    if (requirement === "reserveOrRevenue") return effective.reserve || effective.revenue;
    return effective[requirement] ?? false;
  }

  function tierFor(account: MatcherAccount): { tier: Tier; missing: string[] } {
    const missing = account.requires.filter((requirement) => !satisfied(requirement));
    if (!missing.length) return { tier: "ready", missing };
    if (missing.length <= 2) return { tier: "almost", missing };
    return { tier: "build", missing };
  }

  const tiered = accounts.map((account) => ({ account, ...tierFor(account) }));
  const shown = tiered.filter(({ account }) => tab === "all" || account.path === tab);
  const counts = {
    ready: shown.filter((entry) => entry.tier === "ready").length,
    almost: shown.filter((entry) => entry.tier === "almost").length,
    build: shown.filter((entry) => entry.tier === "build").length,
  };
  const readyCore = CORE_TOGGLES.filter(({ key }) => effective[key]).length;
  const extrasForTab = EXTRA_TOGGLES.filter(({ scope }) => tab === "all" || scope === "both" || scope === tab);
  const hasOverrides = Object.keys(overrides).length > 0;

  type Entry = { account: MatcherAccount; tier: Tier; missing: string[] };
  const readyEntries = shown.filter((entry) => entry.tier === "ready");
  const almostEntries = shown.filter((entry) => entry.tier === "almost");
  const buildEntries = shown.filter((entry) => entry.tier === "build");

  const renderFullCard = ({ account, tier, missing }: Entry) => (
    <div key={`${account.group}-${account.name}`} className="flex flex-col rounded-2xl border border-vfBorder bg-white p-4 shadow-soft">
      <CreditCardFace memberName={userName} cardTypeLabel={account.type} gradient={account.gradient} locked={tier === "build"} />
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${TIER_META[tier].className}`}>{TIER_META[tier].label}</span>
        <span className="text-xs font-bold text-vfText-muted">{account.group}</span>
      </div>
      <h3 className="mt-2 font-display text-base font-bold text-vfText-strong">{account.name}</h3>
      <p className="mt-1 text-sm leading-6 text-vfText-body">{account.why}</p>
      <p className={`mt-2 text-xs font-bold leading-5 ${missing.length ? "text-unlock" : "text-ready"}`}>
        {missing.length ? `Still need: ${missing.map((key) => SHORT_LABELS[key] ?? key).join(", ")}` : "You meet the prerequisites"}
      </p>
      <button type="button" onClick={() => setModal(account)} className="mt-auto pt-3 text-left text-sm font-bold text-brand-blue hover:underline">
        Learn more →
      </button>
    </div>
  );

  const renderRow = ({ account, tier, missing }: Entry) => (
    <button
      key={`${account.group}-${account.name}`}
      type="button"
      onClick={() => setModal(account)}
      className="flex w-full items-start gap-3 rounded-2xl border border-vfBorder bg-white p-3.5 text-left shadow-soft transition hover:border-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
    >
      <span className={`mt-0.5 shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${TIER_META[tier].className}`}>{TIER_META[tier].label}</span>
      <span className="min-w-0 flex-1">
        <span className="block font-display text-sm font-bold text-vfText-strong">{account.name}</span>
        <span className="mt-0.5 block text-xs font-bold text-vfText-muted">{account.group}</span>
        <span className={`mt-1 block text-xs font-bold leading-5 ${missing.length ? "text-unlock" : "text-ready"}`}>
          {missing.length ? `Still need: ${missing.map((key) => SHORT_LABELS[key] ?? key).join(", ")}` : "You meet the prerequisites"}
        </span>
      </span>
      <span className="mt-0.5 shrink-0 text-sm font-bold text-brand-blue" aria-hidden>→</span>
    </button>
  );

  return (
    <div>
      <section className="relative overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#0E1A2B,#1D3A64)] p-7 text-white shadow-soft md:p-9">
        <div className="pointer-events-none absolute -right-14 -top-24 size-64 rounded-full bg-brand-blue/30 blur-3xl" aria-hidden />
        <div className="grid items-center gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-ondark-blue">Account Matches</p>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-[-0.03em] md:text-4xl">Match accounts to your real readiness</h1>
            <p className="mt-3 max-w-xl leading-7 text-ondark-body">Every account here is tiered against your scan signals. Toggle signals to see what unlocks next — matches are guidance, never approval promises.</p>
          </div>
          <video className="aspect-video w-full rounded-2xl bg-black object-cover" controls preload="metadata" poster="/posters/net30.jpg?v=a831a29">
            <source src="/uploads/about-net-30-recreated.webm?v=a831a29" type="video/webm" />
          </video>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {TABS.map((entry) => {
            const readyInTab = tiered.filter(({ account, tier }) => tier === "ready" && (entry.key === "all" || account.path === entry.key)).length;
            const active = tab === entry.key;
            return (
              <button
                key={entry.key}
                type="button"
                onClick={() => setTab(entry.key)}
                aria-pressed={active}
                className={`rounded-2xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${active ? "border-white/60 bg-white/15" : "border-white/15 bg-white/5 hover:bg-white/10"}`}
              >
                <p className="font-display text-sm font-bold">{entry.label}</p>
                <p className="mt-0.5 text-xs text-ondark-body">{entry.blurb}</p>
                <p className="mt-2 text-xs font-bold text-ondark-green">{readyInTab} ready</p>
              </button>
            );
          })}
        </div>
      </section>

      {!hasScan ? (
        <div className="mt-5 rounded-2xl bg-unlock-surface p-5 text-sm font-bold text-unlock">
          Run a scan first so the signals below reflect your real business profile. <Link href="/scan/" className="underline">Run Scan →</Link>
        </div>
      ) : null}

      <div className="mt-5 grid gap-5 lg:grid-cols-[250px_minmax(0,1fr)] lg:items-start">
        <aside className="rounded-2xl border border-vfBorder bg-white p-5 shadow-soft lg:sticky lg:top-5">
          <h2 className="font-display text-base font-bold text-vfText-strong">Your signals</h2>
          <div className="mt-3 overflow-hidden rounded-full bg-[#EAEEF4]">
            <div className="h-2 rounded-full bg-[linear-gradient(90deg,#2563EB,#22C55E)] transition-all" style={{ width: `${Math.round((readyCore / CORE_TOGGLES.length) * 100)}%` }} />
          </div>
          <p className="mt-2 text-xs font-bold text-vfText-body">{readyCore} of {CORE_TOGGLES.length} signals ready</p>
          <div className="mt-4 grid gap-1.5">
            {CORE_TOGGLES.map(({ key, label }) => (
              <label key={key} className="flex cursor-pointer items-center gap-2.5 rounded-xl px-2 py-1.5 text-sm font-bold text-vfText-body transition hover:bg-surface-muted">
                <input type="checkbox" checked={effective[key]} onChange={() => setOverrides((current) => ({ ...current, [key]: !effective[key] }))} className="size-4 accent-[#2563EB]" />
                {label}
              </label>
            ))}
          </div>
          {extrasForTab.length ? (
            <>
              <p className="mt-4 text-xs font-extrabold uppercase tracking-[0.16em] text-vfText-muted">Category signals</p>
              <div className="mt-2 grid gap-1.5">
                {extrasForTab.map(({ key, label }) => (
                  <label key={key} className="flex cursor-pointer items-center gap-2.5 rounded-xl px-2 py-1.5 text-sm font-bold text-vfText-body transition hover:bg-surface-muted">
                    <input type="checkbox" checked={effective[key]} onChange={() => setOverrides((current) => ({ ...current, [key]: !effective[key] }))} className="size-4 accent-[#2563EB]" />
                    {label}
                  </label>
                ))}
              </div>
            </>
          ) : null}
          {hasOverrides ? (
            <button type="button" onClick={() => setOverrides({})} className="mt-4 w-full rounded-xl border border-vfBorder px-3 py-2 text-sm font-bold text-brand-blue transition hover:border-brand-blue">
              Reset to scan
            </button>
          ) : null}
        </aside>

        <div className="min-w-0">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-ready-surface p-4"><b className="font-display text-2xl text-ready">{counts.ready}</b><p className="text-sm font-bold text-ready">Ready now</p></div>
            <div className="rounded-2xl bg-unlock-surface p-4"><b className="font-display text-2xl text-unlock">{counts.almost}</b><p className="text-sm font-bold text-unlock">Almost ready</p></div>
            <div className="rounded-2xl bg-[#EEF1F6] p-4"><b className="font-display text-2xl text-vfText-body">{counts.build}</b><p className="text-sm font-bold text-vfText-body">Build first</p></div>
          </div>

          <section className="mt-6">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="font-display text-lg font-bold text-vfText-strong">Your ready accounts</h2>
              <span className="shrink-0 text-sm font-bold text-ready">{readyEntries.length} ready now</span>
            </div>
            <p className="mt-1 text-sm leading-6 text-vfText-body">You meet the prerequisites for these — start here.</p>
            {readyEntries.length ? (
              <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {readyEntries.map(renderFullCard)}
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-dashed border-vfBorder bg-white p-5 text-sm font-bold leading-6 text-vfText-body">
                No accounts are fully ready yet. Clear the items under “Almost there” to unlock your first matches.
              </div>
            )}
          </section>

          {almostEntries.length ? (
            <section className="mt-8">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="font-display text-lg font-bold text-vfText-strong">Almost there</h2>
                <span className="shrink-0 text-sm font-bold text-unlock">{almostEntries.length}</span>
              </div>
              <p className="mt-1 text-sm leading-6 text-vfText-body">One or two signals away. Finish these to move them into Ready.</p>
              <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                {almostEntries.map(renderRow)}
              </div>
            </section>
          ) : null}

          {buildEntries.length ? (
            <section className="mt-8">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="font-display text-lg font-bold text-vfText-strong">Keep building</h2>
                  <p className="mt-1 text-sm leading-6 text-vfText-body">Longer-term targets that need more foundation in place.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowBuild((current) => !current)}
                  aria-expanded={showBuild}
                  className="shrink-0 rounded-xl border border-vfBorder px-3.5 py-2 text-sm font-bold text-brand-blue transition hover:border-brand-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
                >
                  {showBuild ? "Hide" : `Show all ${buildEntries.length}`}
                </button>
              </div>
              {showBuild ? (
                <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                  {buildEntries.map(renderRow)}
                </div>
              ) : null}
            </section>
          ) : null}
        </div>
      </div>

      {modal ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#0E1A2B]/60 p-4" onClick={() => setModal(null)} role="dialog" aria-modal="true" aria-label={modal.name}>
          <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-[0_30px_80px_rgba(8,16,28,0.4)] md:p-7" onClick={(event) => event.stopPropagation()}>
            {(() => {
              const { tier, missing } = tierFor(modal);
              return (
                <>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${TIER_META[tier].className}`}>{TIER_META[tier].label}</span>
                  <h2 className="mt-3 font-display text-2xl font-bold text-vfText-strong">{modal.name}</h2>
                  <p className="mt-2 leading-7 text-vfText-body">{modal.why}</p>
                  <div className="mt-4 grid gap-3 text-sm">
                    <div className="rounded-xl bg-surface-muted p-3"><b className="text-vfText-strong">Account type:</b> <span className="text-vfText-body">{modal.type}</span></div>
                    <div className="rounded-xl bg-surface-muted p-3">
                      <b className="text-vfText-strong">Required signals:</b>
                      <span className="text-vfText-body"> {modal.requires.map((key) => SHORT_LABELS[key] ?? key).join(", ")}</span>
                    </div>
                    <div className="rounded-xl bg-surface-muted p-3"><b className="text-vfText-strong">Recommended:</b> <span className="text-vfText-body">{modal.recommended.join(", ")}</span></div>
                    {missing.length ? (
                      <div className="rounded-xl bg-flagged-surface p-3 font-bold text-flagged">Match note: finish {missing.map((key) => SHORT_LABELS[key] ?? key).join(", ")} before applying here.</div>
                    ) : (
                      <div className="rounded-xl bg-ready-surface p-3 font-bold text-ready">Your signals meet this account&apos;s prerequisites.</div>
                    )}
                    <div className="rounded-xl bg-blue-50 p-3 text-brand-blue"><b>Timing:</b> {modal.timing}</div>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Link href={`/support/?topic=account&name=${encodeURIComponent(modal.name)}`} className="rounded-xl bg-brand-blue px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#1D4ED8]">Get help with this account</Link>
                    <button type="button" onClick={() => setModal(null)} className="rounded-xl border border-vfBorder px-4 py-2.5 text-sm font-bold text-vfText-body transition hover:border-brand-blue">Close</button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      ) : null}
    </div>
  );
}
