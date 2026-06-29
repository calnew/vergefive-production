import { AdminPageHeader } from "@/components/admin/admin-shell";
import { AdminMembersLive } from "@/components/admin/admin-live-panels";

export default function AdminMembersPage() {
  return (
    <>
      <AdminPageHeader eyebrow="Member management" title="Members" description="Live member list from the existing Cloudflare/D1 admin backend, ready for migration-field merge work." />
      <AdminMembersLive />
    </>
  );
}
