export default function AppLoading() {
  return (
    <main className="grid min-h-screen place-items-center bg-surface-page px-6 py-12" aria-busy="true">
      <div className="rounded-2xl border border-vfBorder bg-white px-6 py-5 font-bold text-brand-navy shadow-soft" role="status" aria-live="polite">
        Loading your Verge Five workspace...
      </div>
    </main>
  );
}
