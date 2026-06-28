import { getCloudflareContext } from "@opennextjs/cloudflare";

type PagesFunctionHandler = (context: { request: Request; env: CloudflareEnv; data: Record<string, unknown> }) => Promise<Response | undefined>;

export async function runCloudflareFunction(request: Request, handler: PagesFunctionHandler) {
  const { env } = await getCloudflareContext({ async: true });
  const response = await handler({ request, env, data: {} });
  return response || Response.json({ error: "Cloudflare function did not return a response." }, { status: 500 });
}

export function methodNotAllowed() {
  return Response.json({ error: "Method not allowed." }, { status: 405, headers: { "cache-control": "no-store" } });
}
