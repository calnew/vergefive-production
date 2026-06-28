import { AdminPageHeader } from "@/components/admin/admin-shell";
import { AdminDashboardLive } from "@/components/admin/admin-live-panels";

export default function AdminDashboardPage() {
  return (
    <>
      <AdminPageHeader eyebrow="Admin dashboard" title="Control center" description="Read-only overview powered by the existing Cloudflare/D1 admin APIs." />
      <AdminDashboardLive />
    </>
  );
}
