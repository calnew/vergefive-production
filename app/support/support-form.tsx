"use client";

import { useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";

import { Button, Card, CardContent } from "@/components/ui";

function topicLabel(value: string | null) {
  if (value === "done-with-you") return "Done-With-You setup call";
  if (value === "access") return "Account access help";
  if (value === "fix") return "Fix page help";
  return "Platform support";
}

export function SupportForm() {
  const params = useSearchParams();
  const [status, setStatus] = useState<{ tone: "ready" | "flagged"; message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const topic = topicLabel(params.get("topic"));
  const fixKey = params.get("from") === "phones" ? "phones" : "";

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        email: formData.get("email"),
        topic: formData.get("topic"),
        message: formData.get("message"),
        company: formData.get("company"),
        fixKey,
      }),
    });
    const data = await response.json().catch(() => ({}));
    setLoading(false);
    if (!response.ok) {
      setStatus({ tone: "flagged", message: data.error || "Message could not be sent yet." });
      return;
    }
    event.currentTarget.reset();
    const savedContext = data.context && typeof data.context === "object" ? data.context : {};
    const savedFixKey = String(savedContext.fixKey || "");
    const savedOption = String(savedContext.selectedOption || "");
    const savedPage = String(savedContext.pageUrl || "");
    setStatus({ tone: "ready", message: savedFixKey ? `Request received. It is tied to ${savedFixKey}${savedOption ? ` · ${savedOption}` : ""} · ${savedPage}` : "Your request was saved to the support backend and routed to Verge Five." });
  }

  return (
    <Card>
      <CardContent className="p-6 md:p-8">
        <form className="grid gap-4" onSubmit={onSubmit}>
          <input className="hidden" name="company" tabIndex={-1} autoComplete="off" />
          <label className="grid gap-2 text-sm font-bold text-vfText-strong">
            Name
            <input className="h-12 rounded-xl border border-vfBorder bg-white px-4 font-normal outline-none focus:border-brand-blue focus:ring-2 focus:ring-blue-100" name="name" required />
          </label>
          <label className="grid gap-2 text-sm font-bold text-vfText-strong">
            Email
            <input className="h-12 rounded-xl border border-vfBorder bg-white px-4 font-normal outline-none focus:border-brand-blue focus:ring-2 focus:ring-blue-100" name="email" type="email" required />
          </label>
          <label className="grid gap-2 text-sm font-bold text-vfText-strong">
            Topic
            <input className="h-12 rounded-xl border border-vfBorder bg-white px-4 font-normal outline-none focus:border-brand-blue focus:ring-2 focus:ring-blue-100" name="topic" defaultValue={topic} required />
          </label>
          <label className="grid gap-2 text-sm font-bold text-vfText-strong">
            What do you need help with?
            <textarea className="min-h-40 rounded-2xl border border-vfBorder bg-white px-4 py-3 font-normal outline-none focus:border-brand-blue focus:ring-2 focus:ring-blue-100" name="message" required placeholder="Tell us what you are trying to do, what page you are on, and what should happen next." />
          </label>
          {status ? <p className={`rounded-xl p-3 text-sm font-bold ${status.tone === "ready" ? "bg-ready-surface text-ready" : "bg-flagged-surface text-flagged"}`} role={status.tone === "ready" ? "status" : "alert"} aria-live={status.tone === "ready" ? "polite" : "assertive"}>{status.message}</p> : null}
          <Button type="submit" disabled={loading}>{loading ? "Sending..." : "Send support request"}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
