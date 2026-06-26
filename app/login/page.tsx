import { Suspense } from "react";

import { LoginForm } from "@/components/auth/login-form";
import { PublicHeader } from "@/components/marketing/public-header";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-surface-page">
      <PublicHeader />
      <section className="grid min-h-[calc(100vh-74px)] place-items-center px-6 py-12">
        <Suspense fallback={<div className="font-bold text-brand-navy">Loading login...</div>}>
          <LoginForm />
        </Suspense>
      </section>
    </main>
  );
}
