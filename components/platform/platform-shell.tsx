import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

import type { User } from "@prisma/client";

const nav = [
  ["Dashboard", "/dashboard/"],
  ["Run Scan", "/scan/"],
  ["Fix List", "/fix-list/"],
  ["Account Matches", "/account-matches/"],
  ["Full Buildout", "/buildout/"],
  ["Report Card", "/report-card/"],
];

export function PlatformShell({ user, active, children }: { user: Pick<User, "name" | "email" | "entitlement">; active: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-page text-vfText-strong lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="sticky top-0 z-30 border-b border-white/10 bg-[#0E1A2B] px-5 py-4 text-white lg:h-screen lg:border-b-0 lg:py-7">
        <div className="flex items-center gap-3">
          <Image src="/logos/verge-five-mark.svg" alt="Verge Five" width={42} height={42} className="rounded-xl" />
          <div>
            <p className="font-display text-lg font-bold leading-tight">Verge Five</p>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#8EA4C7]">Business Credit</p>
          </div>
        </div>
        <nav className="mt-6 flex gap-2 overflow-x-auto pb-1 lg:block lg:space-y-2 lg:overflow-visible">
          {nav.map(([label, href]) => {
            const selected = active === label;
            return (
              <Link key={href} href={href} className={`whitespace-nowrap rounded-2xl px-4 py-3 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 focus-visible:ring-offset-[#0E1A2B] lg:flex lg:w-full ${selected ? "bg-brand-blue text-white shadow-[0_14px_30px_rgba(37,99,235,0.28)]" : "text-[#B7C6DE] hover:bg-white/10 hover:text-white"}`}>
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-5 rounded-2xl bg-white/7 p-4 lg:absolute lg:bottom-6 lg:left-5 lg:right-5">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-full bg-brand-blue font-display text-sm font-bold">{(user.name || user.email).slice(0, 2).toUpperCase()}</div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{user.name}</p>
              <p className="truncate text-xs text-[#8EA4C7]">{user.entitlement.replace("_", " ")}</p>
            </div>
          </div>
        </div>
      </aside>
      <main className="min-w-0 px-5 py-7 md:px-8 lg:px-10">{children}</main>
    </div>
  );
}
