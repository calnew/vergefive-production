import { runCloudflareFunction } from "@/lib/cloudflare-pages-function-adapter";
import { onRequestGet } from "@/functions/api/admin/members.js";

export async function GET(request: Request) {
  return runCloudflareFunction(request, onRequestGet);
}
