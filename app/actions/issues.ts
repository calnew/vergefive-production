"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getD1RequestAuth, type D1Env } from "@/lib/d1-auth";
import { mergeFixStatuses, readinessFrom, type FixStatus } from "@/lib/readiness";

const SIGNALS_TABLE_DDL = `create table if not exists readiness_signals (
  user_id text not null,
  signal_type text not null,
  selected_keys text not null default '[]',
  updated_at text not null default (datetime('now')),
  primary key (user_id, signal_type)
)`;

function parseKeys(value: unknown): string[] {
  try {
    const parsed = JSON.parse(String(value ?? "[]"));
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

async function saveSignalKeys(env: D1Env, userId: string, signalType: string, keys: string[]) {
  await env.DB.prepare(
    `insert into readiness_signals (user_id, signal_type, selected_keys, updated_at)
     values (?, ?, ?, datetime('now'))
     on conflict(user_id, signal_type) do update set
      selected_keys = excluded.selected_keys,
      updated_at = datetime('now')`
  ).bind(userId, signalType, JSON.stringify(keys.slice(0, 100))).run();
}

export async function updateFixStatus(key: string, status: FixStatus, redirectTo?: string) {
  const { auth, env } = await getD1RequestAuth();
  if (!auth?.user?.id) redirect("/login");
  if (!auth.active) redirect("/upgrade");
  const userId = auth.user.id;

  await env.DB.prepare(SIGNALS_TABLE_DDL).run().catch(() => null);

  const { results: signalRows = [] } = await env.DB.prepare(
    "select signal_type, selected_keys from readiness_signals where user_id = ? and signal_type in ('fix_done','fix_progress')"
  ).bind(userId).all<{ signal_type: string; selected_keys: string }>();

  const doneKeys = new Set(parseKeys(signalRows.find((row) => row.signal_type === "fix_done")?.selected_keys));
  const progressKeys = new Set(parseKeys(signalRows.find((row) => row.signal_type === "fix_progress")?.selected_keys));
  doneKeys.delete(key);
  progressKeys.delete(key);
  if (status === "done") doneKeys.add(key);
  if (status === "progress") progressKeys.add(key);
  await saveSignalKeys(env, userId, "fix_done", [...doneKeys]);
  await saveSignalKeys(env, userId, "fix_progress", [...progressKeys]);

  // Keep the latest audit's issue list and score in step with member progress
  // so the scan, report card, and admin views stay consistent.
  const audit = await env.DB.prepare(
    "select id, result_json from visibility_audits where user_id = ? order by created_at desc limit 1"
  ).bind(userId).first<{ id: string; result_json?: string }>();

  if (audit?.id && audit.result_json) {
    try {
      const result = JSON.parse(String(audit.result_json)) as { issues?: Array<Record<string, unknown>> } & Record<string, unknown>;
      const issues = Array.isArray(result.issues) ? result.issues : [];
      const index = issues.findIndex((item) => String(item.key ?? "") === key);
      if (index >= 0) issues[index] = { ...issues[index], status };

      const issueStatuses: Record<string, FixStatus> = {};
      for (const item of issues) {
        const itemStatus = String(item.status ?? "todo");
        issueStatuses[String(item.key ?? "")] = (["todo", "progress", "done"].includes(itemStatus) ? itemStatus : "todo") as FixStatus;
      }
      const scanCleanKeys = ["phones", "email", "address", "bank-rating", "website"].filter((candidate) => !issues.some((item) => String(item.key ?? "") === candidate));
      const readiness = readinessFrom(mergeFixStatuses({ scanCleanKeys, issueStatuses, progressKeys: [...progressKeys], doneKeys: [...doneKeys] }));

      result.issues = issues;
      result.score = readiness.score;
      result.readinessScore = readiness.score;
      result.signalsClean = readiness.doneCount;
      result.signalsTotal = readiness.total;
      result.label = readiness.label;
      result.grade = readiness.label;
      await env.DB.prepare(
        "update visibility_audits set score = ?, label = ?, result_json = ? where id = ? and user_id = ?"
      ).bind(readiness.score, readiness.label, JSON.stringify(result), audit.id, userId).run();
    } catch {
      // Audit sync is best-effort; the readiness_signals write above is the source of truth.
    }
  }

  revalidatePath("/dashboard/");
  revalidatePath("/fix-list/");
  revalidatePath(`/fix/${key}/`);
  revalidatePath("/account-matches/");
  revalidatePath("/buildout/");
  revalidatePath("/report-card/");
  revalidatePath("/scan/");

  if (redirectTo) redirect(redirectTo);
}

export async function updateIssueStatus(issueId: string, status: FixStatus, redirectTo?: string) {
  const key = issueId.replace(/^d1-/, "");
  await updateFixStatus(key, status, redirectTo);
}
