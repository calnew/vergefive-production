export const dynamic = "force-dynamic";

import Link from "next/link";

import { PublicHeader } from "@/components/marketing/public-header";
import { Button, Card, CardContent } from "@/components/ui";

export default async function WelcomePage() {
  return (
    <main className="min-h-screen bg-surface-page">
      <PublicHeader />
      <section className="grid min-h-[calc(100vh-74px)] place-items-center px-6 py-12">
        <Card className="w-full max-w-2xl">
          <CardContent className="p-8 text-center md:p-10">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-ready">Access handoff</p>
            <h1 className="mt-3 font-display text-5xl font-bold tracking-[-0.05em] text-brand-navy">Welcome to Verge Five.</h1>
            <p className="mx-auto mt-5 max-w-xl leading-7 text-vfText-body">
              Stripe access is finalized by the canonical Cloudflare billing webhook and checkout-success routes. If checkout has completed, open your dashboard or request a secure access email.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg"><Link href="/dashboard/">Open dashboard</Link></Button>
              <Button asChild size="lg" variant="outline"><Link href="/login?access=1">Log in</Link></Button>
              <Button asChild size="lg" variant="outline"><Link href="/support?topic=access">Get access help</Link></Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}