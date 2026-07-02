"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { Badge, Card, CardContent, CreditCardFace } from "@/components/ui";

type AccountTab = "all" | "vendor" | "cards" | "funding";

type AccountCard = {
  bucketKey: AccountTab;
  bucketTitle: string;
  name: string;
  group: string;
  type: string;
  gradient: string;
  why: string;
  requirements: string[];
  recommended: string[];
  timing: string;
  blockerLinks: { key: string; label: string }[];
  status: {
    tone: "ready" | "review" | "locked";
    label: string;
    blockers: string[];
  };
};

type PathCard = {
  key: "vendor" | "cards" | "funding";
  eyebrow: string;
  title: string;
  description: string;
  examples: string[];
  readiness: string[];
};

type AccountMatchesClientProps = {
  userName: string;
  readyCount: number;
  lockedCount: number;
  groupCount: number;
  pathCards: PathCard[];
  accounts: AccountCard[];
};

const tabs: { key: AccountTab; label: string; description: string }[] = [
  { key: "all", label: "All Matches", description: "Every account path in one view." },
  { key: "vendor", label: "Vendor & Net 30", description: "Starter tradelines and operating vendors." },
  { key: "cards", label: "Credit & Secured Cards", description: "Secured, store, fleet, and revolving cards." },
  { key: "funding", label: "Funding Options", description: "Funding paths after readiness improves." },
];

function toneBadge(tone: AccountCard["status"]["tone"]) {
  if (tone === "ready") return "ready";
  if (tone === "review") return "info";
  return "flagged";
}

function accountMatchNote(account: AccountCard) {
  if (account.status.tone === "ready") return "You meet the visible prerequisites in this platform view. Review the terms before applying.";
  if (account.blockerLinks.length) return `Build these items first: ${account.blockerLinks.map((item) => item.label).join(", ")}.`;
  return "Review requirements and timing before applying.";
}

export function AccountMatchesClient({
  userName,
  readyCount,
  lockedCount,
  groupCount,
  pathCards,
  accounts,
}: AccountMatchesClientProps) {
  const [activeTab, setActiveTab] = useState<AccountTab>("vendor");
  const [selected, setSelected] = useState<AccountCard | null>(null);

  const visibleAccounts = useMemo(() => {
    if (activeTab === "all") return accounts;
    return accounts.filter((account) => account.bucketKey === activeTab);
  }, [accounts, activeTab]);

  const activePathCards = activeTab === "all" ? pathCards : pathCards.filter((path) => path.key === activeTab);

  return (
    <>
      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <Card><CardContent className="p-6"><Badge variant="ready">Ready to review</Badge><p className="mt-4 font-display text-4xl font-bold text-brand-navy">{readyCount}</p><p className="mt-2 text-sm text-vfText-body">No current scan blocker tied to the account requirement.</p></CardContent></Card>
        <Card><CardContent className="p-6"><Badge variant="flagged">Fix first</Badge><p className="mt-4 font-display text-4xl font-bold text-brand-navy">{lockedCount}</p><p className="mt-2 text-sm text-vfText-body">Current scan blockers should be handled before applying.</p></CardContent></Card>
        <Card><CardContent className="p-6"><Badge variant="info">Categories</Badge><p className="mt-4 font-display text-4xl font-bold text-brand-navy">{groupCount}</p><p className="mt-2 text-sm text-vfText-body">Starter vendors, operating vendors, cards, fleet, tech, and funding paths.</p></CardContent></Card>
      </section>

      <section className="mt-8 grid gap-3 rounded-3xl border border-vfBorder bg-white p-3 shadow-soft md:grid-cols-4">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const count = tab.key === "all" ? accounts.length : accounts.filter((account) => account.bucketKey === tab.key).length;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-2xl p-4 text-left transition ${isActive ? "bg-brand-blue text-white shadow-soft" : "bg-surface-muted text-vfText-body hover:bg-[#E8F0FF]"}`}
            >
              <span className="text-sm font-extrabold">{tab.label}</span>
              <span className={`mt-1 block text-xs leading-5 ${isActive ? "text-white/80" : "text-vfText-muted"}`}>{tab.description}</span>
              <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-extrabold ${isActive ? "bg-white/15 text-white" : "bg-white text-brand-blue"}`}>{count} options</span>
            </button>
          );
        })}
      </section>

      <section className="mt-8 grid gap-4 lg:grid-cols-3">
        {activePathCards.map((path) => (
          <Card key={path.key} className="overflow-hidden">
            <CardContent className="p-6">
              <Badge variant="unlock">{path.eyebrow}</Badge>
              <h2 className="mt-3 font-display text-2xl font-bold text-brand-navy">{path.title}</h2>
              <p className="mt-3 text-sm leading-6 text-vfText-body">{path.description}</p>
              <div className="mt-5 rounded-2xl bg-surface-muted p-4">
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-vfText-muted">Examples</p>
                <p className="mt-2 text-sm font-bold leading-6 text-vfText-body">{path.examples.join(" / ")}</p>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {path.readiness.map((item) => <span key={item} className="rounded-full bg-[#EEF3FE] px-3 py-1 text-xs font-extrabold text-brand-blue">{item}</span>)}
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <Badge variant="info">{activeTab === "vendor" ? "Vendor matcher" : activeTab === "cards" ? "Card matcher" : activeTab === "funding" ? "Funding matcher" : "All account paths"}</Badge>
            <h2 className="mt-3 font-display text-2xl font-bold text-brand-navy">
              {activeTab === "all" ? "All account matches" : tabs.find((tab) => tab.key === activeTab)?.label}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-vfText-body">Open each account card for prerequisites, match notes, and the next fixes to complete before applying.</p>
          </div>
          <Badge variant="outline">{visibleAccounts.length} options</Badge>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visibleAccounts.map((account) => (
            <Card key={`${account.bucketKey}-${account.name}`} className="overflow-hidden">
              <CardContent className="p-5">
                <CreditCardFace memberName={userName} cardTypeLabel={account.type} gradient={account.gradient} locked={account.status.tone === "locked"} />
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Badge variant={toneBadge(account.status.tone)}>{account.status.label}</Badge>
                  <Badge variant="outline">{account.group}</Badge>
                </div>
                <h3 className="mt-3 font-display text-xl font-bold text-brand-navy">{account.name}</h3>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-vfText-body">{account.why}</p>
                <div className="mt-4 rounded-2xl bg-surface-muted p-3">
                  <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-vfText-muted">Required prerequisites</p>
                  <p className="mt-2 text-sm font-bold text-vfText-body">{account.requirements.join(" / ")}</p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button type="button" onClick={() => setSelected(account)} className="rounded-xl bg-brand-blue px-4 py-2 text-sm font-extrabold text-white">View Details</button>
                  <Link href={`/support?topic=account&from=${encodeURIComponent(account.name)}`} className="rounded-xl border border-vfBorder px-4 py-2 text-sm font-extrabold text-brand-blue">Get Help</Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {selected ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#0E1A2B]/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={`${selected.name} details`}>
          <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant={toneBadge(selected.status.tone)}>{selected.status.label}</Badge>
                  <Badge variant="outline">{selected.group}</Badge>
                </div>
                <h2 className="mt-4 font-display text-3xl font-bold tracking-[-0.04em] text-brand-navy">{selected.name}</h2>
                <p className="mt-3 text-sm leading-6 text-vfText-body">{selected.why}</p>
              </div>
              <button type="button" onClick={() => setSelected(null)} className="rounded-full border border-vfBorder px-3 py-1 text-sm font-extrabold text-vfText-muted">Close</button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-surface-muted p-4">
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-vfText-muted">Card type</p>
                <p className="mt-2 font-bold text-vfText-body">{selected.type}</p>
              </div>
              <div className="rounded-2xl bg-surface-muted p-4">
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-vfText-muted">Timing</p>
                <p className="mt-2 font-bold text-vfText-body">{selected.timing}</p>
              </div>
              <div className="rounded-2xl bg-surface-muted p-4 md:col-span-2">
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-vfText-muted">Required prerequisites</p>
                <p className="mt-2 text-sm font-bold leading-6 text-vfText-body">{selected.requirements.join(" / ")}</p>
              </div>
              <div className="rounded-2xl bg-surface-muted p-4 md:col-span-2">
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-vfText-muted">Recommended signals</p>
                <p className="mt-2 text-sm font-bold leading-6 text-vfText-body">{selected.recommended.join(" / ")}</p>
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-unlock-surface p-4 text-sm leading-6 text-vfText-body">
              <b className="text-brand-navy">Match note:</b> {accountMatchNote(selected)}
            </div>

            {selected.blockerLinks.length ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {selected.blockerLinks.map((blocker) => (
                  <Link key={blocker.key} href={`/fix/${blocker.key}/`} className="rounded-xl border border-vfBorder px-4 py-2 text-sm font-extrabold text-brand-blue" onClick={() => setSelected(null)}>
                    Fix {blocker.label}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
