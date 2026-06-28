import { AdminPageHeader } from "@/components/admin/admin-shell";
import { AdminMembersLive } from "@/components/admin/admin-live-panels";

export default function AdminMembersPage() {
  return (
    <>
      <AdminPageHeader eyebrow="Member management" title="Members" description="Read-only member list from the existing Cloudflare/D1 admin member endpoint." />
      <AdminMembersLive />
    </>
  );
}
