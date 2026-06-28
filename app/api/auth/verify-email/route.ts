import { runCloudflareFunction } from "@/lib/cloudflare-pages-function-adapter";
import { onRequestPost } from "@/functions/api/auth/verify-email.js";

export async function POST(request: Request) {
  return runCloudflareFunction(request, onRequestPost);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") || "";
  const wrapped = new Request(request.url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      cookie: request.headers.get("cookie") || "",
    },
    body: JSON.stringify({ token }),
  });
  return runCloudflareFunction(wrapped, onRequestPost);
}
