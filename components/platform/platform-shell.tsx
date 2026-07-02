import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { CreditCard, FileText, Layers, LayoutDashboard, LifeBuoy, ListChecks, Radar } from "lucide-react";

import { LogoutButton } from "@/components/auth/logout-button";

const nav = [
  { label: "Dashboard", href: "/dashboard/", icon: LayoutDashboard },
  { label: "Run Scan", href: "/scan/", icon: Radar },
  { label: "Fix List", href: "/fix-list/", icon: ListChecks },
  { label: "Account Matches", href: "/account-matches/", icon: CreditCard },
  { label: "Full Buildout", href: "/buildout/", icon: Layers },
  { label: "Report Card", href: "/report-card/", icon: FileText },
  { label: "Support", href: "/support/", icon: LifeBuoy },
];

type PlatformShellProps = {
  user: { name: string; email: string; entitlement: string };
  active: string;
  businessName?: string;
  children: ReactNode;
};

export function PlatformShell({ user, active, businessName, children }: PlatformShellProps) {
  const memberLine = businessName || user.entitlement.replace("_", " ");
  return (
    <div className="min-h-screen bg-surface-page text-vfText-strong lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
      <aside className="sticky top-0 z-30 flex flex-col border-b border-sidebar-border bg-sidebar px-4 py-4 text-white lg:h-screen lg:border-b-0 lg:border-r lg:py-6">
        <Link href="/dashboard/" className="flex items-center gap-3 rounded-xl px-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue">
          <Image src="/logos/verge-five-mark.svg" alt="Verge Five" width={36} height={36} className="rounded-[9px]" />
          <span>
            <span className="block font-display text-base font-bold leading-tight">Verge Five</span>
            <span className="block text-[9px] font-extrabold uppercase tracking-[0.2em] text-sidebar-muted">Business Credit</span>
          </span>
        </Link>
        <nav className="mt-5 flex gap-1.5 overflow-x-auto pb-1 lg:block lg:flex-1 lg:space-y-1.5 lg:overflow-visible lg:pb-0" aria-label="Platform">
          {nav.map(({ label, href, icon: Icon }) => {
            const selected = active === label;
            return (
              <Link
                key={href}
                href={href}
                aria-current={selected ? "page" : undefined}
                className={`flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-xl px-3.5 py-2.5 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar lg:w-full ${selected ? "bg-sidebar-active text-white" : "text-sidebar-muted hover:bg-sidebar-hover hover:text-white"}`}
              >
                <Icon size={17} strokeWidth={2.4} aria-hidden />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-4 hidden rounded-2xl border border-sidebar-border bg-white/5 p-3.5 lg:block">
          <Link href="/account/settings/" className="flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,#2563EB,#3B82F6)] font-display text-sm font-bold">
              {(user.name || user.email).slice(0, 2).toUpperCase()}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold">{user.name}</span>
              <span className="block truncate text-xs capitalize text-sidebar-muted">{memberLine}</span>
            </span>
          </Link>
          <LogoutButton />
        </div>
      </aside>
      <main className="min-w-0">
        <div className="mx-auto max-w-[1180px] px-5 pb-14 pt-7 md:px-9">{children}</div>
      </main>
    </div>
  );
}
