import Link from "next/link";

import { PublicHeader } from "@/components/marketing/public-header";

const catchItems = [
  { title: "Wrong phone signal", detail: "A mismatch between public phone records and your business profile.", severity: "High" },
  { title: "Free email as contact", detail: "A Gmail or Yahoo address where a domain email belongs.", severity: "High" },
  { title: "Address inconsistency", detail: "Website, listing, and bank records pointing to different places.", severity: "High" },
  { title: "Bank rating below Low-5", detail: "Average balance under the threshold lenders look for.", severity: "Med" },
  { title: "No reporting tradelines", detail: "No Net 30 account reporting to the business bureaus yet.", severity: "Med" },
];

const logos = ["alliance.png", "bizfilings.png", "corpnet.png", "creditsafe.png", "dandb.png", "equifax.png", "nav.png", "ringcentral.png"];

const readyCards = [
  { name: "Crown Office Supplies", type: "Net 30", why: "Starter Net 30 option that can help create a cleaner vendor profile.", bg: "from-[#123F23] via-[#17623B] to-[#31B36A]" },
  { name: "Uline", type: "Net 30", why: "Supplier Net 30 path that can support early business purchasing activity.", bg: "from-[#0E1A2B] via-[#174EA6] to-[#2563EB]" },
  { name: "BofA Business Advantage Secured", type: "Visa", why: "Bank-backed secured card path for building business payment history.", bg: "from-[#0E1A2B] via-[#45556F] to-[#9CA3AF]" },
];

const lockedCards = [
  { name: "Capital One Spark Classic", type: "Credit card", why: "Unlock after the 12-point criteria pass.", bg: "from-[#1F2937] via-[#4B5563] to-[#9CA3AF]" },
  { name: "Amazon Business Amex", type: "Charge card", why: "Unlock after banking and reporting signals improve.", bg: "from-[#1F2937] via-[#4B5563] to-[#9CA3AF]" },
  { name: "Chase Ink Business Cash", type: "Credit card", why: "Requires bank rating and reporting tradelines.", bg: "from-[#1F2937] via-[#4B5563] to-[#9CA3AF]" },
];

function BrandLockup({ dark = false }: { dark?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <img src="/logos/verge-five-mark.svg" alt="Verge Five" className="h-9 w-9" />
      <div className="leading-none">
        <div className={`font-display text-base font-bold tracking-[-0.03em] ${dark ? "text-white" : "text-brand-navy"}`}>Verge Five</div>
        <div className={`mt-1 text-[10px] font-extrabold tracking-[0.18em] ${dark ? "text-[#7D90AA]" : "text-vfText-muted"}`}>BUSINESS CREDIT</div>
      </div>
    </div>
  );
}

function SeverityPill({ severity }: { severity: string }) {
  const high = severity === "High";
  return <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${high ? "bg-flagged-surface text-flagged" : "bg-unlock-surface text-unlock"}`}>{severity}</span>;
}

function MiniCardFace({ name, type, bg, locked = false }: { name: string; type: string; bg: string; locked?: boolean }) {
  return (
    <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${bg} p-4 text-white shadow-soft`}>
      <div className="flex items-start justify-between gap-3">
        <div className="h-7 w-10 rounded-md bg-gradient-to-br from-amber-100 to-amber-400" />
        <span className="rounded-full bg-white/15 px-2 py-1 text-[10px] font-bold">{type}</span>
      </div>
      <div className="mt-8 font-display text-sm font-bold tracking-[0.14em]">---- ---- ---- 5482</div>
      <div className="mt-3 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.14em] text-white/75">
        <span>{name}</span>
        <span>{locked ? "Locked" : "Ready"}</span>
      </div>
      {locked ? <div className="absolute inset-0 bg-[#111827]/45 backdrop-grayscale" /> : null}
    </div>
  );
}

function CalloutCard({ number, children, className = "" }: { number: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`vf-callout rounded-2xl bg-white p-4 text-sm font-extrabold leading-5 text-vfText-strong shadow-soft ${className}`}>
      <span className="mb-2 grid h-8 w-8 place-items-center rounded-full bg-brand-blue text-white">{number}</span>
      {children}
    </div>
  );
}

function DashboardMockup() {
  return (
    <div id="dashboard" className="relative mx-auto max-w-5xl vf-dashboard-reveal">
      <CalloutCard number="1" className="absolute -left-56 top-24 hidden max-w-44 2xl:block">The scan scores you before you apply.</CalloutCard>
      <CalloutCard number="2" className="absolute -right-56 top-64 hidden max-w-44 2xl:block">See what's missing in plain English.</CalloutCard>
      <CalloutCard number="3" className="absolute -left-56 bottom-16 hidden max-w-44 2xl:block">Correct each one from the fix page.</CalloutCard>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#07111F] p-3 shadow-[0_34px_85px_rgba(0,0,0,0.38)]">
        <div className="mb-3 flex items-center gap-2 px-1">
          <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#FFBD2E]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
          <div className="mx-auto rounded-full bg-[#102033] px-5 py-1 text-[10px] font-bold text-[#6F839E]">app.vergefive.com/dashboard</div>
        </div>
        <div className="grid min-w-0 overflow-hidden rounded-xl bg-[#EFF3F8] md:grid-cols-[190px_minmax(0,1fr)]">
          <aside className="hidden bg-[#0E1A2B] p-5 text-white md:block">
            <BrandLockup dark />
            <nav className="mt-8 grid gap-2 text-xs font-bold text-[#91A3BD]">
              {["Dashboard", "Run My Scan", "Fix List", "Account Matches", "Full Buildout", "Report Card"].map((item, index) => (
                <div key={item} className={`rounded-lg px-3 py-2 ${index === 0 ? "bg-brand-blue text-white" : ""}`}>{item}</div>
              ))}
            </nav>
          </aside>
          <div className="min-w-0 p-4 md:p-7">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-vfText-muted">Member Dashboard</p>
            <h3 className="mt-1 font-display text-2xl font-bold tracking-[-0.04em] text-brand-navy">Welcome back, Maria</h3>
            <p className="text-sm text-vfText-body">Riverside Hauling LLC - Assigned path: <span className="font-bold text-brand-blue">Visibility Cleanup</span></p>
            <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-2xl bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                  <div className="relative grid h-28 w-28 shrink-0 place-items-center rounded-full bg-[conic-gradient(#F59E0B_0_56%,#E9EEF6_56%)]">
                    <div className="grid h-20 w-20 place-items-center rounded-full bg-white text-center">
                      <span className="font-display text-3xl font-bold">56</span>
                      <span className="-mt-3 text-xs font-bold text-vfText-muted">/100</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-vfText-muted">Business Readiness</p>
                    <div className="mt-1 flex items-center gap-2"><span className="font-display text-2xl font-bold text-unlock">Fair</span><span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-bold text-brand-blue">Scan signals</span></div>
                    <p className="mt-2 max-w-xs text-sm text-vfText-body">5 of 9 signals are clean. Start with the high-impact issues first.</p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl bg-white p-5 shadow-sm">
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-vfText-muted">Fix Progress</p>
                <div className="mt-2 font-display text-3xl font-bold">45%</div>
                <div className="mt-4 h-3 rounded-full bg-[#E4EAF3]"><div className="h-3 w-[45%] rounded-full bg-brand-blue" /></div>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-surface-muted p-3"><b className="text-brand-blue">14</b><p className="text-xs font-bold text-vfText-body">Pages explored</p></div>
                  <div className="rounded-xl bg-surface-muted p-3"><b className="text-ready">5</b><p className="text-xs font-bold text-vfText-body">Fixes done</p></div>
                </div>
              </div>
            </div>
            <div className="mt-5 rounded-2xl bg-white p-5 shadow-sm">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h4 className="font-display text-lg font-bold">Detected issues</h4>
                <span className="rounded-full bg-flagged-surface px-3 py-1 text-xs font-bold text-flagged">4 flagged</span>
              </div>
              <div className="grid gap-3">
                {catchItems.slice(0, 4).map((item) => (
                  <div key={item.title} className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-xl border border-vfBorder bg-white p-3 sm:grid-cols-[auto_minmax(0,1fr)_auto_auto]">
                    <span className="h-2.5 w-2.5 rounded-full bg-flagged" />
                    <div className="min-w-0 flex-1"><p className="text-sm font-extrabold text-brand-navy">{item.title}</p><p className="truncate text-xs text-vfText-body">{item.detail}</p></div>
                    <SeverityPill severity={item.severity} />
                    <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-brand-blue">Fix this</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-3 2xl:hidden md:grid-cols-3">
        <CalloutCard number="1">The scan scores you before you apply.</CalloutCard>
        <CalloutCard number="2">See what's missing in plain English.</CalloutCard>
        <CalloutCard number="3">Correct each one from the fix page.</CalloutCard>
      </div>
    </div>
  );
}

function AccountMatchesSection() {
  return (
    <section className="bg-white px-5 py-24 md:px-8">
      <div className="mx-auto max-w-6xl text-center vf-section-reveal">
        <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-brand-blue">The matches</p>
        <h2 className="mt-3 font-display text-4xl font-bold tracking-[-0.05em] text-brand-navy md:text-5xl">Real accounts that unlock as you fix.</h2>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-vfText-body">Every fix you clear re-tiers your matches. Vendor lines, cards, and funding move from Unlock next to Ready now - based on your real scan signals, not promises or odds.</p>
        <div className="marquee-mask mt-10 overflow-hidden">
          <div className="vf-marquee flex flex-wrap items-center justify-center gap-8 opacity-35 grayscale lg:w-max lg:flex-nowrap lg:justify-start lg:gap-12">
            {[...logos, ...logos].map((logo, index) => <img key={`${logo}-${index}`} src={`/logos/v/${logo}`} alt="" className="h-8 w-28 object-contain" />)}
          </div>
        </div>
        <div className="mt-12 text-left">
          <p className="mb-4 text-xs font-extrabold uppercase tracking-[0.18em] text-ready">Ready now - matched to your current signals</p>
          <div className="grid gap-5 md:grid-cols-3">
            {readyCards.map((card) => (
              <div key={card.name} className="rounded-2xl border border-ready-border bg-white p-4 shadow-soft">
                <MiniCardFace {...card} />
                <h3 className="mt-4 font-display text-lg font-bold text-brand-navy">{card.name}</h3>
                <p className="mt-1 text-sm leading-6 text-vfText-body">{card.why}</p>
                <button className="mt-4 w-full rounded-xl bg-brand-blue px-4 py-3 text-sm font-extrabold text-white">Apply</button>
              </div>
            ))}
          </div>
          <p className="mb-4 mt-10 text-xs font-extrabold uppercase tracking-[0.18em] text-unlock">Unlock next - clear these fixes first</p>
          <div className="grid gap-5 md:grid-cols-3">
            {lockedCards.map((card) => (
              <div key={card.name} className="rounded-2xl border border-vfBorder bg-white p-4 shadow-soft">
                <MiniCardFace {...card} locked />
                <h3 className="mt-4 font-display text-lg font-bold text-brand-navy">{card.name}</h3>
                <p className="mt-1 text-sm leading-6 text-vfText-body">{card.why}</p>
                <div className="mt-4 rounded-xl bg-unlock-surface px-4 py-3 text-sm font-bold text-unlock">{card.why}</div>
              </div>
            ))}
          </div>
        </div>
        <Link href="/account-matches" className="mt-10 inline-flex rounded-xl bg-brand-blue px-7 py-4 text-sm font-extrabold text-white shadow-[0_14px_34px_rgba(37,99,235,0.30)]">See all 90+ matches</Link>
        <p className="mx-auto mt-8 max-w-3xl text-xs leading-5 text-vfText-muted">This finder is a readiness guide, not a promise of approval. Banks, lenders, and vendors make independent decisions based on their own underwriting and criteria.</p>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-surface-page text-vfText-strong">
      <PublicHeader dark />

      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_80%_18%,rgba(37,99,235,0.38),transparent_28%),linear-gradient(160deg,#0E1A2B,#142640_58%,#1D3A64)] px-5 pb-24 pt-20 text-center md:px-8 md:pb-32">
        <div className="absolute left-[7%] top-28 hidden max-w-64 rounded-[2rem] border border-white/10 bg-white/5 p-5 text-left text-lg font-bold text-white/30 xl:block">I thought I had everything in order.</div>
        <div className="absolute bottom-40 right-[6%] hidden max-w-64 rounded-[2rem] border border-white/10 bg-white/5 p-5 text-left text-lg font-bold text-white/30 xl:block">...so how did I get denied?</div>
        <div className="mx-auto max-w-4xl vf-hero-copy">
          <h1 className="font-display text-5xl font-bold leading-[0.98] tracking-[-0.06em] text-white md:text-7xl">Run the scan.<br />Fix what matters.<br /><span className="text-[#5FE0A0]">Unlock the right accounts.</span></h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-[#AEBFD8] md:text-lg">Verge Five is the business-credit command center that tells you exactly where your business stands, what's holding it back, and which vendor accounts, cards, and funding open up as you fix it.</p>
          <p className="mx-auto mt-4 max-w-xl text-sm font-medium leading-6 text-[#7D90AA]">Your competitors already run lean on credit. Every week you don't scan is a week of approvals you're leaving on the table.</p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link href="/scan" className="rounded-xl bg-brand-blue px-7 py-4 text-sm font-extrabold text-white shadow-[0_14px_34px_rgba(37,99,235,0.42)]">Run my free scan</Link>
            <a href="#dashboard" className="rounded-xl border border-white/15 bg-white/10 px-7 py-4 text-sm font-extrabold text-white">Tour the dashboard</a>
          </div>
        </div>
      </section>

      <section className="-mt-16 px-5 md:px-8"><DashboardMockup /></section>
      <AccountMatchesSection />

      <section id="how" className="mx-auto max-w-6xl px-5 py-24 md:px-8">
        <div className="mb-10 text-center vf-section-reveal"><p className="text-xs font-extrabold uppercase tracking-[0.22em] text-brand-blue">From scan to fixed</p><h2 className="mt-3 font-display text-4xl font-bold tracking-[-0.05em] text-brand-navy md:text-5xl">Three steps. The dashboard does the thinking.</h2></div>
        <div className="grid gap-5 md:grid-cols-3">
          {[
            ["1", "Run the scan", "The Business Visibility Audit checks your phone, listings, address, website, entity, and banking against what lenders and bureaus expect."],
            ["2", "See what's missing", "Your dashboard lists every gap in plain language, ranked by how much it drags your readiness score."],
            ["3", "Correct each problem", "Each issue opens a focused fix page: what to do, real provider options, proof to save, and Mark complete."],
          ].map(([num, title, detail], index) => (
            <div key={title} className="vf-section-reveal rounded-2xl border border-vfBorder bg-white p-6 shadow-sm">
              <div className={`mb-5 grid h-11 w-11 place-items-center rounded-xl text-sm font-extrabold ${index === 0 ? "bg-blue-50 text-brand-blue" : index === 1 ? "bg-flagged-surface text-flagged" : "bg-ready-surface text-ready"}`}>{num}</div>
              <h3 className="font-display text-xl font-bold tracking-[-0.03em]">{title}</h3>
              <p className="mt-2 min-h-24 text-sm leading-6 text-vfText-body">{detail}</p>
              <div className="mt-5 rounded-xl bg-surface-muted p-4 text-xs font-bold text-vfText-body"><div className="mb-2 flex justify-between"><span>Phone & 411 signal</span><span className={index === 0 ? "text-ready" : "text-flagged"}>{index === 0 ? "Checked" : "High"}</span></div><div className="mb-2 flex justify-between"><span>Website & domain email</span><span className={index === 2 ? "text-ready" : "text-unlock"}>{index === 2 ? "Done" : "Warning"}</span></div><div className="flex justify-between"><span>Banking foundation</span><span className="text-unlock">Queued</span></div></div>
            </div>
          ))}
        </div>
      </section>

      <section id="catch" className="bg-white px-5 py-24 md:px-8"><div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center"><div className="vf-section-reveal"><p className="text-xs font-extrabold uppercase tracking-[0.22em] text-brand-blue">What the scan catches</p><h2 className="mt-3 font-display text-4xl font-bold leading-tight tracking-[-0.05em] text-brand-navy">The mismatches that can slow down account reviews.</h2><p className="mt-5 text-base leading-8 text-vfText-body">Approval systems cross-check your business across public records and databases. A single inconsistency can flag the whole profile. These are the real issues the scan surfaces - each one routes to its own fix page.</p><Link href="/scan" className="mt-7 inline-flex rounded-xl bg-brand-blue px-6 py-3 text-sm font-extrabold text-white">Run my scan</Link></div><div className="grid gap-3">{catchItems.map((item) => <div key={item.title} className="vf-section-reveal flex items-center gap-4 rounded-2xl border border-vfBorder bg-surface-card p-4 shadow-sm"><span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-sm font-extrabold text-brand-blue">!</span><div className="min-w-0 flex-1"><p className="font-display text-base font-bold text-brand-navy">{item.title}</p><p className="text-sm text-vfText-body">{item.detail}</p></div><SeverityPill severity={item.severity} /></div>)}</div></div></section>

      <section className="mx-auto grid max-w-6xl gap-12 px-5 py-24 md:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center"><div className="vf-section-reveal rounded-3xl bg-white p-6 shadow-soft"><span className="rounded-full bg-flagged-surface px-3 py-1 text-xs font-extrabold uppercase text-flagged">High impact - phase 1</span><h3 className="mt-4 font-display text-2xl font-bold tracking-[-0.04em] text-brand-navy">Website & Domain Email Fix</h3><p className="mt-2 text-sm leading-6 text-vfText-body">Run a real business website and a domain email - no free Gmail or Yahoo as your primary address.</p><div className="mt-5 rounded-2xl bg-flagged-surface p-4 text-sm font-bold text-flagged">From your scan: a free-email primary contact was found.</div><div className="mt-5 grid gap-2 text-sm font-bold text-vfText-body"><p>Register a real domain for your business</p><p>Set up a domain email you control</p><p>Replace Gmail on every public profile</p></div><div className="mt-6 flex flex-wrap gap-2"><button className="rounded-xl bg-brand-blue px-4 py-3 text-sm font-extrabold text-white">Do it myself</button><button className="rounded-xl border border-vfBorder px-4 py-3 text-sm font-extrabold text-brand-blue">Get help</button><button className="rounded-xl bg-ready-surface px-4 py-3 text-sm font-extrabold text-ready">Mark complete</button></div></div><div className="vf-section-reveal"><p className="text-xs font-extrabold uppercase tracking-[0.22em] text-brand-blue">Correct the problem areas</p><h2 className="mt-3 font-display text-4xl font-bold leading-tight tracking-[-0.05em] text-brand-navy">Every flagged issue opens a fix you can actually finish.</h2><p className="mt-5 text-base leading-8 text-vfText-body">No course library, no guesswork. Each fix page tells you what the scan saw, what to do about it, which real providers to use, and what proof to save.</p><div className="mt-8 grid gap-5">{["See what the scan saw", "Real provider options", "Save your proof"].map((item) => <div key={item} className="flex gap-4"><span className="mt-1 grid h-8 w-8 place-items-center rounded-xl bg-blue-50 text-brand-blue">+</span><div><h3 className="font-display text-lg font-bold">{item}</h3><p className="text-sm leading-6 text-vfText-body">The dashboard keeps every correction focused and tied to business readiness.</p></div></div>)}</div></div></section>

      <section id="pricing" className="bg-[linear-gradient(160deg,#0E1A2B,#16325A)] px-5 py-24 text-white md:px-8"><div className="mx-auto max-w-6xl text-center vf-section-reveal"><p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#7FA3E6]">Pricing</p><h2 className="mt-3 font-display text-4xl font-bold tracking-[-0.05em] md:text-5xl">Start free. Upgrade when you see what's missing.</h2><p className="mx-auto mt-4 max-w-2xl text-[#AEBFD8]">Run the scan for nothing. The moment you see your gaps, choose how much of the fixing you want to do yourself.</p><div className="mt-12 grid gap-5 text-left lg:grid-cols-3">{[["Free Scan", "$0", "No card required", "free", ["Full Business Visibility Audit", "Your readiness score + grade", "See every flagged gap", "Preview of your account matches"]], ["Self-Serve", "$597", "Annual access · monthly starts at $7, then $49/mo", "self-serve", ["Everything in Free, plus", "A guided fix page for every issue", "All provider resources", "The full 7-module guided buildout", "Downloadable readiness report card"]], ["Done-With-You", "$997", "+ Self-Serve membership", "done-with-you", ["Everything in Self-Serve, plus", "Specialist handles the tough fixes", "Phone, 411, entity & banking setup", "Priority help requests", "12 readiness review call"]]].map(([name, price, note, plan, perks], index) => <div key={name as string} className={`relative rounded-2xl border p-6 ${index === 1 ? "border-white bg-white text-brand-navy shadow-[0_24px_70px_rgba(0,0,0,0.35)]" : "border-white/15 bg-white/5"}`}>{index === 1 ? <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-blue px-4 py-1 text-xs font-extrabold text-white">Most popular</span> : null}<h3 className="font-display text-xl font-bold">{name}</h3><div className="mt-4 flex items-end gap-2"><span className="font-display text-5xl font-bold">{price}</span>{index > 0 ? <span className="pb-2 text-sm opacity-70">/ year</span> : null}</div><p className={`mt-2 text-sm font-bold ${index === 1 ? "text-brand-blue" : "text-[#7D90AA]"}`}>{note}</p><div className="mt-6 grid gap-3 text-sm">{(perks as string[]).map((perk) => <p key={perk}>+ {perk}</p>)}</div><Link href={plan === "done-with-you" ? "/support?topic=done-with-you" : `/signup?plan=${plan}`} className={`mt-8 block rounded-xl px-4 py-3 text-center text-sm font-extrabold ${index === 1 ? "bg-brand-blue text-white" : "border border-white/15 text-white"}`}>{index === 0 ? "Run my free scan" : index === 1 ? "Start Self-Serve" : "Talk to a specialist"}</Link></div>)}</div><div className="mt-8 flex flex-wrap justify-center gap-6 text-xs font-bold text-[#AEBFD8]"><span>Cancel anytime</span><span>Secure checkout</span><span>No card for your scan</span></div><p className="mx-auto mt-5 max-w-3xl text-[11px] leading-5 text-[#7D90AA]">Verge Five is a business-readiness platform, not a lender. We do not promise approvals, funding amounts, or account decisions. Always review provider terms before applying.</p></div></section>

      <section className="px-5 py-24 text-center md:px-8 vf-section-reveal"><h2 className="font-display text-4xl font-bold tracking-[-0.05em] text-brand-navy">See what's missing before a lender does.</h2><p className="mx-auto mt-4 max-w-xl text-base leading-7 text-vfText-body">Run the scan, read your dashboard, and fix the problem areas one focused page at a time.</p><Link href="/scan" className="mt-8 inline-flex rounded-xl bg-brand-blue px-7 py-4 text-sm font-extrabold text-white shadow-[0_14px_34px_rgba(37,99,235,0.35)]">Run my free scan</Link></section>

      <footer className="bg-[#0E1A2B] px-5 py-8 md:px-8"><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-5"><BrandLockup dark /><p className="text-sm text-[#6F8099]">From vision to venture. Verge Five LLC. admin@vergefive.com</p><div className="flex gap-6 text-sm font-bold text-[#AEBFD8]"><a href="#pricing">Pricing</a><Link href="/login">Log in</Link></div></div></footer>
    </main>
  );
}
