import { redirect } from "next/navigation";

import { getD1RequestAuth, entitlementFromD1, type D1Env } from "@/lib/d1-auth";

export const issuePointMap: Record<string, number> = {
  phones: 10,
  email: 9,
  address: 8,
  "bank-rating": 6,
  website: 5,
};

export const issueFixContent: Record<string, {
  phase: string;
  title: string;
  shortTitle: string;
  saw: string;
  matters: string;
  steps: string[];
  proof: string[];
  providers: { name: string; description: string; href: string }[];
}> = {
  phones: {
    phase: "Business Identity",
    title: "Phone & 411 Fix",
    shortTitle: "Phone signal",
    saw: "The scan found that the business phone signal needs stronger public consistency before account applications.",
    matters: "Vendors and lenders compare phone, caller ID, listings, and public business records. A weak phone signal can make a real company look unfinished.",
    steps: ["Choose a dedicated business phone number.", "Set the caller ID to the legal or public business name.", "Add the number to a public 411 or directory listing.", "Update the same phone number across website, bank, and vendor records."],
    proof: ["Screenshot of caller ID or phone account", "Screenshot of directory listing", "Website contact page showing the same number"],
    providers: [
      { name: "TurnCom360 Business Phone", description: "Business phone setup and caller ID support.", href: "https://turncom360.com/" },
      { name: "U.S. Business Directory", description: "Use a listing source that can display consistent public business details.", href: "https://www.bbb.org/" },
    ],
  },
  email: {
    phase: "Business Identity",
    title: "Business Email Fix",
    shortTitle: "Business email",
    saw: "The scan found the primary contact email should use the business domain instead of a free mailbox.",
    matters: "A domain email makes the company look established and helps line up the website, business profile, and application contact details.",
    steps: ["Confirm the business domain is active.", "Create a domain email such as info@ or billing@.", "Update public profiles and vendor applications with the domain email.", "Keep the free email only as a backup, not the primary business contact."],
    proof: ["Screenshot of the domain email inbox", "Website contact page showing the domain email", "Updated business profile record"],
    providers: [
      { name: "Google Workspace", description: "Domain-based email for business teams.", href: "https://workspace.google.com/" },
      { name: "Microsoft 365", description: "Business email and office tools using your domain.", href: "https://www.microsoft.com/microsoft-365/business" },
    ],
  },
  address: {
    phase: "Business Identity",
    title: "Business Address Fix",
    shortTitle: "Address consistency",
    saw: "The scan found address consistency needs attention across public records, website, banking, and account applications.",
    matters: "Address mismatches create friction because vendors compare identity signals before extending terms or card access.",
    steps: ["Pick the exact address format to use everywhere.", "Update the website and business profile first.", "Match the same address on bank, state, and vendor records.", "Save screenshots before applying for new accounts."],
    proof: ["Website contact page", "State or business profile record", "Bank profile or application screenshot"],
    providers: [
      { name: "iPostal1", description: "Business mailing address options where appropriate.", href: "https://ipostal1.com/" },
      { name: "Google Business Profile", description: "Public profile consistency for eligible businesses.", href: "https://www.google.com/business/" },
    ],
  },
  "bank-rating": {
    phase: "Banking Foundation",
    title: "Bank Rating Fix",
    shortTitle: "Bank rating",
    saw: "The scan found the banking signal should be stronger before higher-value account applications.",
    matters: "A stronger business bank balance pattern can support better readiness. Verge Five improves readiness; it does not promise account outcomes.",
    steps: ["Use the business bank account consistently.", "Avoid unnecessary low-balance periods before applying.", "Track average balance targets for the next 60 to 90 days.", "Apply only after the identity and bank signals are aligned."],
    proof: ["Recent business bank statement", "Balance tracker screenshot", "Application timing notes"],
    providers: [
      { name: "Bank of America Business", description: "Business banking option for operating history.", href: "https://www.bankofamerica.com/smallbusiness/" },
      { name: "Chase Business", description: "Business checking and banking tools.", href: "https://www.chase.com/business" },
    ],
  },
  website: {
    phase: "Business Identity",
    title: "Website & Domain Fix",
    shortTitle: "Website/domain",
    saw: "The scan found the website or domain signal is not strong enough for the full account path.",
    matters: "A clear website with matching name, address, phone, and email gives vendors a public place to verify the business.",
    steps: ["Use a real domain, not only a social profile.", "Put the legal/public business name on the site.", "Add matching phone, address, and domain email.", "Keep the website live before applying for accounts."],
    proof: ["Homepage screenshot", "Contact page screenshot", "Domain registration or DNS screenshot"],
    providers: [
      { name: "Squarespace", description: "Website builder for fast business presence.", href: "https://www.squarespace.com/" },
      { name: "GoDaddy", description: "Domain registration and basic web tools.", href: "https://www.godaddy.com/" },
    ],
  },
};

export const buildoutModules = [
  { title: "Business Identity", sections: 4, description: "Phone, address, website, domain email, and public profile consistency." },
  { title: "Legal Foundation", sections: 3, description: "Entity setup, EIN, state records, and legal name alignment." },
  { title: "Banking Foundation", sections: 3, description: "Business banking, balance habits, and bank-rating readiness." },
  { title: "Approval Readiness", sections: 4, description: "Readiness criteria, profile cleanup, and application timing." },
  { title: "Account Strategy", sections: 5, description: "Net 30 vendors, cards, funding paths, and account sequencing." },
];

type D1Row = Record<string, unknown>;
type IssueSeverity = "high" | "med" | "low";
type IssueStatus = "todo" | "progress" | "done";

export type PlatformIssue = { id: string; key: string; title: string; detail: string; severity: IssueSeverity; impactRank: number; status: IssueStatus };
export type PlatformAccountMatch = { id: string; name: string; category: string; tier: string; reason: string; unlockReason: string | null; faceBg: string };
export type PlatformUser = { id: string; email: string; name: string; entitlement: string };
export type PlatformScan = { id: string; business: { name: string; legalName?: string; tradeName?: string; entityType?: string; address?: string; phone?: string; website?: string; email?: string }; readinessScore: number; grade: string; signalsTotal: number; signalsClean: number; issues: PlatformIssue[]; accountMatches: PlatformAccountMatch[] };
export type PlatformData = { user: PlatformUser; allowed: boolean; scan: PlatformScan | null };

function parseJson(value: unknown, fallback: Record<string, unknown> = {}) {
  if (!value) return fallback;
  try {
    return JSON.parse(String(value)) as Record<string, unknown>;
  } catch {
    return fallback;
  }
}

async function safeFirst(env: D1Env, sql: string, ...bindings: unknown[]) {
  try {
    return await env.DB.prepare(sql).bind(...bindings).first<D1Row>();
  } catch {
    return null;
  }
}

function defaultIssues(result: Record<string, unknown>): PlatformIssue[] {
  const redFlags = Array.isArray(result.redFlags) ? result.redFlags.map(String) : [];
  const findings = Array.isArray(result.findings) ? result.findings.map(String) : [];
  const details = [...redFlags, ...findings];
  const keys = ["phones", "email", "address", "bank-rating", "website"];
  return keys.map((key, index) => ({
    id: `d1-${key}`,
    key,
    title: issueFixContent[key].title,
    detail: details[index] || issueFixContent[key].saw,
    severity: index < 3 ? "high" : index === 3 ? "med" : "low",
    impactRank: index + 1,
    status: "todo",
  }));
}

function defaultMatches(): PlatformAccountMatch[] {
  return [
    { id: "ready-crown", name: "Crown Office Supplies", category: "vendor_net30", tier: "ready", reason: "Good fit when identity and address signals are aligned.", unlockReason: null, faceBg: "linear-gradient(135deg,#0E1A2B,#2563EB)" },
    { id: "ready-uline", name: "Uline", category: "vendor_net30", tier: "ready", reason: "Starter vendor path for businesses with core records in place.", unlockReason: null, faceBg: "linear-gradient(135deg,#1E3A8A,#38BDF8)" },
    { id: "ready-bofa", name: "BofA Secured", category: "secured_card", tier: "ready", reason: "Secured card path can fit earlier than stronger revolving cards.", unlockReason: null, faceBg: "linear-gradient(135deg,#111827,#64748B)" },
    { id: "unlock-spark", name: "Capital One Spark", category: "credit_card", tier: "unlock_next", reason: "Finish the phone and public identity signal before using this path.", unlockReason: "Complete Phone & 411 Fix", faceBg: "linear-gradient(135deg,#7F1D1D,#2563EB)" },
    { id: "unlock-amazon", name: "Amazon Business Amex", category: "credit_card", tier: "unlock_next", reason: "Address and business profile consistency should be cleaned up first.", unlockReason: "Complete Business Address Fix", faceBg: "linear-gradient(135deg,#111827,#F59E0B)" },
    { id: "unlock-chase", name: "Chase Ink", category: "credit_card", tier: "unlock_next", reason: "Banking and readiness signals should be stronger before this path.", unlockReason: "Complete Bank Rating Fix", faceBg: "linear-gradient(135deg,#0F172A,#1D4ED8)" },
  ];
}

function signalsCleanFromResult(result: Record<string, unknown>, score: number) {
  const signals = result.signals && typeof result.signals === "object" ? Object.values(result.signals as Record<string, unknown>) : [];
  if (signals.length) return signals.filter(Boolean).length;
  return Math.max(0, Math.min(9, Math.round((score / 100) * 9)));
}

export async function getPlatformData(): Promise<PlatformData> {
  const { auth, env } = await getD1RequestAuth();
  if (!auth) redirect("/login");

  const user: PlatformUser = {
    id: auth.user.id,
    email: auth.user.email,
    name: auth.user.name || auth.user.email,
    entitlement: entitlementFromD1(auth.membership.status, auth.active),
  };
  const allowed = !!auth.active;

  const [profile, audit] = await Promise.all([
    safeFirst(env, "select business_name, trade_name, entity_type, address, phone, website, email from business_profiles where user_id = ? limit 1", auth.user.id),
    safeFirst(env, "select id, business_name, score, label, result_json, created_at from visibility_audits where user_id = ? order by created_at desc limit 1", auth.user.id),
  ]);

  if (!audit && !profile) return { user, allowed, scan: null };

  const result = parseJson(audit?.result_json);
  const score = Number(audit?.score || result.score || 56);
  const businessName = String(audit?.business_name || result.businessName || profile?.business_name || profile?.trade_name || "Your business");
  const scan: PlatformScan = {
    id: String(audit?.id || "d1-profile-scan"),
    business: {
      name: businessName,
      legalName: String(profile?.business_name || ""),
      tradeName: String(profile?.trade_name || ""),
      entityType: String(profile?.entity_type || ""),
      address: String(profile?.address || ""),
      phone: String(profile?.phone || ""),
      website: String(profile?.website || ""),
      email: String(profile?.email || ""),
    },
    readinessScore: Math.max(0, Math.min(100, score)),
    grade: String(audit?.label || result.label || gradeForScore(score)),
    signalsTotal: 9,
    signalsClean: signalsCleanFromResult(result, score),
    issues: defaultIssues(result),
    accountMatches: defaultMatches(),
  };

  return { user, allowed, scan };
}

export function gradeForScore(score: number) {
  if (score >= 80) return "Strong";
  if (score >= 70) return "Good";
  if (score >= 55) return "Fair";
  return "Needs work";
}

export function scoreWithCompleted(baseScore: number, issues: { key: string; status: string }[]) {
  const points = issues.filter((issue) => issue.status === "done").reduce((sum, issue) => sum + (issuePointMap[issue.key] ?? 4), 0);
  return Math.min(100, baseScore + points);
}

export function progressPercent(issues: { status: string }[]) {
  if (!issues.length) return 0;
  return Math.round((issues.filter((issue) => issue.status === "done").length / issues.length) * 100);
}

export function unlockKeyForMatch(name: string) {
  if (name.includes("Capital One")) return "phones";
  if (name.includes("Amazon")) return "address";
  if (name.includes("Chase")) return "bank-rating";
  return null;
}

export function matchIsReady(match: { tier: string; name: string }, issues: { key: string; status: string }[]) {
  if (match.tier === "ready") return true;
  const key = unlockKeyForMatch(match.name);
  return Boolean(key && issues.some((issue) => issue.key === key && issue.status === "done"));
}
