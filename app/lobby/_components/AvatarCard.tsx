import StateCard from "./StateCard";
import { badgeBaseClass, buttonClass } from "./ui";

const rankBadgeClass: Record<string, string> = {
  Gold: "border-amber-200 bg-amber-100 text-amber-900",
  Silver: "border-border bg-muted text-muted-foreground",
  Bronze: "border-orange-200 bg-orange-100 text-orange-900",
};

export default function AvatarCard({
  imageUrl,
  rank,
  onRegenerate,
  regenerateDisabled,
}: {
  imageUrl: string | null | undefined;
  rank: string | null | undefined;
  onRegenerate?: () => void;
  regenerateDisabled?: boolean;
}) {
  const badgeTone = rank ? rankBadgeClass[rank] : undefined;

  return (
    <StateCard
      title="生成完了"
      description="最新のスキル評価に基づくアバターです。"
      badge="Ready"
      tone="ready"
      footer={
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Rank</span>
            <span
              className={`${badgeBaseClass} ${
                badgeTone ?? "border-border bg-muted text-muted-foreground"
              }`}
            >
              {rank ?? "-"}
            </span>
          </div>
          {onRegenerate ? (
            <button
              className={`${buttonClass} w-full gap-2 md:w-auto`}
              onClick={onRegenerate}
              disabled={regenerateDisabled}
              aria-label="アバターを再生成"
            >
              再生成
            </button>
          ) : null}
        </div>
      }
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-border bg-muted/30">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt="生成されたアバター"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
            画像がありません
          </div>
        )}
      </div>
    </StateCard>
  );
}
