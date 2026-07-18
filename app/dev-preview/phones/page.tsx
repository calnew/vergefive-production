export const dynamic = "force-dynamic";

import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { Card, CardContent } from "@/components/ui";
import { getLessonSection } from "@/lib/platform-catalog";

const ALLOWED_HOSTS = new Set([
  "vergefive-next-dev.turncomvoice.workers.dev",
  "localhost:3000",
  "127.0.0.1:3000",
]);

export default async function PhoneModuleDevPreviewPage() {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") || "";
  if (!ALLOWED_HOSTS.has(host)) notFound();

  const content = getLessonSection("phones");
  if (!content) notFound();

  const optionIntro = content.optionIntro ?? {
    kicker: "Choose your phone setup",
    title: "Business phone options",
    sub: "Compare the monthly cost and how much setup work you want to handle yourself.",
  };
  const moduleOptions = content.moduleOptions ?? [];

  return (
    <main className="min-h-screen bg-[#F1F4F9] px-5 py-10 text-vfText-strong md:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-3xl bg-[linear-gradient(135deg,#0E1A2B,#16325A)] p-7 text-white shadow-soft md:p-10">
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-[#7FA3E6]">Dev preview only</p>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-[-0.04em] md:text-5xl">{content.title}</h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-[#C7D5EA]">This preview exists so the approved three-option module layout can be reviewed without opening the raw prototype file or logging into the member backend.</p>
        </div>

        <Card id="vf-options" className="mt-6">
          <CardContent className="p-6 md:p-8">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-brand-blue">{optionIntro.kicker}</p>
            <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl font-bold text-vfText-strong">{optionIntro.title}</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-vfText-body">{optionIntro.sub}</p>
              </div>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.12em] text-brand-blue">Curated choices</span>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {moduleOptions.map((option) => (
                <article key={option.name} className="flex min-h-[245px] flex-col rounded-2xl border border-vfBorder bg-white p-5 shadow-[0_12px_30px_rgba(15,27,45,0.06)]" style={{ borderTop: `5px solid ${option.brandColor ?? "#2563EB"}` }}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex w-fit rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${option.kind === "provider" ? "bg-ready-surface text-ready" : "bg-blue-50 text-brand-blue"}`}>{option.badgeText}</span>
                    {option.price ? <span className="text-xs font-bold text-vfText-muted">{option.price}</span> : null}
                  </div>
                  <h3 className="mt-4 font-display text-xl font-bold text-vfText-strong">{option.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-vfText-body">{option.description}</p>
                  {option.note ? <p className="mt-4 rounded-xl bg-surface-muted px-3 py-2 text-xs font-bold leading-5 text-vfText-body">{option.note}</p> : null}
                  <p className="mt-auto pt-4 text-xs font-extrabold uppercase tracking-[0.12em] text-vfText-muted">Best for: {option.bestFor}</p>
                </article>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 rounded-2xl bg-white p-5 text-sm leading-6 text-vfText-body ring-1 ring-vfBorder">
          Use this preview for layout review only. The real member route remains protected at <span className="font-bold text-brand-blue">/fix/phones</span> and should be tested after login.
        </div>
      </div>
    </main>
  );
}

