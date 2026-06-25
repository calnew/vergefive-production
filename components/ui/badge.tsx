import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-full px-3 py-1 text-xs font-bold", {
  variants: {
    variant: {
      default: "bg-brand-blue text-white",
      info: "bg-blue-50 text-brand-blue",
      ready: "bg-ready-surface text-ready",
      unlock: "bg-unlock-surface text-unlock",
      flagged: "bg-flagged-surface text-flagged",
      secondary: "bg-secondary text-secondary-foreground",
      destructive: "bg-flagged-surface text-flagged",
      outline: "border border-vfBorder text-vfText-strong",
      success: "bg-ready-surface text-ready",
      warning: "bg-unlock-surface text-unlock",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
