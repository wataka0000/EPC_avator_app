import StateCard from "./StateCard";

export default function GeneratingCard({
  label,
  tone = "generating",
}: {
  label: string;
  tone?: "generating" | "loading";
}) {
  const isGenerating = tone === "generating";

  return (
    <StateCard
      title={isGenerating ? "生成を開始しました" : "ロード中"}
      description={
        isGenerating
          ? "アバター生成中です。通常30〜60秒ほどかかります。"
          : "スナップショットを読み込み中です。"
      }
      badge={isGenerating ? "Generating" : "Loading"}
      tone={tone}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-dashed border-border bg-muted/40">
        <div className="flex h-full w-full items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-muted-foreground">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-primary" />
            <p className="text-sm">
              {isGenerating ? "Generating..." : "Loading..."}
            </p>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full w-3/5 animate-pulse rounded-full bg-primary" />
        </div>
        <p className="text-center text-xs text-muted-foreground">
          {isGenerating
            ? "スキル評価に基づきアバターを生成しています。"
            : "最新データを確認しています。"}
        </p>
      </div>
    </StateCard>
  );
}
