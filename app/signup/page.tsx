import { SignupForm } from "@/components/auth/signup-form";
import { normalizeBilling, normalizePlan } from "@/lib/stripe";

export default async function SignupPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const plan = normalizePlan(typeof params.plan === "string" ? params.plan : undefined);
  const billing = normalizeBilling(typeof params.billing === "string" ? params.billing : undefined);
  const canceled = params.canceled === "1";

  return (
    <main className="grid min-h-screen place-items-center bg-surface-page px-6 py-12">
      <SignupForm plan={plan} billing={billing} canceled={canceled} />
    </main>
  );
}