import { runCloudflareFunction } from "@/lib/cloudflare-pages-function-adapter";
import { onRequestGet, onRequestPut } from "@/functions/api/member/profile.js";

export async function GET(request: Request) {
  return runCloudflareFunction(request, onRequestGet);
}

export async function PUT(request: Request) {
  return runCloudflareFunction(request, onRequestPut);
}
