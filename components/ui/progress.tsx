import * as React from "react";

import { cn } from "@/lib/utils";

const ProgressBar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { value?: number }>(
  ({ className, value = 0, ...props }, ref) => (
    <div ref={ref} className={cn("relative h-3 w-full overflow-hidden rounded-full bg-[#E4EAF3]", className)} {...props}>
      <div className="h-full rounded-full bg-brand-blue transition-all" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  ),
);
ProgressBar.displayName = "ProgressBar";

const Progress = ProgressBar;

export { Progress, ProgressBar };
