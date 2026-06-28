import { runCloudflareFunction } from "@/lib/cloudflare-pages-function-adapter";
import { onRequestGet } from "@/functions/api/auth/me.js";

export async function GET(request: Request) {
  return runCloudflareFunction(request, onRequestGet);
}
