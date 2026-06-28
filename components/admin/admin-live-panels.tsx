"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";

import { Badge, Card, CardContent } from "@/components/ui";

type LoadState<T> = {
  loading: boolean;
  error: string;
  data: T | null;
};

function useAdminApi<T>(path: string): LoadState<T> {
  const [state, setState] = useState<LoadState<T>>({ loading: true, error: "", data: null });

  useEffect(() => {
    let canceled = false;
    async function load() {
      try {
        const response = await fetch(path, { credentials: "include", cache: "no-store" });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data.error || `Request failed with ${response.status}`);
        }
        if (!canceled) setState({ loading: false, error: "", data });
      } catch (error) {
        if (!canceled) setState({ loading: false, error: error instanceof Error ? error.message : "Could not load admin data.", data: null });
      }
    }
    load();
    return () => {
      canceled = true;
    };
  }, [path]);

  return state;
}

function PanelState({ loading, error, children }: { loading: boolean; error: string; children: ReactNode }) {
  if (loading) return <Card><CardContent className="p-6 text-sm font-bold text-vfText-body">Loading admin data...</CardContent></Card>;
  if (error) return <Card><CardContent className="p-6"><Badge variant="flagged">Admin data unavailable</Badge><p className="mt-3 text-sm leading-6 text-vfText-body">{error}</p><p className="mt-2 text-xs text-vfText-muted">The existing Cloudflare admin APIs protect this data. Log in as an authorized admin to view live records.</p></CardContent></Card>;
  return <>{children}</>;
}

function text(value: unknown, fallback = "-") {
  return value === null || value === undefined || value === "" ? fallback : String(value);
}

function safeDate(value: unknown) {
  if (!value) return "-";
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? String(value) : parsed.toLocaleString();
}

function statusVariant(status: unknown): "ready" | "unlock" | "flagged" | "outline" | "info" {
  const value = String(status || "").toLowerCase();
  if (["active", "paid", "lifetime", "trialing", "sent", "completed", "resolved"].includes(value)) return "ready";
  if (["failed", "past_due", "canceled", "expired", "unpaid", "high", "urgent"].includes(value)) return "flagged";
  if (["trial", "pending", "open", "new", "imported"].includes(value)) return "unlock";
  if (!value || value === "none") return "outline";
  return "info";
}

export function AdminDashboardLive() {
  const members = useAdminApi<{ totals?: Record<string, unknown>; members?: Array<Record<string, unknown>> }>("/api/admin/members");
  const support = useAdminApi<{ requests?: Array<Record<string, unknown>> }>("/api/admin/support");
  const legacy = useAdminApi<{ campaigns?: Array<Record<string, unknown>>; leads?: Array<Record<string, unknown>> }>("/api/admin/legacy-campaigns");
  const affiliates = useAdminApi<{ affiliates?: Array<Record<string, unknown>>; commissions?: Array<Record<string, unknown>> }>("/api/admin/affiliates");
  const loading = members.loading || support.loading || legacy.loading || affiliates.loading;
  const error = members.error || support.error || legacy.error || affiliates.error;
  const totals = members.data?.totals || {};
  const memberRows = members.data?.members || [];
  const supportRows = support.data?.requests || [];
  const campaignRows = legacy.data?.campaigns || [];
  const leadRows = legacy.data?.leads || [];
  const commissionRows = affiliates.data?.commissions || [];

  const cards = [
    ["Total members", text(totals.total_users, String(memberRows.length)), "All users in the Cloudflare/D1 backend", "info"],
    ["Paid/active members", text(totals.active_members, "0"), "Active, trialing, paid, or lifetime status", "ready"],
    ["Imported legacy leads", String(leadRows.length), "Legacy campaign/import records", "unlock"],
    ["Open support requests", String(supportRows.filter((row) => !["closed", "resolved"].includes(String(row.status || "").toLowerCase())).length), "New, open, and pending requests", "unlock"],
    ["Email campaigns", String(campaignRows.length), "Legacy campaigns/templates", "info"],
    ["Affiliate commissions", String(commissionRows.length), "Referral commission records", "info"],
  ];

  return <PanelState loading={loading} error={error}>{<section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{cards.map(([label, value, detail, variant]) => <Card key={label}><CardContent className="p-6"><Badge variant={variant as "ready" | "unlock" | "flagged" | "outline" | "info"}>{label}</Badge><p className="mt-4 font-display text-4xl font-bold tracking-[-0.05em] text-brand-navy">{value}</p><p className="mt-2 text-sm leading-6 text-vfText-body">{detail}</p></CardContent></Card>)}</section>}</PanelState>;
}

export function AdminMembersLive() {
  const state = useAdminApi<{ totals?: Record<string, unknown>; members?: Array<Record<string, unknown>> }>("/api/admin/members");
  const rows = state.data?.members || [];
  return <PanelState loading={state.loading} error={state.error}><Card><CardContent className="overflow-x-auto p-0"><table className="w-full min-w-[860px] text-left text-sm"><thead className="bg-surface-muted text-xs uppercase tracking-[0.16em] text-vfText-muted"><tr><th className="p-4">Member</th><th className="p-4">Membership</th><th className="p-4">Stripe</th><th className="p-4">Progress</th><th className="p-4">Reports</th><th className="p-4">Last login</th></tr></thead><tbody className="divide-y divide-vfBorder">{rows.map((row) => <tr key={text(row.id)} className="bg-white align-top"><td className="p-4"><Link href={`/admin/members/${encodeURIComponent(text(row.id))}/`} className="font-display text-base font-bold text-brand-blue">{text(row.name, "Unnamed member")}</Link><p className="mt-1 text-vfText-body">{text(row.email)}</p></td><td className="p-4"><Badge variant={statusVariant(row.membership_status)}>{text(row.membership_status, "none")}</Badge></td><td className="p-4 text-vfText-body">{text(row.stripe_customer_id, "Not linked")}</td><td className="p-4 text-vfText-body">{text(row.progress_pages, "0")} pages</td><td className="p-4 text-vfText-body">{text(row.reports, "0")}</td><td className="p-4 text-vfText-body">{safeDate(row.last_login_at)}</td></tr>)}</tbody></table>{!rows.length ? <p className="p-6 text-sm font-bold text-vfText-body">No members returned from the admin API.</p> : null}</CardContent></Card></PanelState>;
}

export function AdminMemberDetailLive({ memberId }: { memberId: string }) {
  const state = useAdminApi<Record<string, unknown>>(`/api/admin/member?id=${encodeURIComponent(memberId)}`);
  const member = (state.data?.member || {}) as Record<string, unknown>;
  const profile = (state.data?.profile || {}) as Record<string, unknown>;
  const progress = (state.data?.progress || []) as Array<Record<string, unknown>>;
  const reports = (state.data?.reports || []) as Array<Record<string, unknown>>;
  const audits = (state.data?.visibilityAudits || []) as Array<Record<string, unknown>>;
  const notes = (state.data?.notes || []) as Array<Record<string, unknown>>;
  const activity = (state.data?.activity || []) as Array<Record<string, unknown>>;
  const links = (state.data?.billingLinks || {}) as Record<string, unknown>;
  return <PanelState loading={state.loading} error={state.error}><section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]"><Card><CardContent className="p-6"><h2 className="font-display text-2xl font-bold text-brand-navy">Account snapshot</h2><div className="mt-5 grid gap-3 text-sm text-vfText-body"><p><b className="text-brand-navy">Email:</b> {text(member.email)}</p><p><b className="text-brand-navy">Name:</b> {text(member.name)}</p><p><b className="text-brand-navy">Business:</b> {text(profile.business_name, "No profile saved")}</p><p><b className="text-brand-navy">Membership:</b> {text(member.membership_status, "none")}</p><p><b className="text-brand-navy">Plan:</b> {text(member.plan)}</p><p><b className="text-brand-navy">Stripe customer:</b> {text(member.stripe_customer_id, "Not linked")}</p><p><b className="text-brand-navy">Stripe subscription:</b> {text(member.stripe_subscription_id, "Not linked")}</p></div><div className="mt-5 flex flex-wrap gap-2"><Badge variant={statusVariant(member.membership_status)}>{text(member.membership_status, "none")}</Badge>{links.stripeCustomer ? <Badge variant="info">Stripe linked</Badge> : <Badge variant="outline">No Stripe link</Badge>}<Badge variant="outline">read-only</Badge></div></CardContent></Card><Card><CardContent className="p-6"><h2 className="font-display text-2xl font-bold text-brand-navy">Saved backend activity</h2><div className="mt-5 grid gap-3 sm:grid-cols-2"><InfoTile label="Progress pages" value={String(progress.length)} /><InfoTile label="Reports" value={String(reports.length)} /><InfoTile label="Visibility audits" value={String(audits.length)} /><InfoTile label="Admin notes" value={String(notes.length)} /><InfoTile label="Audit log" value={String(activity.length)} /></div></CardContent></Card></section><section className="mt-6 grid gap-6 lg:grid-cols-3"><MiniList title="Recent visibility audits" rows={audits.map((row) => `${text(row.businessName, "Business")} - ${text(row.score, "-")} - ${safeDate(row.createdAt)}`)} /><MiniList title="Report snapshots" rows={reports.map((row) => `${text(row.reportType, "report")} - ${safeDate(row.createdAt)}`)} /><MiniList title="Admin notes" rows={notes.map((row) => `${text(row.adminEmail, "admin")}: ${text(row.note)}`)} /></section></PanelState>;
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl bg-surface-muted p-4"><p className="font-display text-3xl font-bold text-brand-navy">{value}</p><p className="text-sm text-vfText-body">{label}</p></div>;
}

function MiniList({ title, rows }: { title: string; rows: string[] }) {
  return <Card><CardContent className="p-6"><h2 className="font-display text-xl font-bold text-brand-navy">{title}</h2><div className="mt-4 grid gap-2">{rows.slice(0, 5).map((row, index) => <p key={`${title}-${index}`} className="rounded-xl bg-surface-muted p-3 text-sm text-vfText-body">{row}</p>)}{!rows.length ? <p className="text-sm text-vfText-muted">No records returned.</p> : null}</div></CardContent></Card>;
}

export function AdminSupportLive() {
  const state = useAdminApi<{ requests?: Array<Record<string, unknown>> }>("/api/admin/support");
  const rows = state.data?.requests || [];
  return <PanelState loading={state.loading} error={state.error}><Card><CardContent className="overflow-x-auto p-0"><table className="w-full min-w-[880px] text-left text-sm"><thead className="bg-surface-muted text-xs uppercase tracking-[0.16em] text-vfText-muted"><tr><th className="p-4">Request</th><th className="p-4">Member/contact</th><th className="p-4">Severity</th><th className="p-4">Status</th><th className="p-4">Page</th><th className="p-4">Created</th></tr></thead><tbody className="divide-y divide-vfBorder">{rows.map((row) => <tr key={text(row.id)} className="bg-white align-top"><td className="p-4"><p className="font-bold text-brand-navy">{text(row.type, "Support")}</p><p className="mt-1 max-w-sm text-vfText-body">{text(row.message)}</p></td><td className="p-4"><p className="font-bold text-brand-navy">{text(row.name, "Member")}</p><p className="text-vfText-body">{text(row.email)}</p></td><td className="p-4"><Badge variant={statusVariant(row.severity)}>{text(row.severity, "Normal")}</Badge></td><td className="p-4"><Badge variant={statusVariant(row.status)}>{text(row.status)}</Badge></td><td className="p-4 text-vfText-body">{text(row.page_url)}</td><td className="p-4 text-vfText-body">{safeDate(row.created_at)}</td></tr>)}</tbody></table>{!rows.length ? <p className="p-6 text-sm font-bold text-vfText-body">No support requests returned.</p> : null}</CardContent></Card></PanelState>;
}

export function AdminEmailsLive() {
  const state = useAdminApi<{ campaigns?: Array<Record<string, unknown>>; leads?: Array<Record<string, unknown>> }>("/api/admin/legacy-campaigns");
  const campaigns = state.data?.campaigns || [];
  const leads = state.data?.leads || [];
  return <PanelState loading={state.loading} error={state.error}><section className="grid gap-5"><Card><CardContent className="p-6"><h2 className="font-display text-2xl font-bold text-brand-navy">Legacy campaign/import summary</h2><p className="mt-2 text-sm leading-6 text-vfText-body">Read-only view. Bulk sending is intentionally not wired here.</p></CardContent></Card>{campaigns.map((campaign) => <Card key={text(campaign.id)}><CardContent className="p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><Badge variant="info">{text(campaign.name, "Legacy campaign")}</Badge><h2 className="mt-4 font-display text-2xl font-bold text-brand-navy">{text(campaign.subject)}</h2><p className="mt-2 text-sm font-bold text-vfText-body">{text(campaign.preview_text, "No preview text")}</p><p className="mt-3 max-w-3xl whitespace-pre-wrap text-sm leading-6 text-vfText-body">{text(campaign.message).slice(0, 700)}</p></div><div className="grid min-w-[220px] gap-2"><InfoTile label="Leads" value={text(campaign.total_leads, "0")} /><InfoTile label="Sent" value={text(campaign.sent_count, "0")} /><InfoTile label="Clicked" value={text(campaign.clicked_count, "0")} /><InfoTile label="Registered" value={text(campaign.registered_count, "0")} /></div></div></CardContent></Card>)}<MiniList title="Recent imported/legacy leads" rows={leads.map((lead) => `${text(lead.email)} - ${text(lead.business_name, "No business")} - ${text(lead.status)}`)} /></section></PanelState>;
}

export function AdminAffiliatesLive() {
  const state = useAdminApi<{ affiliates?: Array<Record<string, unknown>>; commissions?: Array<Record<string, unknown>> }>("/api/admin/affiliates");
  const affiliates = state.data?.affiliates || [];
  const commissions = state.data?.commissions || [];
  return <PanelState loading={state.loading} error={state.error}><section className="grid gap-6 xl:grid-cols-2"><Card><CardContent className="p-6"><h2 className="font-display text-2xl font-bold text-brand-navy">Affiliates</h2><div className="mt-5 grid gap-3">{affiliates.map((row) => <div key={text(row.id)} className="rounded-2xl border border-vfBorder bg-white p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-bold text-brand-navy">{text(row.name)}</p><p className="text-sm text-vfText-body">{text(row.code)} - {text(row.email)}</p></div><Badge variant={statusVariant(row.status)}>{text(row.status)}</Badge></div></div>)}{!affiliates.length ? <p className="text-sm text-vfText-muted">No affiliates returned.</p> : null}</div></CardContent></Card><Card><CardContent className="p-6"><h2 className="font-display text-2xl font-bold text-brand-navy">Commissions</h2><div className="mt-5 grid gap-3">{commissions.slice(0, 10).map((row) => <div key={text(row.id)} className="rounded-2xl border border-vfBorder bg-white p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-bold text-brand-navy">{text(row.member_email)}</p><p className="text-sm text-vfText-body">{text(row.plan)} - ${Number(row.amount_cents || 0) / 100}</p></div><Badge variant={statusVariant(row.status)}>{text(row.status)}</Badge></div></div>)}{!commissions.length ? <p className="text-sm text-vfText-muted">No commissions returned.</p> : null}</div></CardContent></Card></section></PanelState>;
}

export function AdminBillingLive() {
  const state = useAdminApi<{ members?: Array<Record<string, unknown>> }>("/api/admin/members");
  const rows = state.data?.members || [];
  const active = rows.filter((row) => ["active", "paid", "lifetime", "trialing", "trial"].includes(String(row.membership_status || "").toLowerCase()));
  const failed = rows.filter((row) => ["past_due", "failed", "canceled", "expired", "unpaid"].includes(String(row.membership_status || "").toLowerCase()));
  return <PanelState loading={state.loading} error={state.error}><section className="grid gap-4 md:grid-cols-3"><Card><CardContent className="p-6"><Badge variant="ready">Active access</Badge><p className="mt-4 font-display text-4xl font-bold text-brand-navy">{active.length}</p><p className="mt-2 text-sm text-vfText-body">Active/trialing/paid/lifetime statuses from D1.</p></CardContent></Card><Card><CardContent className="p-6"><Badge variant="flagged">Needs billing review</Badge><p className="mt-4 font-display text-4xl font-bold text-brand-navy">{failed.length}</p><p className="mt-2 text-sm text-vfText-body">Past due, canceled, expired, unpaid, or failed.</p></CardContent></Card><Card><CardContent className="p-6"><Badge variant="info">Stripe linked</Badge><p className="mt-4 font-display text-4xl font-bold text-brand-navy">{rows.filter((row) => row.stripe_customer_id).length}</p><p className="mt-2 text-sm text-vfText-body">Members with Stripe customer IDs.</p></CardContent></Card></section><AdminMembersLive /></PanelState>;
}

export function AdminScansLive() {
  const state = useAdminApi<{ members?: Array<Record<string, unknown>> }>("/api/admin/members");
  const rows = state.data?.members || [];
  return <PanelState loading={state.loading} error={state.error}><Card><CardContent className="overflow-x-auto p-0"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-surface-muted text-xs uppercase tracking-[0.16em] text-vfText-muted"><tr><th className="p-4">Member</th><th className="p-4">Signals</th><th className="p-4">Reports</th><th className="p-4">Progress pages</th><th className="p-4">Last login</th></tr></thead><tbody className="divide-y divide-vfBorder">{rows.map((row) => <tr key={text(row.id)} className="bg-white"><td className="p-4"><Link href={`/admin/members/${encodeURIComponent(text(row.id))}/`} className="font-bold text-brand-blue">{text(row.email)}</Link></td><td className="p-4 text-vfText-body">{text(row.signal_groups, "0")}</td><td className="p-4 text-vfText-body">{text(row.reports, "0")}</td><td className="p-4 text-vfText-body">{text(row.progress_pages, "0")}</td><td className="p-4 text-vfText-body">{safeDate(row.last_login_at)}</td></tr>)}</tbody></table></CardContent></Card></PanelState>;
}

export function AdminSystemLive() {
  const paths = ["/api/billing/create-checkout-session", "/api/billing/webhook", "/api/admin/members", "/api/admin/support", "/api/admin/legacy-campaigns", "/api/admin/affiliates"];
  return <section className="grid gap-3">{paths.map((path) => <Card key={path}><CardContent className="p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-display text-lg font-bold text-brand-navy">{path}</p><p className="text-sm text-vfText-body">Cloudflare/D1 backend route retained as the working backend path.</p></div><Badge variant={path.includes("/api/stripe") ? "flagged" : "ready"}>canonical/reference</Badge></div></CardContent></Card>)}</section>;
}
