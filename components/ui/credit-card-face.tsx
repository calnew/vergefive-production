import * as React from "react";

import { cn } from "@/lib/utils";

type CreditCardFaceProps = React.HTMLAttributes<HTMLDivElement> & {
  memberName: string;
  cardTypeLabel: string;
  maskedNumber?: string;
  /** CSS gradient string (e.g. "linear-gradient(135deg,#0E1A2B,#2563EB)") or Tailwind gradient classes. */
  gradient?: string;
  locked?: boolean;
};

const DEFAULT_GRADIENT = "linear-gradient(135deg,#0E1A2B,#2563EB)";

function CreditCardFace({
  memberName,
  cardTypeLabel,
  maskedNumber = "•••• •••• •••• ••••",
  gradient = DEFAULT_GRADIENT,
  locked = false,
  className,
  style,
  ...props
}: CreditCardFaceProps) {
  const isCssGradient = gradient.includes("(");
  return (
    <div
      className={cn("relative aspect-[1.585] w-full overflow-hidden rounded-xl p-4 text-white shadow-soft", !isCssGradient && `bg-gradient-to-br ${gradient}`, className)}
      style={isCssGradient ? { backgroundImage: gradient, ...style } : style}
      {...props}
    >
      <div className="pointer-events-none absolute -right-10 -top-14 size-40 rounded-full bg-white/10 blur-2xl" aria-hidden />
      <div className="relative z-10 flex h-full flex-col justify-between">
        <div className="flex items-start justify-between gap-3">
          <div className={cn("h-7 w-10 rounded-md border border-white/30 shadow-inner", locked ? "bg-gradient-to-br from-slate-300 to-slate-500" : "bg-gradient-to-br from-amber-100 to-amber-400")} />
          <span className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] backdrop-blur">{cardTypeLabel}</span>
        </div>
        <div>
          <div className="font-display text-base font-bold tracking-[0.2em]">{maskedNumber}</div>
          <div className="mt-2 flex items-end justify-between gap-3 text-[9px] font-bold uppercase tracking-[0.16em] text-white/80">
            <span className="min-w-0">
              <span className="block text-[8px] text-white/60">Business member</span>
              <span className="block truncate text-[10px] text-white">{memberName}</span>
            </span>
            <span>Verge Five</span>
          </div>
        </div>
      </div>
      {locked ? (
        <div className="absolute inset-0 z-20 grid place-items-center bg-[#0E1A2B]/70 text-center backdrop-blur-sm">
          <div className="flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-xs font-bold">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>
            Locked
          </div>
        </div>
      ) : null}
    </div>
  );
}

export { CreditCardFace };
