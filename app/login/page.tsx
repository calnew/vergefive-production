import { Suspense } from "react";

import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-surface-page px-6 py-12">
      <Suspense fallback={<div className="font-bold text-brand-navy">Loading login...</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
