import { AdminPageHeader } from "@/components/admin/admin-shell";
import { AdminSystemLive } from "@/components/admin/admin-live-panels";

export default function AdminSystemPage() {
  return (
    <>
      <AdminPageHeader eyebrow="System Health" title="System health" description="Read-only Cloudflare backend route map and canonical billing decision." />
      <AdminSystemLive />
    </>
  );
}
