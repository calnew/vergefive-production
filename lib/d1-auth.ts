import { cookies } from "next/headers";
import { getCloudflareContext } from "@opennextjs/cloudflare";

import { getAuth } from "@/functions/_lib/auth.js";

type D1Auth = Awaited<ReturnType<typeof getAuth>>;
type D1Statement = {
  bind: (...values: unknown[]) => D1Statement;
  first: <T = Record<string, unknown>>() => Promise<T | null>;
  all: <T = Record<string, unknown>>() => Promise<{ results?: T[] }>;
  run: () => Promise<unknown>;
};
export type D1Env = CloudflareEnv & { DB: { prepare: (sql: string) => D1Statement } };

function cookieHeaderFromStore(items: { name: string; value: string }[]) {
  return items.map((item) => `${item.name}=${encodeURIComponent(item.value)}`).join("; ");
}

export async function getD1RequestAuth(): Promise<{ auth: D1Auth; env: D1Env }> {
  const { env } = await getCloudflareContext({ async: true });
  const cookieStore = await cookies();
  const request = new Request("https://vergefive.local/d1-auth", {
    headers: { cookie: cookieHeaderFromStore(cookieStore.getAll()) },
  });
  return { auth: await getAuth(request, env), env: env as D1Env };
}

export function entitlementFromD1(status: string, active: boolean) {
  const normalized = String(status || "none").toLowerCase();
  if (normalized === "lifetime" || normalized === "paid" || normalized === "active" || normalized === "trialing" || (normalized === "trial" && active)) return "self_serve";
  return "free";
}
