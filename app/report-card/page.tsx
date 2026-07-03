export const dynamic = "force-dynamic";

import Link from "next/link";

import { ReportDownloadButton } from "@/app/report-card/report-download-button";
import { PlatformShell } from "@/components/platform/platform-shell";
import { PlatformPaywall } from "@/components/platform/paywall";
import { Badge, Button, Card, CardContent, ProgressBar, ReadinessRing } from "@/components/ui";
import { getPlatformData, matchIsReady } from "@/lib/platform-data";

type ProfileRow = { label: string; value: string; complete: boolean };
type Qualification = { label: string; status: string; note: string; tone: "ready" | "review" | "wait" };

function clean(value: unknown, fallback = "Not saved yet") {
  const text = String(value || "").trim();
  return text || fallback;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[char] || char));
}

function qualificationTone(status: string): "ready" | "review" | "wait" {
  if (/ready|possible|likely/i.test(status)) return "ready";
  if (/rush|not enough|build|wait/i.test(status)) return "wait";
  return "review";
}

function buildQualifications(scan: NonNullable<Awaited<ReturnType<typeof getPlatformData>>["scan"]>): Qualification[] {
  const doneKeys = new Set(scan.issues.filter((issue) => issue.status === "done").map((issue) => issue.key));
  const openHigh = scan.issues.some((issue) => issue.severity === "high" && issue.status !== "done");
  const readyVendor = scan.accountMatches.some((match) => match.tier === "ready" && /vendor|net30/i.test(match.category));
  const readySecured = scan.accountMatches.some((match) => match.tier === "ready" && /secured/i.test(match.category));
  const readyTraditional = scan.accountMatches.some((match) => matchIsReady(match, scan.issues) && /credit_card|card/i.test(match.category));
  const bankingDone = doneKeys.has("bank-rating") || !scan.issues.some((issue) => issue.key === "bank-rating");

  const items = [
    {
      label: "Starter vendor credit",
      status: readyVendor && !openHigh ? "Likely ready to review" : "Build first",
      note: readyVendor && !openHigh ? "Core identity signals look strong enough to review starter vendor paths. Verify current vendor requirements before applying." : "Finish the high-impact identity, phone, address, website, and banking fixes before using vendor applications.",
    },
    {
      label: "Secured business cards",
      status: readySecured ? "Likely ready to review" : "May need more work",
      note: readySecured ? "A secured-card path may fit if deposit, entity, address, and business banking records are aligned." : "A deposit, business records, address consistency, and business banking should be in place first.",
    },
    {
      label: "Traditional business cards",
      status: readyTraditional && !openHigh ? "Review selectively" : "Do not rush",
      note: readyTraditional && !openHigh ? "Use the card matcher and apply selectively only where the current profile fits the issuer path." : "Traditional bank cards usually need stronger owner credit, business records, and underwriting support.",
    },
    {
      label: "Bank funding / secured lending",
      status: bankingDone && scan.readinessScore >= 70 ? "Ready for bank conversation" : "Build bank file first",
      note: bankingDone && scan.readinessScore >= 70 ? "The business has enough readiness signals for a banker conversation. Verify documents, terms, collateral, and guarantees." : "Build statements, bank relationship, reserves or revenue, and documentation before funding applications.",
    },
  ];

  return items.map((item) => ({ ...item, tone: qualificationTone(item.status) }));
}

function buildNextActions(scan: NonNullable<Awaited<ReturnType<typeof getPlatformData>>["scan"]>) {
  const openIssues = scan.issues.filter((issue) => issue.status !== "done").sort((a, b) => a.impactRank - b.impactRank);
  const actions = openIssues.slice(0, 4).map((issue) => `Complete ${issue.title} before stronger applications — every verified signal raises the readiness score.`);
  if (!actions.length) actions.push("Review all current issuer, vendor, and lender requirements. Apply selectively with matching records only.");
  if (!scan.accountMatches.some((match) => matchIsReady(match, scan.issues))) actions.push("Re-run the scan after saving fixes so the account matcher can re-tier ready-now paths.");
  return actions.slice(0, 5);
}

function profileRows(scan: NonNullable<Awaited<ReturnType<typeof getPlatformData>>["scan"]>): ProfileRow[] {
  const business = scan.business;
  return [
    ["Business name", clean(business.name)],
    ["Legal name", clean(business.legalName)],
    ["Trade name", clean(business.tradeName)],
    ["Entity type", clean(business.entityType)],
    ["Business address", clean(business.address)],
    ["Business phone", clean(business.phone)],
    ["Website", clean(business.website)],
    ["Business email", clean(business.email)],
  ].map(([label, value]) => ({ label, value, complete: value !== "Not saved yet" }));
}

function reportStyles() {
  return [
    "@page{size:letter;margin:.35in}",
    "*{box-sizing:border-box;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}",
    "body{font-family:Inter,Arial,sans-serif;color:#071733;margin:0;background:#eef3f8;line-height:1.5}",
    ".print-wrap{max-width:920px;margin:28px auto;padding:0 18px}",
    ".print-btn{margin:0 0 16px;padding:11px 16px;border-radius:8px;border:1px solid #bfd8ed;background:#1769aa;color:#fff;font-weight:800;cursor:pointer}",
    ".report{background:#fff;border:1px solid #d6e2ee;border-radius:14px;overflow:hidden;box-shadow:0 20px 60px rgba(7,23,51,.12)}",
    ".report-hero{background:linear-gradient(135deg,#071733 0%,#0b3558 74%,#1769aa 100%);color:#fff;padding:28px 32px}",
    ".brand{display:flex;align-items:center;gap:10px;font-weight:900;margin-bottom:22px}.brand-mark{width:38px;height:38px;border-radius:10px;background:#020617;display:grid;place-items:center;border:1px solid rgba(255,255,255,.2)}",
    ".report-hero h1{font-size:34px;line-height:1.05;margin:0 0 10px;letter-spacing:-.03em;color:#fff}.report-hero p{margin:0;color:#d8e9f7}",
    ".report-body{padding:28px 32px;background:#fff}.metric-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-bottom:22px}",
    ".metric{border:1px solid #d6e2ee;border-radius:10px;padding:16px;background:#f8fbff}.metric small{display:block;color:#5b6473;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:.07em}.metric strong{display:block;font-size:24px;margin-top:6px;color:#071733;line-height:1.12}",
    ".progress-card{border:1px solid #bfd8ed;background:#e8f2fb;border-radius:12px;padding:18px;margin-bottom:22px}.progress-top{display:flex;justify-content:space-between;gap:16px;margin-bottom:10px;font-weight:900}.bar{height:10px;border-radius:999px;background:#fff;overflow:hidden;border:1px solid #bfd8ed}.bar span{display:block;height:100%;background:linear-gradient(90deg,#1769aa,#16825f)}",
    ".section-title{display:flex;justify-content:space-between;gap:16px;align-items:end;border-bottom:1px solid #d6e2ee;padding-bottom:8px;margin:24px 0 12px}.section-title h2{font-size:19px;line-height:1.15;margin:0;color:#071733}.section-title span{font-size:12px;color:#5b6473;font-weight:800}",
    ".profile-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.profile-row{border:1px solid #d6e2ee;border-radius:9px;padding:11px 12px;background:#fff}.profile-row.done{border-color:#b8e0ce;background:#f1fbf6}.profile-row.missing{border-color:#ead6a4;background:#fffaf0}.profile-row strong{display:block;font-size:12px;color:#17324d;text-transform:uppercase;letter-spacing:.05em}.profile-row span{display:block;margin-top:4px;color:#071733;font-weight:750}",
    ".qual-grid{display:grid;gap:10px}.qual-card{border:1px solid #d6e2ee;border-radius:10px;padding:14px;background:#fff}.qual-card>div{display:flex;justify-content:space-between;gap:12px;align-items:start}.qual-card strong{font-size:15px;color:#071733}.qual-card span{border-radius:999px;padding:5px 9px;font-size:11px;font-weight:900;white-space:nowrap}.qual-card.ready{border-color:#b8e0ce}.qual-card.ready span{background:#e7f5ee;color:#16825f}.qual-card.review span{background:#e8f2fb;color:#0b3558}.qual-card.wait{border-color:#f0d39a}.qual-card.wait span{background:#fff4df;color:#9a6415}.qual-card p{margin:8px 0 0;color:#334155;font-size:13px;line-height:1.6}",
    ".next-list{list-style:none;padding:0;margin:0;display:grid;gap:9px}.next-list li{display:grid;grid-template-columns:28px 1fr;gap:10px;align-items:start;border:1px solid #d6e2ee;border-radius:9px;padding:12px;background:#f8fbff}.next-list b{width:28px;height:28px;border-radius:8px;background:#0b3558;color:#fff;display:grid;place-items:center}.next-list span{color:#17324d;font-weight:800;line-height:1.45}",
    ".safe-note{margin-top:24px;border-top:1px solid #d6e2ee;padding-top:14px;color:#5b6473;font-size:12px;line-height:1.6}.report-footer{background:#f8fbff;border-top:1px solid #d6e2ee;padding:16px 32px;color:#5b6473;font-size:12px;display:flex;justify-content:space-between;gap:12px;align-items:center}.report-footer strong{color:#071733}",
    "@media(max-width:760px){.metric-grid,.profile-grid{grid-template-columns:1fr}.report-hero,.report-body,.report-footer{padding-left:20px;padding-right:20px}.report-footer{display:grid}.qual-card>div{display:grid}}@media print{.print-btn{display:none!important}.print-wrap{margin:0 auto;padding:0}.report{box-shadow:none}.report-hero,.metric,.progress-card,.profile-row,.qual-card,.next-list li,.report-footer{break-inside:avoid;page-break-inside:avoid}}",
  ].join("");
}

function buildReportText(args: { generated: string; stage: string; path: string; profile: ProfileRow[]; qualifications: Qualification[]; nextActions: string[]; progress: number; score: number; grade: string }) {
  const lines = [
    "Verge Five member progress report",
    "",
    `Generated: ${args.generated}`,
    `Readiness stage: ${args.stage}`,
    `Assigned path: ${args.path}`,
    `Readiness score: ${args.score}/100 (${args.grade})`,
    `Platform progress: ${args.progress}%`,
    "",
    "Business profile snapshot",
    ...args.profile.map((row) => `${row.label}: ${row.value}`),
    "",
    "Likely qualification review",
    ...args.qualifications.map((item) => `${item.label}: ${item.status} - ${item.note}`),
    "",
    "Recommended next actions",
    ...args.nextActions.map((item, index) => `${index + 1}. ${item}`),
    "",
    "Important: this report is a progress snapshot and readiness guide, not a guarantee of approval. Requirements, reporting, deposits, guarantees, rates, and underwriting rules can change. Platform lessons, vendor lists, and proprietary training remain inside Verge Five.",
  ];
  return lines.join("\n");
}

function buildReportHtml(args: { generated: string; stage: string; profile: ProfileRow[]; qualifications: Qualification[]; nextActions: string[]; progress: number; profileDone: number; profileTotal: number }) {
  const profileRowsHtml = args.profile.map((row) => `<div class="profile-row ${row.complete ? "done" : "missing"}"><strong>${escapeHtml(row.label)}</strong><span>${escapeHtml(row.value)}</span></div>`).join("");
  const qualificationHtml = args.qualifications.map((item) => `<article class="qual-card ${item.tone}"><div><strong>${escapeHtml(item.label)}</strong><span>${escapeHtml(item.status)}</span></div><p>${escapeHtml(item.note)}</p></article>`).join("");
  const nextHtml = args.nextActions.map((item, index) => `<li><b>${index + 1}</b><span>${escapeHtml(item)}</span></li>`).join("");
  return `<!doctype html><html><head><title>Verge Five member progress report</title><style>${reportStyles()}</style></head><body><div class="print-wrap"><button class="print-btn" onclick="window.print()">Print report</button><section class="report"><header class="report-hero"><div class="brand"><span class="brand-mark">VF</span><span>Verge Five</span></div><h1>Member progress report</h1><p>Full platform readiness snapshot</p></header><main class="report-body"><div class="metric-grid"><div class="metric"><small>Generated</small><strong>${escapeHtml(args.generated)}</strong></div><div class="metric"><small>Readiness stage</small><strong>${escapeHtml(args.stage)}</strong></div><div class="metric"><small>Profile captured</small><strong>${args.profileDone} / ${args.profileTotal}</strong></div></div><section class="progress-card"><div class="progress-top"><span>Platform progress</span><span>${args.progress}%</span></div><div class="bar"><span style="width:${Math.max(0, Math.min(100, args.progress))}%"></span></div></section><div class="section-title"><h2>Business profile snapshot</h2><span>Member-entered progress</span></div><section class="profile-grid">${profileRowsHtml}</section><div class="section-title"><h2>Likely qualification review</h2><span>Readiness guide</span></div><section class="qual-grid">${qualificationHtml}</section><div class="section-title"><h2>Recommended next actions</h2><span>Do next</span></div><ol class="next-list">${nextHtml}</ol><p class="safe-note"><strong>Important:</strong> this report is a progress snapshot and readiness guide, not a guarantee of approval. Requirements, reporting, deposits, guarantees, rates, and underwriting rules can change. Platform lessons, vendor lists, and proprietary training remain inside Verge Five.</p></main><footer class="report-footer"><span><strong>Verge Five LLC</strong> - From vision to venture.</span><span>Member-safe report: no lesson content exported.</span></footer></section></div></body></html>`;
}

export default async function ReportCardPage() {
  const { user, allowed, scan, readiness, pageProgress } = await getPlatformData();
  if (!allowed) return <PlatformPaywall />;

  if (!scan) {
    return (
      <PlatformShell user={user} active="Report Card">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-vfText-muted">Readiness summary</p>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-[-0.05em] text-brand-navy md:text-5xl">Report Card</h1>
          <Card className="mt-8"><CardContent className="p-8"><p className="font-bold text-vfText-body">Run a scan first to create your readiness report.</p><Button asChild className="mt-4"><Link href="/scan/">Run Scan</Link></Button></CardContent></Card>
        </div>
      </PlatformShell>
    );
  }

  const generated = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const profile = profileRows(scan);
  const profileDone = profile.filter((row) => row.complete).length;
  const qualifications = buildQualifications(scan);
  const nextActions = buildNextActions(scan);
  const progress = pageProgress.percent;
  const stage = readiness.label;
  const reportText = buildReportText({ generated, stage, path: readiness.assignedPath, profile, qualifications, nextActions, progress, score: readiness.score, grade: readiness.label });
  const reportHtml = buildReportHtml({ generated, stage, profile, qualifications, nextActions, progress, profileDone, profileTotal: profile.length });
  const snapshot = {
    businessName: scan.business.name,
    generated,
    readinessStage: stage,
    readinessScore: scan.readinessScore,
    grade: scan.grade,
    profileDone,
    profileTotal: profile.length,
    progress,
    qualifications,
    nextActions,
  };

  return (
    <PlatformShell user={user} active="Report Card">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-vfText-muted">Member-safe report</p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-[-0.05em] text-brand-navy md:text-5xl">Report Card</h1>
        <p className="mt-3 max-w-3xl text-vfText-body">This mirrors the original Verge Five progress report layout: printable summary, readiness guide, business snapshot, qualification review, next actions, and no exported lesson/vendor training content.</p>

        <section className="mt-8 overflow-hidden rounded-[1.75rem] border border-vfBorder bg-white shadow-soft">
          <header className="bg-[linear-gradient(135deg,#071733_0%,#0b3558_74%,#1769aa_100%)] p-7 text-white md:p-9">
            <div className="flex items-center gap-3 font-extrabold"><span className="grid size-10 place-items-center rounded-xl border border-white/20 bg-black/45 text-xs">VF</span><span>Verge Five</span></div>
            <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_190px] lg:items-end">
              <div>
                <h2 className="font-display text-4xl font-bold tracking-[-0.05em] md:text-5xl">Member progress report</h2>
                <p className="mt-3 text-[#D8E9F7]">Full platform readiness snapshot for {scan.business.name}.</p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 text-sm font-bold text-[#D8E9F7]">
                <p className="text-xs uppercase tracking-[0.16em] text-[#BDEAF6]">Generated</p>
                <p className="mt-2 text-xl text-white">{generated}</p>
              </div>
            </div>
          </header>

          <div className="p-6 md:p-8">
            <div className="grid gap-3 md:grid-cols-3">
              <MetricCard label="Readiness stage" value={stage} />
              <MetricCard label="Assigned path" value={readiness.assignedPath} />
              <MetricCard label="Score" value={`${readiness.score}/100`} />
            </div>

            <section className="mt-6 rounded-2xl border border-[#BFD8ED] bg-[#E8F2FB] p-5">
              <div className="flex flex-wrap items-center justify-between gap-4 font-extrabold text-brand-navy"><span>Platform progress</span><span>{progress}%</span></div>
              <ProgressBar value={progress} className="mt-4 bg-white" />
            </section>

            <section className="mt-8 grid gap-6 lg:grid-cols-[310px_minmax(0,1fr)]">
              <Card><CardContent className="grid place-items-center p-8 text-center"><ReadinessRing value={readiness.score} size={164} color={readiness.color} /><h2 className="mt-5 font-display text-2xl font-bold" style={{ color: readiness.color }}>{readiness.label}</h2><p className="mt-2 text-vfText-body">{readiness.doneCount} of {readiness.total} signals clean · {profileDone} of {profile.length} profile fields saved.</p></CardContent></Card>
              <div>
                <SectionTitle title="Business profile snapshot" meta="Member-entered progress" />
                <div className="grid gap-2 sm:grid-cols-2">
                  {profile.map((row) => <ProfileTile key={row.label} row={row} />)}
                </div>
              </div>
            </section>

            <section className="mt-8">
              <SectionTitle title="Likely qualification review" meta="Readiness guide" />
              <div className="grid gap-3">
                {qualifications.map((item) => <QualificationCard key={item.label} item={item} />)}
              </div>
            </section>

            <section className="mt-8">
              <SectionTitle title="Recommended next actions" meta="Do next" />
              <ol className="grid gap-3">
                {nextActions.map((item, index) => <li key={item} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3 rounded-xl border border-vfBorder bg-[#F8FBFF] p-4"><b className="grid size-8 place-items-center rounded-lg bg-[#0B3558] text-sm text-white">{index + 1}</b><span className="font-bold leading-6 text-[#17324D]">{item}</span></li>)}
              </ol>
            </section>

            <p className="mt-8 border-t border-vfBorder pt-4 text-xs leading-6 text-vfText-muted"><b>Important:</b> this report is a progress snapshot and readiness guide, not a guarantee of approval. Requirements, reporting, deposits, guarantees, rates, and underwriting rules can change. Platform lessons, vendor lists, and proprietary training remain inside Verge Five.</p>
          </div>

          <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-vfBorder bg-[#F8FBFF] px-6 py-5 text-sm text-vfText-body md:px-8">
            <span><b className="text-brand-navy">Verge Five LLC</b> - From vision to venture.</span>
            <span>Member-safe report: no lesson content exported.</span>
          </footer>
        </section>

        <div className="mt-6"><ReportDownloadButton reportText={reportText} reportHtml={reportHtml} readinessStage={stage} snapshot={snapshot} /></div>
      </div>
    </PlatformShell>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-vfBorder bg-[#F8FBFF] p-4"><p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-vfText-muted">{label}</p><p className="mt-2 font-display text-2xl font-bold leading-tight text-brand-navy">{value}</p></div>;
}

function SectionTitle({ title, meta }: { title: string; meta: string }) {
  return <div className="mb-3 flex flex-wrap items-end justify-between gap-3 border-b border-vfBorder pb-2"><h2 className="font-display text-2xl font-bold text-brand-navy">{title}</h2><span className="text-xs font-extrabold text-vfText-muted">{meta}</span></div>;
}

function ProfileTile({ row }: { row: ProfileRow }) {
  return <div className={`rounded-xl border p-4 ${row.complete ? "border-ready-border bg-ready-surface" : "border-[#EAD6A4] bg-[#FFFAF0]"}`}><p className="text-xs font-extrabold uppercase tracking-[0.08em] text-[#17324D]">{row.label}</p><p className="mt-1 font-bold text-brand-navy">{row.value}</p></div>;
}

function QualificationCard({ item }: { item: Qualification }) {
  const badge = item.tone === "ready" ? "ready" : item.tone === "wait" ? "unlock" : "info";
  return <article className={`rounded-xl border bg-white p-4 ${item.tone === "ready" ? "border-ready-border" : item.tone === "wait" ? "border-[#F0D39A]" : "border-vfBorder"}`}><div className="flex flex-wrap items-start justify-between gap-3"><h3 className="font-display text-lg font-bold text-brand-navy">{item.label}</h3><Badge variant={badge}>{item.status}</Badge></div><p className="mt-2 text-sm leading-6 text-vfText-body">{item.note}</p></article>;
}