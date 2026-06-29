import { AdminPageHeader } from "@/components/admin/admin-shell";
import { AdminSystemLive } from "@/components/admin/admin-live-panels";

export default function AdminSettingsPage() {
  return (
    <>
      <AdminPageHeader eyebrow="Settings" title="Admin settings" description="Backend route and migration settings visibility for the existing admin platform. Destructive configuration remains intentionally limited." />
      <AdminSystemLive />
    </>
  );
}
