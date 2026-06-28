import { runCloudflareFunction } from "@/lib/cloudflare-pages-function-adapter";
import { onRequestGet, onRequestPost } from "@/functions/api/member/visibility-audits.js";

export async function GET(request: Request) {
  return runCloudflareFunction(request, onRequestGet);
}

export async function POST(request: Request) {
  return runCloudflareFunction(request, onRequestPost);
}
