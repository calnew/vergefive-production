import type { FixStatus } from "@/lib/readiness";
import { cn } from "@/lib/utils";

export function statusMeta(status: FixStatus) {
  if (status === "done") return { label: "Complete", className: "bg-ready-surface text-ready" };
  if (status === "progress") return { label: "In Progress", className: "bg-unlock-surface text-unlock" };
  return { label: "Not Started", className: "bg-[#EEF1F6] text-vfText-body" };
}

export function impactMeta(severity: string) {
  if (severity === "high") return { label: "High impact", className: "bg-flagged-surface text-flagged" };
  if (severity === "med") return { label: "Medium impact", className: "bg-blue-50 text-brand-blue" };
  return { label: "Supporting", className: "bg-blue-50 text-brand-blue" };
}

export function StatusPill({ status, className }: { status: FixStatus; className?: string }) {
  const meta = statusMeta(status);
  return <span className={cn("inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold", meta.className, className)}>{meta.label}</span>;
}

export function ImpactPill({ severity, className }: { severity: string; className?: string }) {
  const meta = impactMeta(severity);
  return <span className={cn("inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold", meta.className, className)}>{meta.label}</span>;
}
