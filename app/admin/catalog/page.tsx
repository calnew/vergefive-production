import { AdminPageHeader } from "@/components/admin/admin-shell";
import { AdminAffiliatesLive } from "@/components/admin/admin-live-panels";

export default function AdminCatalogPage() {
  return (
    <>
      <AdminPageHeader eyebrow="Catalog" title="Catalog and affiliate visibility" description="Affiliate and catalog-side migration visibility backed by the existing Cloudflare/D1 records." />
      <AdminAffiliatesLive />
    </>
  );
}
