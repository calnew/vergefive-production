import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

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

export type PlatformData = Awaited<ReturnType<typeof getPlatformData>>;

export async function getPlatformData() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/login");

  const allowed = user.entitlement === "self_serve" || user.entitlement === "done_with_you";
  const scan = await prisma.scan.findFirst({
    where: { business: { userId: user.id } },
    include: { business: true, issues: { orderBy: { impactRank: "asc" } }, accountMatches: true },
    orderBy: { createdAt: "desc" },
  });

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

