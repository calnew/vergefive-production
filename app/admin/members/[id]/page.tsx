import { AdminPageHeader } from "@/components/admin/admin-shell";
import { AdminMemberDetailLive } from "@/components/admin/admin-live-panels";

export default async function AdminMemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <>
      <AdminPageHeader eyebrow="Member detail" title="Member profile" description="Read-only member detail from the existing Cloudflare/D1 admin member endpoint." />
      <AdminMemberDetailLive memberId={id} />
    </>
  );
}
