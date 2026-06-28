import { AdminPageHeader } from "@/components/admin/admin-shell";
import { AdminBillingLive } from "@/components/admin/admin-live-panels";

export default function AdminPurchasesPage() {
  return (
    <>
      <AdminPageHeader eyebrow="Purchases" title="Purchases and billing" description="Read-only purchase and billing visibility from the existing Cloudflare member data." />
      <AdminBillingLive />
    </>
  );
}
