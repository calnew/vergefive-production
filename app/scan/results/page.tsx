export const dynamic = "force-dynamic";

import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCloudflareContext } from "@opennextjs/cloudflare";

import { getAuth } from "@/functions/_lib/auth.js";
import { Badge, Button, Card, CardContent, ReadinessRing } from "@/components/ui";
import { gradeForScore, issuePointMap, issuesFromResult, matchesFromResult } from "@/lib/platform-data";
import type { D1Env } from "@/lib/d1-auth";

function parseJson(value: unknown) {
  if (!value) return {};
  try {
    return JSON.parse(String(value)) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function cookieHeader(items: { name: string; value: string }[]) {
  return items.map((item) => `${item.name}=${encodeURIComponent(item.value)}`).join("; ");
}

function signalsCleanFromResult(result: Record<string, unknown>, score: number) {
  const signals = result.signals && typeof result.signals === "object" ? Object.values(result.signals as Record<string, unknown>) : [];
  if (signals.length) return signals.filter(Boolean).length;
  return Math.max(0, Math.min(9, Math.round((score / 100) * 9)));
}

export default async function ScanResultsPage() {
  const { env } = await getCloudflareContext({ async: true });
  const d1Env = env as D1Env;
  const cookieStore = await cookies();
  const authRequest = new Request("https://vergefive.local/scan-results", {
    headers: { cookie: cookieHeader(cookieStore.getAll()) },
  });
  const session = await getAuth(authRequest, d1Env);
  if (session?.active) {
    redirect("/dashboard/");
  }

  const latestScanId = cookieStore.get("vf_latest_scan_id")?.value;
  const lightUserId = cookieStore.get("vf_light_user_id")?.value;
  const allowedUserId = session?.user?.id ?? lightUserId;

  if (!allowedUserId) redirect("/scan");

  const audit = latestScanId
    ? await d1Env.DB.prepare(
        `select id, user_id, business_name, score, label, result_json, created_at
         from visibility_audits
         where id = ? and user_id = ?
         limit 1`
      ).bind(latestScanId, allowedUserId).first<Record<string, unknown>>().catch(() => null)
    : await d1Env.DB.prepare(
        `select id, user_id, business_name, score, label, result_json, created_at
         from visibility_audits
         where user_id = ?
         order by created_at desc
         limit 1`
      ).bind(allowedUserId).first<Record<string, unknown>>().catch(() => null);

  if (!audit) redirect("/scan");

  const profile = await d1Env.DB.prepare(
    "select business_name, entity_type, address, phone, website, email from business_profiles where user_id = ? limit 1"
  ).bind(allowedUserId).first<Record<string, unknown>>().catch(() => null);

  const result = parseJson(audit.result_json);
  const score = Number(audit.score || result.score || result.readinessScore || 56);
  const issues = issuesFromResult(result).sort((a, b) => a.impactRank - b.impactRank);
  const accountMatches = matchesFromResult(result);
  const scan = {
    id: String(audit.id),
    business: {
      name: String(audit.business_name || result.businessName || profile?.business_name || "Your business"),
    },
    readinessScore: Math.max(0, Math.min(100, score)),
    grade: String(audit.label || result.label || result.grade || gradeForScore(score)),
    signalsTotal: Number(result.signalsTotal || 9),
    signalsClean: signalsCleanFromResult(result, score),
    issues,
    accountMatches,
  };

  const readyCount = scan.accountMatches.filter((match) => match.tier === "ready").length;
  const unlockCount = scan.accountMatches.filter((match) => match.tier === "unlock_next").length;

  return (
    <main className="min-h-screen bg-surface-page px-5 py-8 md:px-8">
      <nav className="mx-auto mb-8 flex max-w-6xl items-center justify-between">
        <Link href="/" className="font-display text-lg font-bold text-brand-navy">Verge Five</Link>
        <Link href="/login" className="rounded-xl border border-vfBorder bg-white px-4 py-2 text-sm font-bold text-brand-blue">Log in</Link>
      </nav>

      <section className="mx-auto max-w-6xl">
        <div className="mb-8 rounded-3xl bg-[linear-gradient(160deg,#0E1A2B,#16325A)] p-8 text-white md:p-10">
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#7FA3E6]">Your free scan result</p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-[-0.05em] md:text-5xl">{scan.business.name} has {scan.issues.length} problem areas to fix.</h1>
          <p className="mt-4 max-w-3xl leading-7 text-[#AEBFD8]">Your score, grade, signal count, and issue titles are visible now. The exact fix instructions and account unlock list are gated.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <Card>
            <CardContent className="p-7">
              <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left lg:flex-col lg:text-center xl:flex-row xl:text-left">
                <ReadinessRing value={scan.readinessScore} size={136} />
                <div>
                  <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-vfText-muted">Readiness grade</p>
                  <h2 className="mt-1 font-display text-4xl font-bold text-brand-navy">{scan.grade}</h2>
                  <p className="mt-2 text-vfText-body">{scan.signalsClean} of {scan.signalsTotal} clean signals.</p>
                </div>
              </div>
              <div className="mt-7 rounded-2xl bg-unlock-surface p-5 text-unlock">
                <p className="font-display text-2xl font-bold">{scan.issues.length} problem areas found</p>
                <p className="mt-1 text-sm font-bold">Unlocking the fixes can add up to {scan.issues.reduce((sum, issue) => sum + (issuePointMap[issue.key] ?? 4), 0)} readiness points.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-7">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-display text-2xl font-bold text-brand-navy">Issue titles you can fix</h2>
                <Badge variant="flagged">{scan.issues.length} flagged</Badge>
              </div>
              <div className="grid gap-3">
                {scan.issues.map((issue) => (
                  <div key={issue.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 rounded-2xl border border-vfBorder bg-white p-4">
                    <div className="min-w-0">
                      <h3 className="font-display text-lg font-bold text-brand-navy">{issue.title}</h3>
                <p className="mt-1 text-sm text-vfText-body">Could add up to <b>{issuePointMap[issue.key] ?? 4} points</b> when corrected.</p>
                    </div>
                    <Badge variant={issue.severity === "high" ? "flagged" : "unlock"}>{issue.severity}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <section className="relative mt-8 overflow-hidden rounded-3xl border border-vfBorder bg-white p-6 shadow-soft md:p-8">
          <div className="grid gap-6 blur-[5px] lg:grid-cols-3">
            {scan.issues.map((issue) => (
              <div key={issue.id} className="rounded-2xl border border-vfBorder bg-surface-muted p-5">
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-blue">Locked fix</p>
                <h3 className="mt-3 font-display text-xl font-bold text-brand-navy">{issue.title}</h3>
                <p className="mt-3 text-sm leading-6 text-vfText-body">Step-by-step instructions, provider options, proof checklist, and completion tracking are locked.</p>
              </div>
            ))}
            {scan.accountMatches.map((match) => (
              <div key={match.id} className="rounded-2xl border border-vfBorder bg-surface-muted p-5">
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-ready">Account match</p>
                <h3 className="mt-3 font-display text-xl font-bold text-brand-navy">{match.name}</h3>
                <p className="mt-3 text-sm leading-6 text-vfText-body">Reason, unlock notes, and application guidance are locked.</p>
              </div>
            ))}
            {["Business Identity", "Legal Setup", "Banking Foundation", "Approval Readiness"].map((module) => (
              <div key={module} className="rounded-2xl border border-vfBorder bg-surface-muted p-5">
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-unlock">Locked buildout</p>
                <h3 className="mt-3 font-display text-xl font-bold text-brand-navy">{module}</h3>
                <p className="mt-3 text-sm leading-6 text-vfText-body">The guided lesson path and completion checklist unlock after upgrade.</p>
              </div>
            ))}
          </div>
          <div className="absolute inset-0 grid place-items-center bg-white/65 p-6 backdrop-blur-sm">
            <div className="max-w-xl rounded-3xl bg-[#0E1A2B] p-8 text-center text-white shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white/10 text-xs font-extrabold tracking-[0.18em]">LOCKED</div>
              <h2 className="mt-5 font-display text-3xl font-bold tracking-[-0.04em]">Unlock your fixes and 90+ account matches.</h2>
              <p className="mt-3 text-sm leading-6 text-[#AEBFD8]">Your free scan found {scan.issues.length} problem areas, {readyCount} ready-now matches, and {unlockCount} unlock-next matches. Upgrade to see the exact correction path.</p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button asChild size="lg"><Link href="/signup?plan=self-serve">Unlock my fixes — $597/yr</Link></Button>
                <Button asChild size="lg" variant="outline" className="bg-white"><Link href="/#pricing">See plans</Link></Button>
              </div>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
