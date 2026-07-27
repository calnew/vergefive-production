"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getD1RequestAuth, type D1Env } from "@/lib/d1-auth";
import { getLessonSection } from "@/lib/platform-catalog";
import { type FixStatus } from "@/lib/readiness";

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

async function saveFixStatus(env: D1Env, userId: string, key: string, status: FixStatus) {
  await env.DB.prepare(
    `insert into member_fix_status (user_id, fix_key, status, updated_at)
     values (?, ?, ?, datetime('now'))
     on conflict(user_id, fix_key) do update set
       status = excluded.status,
       updated_at = datetime('now')`,
  ).bind(userId, key, status).run();
}

function selectedOptionSignalType(key: string) {
  return `selected_option:${key}`;
}

async function completionBlocker(env: D1Env, userId: string, key: string) {
  const content = getLessonSection(key);
  if (!content || content.key !== "phones") return null;

  const optionRow = await env.DB.prepare(
    "select selected_keys from readiness_signals where user_id = ? and signal_type = ? limit 1"
  ).bind(userId, selectedOptionSignalType(content.key)).first<{ selected_keys?: string }>();
  const selectedOption = parseKeys(optionRow?.selected_keys)[0] ?? "";
  if (!content.moduleOptions?.some((option) => option.name === selectedOption)) return "option-required";

  const progressRow = await env.DB.prepare(
    "select completed_indexes from lesson_progress where user_id = ? and page_path = ? limit 1"
  ).bind(userId, `/fix/${content.key}/`).first<{ completed_indexes?: string }>();
  const completed = new Set(parseKeys(progressRow?.completed_indexes).map(Number).filter(Number.isInteger));
  const proofStart = content.checklist.length;
  const proofComplete = content.proof.every((_, index) => completed.has(proofStart + index));
  return proofComplete ? null : "proof-required";
}

export async function selectFixOption(key: string, optionName: string, redirectTo?: string) {
  const content = getLessonSection(key);
  const option = content?.moduleOptions?.find((item) => item.name === optionName);
  if (!content || !option) redirect("/fix-list/");

  const { auth, env } = await getD1RequestAuth();
  if (!auth?.user?.id) redirect("/login");
  if (!auth.active) redirect("/upgrade");
  const userId = auth.user.id;

  await saveSignalKeys(env, userId, selectedOptionSignalType(content.key), [option.name]);
  await env.DB.prepare(
    `insert into member_fix_status (user_id, fix_key, status, updated_at)
     values (?, ?, 'progress', datetime('now'))
     on conflict(user_id, fix_key) do update set
       status = case when member_fix_status.status = 'done' then 'done' else 'progress' end,
       updated_at = datetime('now')`,
  ).bind(userId, content.key).run();

  revalidatePath("/dashboard/");
  revalidatePath("/fix-list/");
  revalidatePath(`/fix/${content.key}/`);

  if (redirectTo) redirect(redirectTo);
}

export async function updateFixStatus(key: string, status: FixStatus, redirectTo?: string) {
  const content = getLessonSection(key);
  if (!content || !["todo", "progress", "done"].includes(status)) redirect("/fix-list/");

  const { auth, env } = await getD1RequestAuth();
  if (!auth?.user?.id) redirect("/login");
  if (!auth.active) redirect("/upgrade");
  const userId = auth.user.id;

  if (status === "done") {
    const blocker = await completionBlocker(env, userId, content.key);
    if (blocker) redirect(`/fix/${content.key}/?completion=${blocker}#${blocker === "option-required" ? "vf-options" : "proof-checklist"}`);
  }

  await saveFixStatus(env, userId, content.key, status);

  revalidatePath("/dashboard/");
  revalidatePath("/fix-list/");
  revalidatePath(`/fix/${content.key}/`);
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
