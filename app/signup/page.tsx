import { SignupForm } from "@/components/auth/signup-form";
import { PublicHeader } from "@/components/marketing/public-header";
import { normalizeBilling, normalizePlan } from "@/lib/stripe";

export default async function SignupPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const plan = normalizePlan(typeof params.plan === "string" ? params.plan : undefined);
  const billing = normalizeBilling(typeof params.billing === "string" ? params.billing : undefined);
  const canceled = params.canceled === "1";

  return (
    <main className="min-h-screen bg-surface-page">
      <PublicHeader />
      <section className="grid min-h-[calc(100vh-74px)] place-items-center px-6 py-12">
        <SignupForm plan={plan} billing={billing} canceled={canceled} />
      </section>
    </main>
  );
}
