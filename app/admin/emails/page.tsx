import { AdminPageHeader } from "@/components/admin/admin-shell";
import { AdminEmailsLive } from "@/components/admin/admin-live-panels";

export default function AdminEmailsPage() {
  return (
    <>
      <AdminPageHeader eyebrow="Email Templates" title="Email templates and legacy campaigns" description="Read-only view of existing legacy campaign/template data. Sending remains disabled from this UI." />
      <AdminEmailsLive />
    </>
  );
}
