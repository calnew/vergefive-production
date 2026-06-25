import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type CreditCardFaceProps = React.HTMLAttributes<HTMLDivElement> & {
  memberName: string;
  cardTypeLabel: string;
  maskedNumber?: string;
  gradient?: string;
  locked?: boolean;
};

function CreditCardFace({
  memberName,
  cardTypeLabel,
  maskedNumber = "---- ---- ---- 5482",
  gradient = "from-[#0E1A2B] via-[#174EA6] to-[#26B7CD]",
  locked = false,
  className,
  ...props
}: CreditCardFaceProps) {
  return (
    <div className={cn("credit-card-shine relative min-h-44 overflow-hidden rounded-2xl bg-gradient-to-br p-5 text-white shadow-soft", gradient, className)} {...props}>
      <div className="relative z-10 flex h-full min-h-34 flex-col justify-between">
        <div className="flex items-start justify-between gap-4">
          <div className="h-9 w-12 rounded-lg border border-white/30 bg-gradient-to-br from-amber-100 to-amber-400 shadow-inner" />
          <Badge variant="info" className="bg-white/15 text-white backdrop-blur">{cardTypeLabel}</Badge>
        </div>
        <div>
          <div className="font-display text-xl font-bold tracking-[0.18em]">{maskedNumber}</div>
          <div className="mt-4 flex items-end justify-between gap-4 text-xs uppercase tracking-[0.2em] text-white/80">
            <span>{memberName}</span>
            <span>Verge Five</span>
          </div>
        </div>
      </div>
      {locked ? (
        <div className="absolute inset-0 z-20 grid place-items-center bg-[#0E1A2B]/72 text-center backdrop-blur-sm">
          <div className="rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-bold">Locked</div>
        </div>
      ) : null}
    </div>
  );
}

export { CreditCardFace };
