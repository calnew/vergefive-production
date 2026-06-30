"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { gradeForScore, issuePointMap, unlockKeyForMatch } from "@/lib/platform-data";
import { prisma } from "@/lib/prisma";

export async function updateIssueStatus(issueId: string, status: "todo" | "progress" | "done", redirectTo?: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { entitlement: true } });
  if (!user || (user.entitlement !== "self_serve" && user.entitlement !== "done_with_you")) redirect("/upgrade");

  const issue = await prisma.issue.findFirst({
    where: { id: issueId, scan: { business: { userId: session.user.id } } },
    include: { scan: { include: { issues: true, accountMatches: true } } },
  });

  if (!issue) redirect("/fix-list/");

  await prisma.issue.update({ where: { id: issue.id }, data: { status } });

  const updatedIssues = issue.scan.issues.map((item: (typeof issue.scan.issues)[number]) => (item.id === issue.id ? { ...item, status } : item));
  const completedPoints = updatedIssues.filter((item: (typeof updatedIssues)[number]) => item.status === "done").reduce((sum: number, item: (typeof updatedIssues)[number]) => sum + (issuePointMap[item.key] ?? 4), 0);
  const score = Math.min(100, Math.max(issue.scan.readinessScore, 56) + completedPoints);
  const clean = Math.min(issue.scan.signalsTotal, Math.max(issue.scan.signalsClean, 5) + updatedIssues.filter((item: (typeof updatedIssues)[number]) => item.status === "done").length);

  await prisma.scan.update({ where: { id: issue.scanId }, data: { readinessScore: score, grade: gradeForScore(score), signalsClean: clean } });

  const completedKeys = new Set(updatedIssues.filter((item: (typeof updatedIssues)[number]) => item.status === "done").map((item: (typeof updatedIssues)[number]) => item.key));
  const unlockNames = issue.scan.accountMatches.filter((match: (typeof issue.scan.accountMatches)[number]) => {
    const key = unlockKeyForMatch(match.name);
    return match.tier === "unlock_next" && key && completedKeys.has(key);
  }).map((match: (typeof issue.scan.accountMatches)[number]) => match.name);

  if (unlockNames.length) {
    await prisma.accountMatch.updateMany({
      where: { scanId: issue.scanId, name: { in: unlockNames } },
      data: { tier: "ready", faceBg: "from-[#0E1A2B] via-[#17623B] to-[#31B36A]" },
    });
  }

  revalidatePath("/dashboard/");
  revalidatePath("/fix-list/");
  revalidatePath(`/fix/${issue.key}/`);
  revalidatePath("/account-matches/");
  revalidatePath("/report-card/");

  if (redirectTo) redirect(redirectTo);
}

