"use client";

import { useLobbySnapshot } from "../_hooks/useLobbySnapshot";
import { useGenerateSnapshot } from "../_hooks/useGenerateSnapshot";
import { TopTabs } from "./TopTabs";
import AvatarPanel from "./AvatarPanel";
import SkillInsightsPanel from "./SkillInsightsPanel";

type LobbyDashboardViewProps = {
  userId: string | null;
};

export default function LobbyDashboardView({ userId }: LobbyDashboardViewProps) {
  const { loading, snapshot, error } = useLobbySnapshot(userId);
  const { generate, submitting, error: genErr } = useGenerateSnapshot();

  const rawStatus = snapshot?.status ?? (snapshot?.image_url ? "ready" : "idle");
  const status =
    rawStatus === "queued"
      ? "generating"
      : (rawStatus as "idle" | "generating" | "ready" | "failed");

  const canRegenerate =
    !!snapshot?.latest_assessment_id &&
    status !== "generating" &&
    !submitting;

  const onRegenerate = async () => {
    if (!snapshot?.latest_assessment_id) return;
    await generate(snapshot.latest_assessment_id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="mx-auto w-full max-w-6xl px-6 pb-0 pt-8">
          <p className="mb-0.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Skill Avatar
          </p>
          <h1 className="text-2xl font-semibold text-foreground">Lobby</h1>
        </header>
        <TopTabs />
        <main className="mx-auto flex w-full max-w-6xl flex-1 items-center justify-center px-6 py-12">
          <div className="flex flex-col items-center gap-4">
            <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-border border-t-primary" />
            <p className="text-sm text-muted-foreground">Loading your lobby...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto w-full max-w-6xl px-6 pb-0 pt-8">
        <p className="mb-0.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Skill Avatar
        </p>
        <h1 className="text-2xl font-semibold text-foreground">Lobby</h1>
      </header>
      <TopTabs />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="flex min-h-0 flex-col">
            <AvatarPanel
              loading={loading}
              snapshot={snapshot}
              status={status}
              errorMessage={error ?? genErr}
              canRegenerate={canRegenerate}
              onRegenerate={onRegenerate}
            />
          </div>

          <div className="flex min-h-0 flex-col">
            <SkillInsightsPanel snapshot={snapshot} />
          </div>
        </div>
      </main>
    </div>
  );
}
