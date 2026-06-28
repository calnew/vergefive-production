"use client";

import { useState } from "react";

export function LogoutButton() {
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
    window.location.href = "/login";
  }

  return (
    <button type="button" onClick={logout} disabled={loading} className="mt-3 w-full rounded-xl border border-white/15 px-3 py-2 text-sm font-bold text-[#B7C6DE] transition hover:bg-white/10 hover:text-white disabled:opacity-70">
      {loading ? "Logging out..." : "Log out"}
    </button>
  );
}
