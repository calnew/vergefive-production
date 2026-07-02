import * as React from "react";

import { cn } from "@/lib/utils";

type ReadinessRingProps = React.HTMLAttributes<HTMLDivElement> & {
  value: number;
  label?: string;
  size?: number;
  color?: string;
};

function ReadinessRing({ value, label = "/100", size = 128, color = "#2563EB", className, ...props }: ReadinessRingProps) {
  const normalized = Math.max(0, Math.min(100, value));
  const stroke = size >= 150 ? 13 : 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (normalized / 100) * circumference;

  return (
    <div className={cn("relative inline-grid place-items-center text-vfText-strong", className)} style={{ width: size, height: size }} {...props}>
      <svg width={size} height={size} className="-rotate-90" role="img" aria-label={`Readiness ${normalized} out of 100`}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#EAEEF4" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeLinecap="round"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: "stroke-dashoffset .7s ease, stroke .4s ease" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="font-display font-bold leading-none" style={{ fontSize: Math.round(size * 0.28) }}>{normalized}</div>
          <div className="mt-1 text-xs font-bold text-vfText-muted">{label}</div>
        </div>
      </div>
    </div>
  );
}

export { ReadinessRing };
