import { runCloudflareFunction } from "@/lib/cloudflare-pages-function-adapter";
import { onRequestPost } from "@/functions/api/admin/actions.js";

export async function POST(request: Request) {
  return runCloudflareFunction(request, onRequestPost);
}
