import Link from "next/link";

type PublicHeaderProps = {
  dark?: boolean;
};

export function PublicHeader({ dark = false }: PublicHeaderProps) {
  return (
    <header className={`sticky top-0 z-50 border-b px-5 py-4 backdrop-blur md:px-8 ${dark ? "border-white/10 bg-[#0E1A2B]/95" : "border-vfBorder bg-white/95"}`}>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-5">
        <Link href="/" className="flex items-center gap-3" aria-label="Verge Five home">
          <img src="/logos/verge-five-mark.svg" alt="" className="h-9 w-9" />
          <div className="leading-none">
            <div className={`font-display text-base font-bold tracking-[-0.03em] ${dark ? "text-white" : "text-brand-navy"}`}>Verge Five</div>
            <div className={`mt-1 text-[10px] font-extrabold tracking-[0.18em] ${dark ? "text-[#7D90AA]" : "text-vfText-muted"}`}>BUSINESS CREDIT</div>
          </div>
        </Link>
        <nav className={`hidden items-center gap-8 text-sm font-bold lg:flex ${dark ? "text-[#AEBFD8]" : "text-vfText-body"}`}>
          <Link href="/#dashboard">The dashboard</Link>
          <Link href="/#how">How it works</Link>
          <Link href="/#catch">What we catch</Link>
          <Link href="/#pricing">Pricing</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link className={`rounded-xl border px-4 py-2 text-sm font-bold ${dark ? "border-[#25395A] text-white" : "border-vfBorder-strong text-brand-navy"}`} href="/login">
            Log in
          </Link>
          <Link className="rounded-xl bg-brand-blue px-4 py-2 text-sm font-bold text-white shadow-[0_8px_18px_rgba(37,99,235,0.32)]" href="/signup?plan=self-serve">
            Start
          </Link>
        </div>
      </div>
    </header>
  );
}
