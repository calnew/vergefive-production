import { AdminPageHeader } from "@/components/admin/admin-shell";
import { AdminAffiliatesLive } from "@/components/admin/admin-live-panels";

export default function AdminCatalogPage() {
  return (
    <>
      <AdminPageHeader eyebrow="Catalog" title="Catalog and affiliate visibility" description="Read-only placeholder for account catalog work, with existing affiliate data surfaced from Cloudflare/D1." />
      <AdminAffiliatesLive />
    </>
  );
}
