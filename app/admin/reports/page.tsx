import { AdminPageHeader } from "@/components/admin/admin-shell";
import { AdminScansLive } from "@/components/admin/admin-live-panels";

export default function AdminReportsPage() {
  return (
    <>
      <AdminPageHeader eyebrow="Reports" title="Reports and exports" description="Read-only report visibility for now. Export actions remain intentionally unwired." />
      <AdminScansLive />
    </>
  );
}
