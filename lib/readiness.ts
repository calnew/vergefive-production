export type FixStatus = "todo" | "progress" | "done";

// The nine scan signals that drive the readiness score. The "email" fix key
// folds into the "website" signal (one "Website & domain email" signal), so a
// signal is only clean when every fix key mapped to it is done.
export const CORE_SIGNAL_KEYS = ["phones", "address", "website", "llc", "ein", "bank", "bank-rating", "criteria", "net30"] as const;
export type CoreSignalKey = (typeof CORE_SIGNAL_KEYS)[number];

const SIGNAL_FIX_KEYS: Record<CoreSignalKey, string[]> = {
  phones: ["phones"],
  address: ["address"],
  website: ["website", "email"],
  llc: ["llc"],
  ein: ["ein"],
  bank: ["bank"],
  "bank-rating": ["bank-rating"],
  criteria: ["criteria"],
  net30: ["net30"],
};

export const SIGNAL_LABELS: Record<CoreSignalKey, string> = {
  phones: "Business phone & 411",
  address: "Business address",
  website: "Website & domain email",
  llc: "Legal entity",
  ein: "EIN identity",
  bank: "Business bank account",
  "bank-rating": "Bank rating",
  criteria: "Readiness criteria",
  net30: "Starter vendor readiness",
};

export type Readiness = {
  score: number;
  label: string;
  color: string;
  assignedPath: string;
  doneCount: number;
  total: number;
  signalStatuses: Record<CoreSignalKey, FixStatus>;
};

function worstStatus(statuses: FixStatus[]): FixStatus {
  if (statuses.includes("todo")) return statuses.includes("done") || statuses.includes("progress") ? "progress" : "todo";
  if (statuses.includes("progress")) return "progress";
  return "done";
}

export function signalStatusesFrom(fixStatuses: Record<string, FixStatus>): Record<CoreSignalKey, FixStatus> {
  const out = {} as Record<CoreSignalKey, FixStatus>;
  for (const signal of CORE_SIGNAL_KEYS) {
    const parts = SIGNAL_FIX_KEYS[signal].map((key) => fixStatuses[key] ?? "todo");
    out[signal] = parts.every((status) => status === "done") ? "done" : worstStatus(parts);
  }
  return out;
}

export function scoreLabel(score: number): { label: string; color: string } {
  if (score < 50) return { label: "Needs Work", color: "#DC2626" };
  if (score < 65) return { label: "Fair", color: "#D97706" };
  if (score < 80) return { label: "Good", color: "#2563EB" };
  return { label: "Ready for Account Match Review", color: "#15803D" };
}

export function assignedPathFor(score: number) {
  if (score >= 80) return "Account Match Review";
  if (score >= 65) return "Credit Card Readiness";
  if (score >= 50) return "Visibility Cleanup";
  return "Foundation Fixes";
}

export function readinessFrom(fixStatuses: Record<string, FixStatus>): Readiness {
  const signalStatuses = signalStatusesFrom(fixStatuses);
  const doneCount = CORE_SIGNAL_KEYS.filter((key) => signalStatuses[key] === "done").length;
  // In-progress signals (including scan-detected ones) earn half credit so a
  // fresh scan with real business details doesn't start at zero.
  const progressCount = CORE_SIGNAL_KEYS.filter((key) => signalStatuses[key] === "progress").length;
  const score = Math.min(96, Math.round(((doneCount + progressCount * 0.5) / CORE_SIGNAL_KEYS.length) * 100));
  const { label, color } = scoreLabel(score);
  return { score, label, color, assignedPath: assignedPathFor(score), doneCount, total: CORE_SIGNAL_KEYS.length, signalStatuses };
}

// Maps the scan result's detected-signal booleans to fix keys that deserve
// partial credit (the signal was seen, but the fix isn't verified complete).
const DETECTED_SIGNAL_FIX_KEYS: Record<string, string> = {
  phone: "phones",
  address: "address",
  website: "website",
  email: "email",
  entity: "llc",
  bank: "bank",
};

export function detectedKeysFromScanSignals(signals: unknown): string[] {
  if (!signals || typeof signals !== "object") return [];
  return Object.entries(signals as Record<string, unknown>)
    .filter(([name, value]) => value === true && DETECTED_SIGNAL_FIX_KEYS[name])
    .map(([name]) => DETECTED_SIGNAL_FIX_KEYS[name]);
}

// Page progress is an engagement metric, deliberately separate from the
// readiness score: activity is not readiness. Weighted 60% fixes / 40% pages.
export function pageProgressPercent(fixStatuses: Record<string, FixStatus>, visitedCount: number, totalPages: number) {
  const signalStatuses = signalStatusesFrom(fixStatuses);
  const fixPart = CORE_SIGNAL_KEYS.reduce((sum, key) => sum + (signalStatuses[key] === "done" ? 1 : signalStatuses[key] === "progress" ? 0.5 : 0), 0) / CORE_SIGNAL_KEYS.length;
  const pagePart = totalPages > 0 ? Math.min(1, visitedCount / totalPages) : 0;
  return Math.round((fixPart * 0.6 + pagePart * 0.4) * 100);
}

// Merge order (later wins): scan-verified clean signals -> scan issue
// statuses -> scan-detected partial credit -> member progress saved in
// readiness_signals. Detected keys only upgrade todo -> progress.
export function mergeFixStatuses(input: {
  scanCleanKeys?: string[];
  issueStatuses?: Record<string, FixStatus>;
  detectedKeys?: string[];
  progressKeys?: string[];
  doneKeys?: string[];
}): Record<string, FixStatus> {
  const out: Record<string, FixStatus> = {};
  for (const key of input.scanCleanKeys ?? []) out[key] = "done";
  for (const [key, status] of Object.entries(input.issueStatuses ?? {})) out[key] = status;
  for (const key of input.detectedKeys ?? []) if ((out[key] ?? "todo") === "todo") out[key] = "progress";
  for (const key of input.progressKeys ?? []) if (out[key] !== "done") out[key] = "progress";
  for (const key of input.doneKeys ?? []) out[key] = "done";
  return out;
}
