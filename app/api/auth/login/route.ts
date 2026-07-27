import { onRequestPost } from "@/functions/api/auth/login.js";
import { runCloudflareFunction } from "@/lib/cloudflare-pages-function-adapter";

export async function POST(request: Request) {
  return runCloudflareFunction(request, onRequestPost);
}
