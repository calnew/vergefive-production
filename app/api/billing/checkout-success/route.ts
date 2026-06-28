import { runCloudflareFunction } from "@/lib/cloudflare-pages-function-adapter";
import { onRequestPost } from "@/functions/api/billing/checkout-success.js";

export async function POST(request: Request) {
  return runCloudflareFunction(request, onRequestPost);
}
