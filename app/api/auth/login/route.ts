import { getCloudflareContext } from "@opennextjs/cloudflare";

import { createSession, json, normalizeEmail, readJson, verifyPassword } from "@/functions/_lib/auth.js";
import type { D1Env } from "@/lib/d1-auth";

type D1UserRow = {
  id: string;
  email: string;
  name?: string;
  password_hash?: string;
  password_salt?: string;
  password_iterations?: number;
  email_verified_at?: string;
};

export async function POST(request: Request) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const d1Env = env as D1Env;
    if (!d1Env.DB) return json({ error: "D1 binding DB is not configured." }, 500);

    const input = await readJson(request).catch(() => ({}));
    const email = normalizeEmail(input.email);
    const password = String(input.password || "");
    if (!email || !password) return json({ error: "Email and password are required." }, 400);

    const user = await d1Env.DB.prepare("select * from users where email = ? limit 1").bind(email).first<D1UserRow>();
    const valid = await verifyPassword(password, user || null);
    if (!valid || !user) return json({ error: "Email or password is incorrect." }, 401);

    if (String((env as D1Env & { REQUIRE_EMAIL_VERIFICATION?: string }).REQUIRE_EMAIL_VERIFICATION || "").toLowerCase() === "true" && !user.email_verified_at) {
      return json({ error: "Please verify your email address before logging in." }, 403);
    }

    const cookie = await createSession(d1Env, user.id, request);
    return json({ ok: true, user: { id: user.id, email: user.email, name: user.name || "", emailVerified: !!user.email_verified_at } }, 200, { "set-cookie": cookie });
  } catch (error) {
    console.error("d1 login failed", error instanceof Error ? error.message : error);
    return json({ error: "Unable to log in." }, 500);
  }
}
