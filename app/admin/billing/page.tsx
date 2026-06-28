import { AdminPageHeader } from "@/components/admin/admin-shell";
import { AdminBillingLive } from "@/components/admin/admin-live-panels";

export default function AdminBillingPage() {
  return (
    <>
      <AdminPageHeader eyebrow="Billing" title="Stripe and access status" description="Read-only billing visibility from D1 memberships. Checkout and portal stay on /api/billing/* only." />
      <AdminBillingLive />
    </>
  );
}
