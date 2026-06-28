import { runCloudflareFunction } from "@/lib/cloudflare-pages-function-adapter";
import { onRequestPost } from "@/functions/api/auth/request-password-reset.js";

export async function POST(request: Request) {
  return runCloudflareFunction(request, onRequestPost);
}
