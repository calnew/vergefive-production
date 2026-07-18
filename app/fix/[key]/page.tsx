export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import Link from "next/link";

import { updateFixStatus } from "@/app/actions/issues";
import { BankRatingCalculator } from "@/components/platform/bank-rating-calculator";
import { FixChecklist } from "@/components/platform/fix-checklist";
import { PlatformShell } from "@/components/platform/platform-shell";
import { PlatformPaywall } from "@/components/platform/paywall";
import { ImpactPill, StatusPill } from "@/components/platform/pills";
import { StatePicker } from "@/components/platform/state-picker";
import { Button, Card, CardContent } from "@/components/ui";
import { beforeYouLeaveText, fixPlaybooks, getLessonNavigation, getLessonSection } from "@/lib/platform-catalog";
import { getPlatformData } from "@/lib/platform-data";

export default async function FixPage({ params, searchParams }: { params: Promise<{ key: string }>; searchParams: Promise<{ completed?: string }> }) {
  const [{ key }, { completed }] = await Promise.all([params, searchParams]);
  const { user, allowed, scan, fixStatuses, lessonProgress } = await getPlatformData();
  if (!allowed) return <PlatformPaywall />;

  const content = getLessonSection(key);
  if (!content) redirect("/fix-list/");

  const playbook = fixPlaybooks[content.key] ?? fixPlaybooks[key];
  const issueKeys = Array.from(new Set([key, content.key, ...(key === "website" || content.key === "website" ? ["email"] : [])]));
  const issue = scan?.issues.find((item) => issueKeys.includes(item.key) && item.status !== "done");
  const status = fixStatuses[content.key] ?? "todo";
  const navigation = getLessonNavigation(key);
  const justCompleted = completed === "1" && status === "done";

  const moduleOptions = content.moduleOptions ?? [];
  const optionIntro = content.optionIntro ?? { kicker: "Recommended setup options", title: "Choose how to handle this", sub: "Do it yourself, use a recommended provider, or request help." };
  const hasOptions = moduleOptions.length > 0;
  const scanFinding = issue?.detail ?? playbook?.scanFinding;
  const pagePath = `/fix/${content.key}/`;
  const nextLink = navigation.next ? { href: `/fix/${navigation.next.key}/`, label: navigation.next.title } : { href: "/account-matches/", label: "Account Matches" };

  return (
    <PlatformShell user={user} active="Fix List" businessName={scan?.business.name}>
      <div className="mx-auto max-w-[860px]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-vfText-muted">{content.phase} Â· {content.module}</p>
          <div className="flex gap-2">
            <Button asChild size="sm" variant="outline"><Link href={navigation.previous ? `/fix/${navigation.previous.key}/` : "/fix-list/"}>â† {navigation.previous ? "Previous" : "Fix list"}</Link></Button>
            <Button asChild size="sm" variant="outline"><Link href={nextLink.href}>Next â†’</Link></Button>
          </div>
        </div>
        <div className="mt-3 overflow-hidden rounded-full bg-white ring-1 ring-vfBorder">
          <div className="h-2 rounded-full bg-[linear-gradient(90deg,#2563EB,#22C55E)]" style={{ width: `${navigation.percent}%` }} />
        </div>

        <div className="mt-5 grid gap-5">
          {justCompleted ? (
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-[linear-gradient(135deg,#15803D,#22C55E)] p-6 text-white shadow-soft">
              <div>
                <p className="font-display text-lg font-bold">Nice â€” this fix is marked complete.</p>
                <p className="mt-1 text-sm text-white/85">Your readiness score has been updated.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline" className="border-white/40 bg-white/10 text-white hover:bg-white/20"><Link href="/dashboard/">Back to Dashboard</Link></Button>
                <Button asChild className="bg-white text-ready hover:bg-white/90"><Link href={nextLink.href}>Continue to {nextLink.label}</Link></Button>
              </div>
            </div>
          ) : null}

          <Card>
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill status={status} />
                {issue ? <ImpactPill severity={issue.severity} /> : null}
              </div>
              <h1 className="mt-3 font-display text-2xl font-bold tracking-[-0.02em] text-vfText-strong md:text-[27px]">{content.title}</h1>
              <p className="mt-2 max-w-2xl leading-7 text-vfText-body">{content.description}</p>
              {scanFinding ? (
                <div className="mt-4 flex gap-3 rounded-2xl border border-unlock-border bg-unlock-surface p-4">
                  <span aria-hidden className="text-unlock">âš </span>
                  <p className="text-sm font-bold leading-6 text-unlock"><span className="uppercase tracking-[0.14em]">Scan finding</span> Â· {scanFinding}</p>
                </div>
              ) : null}
              <div className="mt-5 flex flex-wrap gap-2">
                {status === "done" ? (
                  <form action={updateFixStatus.bind(null, content.key, "todo", pagePath)}>
                    <Button type="submit" variant="outline">Marked Complete âœ“ â€” undo</Button>
                  </form>
                ) : (
                  <form action={updateFixStatus.bind(null, content.key, "done", `${pagePath}?completed=1`)}>
                    <Button type="submit" className="bg-ready hover:bg-[#136B33]">Mark Complete</Button>
                  </form>
                )}
                {hasOptions ? <Button asChild variant="outline"><a href="#vf-options">Choose a provider</a></Button> : null}
                <Button asChild variant="outline"><Link href={`/support/?topic=fix&from=${encodeURIComponent(content.key)}`}>Get Help</Link></Button>
                <Button asChild variant="outline"><Link href="/dashboard/">Back to Dashboard</Link></Button>
              </div>
            </CardContent>
          </Card>

          {content.videos.map((video, index) => (
            <Card key={video.src}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <span className={`grid size-9 place-items-center rounded-xl font-display text-sm font-bold text-white ${index === 0 ? "bg-brand-blue" : "bg-brand-navy"}`}>{index + 1}</span>
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-vfText-muted">Watch step {index + 1}</p>
                    <h2 className="font-display text-base font-bold text-vfText-strong">{video.title}</h2>
                  </div>
                </div>
                <video className="mx-auto mt-4 aspect-video w-full max-w-[560px] rounded-2xl bg-black object-cover" controls preload="metadata" poster={video.poster}>
                  <source src={video.src} type="video/webm" />
                  Your browser can&apos;t play this lesson video.
                </video>
              </CardContent>
            </Card>
          ))}

          <Card>
            <CardContent className="p-6 md:p-7">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-blue-50 text-lg" aria-hidden>ðŸ’¡</span>
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-brand-blue">Why this matters</p>
                  <h2 className="font-display text-lg font-bold text-vfText-strong">This signal gets compared before anyone approves you.</h2>
                </div>
              </div>
              <div className="mt-4 grid gap-3">
                {content.why.map((item) => <p key={item} className="rounded-2xl bg-surface-muted p-4 text-sm leading-6 text-vfText-body">{item}</p>)}
              </div>
            </CardContent>
          </Card>

          <div className="rounded-2xl bg-[linear-gradient(135deg,#0E1A2B,#1C1210)] p-6 text-white shadow-soft md:p-7">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#F3B27A]">Do not skip</p>
            <h2 className="mt-2 font-display text-lg font-bold">{content.warningTitle}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-ondark-body">{content.warning}</p>
          </div>

          {hasOptions ? (
            <Card id="vf-options" className="scroll-mt-6">
              <CardContent className="p-6 md:p-7">
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-brand-blue">{optionIntro.kicker}</p>
                <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h2 className="font-display text-lg font-bold text-vfText-strong">{optionIntro.title}</h2>
                    <p className="mt-1 max-w-2xl text-sm leading-6 text-vfText-body">{optionIntro.sub}</p>
                  </div>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.12em] text-brand-blue">Curated choices</span>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {moduleOptions.map((option) => (
                    <div key={option.name} className="flex min-h-[220px] flex-col rounded-2xl border border-vfBorder bg-white p-4 shadow-[0_12px_30px_rgba(15,27,45,0.05)]" style={{ borderTop: `4px solid ${option.brandColor ?? "#2563EB"}` }}>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-flex w-fit rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${option.kind === "help" ? "bg-unlock-surface text-unlock" : option.kind === "provider" ? "bg-ready-surface text-ready" : "bg-blue-50 text-brand-blue"}`}>{option.badgeText}</span>
                        {option.price ? <span className="text-xs font-bold text-vfText-muted">{option.price}</span> : null}
                      </div>
                      <h3 className="mt-3 font-display text-base font-bold text-vfText-strong">{option.name}</h3>
                      <p className="mt-1 text-sm leading-6 text-vfText-body">{option.description}</p>
                      {option.note ? <p className="mt-3 rounded-xl bg-surface-muted px-3 py-2 text-xs font-bold leading-5 text-vfText-body">{option.note}</p> : null}
                      <div className="mt-auto pt-4">
                        {option.bestFor ? <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.12em] text-vfText-muted">Best for: {option.bestFor}</p> : null}
                        {option.href ? (
                          option.href.startsWith("/") ? (
                            <Link href={option.href} className="text-sm font-bold text-brand-blue hover:underline">{option.openLabel ?? "Open option"} &gt;</Link>
                          ) : (
                            <a href={option.href} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-brand-blue hover:underline">{option.openLabel ?? "Open site"} &gt;</a>
                          )
                        ) : (
                          <Link href={`/support/?topic=fix&from=${encodeURIComponent(content.key)}&option=${encodeURIComponent(option.name)}`} className="text-sm font-bold text-brand-blue hover:underline">Request help &gt;</Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : null}
          {content.key === "sos" ? (
            <Card><CardContent className="p-6 md:p-7"><StatePicker /></CardContent></Card>
          ) : null}
          {content.key === "bank-rating" ? (
            <Card><CardContent className="p-6 md:p-7"><BankRatingCalculator /></CardContent></Card>
          ) : null}

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
            <Card>
              <CardContent className="p-6 md:p-7">
                <FixChecklist
                  pagePath={pagePath}
                  pageTitle={content.title}
                  breadcrumb={`${content.phase} Â· ${content.module}`}
                  items={content.checklist}
                  proofItems={content.proof}
                  initialChecked={lessonProgress[pagePath] ?? []}
                />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 md:p-7">
                <h2 className="font-display text-lg font-bold text-vfText-strong">Private proof file</h2>
                <div className="mt-3 grid gap-2">
                  {content.proof.map((item) => <div key={item} className="rounded-xl bg-ready-surface px-4 py-3 text-sm font-bold text-ready">{item}</div>)}
                </div>
                {playbook?.unlocks.length ? (
                  <>
                    <h3 className="mt-5 font-display text-base font-bold text-vfText-strong">Completing this unlocks</h3>
                    <div className="mt-2 grid gap-2">
                      {playbook.unlocks.map((item) => <div key={item} className="rounded-xl bg-surface-muted px-4 py-3 text-sm font-bold text-vfText-body">{item}</div>)}
                    </div>
                  </>
                ) : null}
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-[linear-gradient(135deg,#EEF3FE,#E3ECFD)] p-6">
            <p className="max-w-xl text-sm font-bold leading-6 text-vfText-body">{beforeYouLeaveText}</p>
            <Button asChild><Link href={nextLink.href}>Next: {nextLink.label} â†’</Link></Button>
          </div>
        </div>
      </div>
    </PlatformShell>
  );
}




