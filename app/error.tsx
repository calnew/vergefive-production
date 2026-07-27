"use client";

import { Button } from "@/components/ui";

export default function AppError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center bg-surface-page px-6 py-12">
      <section className="w-full max-w-xl rounded-3xl border border-vfBorder bg-white p-8 text-center shadow-soft">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-flagged">Temporary connection problem</p>
        <h1 className="mt-3 font-display text-3xl font-bold text-vfText-strong">Your Verge Five data could not load.</h1>
        <p className="mt-3 leading-7 text-vfText-body">Your saved information has not been replaced or erased. Try the request again; if the problem continues, contact support.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button onClick={reset}>Try again</Button>
          <Button asChild variant="outline"><a href="/support/">Contact support</a></Button>
        </div>
      </section>
    </main>
  );
}
