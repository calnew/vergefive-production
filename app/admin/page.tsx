import { AdminPageHeader } from "@/components/admin/admin-shell";
import { AdminDashboardLive } from "@/components/admin/admin-live-panels";

export default function AdminDashboardPage() {
  return (
    <>
      <AdminPageHeader eyebrow="Admin dashboard" title="Control center" description="Live overview powered by the existing Cloudflare/D1 admin APIs, preserved as the source of truth during migration." />
      <AdminDashboardLive />
    </>
  );
}
