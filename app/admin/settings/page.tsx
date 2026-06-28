import { AdminPageHeader } from "@/components/admin/admin-shell";
import { AdminSystemLive } from "@/components/admin/admin-live-panels";

export default function AdminSettingsPage() {
  return (
    <>
      <AdminPageHeader eyebrow="Settings" title="Admin settings" description="Read-only settings placeholder. No configuration or destructive action is wired." />
      <AdminSystemLive />
    </>
  );
}
