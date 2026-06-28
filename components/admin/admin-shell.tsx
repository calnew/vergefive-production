"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const navItems = [
  { label: "Dashboard", href: "/admin/" },
  { label: "Members", href: "/admin/members/" },
  { label: "Purchases", href: "/admin/purchases/" },
  { label: "Billing", href: "/admin/billing/" },
  { label: "Scans", href: "/admin/scans/" },
  { label: "Support", href: "/admin/support/" },
  { label: "Email Templates", href: "/admin/emails/" },
  { label: "Catalog", href: "/admin/catalog/" },
  { label: "Reports", href: "/admin/reports/" },
  { label: "Settings", href: "/admin/settings/" },
  { label: "System Health", href: "/admin/system/" },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#EEF3F8] text-vfText-strong lg:grid lg:grid-cols-[286px_minmax(0,1fr)]">
      <aside className="sticky top-0 z-40 border-b border-white/10 bg-[#07111F] px-5 py-4 text-white lg:h-screen lg:border-b-0 lg:px-6 lg:py-7">
        <Link href="/admin/" className="flex items-center gap-3 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 focus-visible:ring-offset-[#07111F]">
          <Image src="/logos/verge-five-mark.svg" alt="Verge Five" width={44} height={44} className="rounded-xl bg-black" />
          <div>
            <p className="font-display text-lg font-bold leading-tight">Verge Five</p>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#8EA4C7]">Admin Panel</p>
          </div>
        </Link>

        <nav className="mt-6 flex gap-2 overflow-x-auto pb-1 lg:block lg:space-y-1.5 lg:overflow-visible">
          {navItems.map((item) => {
            const active = item.href === "/admin/" ? pathname === "/admin" || pathname === "/admin/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap rounded-2xl px-4 py-3 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2 focus-visible:ring-offset-[#07111F] lg:flex lg:w-full ${active ? "bg-brand-blue text-white shadow-[0_14px_30px_rgba(37,99,235,0.28)]" : "text-[#B7C6DE] hover:bg-white/10 hover:text-white"}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.06] p-4 lg:absolute lg:bottom-6 lg:left-6 lg:right-6">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#8EA4C7]">Layout pass</p>
          <p className="mt-2 text-sm font-bold text-white">Placeholder data only</p>
          <p className="mt-1 text-xs leading-5 text-[#AEBFD8]">Backend actions, Stripe, email, and imports are intentionally not wired yet.</p>
        </div>
      </aside>

      <main className="min-w-0 px-5 py-6 md:px-8 lg:px-10 lg:py-8">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  );
}

export function AdminPageHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <header className="mb-7 flex flex-col gap-4 border-b border-vfBorder pb-6 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-vfText-muted">{eyebrow}</p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-[-0.05em] text-brand-navy md:text-5xl">{title}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-vfText-body md:text-base">{description}</p>
      </div>
      <div className="rounded-2xl border border-vfBorder bg-white px-4 py-3 text-sm font-bold text-vfText-body shadow-soft">No live admin actions</div>
    </header>
  );
}
