import { runCloudflareFunction } from "@/lib/cloudflare-pages-function-adapter";
import { onRequestPost } from "@/functions/api/auth/reset-password.js";

export async function POST(request: Request) {
  return runCloudflareFunction(request, onRequestPost);
}
