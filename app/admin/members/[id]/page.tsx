import { AdminPageHeader } from "@/components/admin/admin-shell";
import { AdminMemberDetailLive } from "@/components/admin/admin-live-panels";

export default async function AdminMemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <>
      <AdminPageHeader eyebrow="Member detail" title="Member profile" description="Live member detail and admin actions backed by the existing Cloudflare/D1 member record." />
      <AdminMemberDetailLive memberId={id} />
    </>
  );
}
