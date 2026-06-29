import { AdminPageHeader } from "@/components/admin/admin-shell";
import { AdminEmailsLive } from "@/components/admin/admin-live-panels";

export default function AdminEmailsPage() {
  return (
    <>
      <AdminPageHeader eyebrow="Email Templates" title="Email templates and legacy campaigns" description="Legacy campaign and template data preserved from the live backend. Bulk sending remains disabled from this UI." />
      <AdminEmailsLive />
    </>
  );
}
