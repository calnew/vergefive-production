"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getD1RequestAuth } from "@/lib/d1-auth";
import { gradeForScore, issuePointMap } from "@/lib/platform-data";

export async function updateIssueStatus(issueId: string, status: "todo" | "progress" | "done", redirectTo?: string) {
  const { auth, env } = await getD1RequestAuth();
  if (!auth?.user?.id) redirect("/login");
  if (!auth.active) redirect("/upgrade");

  const audit = await env.DB.prepare(
    `select id, score, result_json
     from visibility_audits
     where user_id = ?
     order by created_at desc
     limit 1`
  ).bind(auth.user.id).first<{ id: string; score?: number; result_json?: string }>();

  if (!audit?.id || !audit.result_json) redirect("/fix-list/");

  const result = JSON.parse(String(audit.result_json || "{}")) as {
    issues?: Array<Record<string, unknown>>;
    score?: number;
    readinessScore?: number;
    signalsClean?: number;
    signalsTotal?: number;
    label?: string;
    grade?: string;
  };
  const issues = Array.isArray(result.issues) ? result.issues : [];
  const index = issues.findIndex((item) => String(item.id || `d1-${item.key || ""}`) === issueId);
  if (index < 0) redirect("/fix-list/");

  issues[index] = { ...issues[index], status };

  const baseScore = Number(audit.score || result.score || result.readinessScore || 56);
  const completedPoints = issues
    .filter((item) => item.status === "done")
    .reduce((sum, item) => sum + (issuePointMap[String(item.key)] ?? 4), 0);
  const score = Math.min(100, Math.max(baseScore, 56) + completedPoints);
  const total = Number(result.signalsTotal || 9);
  const clean = Math.min(total, Math.max(Number(result.signalsClean || 5), 5) + issues.filter((item) => item.status === "done").length);
  const grade = gradeForScore(score);

  result.issues = issues;
  result.score = score;
  result.readinessScore = score;
  result.signalsClean = clean;
  result.label = grade;
  result.grade = grade;
  await env.DB.prepare(
    `update visibility_audits
     set score = ?, label = ?, result_json = ?
     where id = ? and user_id = ?`
  ).bind(score, grade, JSON.stringify(result), audit.id, auth.user.id).run();

  revalidatePath("/dashboard/");
  revalidatePath("/fix-list/");
  revalidatePath(`/fix/${String(issues[index].key)}/`);
  revalidatePath("/account-matches/");
  revalidatePath("/report-card/");

  if (redirectTo) redirect(redirectTo);
}

