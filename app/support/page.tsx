import Link from "next/link";

import { PublicHeader } from "@/components/marketing/public-header";
import { Badge } from "@/components/ui";
import { SupportForm } from "@/app/support/support-form";

export const dynamic = "force-dynamic";

export default function SupportPage() {
  return (
    <main className="min-h-screen bg-surface-page">
      <PublicHeader />
      <section className="mx-auto grid max-w-6xl gap-8 px-5 py-12 md:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div>
          <Badge variant="info">Live support backend</Badge>
          <h1 className="mt-4 font-display text-5xl font-bold tracking-[-0.05em] text-brand-navy">Get help from Verge Five.</h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-vfText-body">
            Use this for access issues, Done-With-You interest, billing questions, or help with a fix page. Requests save into the existing Cloudflare/D1 support queue so admins can manage them in the live backend.
          </p>
          <div className="mt-6 grid gap-3 text-sm font-bold text-vfText-body">
            <p className="rounded-2xl bg-white p-4 shadow-sm">No bulk email is sent from this page.</p>
            <p className="rounded-2xl bg-white p-4 shadow-sm">Paid checkout still runs only through the canonical /api/billing routes.</p>
            <p className="rounded-2xl bg-white p-4 shadow-sm">Need account access? <Link className="text-brand-blue" href="/login?access=1">Start from login</Link>.</p>
          </div>
        </div>
        <SupportForm />
      </section>
    </main>
  );
}
