import { AdminPageHeader } from "@/components/admin/admin-shell";
import { AdminScansLive } from "@/components/admin/admin-live-panels";

export default function AdminScansPage() {
  return (
    <>
      <AdminPageHeader eyebrow="Business Visibility Scans" title="Scans and saved reports" description="Live scan and report visibility through the existing Cloudflare admin/member data." />
      <AdminScansLive />
    </>
  );
}
