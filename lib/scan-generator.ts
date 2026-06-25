import type { AccountCategory, AccountTier, IssueSeverity } from "@prisma/client";

type ScanInput = {
  name: string;
  entityType: string;
  address: string;
  phone: string;
  website: string;
  email: string;
};

type GeneratedIssue = {
  key: string;
  title: string;
  detail: string;
  severity: IssueSeverity;
  impactRank: number;
  status: "todo";
  potentialPoints: number;
};

type GeneratedMatch = {
  name: string;
  category: AccountCategory;
  tier: AccountTier;
  reason: string;
  unlockReason?: string;
  faceBg: string;
};

function hasDomainEmail(input: ScanInput) {
  const emailDomain = input.email.split("@")[1]?.toLowerCase() ?? "";
  const websiteDomain = input.website.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0].toLowerCase();
  return Boolean(emailDomain && websiteDomain && emailDomain === websiteDomain);
}

function hasLikelyWebsite(input: ScanInput) {
  return input.website.includes(".") && !input.website.toLowerCase().includes("facebook.com");
}

function cleanPhone(input: ScanInput) {
  return input.phone.replace(/\D/g, "").length >= 10;
}

export function generateScanResult(input: ScanInput) {
  const issues: GeneratedIssue[] = [];

  if (!cleanPhone(input)) {
    issues.push({
      key: "phones",
      title: "Phone signal mismatch",
      detail: "The business phone signal may not match public records and directory listings.",
      severity: "high",
      impactRank: 1,
      status: "todo",
      potentialPoints: 12,
    });
  } else {
    issues.push({
      key: "phones",
      title: "Phone signal mismatch",
      detail: "The public phone signal still needs a directory and caller ID confirmation before account applications.",
      severity: "high",
      impactRank: 1,
      status: "todo",
      potentialPoints: 10,
    });
  }

  if (!hasDomainEmail(input)) {
    issues.push({
      key: "email",
      title: "Free email as primary contact",
      detail: "The primary contact email should use the business domain instead of a free email provider.",
      severity: "high",
      impactRank: 2,
      status: "todo",
      potentialPoints: 9,
    });
  }

  issues.push({
    key: "address",
    title: "Address inconsistency",
    detail: "The business address should match across website, directory listings, bank records, and public profiles.",
    severity: "high",
    impactRank: 3,
    status: "todo",
    potentialPoints: 8,
  });

  issues.push({
    key: "bank-rating",
    title: "Bank rating below Low-5",
    detail: "The business banking signal is below the balance range lenders often look for before stronger account reviews.",
    severity: "med",
    impactRank: 4,
    status: "todo",
    potentialPoints: 6,
  });

  if (!hasLikelyWebsite(input)) {
    issues.push({
      key: "website",
      title: "Website/domain signal missing",
      detail: "The business needs a real website/domain signal before stronger accounts unlock.",
      severity: "med",
      impactRank: 5,
      status: "todo",
      potentialPoints: 5,
    });
  }

  const highCount = issues.filter((issue) => issue.severity === "high").length;
  const readinessScore = Math.max(42, Math.min(72, 78 - highCount * 7 - issues.length * 2));
  const grade = readinessScore >= 70 ? "Good" : readinessScore >= 55 ? "Fair" : "Needs work";
  const signalsTotal = 9;
  const signalsClean = Math.max(3, signalsTotal - issues.length);

  const accountMatches: GeneratedMatch[] = [
    {
      name: "Crown Office Supplies",
      category: "vendor_net30",
      tier: "ready",
      reason: "Starter Net 30 option that fits the current readiness profile.",
      faceBg: "from-[#0E1A2B] via-[#17623B] to-[#31B36A]",
    },
    {
      name: "Uline",
      category: "vendor_net30",
      tier: "ready",
      reason: "Supplier Net 30 path that can support early purchasing history.",
      faceBg: "from-[#0E1A2B] via-[#174EA6] to-[#2563EB]",
    },
    {
      name: "BofA Secured",
      category: "secured_card",
      tier: "ready",
      reason: "Secured business card option that can fit early credit-building.",
      faceBg: "from-[#0E1A2B] via-[#466AA8] to-[#D8E4F2]",
    },
    {
      name: "Capital One Spark",
      category: "credit_card",
      tier: "unlock_next",
      reason: "Useful business card path once identity and bank signals are stronger.",
      unlockReason: "Clear the phone, address, email, and bank-rating fixes first.",
      faceBg: "from-[#1F2937] via-[#4B5563] to-[#9CA3AF]",
    },
    {
      name: "Amazon Business Amex",
      category: "credit_card",
      tier: "unlock_next",
      reason: "Better fit after cleaner public consistency and reporting signals.",
      unlockReason: "Resolve high-impact identity issues before applying.",
      faceBg: "from-[#1F2937] via-[#4B5563] to-[#9CA3AF]",
    },
    {
      name: "Chase Ink",
      category: "credit_card",
      tier: "unlock_next",
      reason: "Higher-value card path that should wait until readiness improves.",
      unlockReason: "Requires bank rating and reporting tradelines.",
      faceBg: "from-[#1F2937] via-[#4B5563] to-[#9CA3AF]",
    },
  ];

  return { readinessScore, grade, signalsTotal, signalsClean, issues, accountMatches };
}
