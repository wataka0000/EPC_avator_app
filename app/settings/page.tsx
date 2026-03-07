import PageHeaderWithTabs from "../_components/PageHeaderWithTabs";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <PageHeaderWithTabs title="設定" />
      <main className="mx-auto w-full max-w-6xl px-6 py-6">
        <div className="mx-auto flex min-h-[40vh] max-w-3xl items-center justify-center">
          <div className="rounded-xl border border-border bg-card p-8 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-foreground">設定</h2>
            <p className="mt-2 text-sm text-muted-foreground">Coming soon</p>
          </div>
        </div>
      </main>
    </div>
  );
}
