import { AdminPageHeader } from "@/components/admin/admin-shell";
import { AdminSupportLive } from "@/components/admin/admin-live-panels";

export default function AdminSupportPage() {
  return (
    <>
      <AdminPageHeader eyebrow="Support" title="Support requests" description="Read-only support queue from the existing Cloudflare/D1 support backend." />
      <AdminSupportLive />
    </>
  );
}
